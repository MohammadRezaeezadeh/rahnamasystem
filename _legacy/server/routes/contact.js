const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, phone, company, interest, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'نام و شماره تماس الزامی است' });
    }

    const result = await pool.query(
      'INSERT INTO contacts (name, phone, company, interest, message) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, phone, company || null, interest || null, message || null]
    );

    res.json({
      success: true,
      message: 'پیام شما با موفقیت ثبت شد. به زودی با شما تماس می‌گیریم.',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ error: 'خطا در ثبت پیام' });
  }
});

// GET /api/contact - Get all contacts (admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts ORDER BY created_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'خطا در دریافت پیام‌ها' });
  }
});

module.exports = router;
