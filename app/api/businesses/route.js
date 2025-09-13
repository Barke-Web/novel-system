import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const verified = searchParams.get('verified');

let sql = `
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
        u.representativeMobileNumber
    FROM business b
    INNER JOIN users u ON b.id = u.business_id
`;
let params = [];

if (verified !== null) {
    sql += ' WHERE b.isVerified = ?';
    params.push(verified);
}

// Add ordering if needed
sql += ' ORDER BY b.createdAt DESC';

  try {
    const businesses = await query(sql, params);
    return Response.json(businesses, { status: 200 });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return Response.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}