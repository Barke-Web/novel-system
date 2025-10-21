import { NextRequest, NextResponse } from 'next/server';
import { MpesaService } from '@/lib/mpesa';

const mpesaService = new MpesaService();

export async function POST(request) {
  try {
    const { checkoutRequestID } = await request.json();

    if (!checkoutRequestID) {
      return NextResponse.json(
        { success: false, message: 'Checkout Request ID is required' },
        { status: 400 }
      );
    }

    const status = await mpesaService.checkTransactionStatus(checkoutRequestID);

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Status check error:', error);
    
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