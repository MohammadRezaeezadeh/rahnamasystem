const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const paymentService = require('../services/payment');

// POST /api/payment/create - Create payment
router.post('/create', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, product_name, product_id, amount } = req.body;

    if (!customer_name || !customer_phone || !product_name || !amount) {
      return res.status(400).json({ error: 'اطلاعات ناقص است' });
    }

    // Create order in database
    const orderResult = await pool.query(
      `INSERT INTO orders (customer_name, customer_phone, customer_email, product_name, product_id, amount)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [customer_name, customer_phone, customer_email || null, product_name, product_id || null, amount]
    );

    const orderId = orderResult.rows[0].id;

    // Create payment with SnapPay
    const paymentResult = await paymentService.createPayment({
      amount: amount,
      orderId: orderId,
      description: `خرید ${product_name}`,
      mobile: customer_phone,
      email: customer_email
    });

    if (paymentResult.success) {
      // Save payment record
      await pool.query(
        `INSERT INTO payments (order_id, amount, authority)
         VALUES ($1, $2, $3)`,
        [orderId, amount, paymentResult.data.authority]
      );

      // Update order with payment_id
      await pool.query(
        'UPDATE orders SET payment_id = $1 WHERE id = $2',
        [paymentResult.data.authority, orderId]
      );

      res.json({
        success: true,
        orderId: orderId,
        paymentUrl: paymentResult.data.url,
        authority: paymentResult.data.authority
      });
    } else {
      res.status(400).json({ error: paymentResult.error || 'خطا در ایجاد پرداخت' });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'خطا در پردازش پرداخت' });
  }
});

// GET /api/payment/callback - Handle SnapPay callback
router.get('/callback', async (req, res) => {
  try {
    const { authority, Status, OrderId } = req.query;

    if (!authority || !Status) {
      return res.redirect('/?payment=status_error');
    }

    if (Status !== 'OK') {
      // Payment was not successful
      await pool.query(
        `UPDATE payments SET status = 'failed' WHERE authority = $1`,
        [authority]
      );
      return res.redirect('/?payment=failed');
    }

    // Find the order
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE payment_id = $1',
      [authority]
    );

    if (orderResult.rows.length === 0) {
      return res.redirect('/?payment=order_not_found');
    }

    const order = orderResult.rows[0];

    // Verify payment with SnapPay
    const verifyResult = await paymentService.verifyPayment(authority, order.amount);

    if (verifyResult.success) {
      // Update payment status
      await pool.query(
        `UPDATE payments 
         SET status = 'verified', 
             ref_id = $1,
             snap_pay_id = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE authority = $3`,
        [verifyResult.data.ref_id, verifyResult.data.card_hash, authority]
      );

      // Update order status
      await pool.query(
        `UPDATE orders SET status = 'paid' WHERE id = $1`,
        [order.id]
      );

      return res.redirect(`/?payment=success&orderId=${order.id}`);
    } else {
      return res.redirect('/?payment=verify_failed');
    }
  } catch (error) {
    console.error('Error in payment callback:', error);
    res.redirect('/?payment=error');
  }
});

// POST /api/payment/verify - Manual verify
router.post('/verify', async (req, res) => {
  try {
    const { authority, orderId } = req.body;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'سفارش یافت نشد' });
    }

    const order = orderResult.rows[0];
    const verifyResult = await paymentService.verifyPayment(authority, order.amount);

    if (verifyResult.success) {
      await pool.query(
        `UPDATE payments 
         SET status = 'verified', 
             ref_id = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE authority = $2`,
        [verifyResult.data.ref_id, authority]
      );

      await pool.query(
        `UPDATE orders SET status = 'paid' WHERE id = $1`,
        [orderId]
      );

      res.json({
        success: true,
        message: 'پرداخت با موفقیت تایید شد',
        refId: verifyResult.data.ref_id
      });
    } else {
      res.status(400).json({ error: verifyResult.error || 'خطا در تایید پرداخت' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'خطا در تایید پرداخت' });
  }
});

// GET /api/payment/status/:orderId - Check payment status
router.get('/status/:orderId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, p.status as payment_status, p.ref_id 
       FROM orders o 
       LEFT JOIN payments p ON o.id = p.order_id 
       WHERE o.id = $1`,
      [req.params.orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'سفارش یافت نشد' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'خطا در بررسی وضعیت پرداخت' });
  }
});

module.exports = router;
