// /app/api/auth/password/route.js
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function PUT(request) {
  console.log('Password update request received');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { currentPassword, newPassword, userId } = body;

    // Validate required fields
    if (!currentPassword || !newPassword || !userId) {
      console.log('Missing required fields');
      return Response.json({ 
        success: false, 
        message: 'All fields are required' 
      }, { status: 400 });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return Response.json({ 
        success: false, 
        message: 'New password must be at least 8 characters long' 
      }, { status: 400 });
    }

    console.log('Fetching user data for ID:', userId);
    const userSql = `SELECT id, representativePassword FROM users WHERE id = ?`;
    const users = await query(userSql, [userId]);
    console.log('User query result:', users);
    
    if (!users || users.length === 0) {
      console.log('User not found');
      return Response.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    const user = users[0];
    console.log('User found:', user);

    // Debug: Check what's actually stored in the database
    console.log('Stored password type:', typeof user.representativePassword);
    console.log('Stored password value:', user.representativePassword);
    console.log('Stored password length:', user.representativePassword ? user.representativePassword.length : 'null');

    // Check if user has a password set
    if (!user.representativePassword) {
      console.log('No existing password found, setting new password');
      
      try {
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        console.log('New password hashed successfully');

        const updateSql = `UPDATE users SET representativePassword = ? WHERE id = ?`;
        const result = await query(updateSql, [hashedNewPassword, userId]);
        console.log('Update result:', result);

        if (result.affectedRows === 0) {
          console.log('No rows affected - update failed');
          return Response.json({ 
            success: false, 
            message: 'Failed to update password' 
          }, { status: 500 });
        }

        console.log('Password set successfully');
        return Response.json({ 
          success: true, 
          message: 'Password set successfully'
        }, { status: 200 });

      } catch (hashError) {
        console.error('Hash error:', hashError);
        return Response.json({ 
          success: false, 
          message: 'Error processing password' 
        }, { status: 500 });
      }
    }

    // Verify current password - ADD DEBUGGING HERE
    console.log('Verifying current password');
    console.log('Input password:', currentPassword);
    console.log('Stored hash:', user.representativePassword);
    
    try {
      // Check if the stored password looks like a bcrypt hash
      const isBcryptHash = user.representativePassword.startsWith('$2b$') || 
                           user.representativePassword.startsWith('$2a$') ||
                           user.representativePassword.startsWith('$2y$');
      
      console.log('Is stored value a bcrypt hash?', isBcryptHash);
      
      if (!isBcryptHash) {
        console.log('Stored password is not a valid bcrypt hash');
        // Handle case where password might be stored in plain text or different format
        if (user.representativePassword === currentPassword) {
          console.log('Plain text password matches, upgrading to hashed password');
          
          const saltRounds = 10;
          const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
          const updateSql = `UPDATE users SET representativePassword = ? WHERE id = ?`;
          const result = await query(updateSql, [hashedNewPassword, userId]);
          
          if (result.affectedRows > 0) {
            return Response.json({ 
              success: true, 
              message: 'Password updated successfully (migrated from plain text)'
            }, { status: 200 });
          }
        } else {
          console.log('Plain text password does not match');
          return Response.json({ 
            success: false, 
            message: 'Current password is incorrect' 
          }, { status: 401 });
        }
      }

      // Normal bcrypt comparison for hashed passwords
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.representativePassword);
      
      console.log('Password comparison result:', isCurrentPasswordValid);
      
      if (!isCurrentPasswordValid) {
        console.log('Current password is incorrect');
        return Response.json({ 
          success: false, 
          message: 'Current password is incorrect' 
        }, { status: 401 });
      }

      console.log('Current password verified successfully');

      // Hash and update new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      console.log('New password hashed successfully');

      const updateSql = `UPDATE users SET representativePassword = ? WHERE id = ?`;
      const result = await query(updateSql, [hashedNewPassword, userId]);
      console.log('Update result:', result);

      if (result.affectedRows === 0) {
        console.log('No rows affected - update failed');
        return Response.json({ 
          success: false, 
          message: 'Failed to update password' 
        }, { status: 500 });
      }

      console.log('Password updated successfully');
      return Response.json({ 
        success: true, 
        message: 'Password updated successfully'
      }, { status: 200 });

    } catch (bcryptError) {
      console.error('Bcrypt comparison error details:', bcryptError);
      console.error('Error message:', bcryptError.message);
      console.error('Error stack:', bcryptError.stack);
      
      return Response.json({ 
        success: false, 
        message: 'Error verifying password. Please contact support.',
        debug: process.env.NODE_ENV === 'development' ? bcryptError.message : undefined
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Password update error:', error);
    console.error('Error stack:', error.stack);
    
    return Response.json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Add other HTTP methods to prevent errors
export async function GET() {
  return Response.json({ 
    success: false, 
    message: 'Method not allowed' 
  }, { status: 405 });
}

export async function POST() {
  return Response.json({ 
    success: false, 
    message: 'Method not allowed' 
  }, { status: 405 });
}