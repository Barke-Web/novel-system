import { query } from '@/lib/db';

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return Response.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { representativeEmail, representativeMobileNumber } = body;
    
    if (!representativeMobileNumber || !representativeEmail) {
      return Response.json({ 
        success: false, 
        message: 'Representative Mobile Number and Email are required' 
      }, { status: 400 });
    }

    console.log('Updating user:', userId, 'with data:', { representativeEmail, representativeMobileNumber });

    // Simple update without transaction
    const updateUserSql = `
      UPDATE users 
      SET representativeEmail = ?, representativeMobileNumber = ?
      WHERE id = ?
    `;
    
    const userUpdateResult = await query(updateUserSql, [
      representativeEmail, 
      representativeMobileNumber, 
      userId
    ]);

    if (userUpdateResult.affectedRows === 0) {
      return Response.json({ 
        success: false, 
        message: 'User not found or no changes made' 
      }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      message: 'Profile updated successfully',
      updatedFields: {
        representativeEmail,
        representativeMobileNumber,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return Response.json({ 
      success: false, 
      message: 'Database update failed: ' + error.message 
    }, { status: 500 });
  }
}