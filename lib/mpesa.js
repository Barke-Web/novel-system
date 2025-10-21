// lib/mpesa.js
import axios from 'axios';

export class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE || '174379';
    this.passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    this.testMode = process.env.MPESA_TEST_MODE === 'true' || !this.consumerKey || !this.consumerSecret;
    
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    console.log('🔧 M-Pesa Configuration:', {
      environment: this.environment,
      testMode: this.testMode,
      businessShortCode: this.businessShortCode
    });
  }

  async getAccessToken() {
    if (this.testMode) {
      console.log('🧪 TEST MODE: Returning mock access token');
      return 'mock_access_token_' + Date.now();
    }

    try {
      console.log('🔑 Getting M-Pesa access token...');
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          timeout: 10000,
        }
      );

      console.log('✅ Access token received');
      return response.data.access_token;
    } catch (error) {
      console.error('❌ Access Token Error:', error.response?.data || error.message);
      throw new Error(`Failed to get access token: ${error.response?.data?.error_message || 'Check your credentials'}`);
    }
  }

  async initiateSTKPush(phoneNumber, amount, businessId, accountReference = '', description = '') {
    if (this.testMode) {
      console.log('🧪 TEST MODE: Simulating STK Push');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        MerchantRequestID: 'TEST-' + Date.now(),
        CheckoutRequestID: 'ws_CO_TEST_' + Date.now(),
        ResponseCode: '0',
        ResponseDescription: 'Success',
        CustomerMessage: 'Success. Request accepted for processing'
      };
    }

    try {
      console.log('🚀 Initiating real STK Push...');
      const accessToken = await this.getAccessToken();
      
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
      const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
      
      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mpesa/callback`,
        AccountReference: accountReference || `INV-${businessId}`,
        TransactionDesc: description || 'Business Registration Payment',
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('✅ STK Push Response:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ STK Push Error:', error.response?.data || error.message);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  async checkTransactionStatus(checkoutRequestID) {
    if (this.testMode) {
      console.log('🧪 TEST MODE: Simulating payment status check');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For testing, simulate different statuses
      const randomStatus = Math.random() > 0.3 ? 'success' : 'processing';
      
      if (randomStatus === 'success') {
        return {
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully",
          CheckoutRequestID: checkoutRequestID,
          MerchantRequestID: checkoutRequestID.replace('ws_CO_', 'TEST_')
        };
      } else {
        return {
          ResultCode: 1032,
          ResultDesc: "Request processing in progress",
          CheckoutRequestID: checkoutRequestID
        };
      }
    }

    try {
      console.log('🔍 Checking transaction status for:', checkoutRequestID);
      const accessToken = await this.getAccessToken();
      
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
      const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('✅ Status Check Response:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Status Check Error:', error.response?.data || error.message);
      throw new Error(`Status check failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }
}