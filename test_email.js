// Test if emailService can be loaded
try {
  console.log('Testing email service import...');
  const emailService = require('./backend/services/emailService');
  console.log('✅ Email service loaded successfully');
  console.log('Available functions:', Object.keys(emailService));
} catch (error) {
  console.error('❌ Error loading email service:', error.message);
  console.error('Stack:', error.stack);
}