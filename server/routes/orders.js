const express = require('express');
const router = express.Router();
const sepidar = require('../services/sepidar');

// POST /api/orders/quotation - Create quotation
router.post('/quotation', async (req, res) => {
  try {
    const result = await sepidar.registerQuotation(req.body);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'پیش‌فاکتور با موفقیت ثبت شد'
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در ثبت پیش‌فاکتور' });
  }
});

// POST /api/orders/invoice - Create sales invoice
router.post('/invoice', async (req, res) => {
  try {
    const result = await sepidar.registerSalesInvoice(req.body);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'فاکتور فروش با موفقیت ثبت شد'
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در ثبت فاکتور' });
  }
});

// GET /api/orders/quotations - Get all quotations
router.get('/quotations', async (req, res) => {
  try {
    const result = await sepidar.getQuotations(req.query);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در دریافت پیش‌فاکتورها' });
  }
});

module.exports = router;
