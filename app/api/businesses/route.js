import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const verified = searchParams.get('verified');

  let sql = `
    SELECT id, businessName, category, registrationNumber, country, county, 
           businessEmail, kraPin, mobileNumber, isVerified, createdAt 
    FROM business
  `;
  let params = [];

  if (verified !== null) {
    sql += ' WHERE isVerified = ?';
    params.push(verified);
  }

  sql += ' ORDER BY createdAt DESC';

  try {
    const businesses = await query(sql, params);
    return Response.json(businesses, { status: 200 });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return Response.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}