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
    
    // Accept the fields your frontend is actually sending
    const { representativeEmail, representativeMobileNumber } = body;
    
    // Update validation to match what frontend sends
    if (!representativeEmail) {
      return Response.json({ 
        success: false, 
        message: 'Email is required' 
      }, { status: 400 });
    }

    // Start transaction
    await query('START TRANSACTION');

    // Update only the fields that are actually being sent
    const updateUserSql = `
      UPDATE users 
      SET representativeEmail = ?, 
          representativeMobileNumber = COALESCE(?, representativeMobileNumber)
      WHERE id = ?
    `;
    await query(updateUserSql, [representativeEmail, representativeMobileNumber, userId]);

    await query('COMMIT');

    return Response.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    }, { status: 200 });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Profile update error:', error);
    return Response.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}