import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAIL_SERVICE_ID = 'service_570v2gp'; // Replace with your EmailJS service ID
const PROMOTION_TEMPLATE_ID = 'template_7r0fshc'; // Template for promotions
const DEMOTION_TEMPLATE_ID = 'template_vceg58i'; // Template for demotions (you need to create this)
const EMAIL_PUBLIC_KEY = 'whFc9F3Zj5tk5G6vd'; // Replace with your EmailJS public key

// Initialize EmailJS
emailjs.init(EMAIL_PUBLIC_KEY);

export const sendPromotionEmail = async (userEmail, userName) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'SportsPlex Administration',
      reply_to: userEmail,
      message: `Dear ${userName},
        
Congratulations! 🎉
        
We are excited to inform you that you have been promoted to Student Head position in our SportsPlex system!
        
Your New Responsibilities Include:
• Managing student activities and events
• Coordinating with administrators
• Overseeing club operations
• Supporting fellow students
        
Your leadership skills and dedication have earned you this position. We believe you will excel in this role and make a positive impact on the student community.
        
Please log in to your dashboard to access your new privileges.
        
Best regards,
SportsPlex Administration Team`
    };

    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      PROMOTION_TEMPLATE_ID, // Using promotion-specific template
      templateParams
    );

    console.log('Promotion email sent successfully:', response);
    return {
      success: true,
      message: 'Promotion email sent successfully',
      response
    };

  } catch (error) {
    console.error('Error sending promotion email:', error);
    return {
      success: false,
      message: 'Failed to send promotion email',
      error: error.message
    };
  }
};

export const sendDemotionEmail = async (userEmail, userName) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'SportsPlex Administration',
      reply_to: userEmail,
      message: `Dear ${userName},
        
We are writing to inform you about a change in your role within our SportsPlex system.
        
Your role has been updated from Student Head back to Student.
        
Thank you for your service as a Student Head. Your contributions and leadership during your tenure were valuable to our community.
        
As a student, you will continue to have access to:
• All student features and activities
• Club participation and events
• Equipment booking and facilities
• General student resources
        
If you have any questions about this change, please don't hesitate to contact the administration.
        
Best regards,
SportsPlex Administration Team`
    };

    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      DEMOTION_TEMPLATE_ID, // Using demotion-specific template
      templateParams
    );

    console.log('Demotion email sent successfully:', response);
    return {
      success: true,
      message: 'Demotion email sent successfully',
      response
    };

  } catch (error) {
    console.error('Error sending demotion email:', error);
    return {
      success: false,
      message: 'Failed to send demotion email',
      error: error.message
    };
  }
};

// For testing purposes - you can use this to send a test email
export const sendTestEmail = async () => {
  return await sendPromotionEmail('test@example.com', 'Test User');
};
