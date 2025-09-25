import api from './api';

// Match service functions
const matchService = {
  // Get all matches
  getAllMatches: async (params = {}) => {
    try {
      const response = await api.get('/matches', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  },

  // Get single match
  getMatchById: async (matchId) => {
    try {
      const response = await api.get(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching match:', error);
      throw error;
    }
  },

  // Update live score
  updateLiveScore: async (matchId, scoreData) => {
    try {
      const response = await api.put(`/matches/${matchId}/live-score`, scoreData);
      return response.data;
    } catch (error) {
      console.error('Error updating live score:', error);
      throw error;
    }
  },

  // Update match status
  updateMatchStatus: async (matchId, status) => {
    try {
      const response = await api.put(`/matches/${matchId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating match status:', error);
      throw error;
    }
  },

  // Get live updates history
  getLiveUpdatesHistory: async (matchId) => {
    try {
      const response = await api.get(`/matches/${matchId}/live-updates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching live updates history:', error);
      throw error;
    }
  },

  // Create new match
  createMatch: async (matchData) => {
    try {
      const response = await api.post('/matches', matchData);
      return response.data;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  // Update match
  updateMatch: async (matchId, matchData) => {
    try {
      const response = await api.put(`/matches/${matchId}`, matchData);
      return response.data;
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  },

  // Delete match
  deleteMatch: async (matchId) => {
    try {
      const response = await api.delete(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting match:', error);
      throw error;
    }
  },

  // Get match analytics
  getMatchAnalytics: async () => {
    try {
      const response = await api.get('/matches/analytics/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching match analytics:', error);
      throw error;
    }
  },

  // Record toss result for cricket matches
  recordToss: async (matchId, tossData) => {
    try {
      const response = await api.put(`/matches/${matchId}/toss`, tossData);
      return response.data;
    } catch (error) {
      console.error('Error recording toss:', error);
      throw error;
    }
  },

  // Switch innings for cricket matches
  switchInnings: async (matchId, inningsData = {}) => {
    try {
      const response = await api.put(`/matches/${matchId}/switch-innings`, inningsData);
      return response.data;
    } catch (error) {
      console.error('Error switching innings:', error);
      throw error;
    }
  }
};

export default matchService;
