const CryptoJS = require('crypto-js');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class SepidarClient {
  constructor() {
    this.apiUrl = process.env.SEPIDAR_API_URL || 'http://localhost:7373';
    this.serial = process.env.SEPIDAR_SERIAL;
    this.integrationId = parseInt(process.env.SEPIDAR_INTEGRATION_ID) || 1001;
    this.token = null;
    this.publicKey = null;
    this.generationVersion = 112;
  }

  generateKey() {
    return this.serial + this.serial;
  }

  encryptAES(text) {
    const key = this.generateKey();
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return {
      cypher: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      iv: iv.toString(CryptoJS.enc.Base64)
    };
  }

  decryptAES(cypher, ivBase64) {
    const key = this.generateKey();
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const ciphertext = CryptoJS.enc.Base64.parse(cypher);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  encryptWithPublicKey(text) {
    if (!this.publicKey) throw new Error('Public key not available');
    // In production, use RSA encryption with the public key
    // For now, we'll use a simple approach
    return Buffer.from(text).toString('base64');
  }

  async registerDevice() {
    const { cypher, iv } = this.encryptAES(this.integrationId.toString());

    try {
      const response = await axios.post(`${this.apiUrl}/api/Devices/Register`, {
        Cypher: cypher,
        IV: iv,
        IntegrationID: this.integrationId
      });

      // Decrypt the public key from response
      const decryptedKey = this.decryptAES(response.data.Cypher, response.data.IV);
      this.publicKey = decryptedKey;

      return {
        success: true,
        deviceTitle: response.data.DeviceTitle,
        publicKey: decryptedKey
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/Account/Login`, {
        Username: username,
        Password: password
      });

      this.token = response.data.Token;
      return { success: true, token: this.token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  getHeaders() {
    const arbitraryCode = uuidv4();
    return {
      'GenerationVersion': this.generationVersion.toString(),
      'Authorization': `Bearer ${this.token}`,
      'IntegrationID': this.integrationId.toString(),
      'ArbitraryCode': arbitraryCode,
      'EncArbitraryCode': this.encryptWithPublicKey(arbitraryCode)
    };
  }

  async isAuthorized() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/IsAuthorized`, {
        headers: this.getHeaders()
      });
      return { success: true, authorized: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getItems(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.orderBy) queryParams.append('orderBy', params.orderBy);
      if (params.orderByDesc) queryParams.append('orderByDesc', params.orderByDesc);

      const response = await axios.get(`${this.apiUrl}/api/Items/Paginated/?${queryParams.toString()}`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getItemImage(itemId) {
    try {
      const response = await axios.get(`${this.apiUrl}/api/Items/ReceiveImage/${itemId}`, {
        headers: this.getHeaders(),
        responseType: 'arraybuffer'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getItemInventory(itemId) {
    try {
      const response = await axios.get(`${this.apiUrl}/api/Items/ReceiveInventory/${itemId}`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);

      const response = await axios.get(`${this.apiUrl}/api/Customers/Paginated/?${queryParams.toString()}`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async registerCustomer(customerData) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/Customers/Registration`, customerData, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getQuotations(params = {}) {
    try {
      const response = await axios.get(`${this.apiUrl}/api/Quotations/GetQuotations`, {
        headers: this.getHeaders(),
        params
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async registerQuotation(quotationData) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/Quotations/PreInvoiceRegistration`, quotationData, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async registerSalesInvoice(invoiceData) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/Invoices/RegisterSalesInvoice`, invoiceData, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getBanks() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/Banks/GetBanks`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getBankAccounts() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/BankAccounts/GetBankAccounts`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getStocks() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/Stocks/GetStock`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getSaleTypes() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/SaleTypes/GetSaleTypes`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }

  async getCurrencies() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/Currencies/GetCurrencies`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.Message || error.message
      };
    }
  }
}

module.exports = new SepidarClient();
