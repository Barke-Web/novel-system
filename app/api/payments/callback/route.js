import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const callbackData = await request.json();
    
    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    const stkCallback = callbackData.Body.stkCallback;
    const resultCode = stkCallback.ResultCode;
    const merchantRequestID = stkCallback.MerchantRequestID;
    const checkoutRequestID = stkCallback.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment was successful
      console.log('✅ Payment Successful!', {
        merchantRequestID,
        checkoutRequestID
      });

      // TODO: Update invoice status to 'paid' in your database
      // TODO: Save transaction details

    } else {
      // Payment failed
      console.log('❌ Payment Failed:', {
        merchantRequestID,
        checkoutRequestID,
        error: stkCallback.ResultDesc
      });

      // TODO: Update invoice status to 'failed' in your database
    }

    // Always acknowledge receipt to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success"
    });

  } catch (error) {
    console.error('Error processing callback:', error);
    
    // Still acknowledge receipt to avoid M-Pesa retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success"
    });
  }
}