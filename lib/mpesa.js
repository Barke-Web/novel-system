// lib/mpesa.js
import axios from 'axios';

export class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.baseURL =' https://sandbox.safaricom.co.ke';
    this.callbackURL = process.env.MPESA_CALLBACK_URL;
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  generatePassword() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  async initiateSTKPush(phoneNumber, amount, businessId, accountReference = '', description = '') {
    try {
      console.log('🚀 Initiating STK Push...');
      console.log('Payment Details:', {
        phoneNumber,
        amount,
        businessId,
        accountReference,
        description
      });

      const accessToken = await this.getAccessToken();
      console.log('✅ Access token obtained');

      // Validate phone number format for M-Pesa
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      console.log('Formatted phone number:', formattedPhone);

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

      console.log('📦 STK Push Payload:', JSON.stringify(payload, null, 2));

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
      console.error('❌ STK Push Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          headers: {
            authorization: error.config?.headers?.Authorization ? 'Present' : 'Missing',
            contentType: error.config?.headers?.['Content-Type']
          }
        }
      });
      
      // More specific error messages
      if (error.response?.data?.errorCode) {
        throw new Error(`M-Pesa Error ${error.response.data.errorCode}: ${error.response.data.errorMessage}`);
      } else if (error.response?.data?.errorMessage) {
        throw new Error(`M-Pesa Error: ${error.response.data.errorMessage}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to M-Pesa API. Check your internet connection.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('M-Pesa API request timed out.');
      } else {
        throw new Error(`M-Pesa payment failed: ${error.message}`);
      }
    }
  }
}