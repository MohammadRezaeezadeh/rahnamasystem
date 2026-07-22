# Rahnama System Backend

## Quick Start

```bash
cd server
npm install
npm run dev
```

Server will run on http://localhost:3000

## API Endpoints

### Products
- `GET /api/products` - Get all products (from Sepidar API)
- `GET /api/products/:id` - Get single product
- `GET /api/products/:id/image` - Get product image
- `GET /api/products/:id/inventory` - Get product inventory

### Auth
- `POST /api/auth/register-device` - Register device with Sepidar
- `POST /api/auth/login` - Login to Sepidar
- `GET /api/auth/check` - Check authorization

### Orders
- `POST /api/orders/quotation` - Create quotation
- `POST /api/orders/invoice` - Create sales invoice
- `GET /api/orders/quotations` - Get all quotations

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (admin)

### Blog
- `GET /api/blog` - Get all published posts
- `GET /api/blog/:slug` - Get single post by slug
- `POST /api/blog` - Create new post
- `PUT /api/blog/:id` - Update post
- `DELETE /api/blog/:id` - Delete post

### Payment
- `POST /api/payment/create` - Create payment
- `GET /api/payment/callback` - Handle SnapPay callback
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/status/:orderId` - Check payment status

### Health
- `GET /api/health` - Health check

## Configuration

### 1. Database (LIARA PostgreSQL)

Add your PostgreSQL connection string to `.env`:

```
PG_URI=postgresql://root:your_password@your_host:5432/your_database
```

### 2. Sepidar API

Add your Sepidar API credentials to `.env`:

```
SEPIDAR_SERIAL=your_serial_number
SEPIDAR_INTEGRATION_ID=your_integration_id
SEPIDAR_CONFIGURED=true
```

### 3. SnapPay Payment Gateway

Add your SnapPay API credentials to `.env`:

```
SNAPPAY_API_KEY=your_api_key
SNAPPAY_MERCHANT_ID=your_merchant_id
SNAPPAY_CALLBACK_URL=https://yourdomain.com/api/payment/callback
SNAPPAY_CONFIGURED=true
```

## Deployment to LIARA

1. Install LIARA CLI:
```bash
npm i -g liara
```

2. Login to LIARA:
```bash
liara login
```

3. Deploy:
```bash
cd server
liara deploy
```

## File Structure

```
server/
├── server.js              # Main server entry
├── database.js            # PostgreSQL connection
├── package.json           # Dependencies
├── .env                   # Environment variables
├── liara.json             # LIARA deployment config
├── middleware/
│   └── auth.js            # JWT verification
├── routes/
│   ├── products.js        # Product endpoints
│   ├── auth.js            # Authentication
│   ├── orders.js          # Order management
│   ├── contact.js         # Contact form
│   ├── blog.js            # Blog posts
│   └── payment.js         # SnapPay payment
└── services/
    ├── sepidar.js         # Sepidar API client
    └── payment.js         # SnapPay service
```

## Notes

- When API keys are not configured, the system uses mock data
- Database tables are created automatically on first run
- All Persian text is UTF-8 encoded
