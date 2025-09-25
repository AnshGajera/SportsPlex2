const axios = require('axios');

async function testPutEndpoint() {
  try {
    console.log('Testing PUT endpoint...');
    const response = await axios.put('http://localhost:5000/api/matches/507f1f77bcf86cd799439011/live-score', {
      team1Score: 10,
      team2Score: 5,
      status: 'live'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Network Error:', error.message);
    }
  }
}

testPutEndpoint();