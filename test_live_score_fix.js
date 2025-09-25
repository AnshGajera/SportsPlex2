const axios = require('axios');

// Test script to verify the live score update endpoint works
async function testLiveScoreEndpoint() {
  const baseURL = 'http://localhost:5000';
  
  try {
    // First, let's test if the server is running
    console.log('🔄 Testing server connectivity...');
    const serverTest = await axios.get(`${baseURL}/`);
    console.log('✅ Server is running:', serverTest.data);
    
    // Test the live score endpoint with a sample match ID
    // Note: This will likely fail due to authentication, but it should NOT return 404
    console.log('\n🔄 Testing live score endpoint...');
    
    try {
      const testMatchId = '507f1f77bcf86cd799439011'; // Sample MongoDB ObjectId
      const response = await axios.put(`${baseURL}/api/matches/${testMatchId}/live-score`, {
        team1Score: 10,
        team2Score: 5,
        status: 'live'
      });
      console.log('✅ Live score endpoint responded successfully');
    } catch (error) {
      if (error.response) {
        console.log(`📊 Status Code: ${error.response.status}`);
        console.log(`📝 Response: ${JSON.stringify(error.response.data, null, 2)}`);
        
        if (error.response.status === 404) {
          console.log('❌ Still getting 404 - the fix didn\'t work');
        } else if (error.response.status === 401 || error.response.status === 403) {
          console.log('✅ Getting authentication error instead of 404 - the endpoint exists! Fix worked!');
        } else {
          console.log('📊 Got a different error - endpoint exists but there might be other issues');
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Failed to connect to server:', error.message);
    console.log('💡 Make sure the backend server is running on port 5000');
  }
}

// Run the test
testLiveScoreEndpoint();