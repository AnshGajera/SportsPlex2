/**
 * Live Scoring System Test Script
 * Tests sport-specific live scoring functionality across all user roles
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_CONFIG = {
  // Replace these with actual tokens from your system
  adminToken: 'your-admin-token-here',
  studentHeadToken: 'your-student-head-token-here',
  userToken: 'your-user-token-here'
};

// Test data for different sports
const TEST_MATCHES = {
  cricket: {
    title: 'Test Cricket Match',
    description: 'Test cricket match for live scoring',
    sport: 'Cricket',
    team1: { name: 'Team Alpha', score: 0 },
    team2: { name: 'Team Beta', score: 0 },
    startTime: new Date(Date.now() + 60000), // 1 minute from now
    endTime: new Date(Date.now() + 3600000), // 1 hour from now
    venue: 'Test Ground',
    status: 'scheduled'
  },
  football: {
    title: 'Test Football Match',
    description: 'Test football match for live scoring',
    sport: 'Football',
    team1: { name: 'Team Gamma', score: 0 },
    team2: { name: 'Team Delta', score: 0 },
    startTime: new Date(Date.now() + 120000), // 2 minutes from now
    endTime: new Date(Date.now() + 5400000), // 1.5 hours from now
    venue: 'Test Field',
    status: 'scheduled'
  },
  basketball: {
    title: 'Test Basketball Match',
    description: 'Test basketball match for live scoring',
    sport: 'Basketball',
    team1: { name: 'Team Epsilon', score: 0 },
    team2: { name: 'Team Zeta', score: 0 },
    startTime: new Date(Date.now() + 180000), // 3 minutes from now
    endTime: new Date(Date.now() + 3600000), // 1 hour from now
    venue: 'Test Court',
    status: 'scheduled'
  }
};

// Cricket specific test scenarios
const CRICKET_SCENARIOS = [
  {
    name: 'Basic Run Scoring',
    updates: [
      { team: 'team1', runs: 4, balls: 1 },
      { team: 'team1', runs: 6, balls: 1 },
      { team: 'team1', runs: 1, balls: 1 }
    ]
  },
  {
    name: 'Wicket and Over Completion',
    updates: [
      { team: 'team1', runs: 2, balls: 1 },
      { team: 'team1', runs: 0, balls: 1, wickets: 1 },
      { team: 'team1', runs: 4, balls: 1 },
      { team: 'team1', runs: 1, balls: 1 },
      { team: 'team1', runs: 2, balls: 1 },
      { team: 'team1', runs: 3, balls: 1 } // Completes over
    ]
  },
  {
    name: 'Extras Scoring',
    updates: [
      { team: 'team1', runs: 0, balls: 0, extras: { wide: 1 } },
      { team: 'team1', runs: 0, balls: 0, extras: { bye: 4 } },
      { team: 'team1', runs: 1, balls: 1 }
    ]
  }
];

// General sports test scenarios
const GENERAL_SCENARIOS = [
  {
    name: 'Basic Goal Scoring',
    updates: [
      { team: 'team1', increment: 1 },
      { team: 'team2', increment: 2 },
      { team: 'team1', increment: 1 }
    ]
  },
  {
    name: 'Score Correction',
    updates: [
      { team: 'team1', increment: 3 },
      { team: 'team1', decrement: 1 },
      { team: 'team2', increment: 2 }
    ]
  }
];

class LiveScoringTester {
  constructor() {
    this.createdMatches = [];
  }

  // Helper method to make authenticated requests
  async makeRequest(method, endpoint, data = null, token = null) {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message 
      };
    }
  }

  // Test match creation
  async testMatchCreation() {
    console.log('🏆 Testing Match Creation...\n');

    for (const [sport, matchData] of Object.entries(TEST_MATCHES)) {
      console.log(`Creating ${sport} match...`);
      
      const result = await this.makeRequest(
        'POST', 
        '/matches', 
        matchData, 
        TEST_CONFIG.adminToken
      );

      if (result.success) {
        this.createdMatches.push({
          sport,
          id: result.data._id,
          data: result.data
        });
        console.log(`✅ ${sport} match created with ID: ${result.data._id}`);
      } else {
        console.log(`❌ Failed to create ${sport} match:`, result.error);
      }
    }
    console.log();
  }

  // Test cricket live scoring
  async testCricketLiveScoring(matchId) {
    console.log('🏏 Testing Cricket Live Scoring...\n');

    for (const scenario of CRICKET_SCENARIOS) {
      console.log(`Testing scenario: ${scenario.name}`);

      for (const update of scenario.updates) {
        const liveUpdate = {
          matchId,
          team: update.team,
          scoreData: {
            runs: update.runs || 0,
            wickets: update.wickets || 0,
            balls: update.balls || 0,
            extras: update.extras || {}
          },
          sport: 'Cricket'
        };

        const result = await this.makeRequest(
          'POST',
          `/matches/${matchId}/live-score`,
          liveUpdate,
          TEST_CONFIG.adminToken
        );

        if (result.success) {
          const { team1, team2 } = result.data;
          console.log(`✅ Update applied - Team1: ${team1.cricketScore?.runs || 0}/${team1.cricketScore?.wickets || 0} (${team1.cricketScore?.overs || 0}.${team1.cricketScore?.balls || 0})`);
        } else {
          console.log(`❌ Update failed:`, result.error);
        }
      }
      console.log();
    }
  }

  // Test general sports live scoring
  async testGeneralSportsLiveScoring(matchId, sport) {
    console.log(`🏈 Testing ${sport} Live Scoring...\n`);

    for (const scenario of GENERAL_SCENARIOS) {
      console.log(`Testing scenario: ${scenario.name}`);

      for (const update of scenario.updates) {
        const liveUpdate = {
          matchId,
          team: update.team,
          scoreData: {
            increment: update.increment,
            decrement: update.decrement
          },
          sport
        };

        const result = await this.makeRequest(
          'POST',
          `/matches/${matchId}/live-score`,
          liveUpdate,
          TEST_CONFIG.adminToken
        );

        if (result.success) {
          const { team1, team2 } = result.data;
          console.log(`✅ Update applied - Team1: ${team1.score || 0}, Team2: ${team2.score || 0}`);
        } else {
          console.log(`❌ Update failed:`, result.error);
        }
      }
      console.log();
    }
  }

  // Test permission-based access
  async testPermissions() {
    console.log('🔐 Testing Permissions...\n');

    if (this.createdMatches.length === 0) {
      console.log('❌ No matches available for permission testing');
      return;
    }

    const testMatch = this.createdMatches[0];

    // Test admin access
    console.log('Testing admin access...');
    const adminResult = await this.makeRequest(
      'POST',
      `/matches/${testMatch.id}/live-score`,
      {
        matchId: testMatch.id,
        team: 'team1',
        scoreData: { increment: 1 },
        sport: testMatch.sport
      },
      TEST_CONFIG.adminToken
    );
    console.log(adminResult.success ? '✅ Admin access granted' : '❌ Admin access denied');

    // Test student head access
    console.log('Testing student head access...');
    const studentHeadResult = await this.makeRequest(
      'POST',
      `/matches/${testMatch.id}/live-score`,
      {
        matchId: testMatch.id,
        team: 'team1',
        scoreData: { increment: 1 },
        sport: testMatch.sport
      },
      TEST_CONFIG.studentHeadToken
    );
    console.log(studentHeadResult.success ? '✅ Student head access granted' : '❌ Student head access denied');

    // Test regular user access (should be denied)
    console.log('Testing regular user access...');
    const userResult = await this.makeRequest(
      'POST',
      `/matches/${testMatch.id}/live-score`,
      {
        matchId: testMatch.id,
        team: 'team1',
        scoreData: { increment: 1 },
        sport: testMatch.sport
      },
      TEST_CONFIG.userToken
    );
    console.log(!userResult.success ? '✅ User access properly denied' : '❌ User access incorrectly granted');
    console.log();
  }

  // Test validation rules
  async testValidation() {
    console.log('✅ Testing Validation Rules...\n');

    const cricketMatch = this.createdMatches.find(m => m.sport === 'cricket');
    if (!cricketMatch) {
      console.log('❌ No cricket match available for validation testing');
      return;
    }

    // Test invalid wickets (> 10)
    console.log('Testing invalid wickets count...');
    const invalidWicketsResult = await this.makeRequest(
      'POST',
      `/matches/${cricketMatch.id}/live-score`,
      {
        matchId: cricketMatch.id,
        team: 'team1',
        scoreData: { wickets: 15 },
        sport: 'Cricket'
      },
      TEST_CONFIG.adminToken
    );
    console.log(!invalidWicketsResult.success ? '✅ Invalid wickets properly rejected' : '❌ Invalid wickets accepted');

    // Test invalid balls (> 5)
    console.log('Testing invalid balls count...');
    const invalidBallsResult = await this.makeRequest(
      'POST',
      `/matches/${cricketMatch.id}/live-score`,
      {
        matchId: cricketMatch.id,
        team: 'team1',
        scoreData: { balls: 8 },
        sport: 'Cricket'
      },
      TEST_CONFIG.adminToken
    );
    console.log(!invalidBallsResult.success ? '✅ Invalid balls properly rejected' : '❌ Invalid balls accepted');

    console.log();
  }

  // Test match retrieval and display
  async testMatchRetrieval() {
    console.log('📊 Testing Match Retrieval...\n');

    // Get all matches
    const allMatchesResult = await this.makeRequest('GET', '/matches');
    if (allMatchesResult.success) {
      console.log(`✅ Retrieved ${allMatchesResult.data.length} matches`);
      
      // Display sample match data
      const sampleMatch = allMatchesResult.data[0];
      if (sampleMatch) {
        console.log('Sample match data:');
        console.log(`- Sport: ${sampleMatch.sport}`);
        console.log(`- Status: ${sampleMatch.status}`);
        if (sampleMatch.sport?.toLowerCase().includes('cricket')) {
          console.log(`- Team1 Score: ${sampleMatch.team1?.cricketScore?.runs || 0}/${sampleMatch.team1?.cricketScore?.wickets || 0}`);
          console.log(`- Team2 Score: ${sampleMatch.team2?.cricketScore?.runs || 0}/${sampleMatch.team2?.cricketScore?.wickets || 0}`);
        } else {
          console.log(`- Team1 Score: ${sampleMatch.team1?.score || 0}`);
          console.log(`- Team2 Score: ${sampleMatch.team2?.score || 0}`);
        }
      }
    } else {
      console.log('❌ Failed to retrieve matches:', allMatchesResult.error);
    }
    console.log();
  }

  // Cleanup test matches
  async cleanup() {
    console.log('🧹 Cleaning up test matches...\n');

    for (const match of this.createdMatches) {
      const result = await this.makeRequest(
        'DELETE',
        `/matches/${match.id}`,
        null,
        TEST_CONFIG.adminToken
      );

      if (result.success) {
        console.log(`✅ Deleted ${match.sport} match`);
      } else {
        console.log(`❌ Failed to delete ${match.sport} match:`, result.error);
      }
    }
    console.log();
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Live Scoring System Tests\n');
    console.log('='.repeat(50));

    try {
      // Create test matches
      await this.testMatchCreation();

      // Test cricket scoring if cricket match was created
      const cricketMatch = this.createdMatches.find(m => m.sport === 'cricket');
      if (cricketMatch) {
        await this.testCricketLiveScoring(cricketMatch.id);
      }

      // Test general sports scoring
      const footballMatch = this.createdMatches.find(m => m.sport === 'football');
      if (footballMatch) {
        await this.testGeneralSportsLiveScoring(footballMatch.id, 'Football');
      }

      const basketballMatch = this.createdMatches.find(m => m.sport === 'basketball');
      if (basketballMatch) {
        await this.testGeneralSportsLiveScoring(basketballMatch.id, 'Basketball');
      }

      // Test permissions
      await this.testPermissions();

      // Test validation
      await this.testValidation();

      // Test match retrieval
      await this.testMatchRetrieval();

    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      // Cleanup
      await this.cleanup();
      console.log('✅ All tests completed!\n');
      console.log('='.repeat(50));
    }
  }
}

// Usage instructions
console.log(`
🏆 Live Scoring System Test Suite
=================================

Before running this test:
1. Update TEST_CONFIG with actual JWT tokens from your system
2. Ensure your backend server is running on http://localhost:5000
3. Make sure you have admin, student_head, and user accounts

To run the tests:
node test_live_scoring.js

This will test:
- Match creation for different sports
- Cricket-specific live scoring (runs, wickets, overs)
- General sports scoring (increment/decrement)
- Permission-based access control
- Input validation rules
- Match data retrieval

`);

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new LiveScoringTester();
  
  // Check if tokens are configured
  const hasTokens = Object.values(TEST_CONFIG).every(token => token !== 'your-admin-token-here' && token !== 'your-student-head-token-here' && token !== 'your-user-token-here');
  
  if (hasTokens) {
    tester.runAllTests();
  } else {
    console.log('⚠️ Please configure TEST_CONFIG with actual JWT tokens before running tests');
  }
}

module.exports = LiveScoringTester;