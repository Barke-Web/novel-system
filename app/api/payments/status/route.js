// app/api/payments/status/route.js
import { NextResponse } from 'next/server';
import { MpesaService } from '@/lib/mpesa';

export async function POST(request) {
  try {
    const body = await request.json();
    const { checkoutRequestID } = body;

    console.log('🔍 Status check request for:', checkoutRequestID);

    if (!checkoutRequestID) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Checkout Request ID is required' 
        },
        { status: 400 }
      );
    }

    // Create MpesaService instance inside the route handler
    const mpesaService = new MpesaService();
    const status = await mpesaService.checkTransactionStatus(checkoutRequestID);

    console.log('✅ Status check result:', status);

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check transaction status',
        error: error.message 
      },
      { status: 500 }
    );
  }
}