const express = require('express');
const router = express.Router();
const sepidar = require('../services/sepidar');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const result = await sepidar.getItems({
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در دریافت محصولات' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await sepidar.getItems({ limit: 1, offset: 0 });

    if (result.success) {
      const product = result.data.Result.find(p => p.ItemID === parseInt(req.params.id));
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'محصول یافت نشد' });
      }
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در دریافت محصول' });
  }
});

// GET /api/products/:id/image - Get product image
router.get('/:id/image', async (req, res) => {
  try {
    const result = await sepidar.getItemImage(req.params.id);

    if (result.success) {
      res.set('Content-Type', 'image/jpeg');
      res.send(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در دریافت تصویر محصول' });
  }
});

// GET /api/products/:id/inventory - Get product inventory
router.get('/:id/inventory', async (req, res) => {
  try {
    const result = await sepidar.getItemInventory(req.params.id);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطا در دریافت موجودی' });
  }
});

module.exports = router;
