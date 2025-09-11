import { query } from '../../../../lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return Response.json({ 
        success: false, 
        message: 'Email and password are required' 
      }, { status: 400 });
    }

    // Find user by representativeEmail
    const userSql = `
      SELECT 
        u.*, 
        b.businessName, 
        b.businessEmail
      FROM users u
      LEFT JOIN business b ON u.business_id = b.id
      WHERE u.representativeEmail = ?
    `;
    
    const users = await query(userSql, [email]);
    
    if (users.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'Invalid email or password' 
      }, { status: 401 });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.representativePassword);
    
    if (!isPasswordValid) {
      return Response.json({ 
        success: false, 
        message: 'Invalid email or password' 
      }, { status: 401 });
    }

    // Remove password from response
    const { representativePassword: _, ...userWithoutPassword } = user;

    return Response.json({ 
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return Response.json({ 
    success: false, 
    message: 'Method not allowed' 
  }, { status: 405 });
}