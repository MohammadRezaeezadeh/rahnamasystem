const https = require('https');
const http = require('http');
const { URL } = require('url');

class SnapPayService {
  constructor() {
    this.apiKey = process.env.SNAPPAY_API_KEY;
    this.merchantId = process.env.SNAPPAY_MERCHANT_ID;
    this.callbackUrl = process.env.SNAPPAY_CALLBACK_URL;
    this.apiUrl = process.env.SNAPPAY_API_URL || 'https://api.snappay.ir';
    this.isConfigured = !!(this.apiKey && this.merchantId);
  }

  async request(path, data) {
    const url = new URL(path, this.apiUrl);
    const protocol = url.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = protocol.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async createPayment({ amount, orderId, description, mobile, email }) {
    if (!this.isConfigured) {
      // Mock response for testing
      return {
        success: true,
        data: {
          authority: `MOCK_${orderId}_${Date.now()}`,
          url: `${this.callbackUrl}?authority=MOCK_${orderId}_${Date.now()}&Status=OK`
        }
      };
    }

    try {
      const result = await this.request('/v1/payment/create', {
        merchant_id: this.merchantId,
        amount: amount,
        callback_url: this.callbackUrl,
        description: description || `پرداخت سفارش ${orderId}`,
        mobile: mobile || '',
        email: email || '',
        order_id: orderId
      });

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async verifyPayment(authority, amount) {
    if (!this.isConfigured) {
      // Mock verification for testing
      return {
        success: true,
        data: {
          card_hash: 'MOCK_CARD_HASH',
          card_pan: '6104-****-****-1234',
          ref_id: `REF_${Date.now()}`,
          fee: Math.round(amount * 0.005)
        }
      };
    }

    try {
      const result = await this.request('/v1/payment/verify', {
        merchant_id: this.merchantId,
        authority: authority,
        amount: amount
      });

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPaymentStatus(authority) {
    if (!this.isConfigured) {
      return { success: true, data: { status: 'OK' } };
    }

    try {
      const result = await this.request('/v1/payment/status', {
        merchant_id: this.merchantId,
        authority: authority
      });

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SnapPayService();
