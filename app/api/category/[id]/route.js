import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET single category
export async function GET(request, { params }) {
  try {
    const categories = await query(
      `SELECT id, name, fee, description, is_active, created_at, updated_at 
       FROM category WHERE id = ?`,
      [params.id]
    );
    
    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(categories[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - Update a category
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    
    await query(
      `UPDATE category 
       SET name = ?, fee = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [body.name, body.fee || 0.00, body.description || null, body.is_active !== false, params.id]
    );
    
    // Fetch the updated category
    const updatedCategories = await query(
      `SELECT id, name, fee, description, is_active, created_at, updated_at 
       FROM category WHERE id = ?`,
      [params.id]
    );
    
    if (updatedCategories.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedCategories[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category
export async function DELETE(request, { params }) {
  try {
    const result = await query(
      'DELETE FROM category WHERE id = ?',
      [params.id]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
