// Test if announcement controller can be loaded
try {
  console.log('Testing announcement controller import...');
  const ctrl = require('./backend/controllers/announcementController');
  console.log('✅ Controller loaded successfully');
  console.log('Available functions:', Object.keys(ctrl));
} catch (error) {
  console.error('❌ Error loading controller:', error.message);
  console.error('Stack:', error.stack);
}