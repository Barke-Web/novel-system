// app/api/categories/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const category = await query(`
      SELECT id, name, fee, description, is_active, created_at, updated_at 
      FROM category 
      ORDER BY created_at DESC
    `);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const result = await query(
      `INSERT INTO category (name, fee, description, is_active) 
       VALUES (?, ?, ?, ?)`,
      [body.name, body.fee || 0.00, body.description || null, body.is_active !== false]
    );
    
    const [newCategory] = await query(
      `SELECT id, name, fee, description, is_active, created_at, updated_at 
       FROM category WHERE id = ?`,
      [result.insertId]
    );
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category: ' + error.message },
      { status: 500 }
    );
  }
}