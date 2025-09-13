import { query } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const sql = `
      SELECT 
          b.id, 
          b.businessName, 
          b.category, 
          b.registrationNumber, 
          b.country,
          b.county, 
          b.businessEmail, 
          b.kraPin, 
          b.mobileNumber, 
          b.isVerified, 
          b.createdAt,
          u.representativeFirstName,
          u.representativeLastName,
          u.representativeMobileNumber,
          u.representativeEmail,
          u.representativeIdNumber
      FROM business b
      INNER JOIN users u ON b.id = u.business_id
      WHERE b.id = ?
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