import { query } from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = params;
  const { isVerified } = await request.json();

  try {
    const sql = 'UPDATE business SET isVerified = ? WHERE id = ?';
    const result = await query(sql, [isVerified, id]);

    if (result.affectedRows === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    return Response.json({ message: 'Business verification status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating business verification status:', error);
    return Response.json({ error: 'Failed to update verification status' }, { status: 500 });
  }
}