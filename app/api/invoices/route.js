// app/api/invoices/route.js
import { query } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    try {
        let sql = `
            SELECT 
                b.*,
                u.representativeFirstName,
                u.representativeLastName,
                u.representativeMobileNumber,
                c.fee as categoryFee
            FROM business b
            INNER JOIN users u ON b.id = u.business_id
            LEFT JOIN categories c ON LOWER(b.category) = LOWER(c.name)
        `;
        
        let params = [];

        if (businessId) {
            sql += ' WHERE b.id = ?';
            params.push(businessId);
        }

        sql += ' ORDER BY b.createdAt DESC';

        const businesses = await query(sql, params);
        return Response.json(businesses, { status: 200 });
    } catch (error) {
        console.error('Error fetching invoice data:', error);
        return Response.json({ error: 'Failed to fetch invoice data' }, { status: 500 });
    }
}