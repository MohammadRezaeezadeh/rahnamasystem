const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sepidar = require('../services/sepidar');

// POST /api/auth/register-device - Register device with Sepidar
router.post('/register-device', async (req, res) => {
  try {
    const result = await sepidar.registerDevice();

    if (result.success) {
      res.json({
        success: true,
        deviceTitle: result.deviceTitle,
        message: 'دستگاه با موفقیت رجیستر شد'
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در رجیستر دستگاه' });
  }
});

// POST /api/auth/login - Login to Sepidar
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است' });
    }

    const result = await sepidar.login(username, password);

    if (result.success) {
      // Generate our own JWT token
      const token = jwt.sign(
        { username, authenticated: true },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        message: 'ورود موفقیت‌آمیز'
      });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در ورود' });
  }
});

// GET /api/auth/check - Check authorization
router.get('/check', async (req, res) => {
  try {
    const result = await sepidar.isAuthorized();

    if (result.success) {
      res.json({ authorized: result.authorized });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در بررسی اعتبار' });
  }
});

module.exports = router;
