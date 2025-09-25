// Quick test script to verify announcements API
const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('Testing announcements API...');
    
    // Test without auth (should fail)
    try {
      const response = await axios.get('http://localhost:5000/api/announcements');
      console.log('❌ Unexpected: Got response without auth:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Expected: 401 Unauthorized without auth token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }
    
    // Test analytics endpoint without auth (should also fail)
    try {
      const response = await axios.get('http://localhost:5000/api/announcements/analytics');
      console.log('❌ Unexpected: Got analytics without auth:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Expected: 401 Unauthorized for analytics without auth token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAPI();