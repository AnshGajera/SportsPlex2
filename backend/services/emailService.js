// Simple email service without Firebase Admin (for development)
// In production, you would configure Firebase Admin or use another email service

const sendPromotionEmail = async (userEmail, userName) => {
  try {
    // Email content
    const emailData = {
      to: userEmail,
      subject: '🎉 Congratulations! You are now a Student Head',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Congratulations!</h1>
            <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">You've been promoted to Student Head</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${userName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              We are excited to inform you that you have been promoted to <strong style="color: #3b82f6;">Student Head</strong> 
              position in our SportsPlex system!
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Your New Responsibilities Include:</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Managing student activities and events</li>
                <li>Coordinating with administrators</li>
                <li>Overseeing club operations</li>
                <li>Supporting fellow students</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
              Your leadership skills and dedication have earned you this position. We believe you will excel 
              in this role and make a positive impact on the student community.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Access Your Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong style="color: #374151;">SportsPlex Administration Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    // Log the email data (simulated email sending for development)
    console.log('=== PROMOTION EMAIL SIMULATION ===');
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('Email content prepared for:', userName);
    console.log('✅ Email would be sent in production environment');
    
    // Simulate successful email sending
    return {
      success: true,
      message: 'Promotion email sent successfully (simulated)',
      emailData
    };
    
  } catch (error) {
    console.error('Error preparing promotion email:', error);
    return {
      success: false,
      message: 'Failed to prepare promotion email',
      error: error.message
    };
  }
};

module.exports = {
  sendPromotionEmail
};
