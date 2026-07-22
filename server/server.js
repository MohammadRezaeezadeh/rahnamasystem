require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Rahnama System API',
    sepidarConfigured: !!(process.env.SEPIDAR_SERIAL && process.env.SEPIDAR_SERIAL !== 'YOUR_SERIAL_HERE'),
    snapPayConfigured: !!(process.env.SNAPPAY_API_KEY),
    databaseConfigured: !!process.env.PG_URI
  });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'خطای داخلی سرور' });
});

// Initialize database and start server
async function start() {
  try {
    if (process.env.PG_URI) {
      await initDatabase();
      console.log('Database initialized');
    } else {
      console.log('Warning: No database configured (PG_URI not set)');
    }
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    console.log('Server will start without database');
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Sepidar API: ${process.env.SEPIDAR_CONFIGURED === 'true' ? 'Configured' : 'Not configured (using mock data)'}`);
    console.log(`SnapPay: ${process.env.SNAPPAY_CONFIGURED === 'true' ? 'Configured' : 'Not configured (using mock data)'}`);
  });
}

start();
