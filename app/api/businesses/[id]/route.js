import { query } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const sql = `
      SELECT id, businessName, category, registrationNumber, country, county, 
             businessEmail, kraPin, mobileNumber, isVerified, createdAt 
      FROM business
      WHERE id = ?
      LIMIT 1
    `;
    const results = await query(sql, [id]);
    if (results.length === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }
    return Response.json(results[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching business:', error);
    return Response.json({ error: 'Failed to fetch business' }, { status: 500 });
  }
}