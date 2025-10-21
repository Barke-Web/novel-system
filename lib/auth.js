// lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.representativeEmail,
    businessId: user.business_id,
    businessName: user.businessName,
    role: user.role || 'user'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function authMiddleware(handler) {
  return async (req, context) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Access token required' 
        }), { status: 401 });
      }

      const decoded = verifyToken(token);
      req.user = decoded;
      
      return handler(req, context);
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid or expired token' 
      }), { status: 401 });
    }
  };
}