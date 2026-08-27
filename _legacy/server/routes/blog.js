const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// GET /api/blog - Get all published posts
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0, category } = req.query;
    let query = 'SELECT id, title, slug, category, image_url, created_at FROM blog_posts WHERE published = true';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    params.push(parseInt(limit));
    query += ` LIMIT $${params.length}`;
    params.push(parseInt(offset));
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'خطا در دریافت مقالات' });
  }
});

// GET /api/blog/:slug - Get single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE slug = $1 AND published = true',
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'خطا در دریافت مقاله' });
  }
});

// POST /api/blog - Create new post
router.post('/', async (req, res) => {
  try {
    const { title, slug, content, category, image_url, published } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'عنوان، لینک و محتوا الزامی است' });
    }

    const result = await pool.query(
      'INSERT INTO blog_posts (title, slug, content, category, image_url, published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [title, slug, content, category || null, image_url || null, published || false]
    );

    res.json({
      success: true,
      message: 'مقاله با موفقیت ایجاد شد',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'خطا در ایجاد مقاله' });
  }
});

// PUT /api/blog/:id - Update post
router.put('/:id', async (req, res) => {
  try {
    const { title, slug, content, category, image_url, published } = req.body;

    const result = await pool.query(
      `UPDATE blog_posts 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           content = COALESCE($3, content),
           category = COALESCE($4, category),
           image_url = COALESCE($5, image_url),
           published = COALESCE($6, published),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id`,
      [title, slug, content, category, image_url, published, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }

    res.json({
      success: true,
      message: 'مقاله با موفقیت بروزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'خطا در بروزرسانی مقاله' });
  }
});

// DELETE /api/blog/:id - Delete post
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM blog_posts WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'مقاله یافت نشد' });
    }

    res.json({
      success: true,
      message: 'مقاله با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'خطا در حذف مقاله' });
  }
});

module.exports = router;
