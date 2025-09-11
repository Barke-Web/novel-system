import { query} from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    const {
      businessName,
      registrationNumber,
      category,
      country,
      county,
      businessEmail,
      kraPin,
      mobileNumber,
      representativeFirstName,
      representativeLastName,
      representativeIdNumber,
      representativeEmail,
      representativeMobileNumber,
      representativePassword
    } = formData;

    // Validate required fields
    if (!businessName || !businessEmail || !representativeEmail || !representativePassword) {
      return Response.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(representativePassword, 10);

    try {
      // First insert into business table
      const businessSql = `
        INSERT INTO business (
          businessName, category, registrationNumber, country, county, 
          businessEmail, kraPin, mobileNumber
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const businessParams = [
        businessName,
        category,
        registrationNumber,
        country,
        county,
        businessEmail,
        kraPin,
        mobileNumber
      ];
      
      const businessResult = await query(businessSql, businessParams);
      const businessId = businessResult.insertId;

      // Then insert into users table with reference to business ID
      const userSql = `
        INSERT INTO users (
          representativeFirstName, representativeLastName, representativeEmail, 
          representativeMobileNumber, representativeIdNumber, representativePassword,
          business_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const userParams = [
        representativeFirstName,
        representativeLastName,
        representativeEmail,
        representativeMobileNumber,
        representativeIdNumber,
        hashedPassword,
        businessId
      ];
      
      const userResult = await query(userSql, userParams);

      return Response.json({ 
        success: true, 
        message: 'Registration successful',
        businessId: businessId,
        userId: userResult.insertId
      }, { status: 200 });

    } catch (error) {
      console.error('Database error:', error);
      return Response.json({ 
        success: false, 
        message: 'Database error: ' + error.message 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ 
      success: false, 
      message: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}