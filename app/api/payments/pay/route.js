import { NextRequest, NextResponse } from 'next/server';
import { MpesaService } from '../../../../lib/mpesa';

const mpesaService = new MpesaService();

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.phoneNumber || !body.amount || !body.businessId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Phone number, amount, and invoice ID are required' 
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (body.amount < 1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Amount must be at least 1 KSH' 
        },
        { status: 400 }
      );
    }

    // Initiate M-Pesa payment
    const result = await mpesaService.initiateSTKPush(
      body.phoneNumber,
      body.amount,
      body.businessId
    );

    // TODO: Save payment attempt to your database
    // TODO: Update invoice status to 'processing'

    return NextResponse.json({
      success: true,
      message: 'Payment initiated successfully',
      data: result
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to initiate payment',
        error: error.message 
      },
      { status: 500 }
    );
  }
}