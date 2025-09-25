import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Users, 
  Clock, 
  Activity, 
  Plus, 
  Minus, 
  Settings,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  Save,
  Eye
} from 'lucide-react';
import matchService from '../services/matchService';
import TossManagementModal from '../components/Modals/TossManagementModal';
import InningsSwitchModal from '../components/Modals/InningsSwitchModal';

const LiveScoreUpdate = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTossModal, setShowTossModal] = useState(false);
  const [showInningsSwitchModal, setShowInningsSwitchModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [formData, setFormData] = useState({
    team1Score: 0,
    team2Score: 0,
    matchStatus: 'live',
    notes: '',
    winner: null,
    // Cricket-specific state
    team1Cricket: {
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 }
    },
    team2Cricket: {
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 }
    },
    cricketConfig: {
      format: 'T20',
      totalOvers: 20,
      currentInnings: 1,
      target: 0
    }
  });

  // Fetch match data on component mount
  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || match?.status !== 'live') return;

    const interval = setInterval(() => {
      fetchMatchData();
    }, 30000); // Refresh every 30 seconds for live matches

    return () => clearInterval(interval);
  }, [autoRefresh, match?.status, matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const response = await matchService.getMatchById(matchId);
      setMatch(response);
      
      const isCricket = response.sport?.toLowerCase().includes('cricket');
      
      setFormData({
        team1Score: response.team1?.score || 0,
        team2Score: response.team2?.score || 0,
        matchStatus: response.status || 'live',
        notes: response.result?.notes || '',
        winner: response.result?.winner || null,
        // Cricket-specific data
        team1Cricket: isCricket ? {
          runs: response.team1?.cricketScore?.runs || 0,
          wickets: response.team1?.cricketScore?.wickets || 0,
          overs: response.team1?.cricketScore?.overs || 0,
          balls: response.team1?.cricketScore?.balls || 0,
          extras: response.team1?.cricketScore?.extras || { wides: 0, noBalls: 0, byes: 0, legByes: 0 }
        } : { runs: 0, wickets: 0, overs: 0, balls: 0, extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 } },
        team2Cricket: isCricket ? {
          runs: response.team2?.cricketScore?.runs || 0,
          wickets: response.team2?.cricketScore?.wickets || 0,
          overs: response.team2?.cricketScore?.overs || 0,
          balls: response.team2?.cricketScore?.balls || 0,
          extras: response.team2?.cricketScore?.extras || { wides: 0, noBalls: 0, byes: 0, legByes: 0 }
        } : { runs: 0, wickets: 0, overs: 0, balls: 0, extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 } },
        cricketConfig: isCricket ? {
          format: response.matchConfig?.cricketConfig?.format || 'T20',
          totalOvers: response.matchConfig?.cricketConfig?.totalOvers || 20,
          currentInnings: response.matchConfig?.cricketConfig?.currentInnings || 1,
          target: response.matchConfig?.cricketConfig?.target || 0
        } : { format: 'T20', totalOvers: 20, currentInnings: 1, target: 0 }
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching match:', error);
      setError('Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  // Update score handlers
  const updateGeneralScore = (team, operation, value = 1) => {
    const scoreField = team === 'team1' ? 'team1Score' : 'team2Score';
    
    setFormData(prev => {
      let newScore = prev[scoreField];
      
      if (operation === 'increment') {
        newScore += value;
      } else if (operation === 'decrement') {
        newScore = Math.max(0, newScore - value);
      } else {
        newScore = Math.max(0, parseInt(value) || 0);
      }
      
      return {
        ...prev,
        [scoreField]: newScore
      };
    });
  };

  const updateCricketScore = (team, field, operation, value) => {
    const teamField = team === 'team1' ? 'team1Cricket' : 'team2Cricket';
    
    setFormData(prev => {
      const newTeamData = { ...prev[teamField] };
      
      if (operation === 'increment') {
        newTeamData[field] = Math.max(0, newTeamData[field] + 1);
      } else if (operation === 'decrement') {
        newTeamData[field] = Math.max(0, newTeamData[field] - 1);
      } else {
        newTeamData[field] = Math.max(0, parseInt(value) || 0);
      }

      // Auto-calculate overs from balls
      if (field === 'balls' && newTeamData.balls >= 6) {
        newTeamData.overs += Math.floor(newTeamData.balls / 6);
        newTeamData.balls = newTeamData.balls % 6;
      }

      // Validate wickets (max 10 for most formats)
      if (field === 'wickets' && newTeamData.wickets > 10) {
        newTeamData.wickets = 10;
      }

      return {
        ...prev,
        [teamField]: newTeamData
      };
    });
  };

  const addCricketRuns = (team, runs) => {
    const teamField = team === 'team1' ? 'team1Cricket' : 'team2Cricket';
    
    setFormData(prev => ({
      ...prev,
      [teamField]: {
        ...prev[teamField],
        runs: prev[teamField].runs + runs,
        balls: runs === 0 ? prev[teamField].balls + 1 : prev[teamField].balls + 1 // Add ball for dot and runs
      }
    }));
  };

  const addCricketWicket = (team) => {
    const teamField = team === 'team1' ? 'team1Cricket' : 'team2Cricket';
    
    setFormData(prev => ({
      ...prev,
      [teamField]: {
        ...prev[teamField],
        wickets: Math.min(prev[teamField].wickets + 1, 10),
        balls: prev[teamField].balls + 1
      }
    }));
  };

  const handleCricketExtras = (team, extraType) => {
    const teamField = team === 'team1' ? 'team1Cricket' : 'team2Cricket';
    
    setFormData(prev => ({
      ...prev,
      [teamField]: {
        ...prev[teamField],
        runs: prev[teamField].runs + 1,
        extras: {
          ...prev[teamField].extras,
          [extraType]: prev[teamField].extras[extraType] + 1
        },
        balls: (extraType !== 'wides' && extraType !== 'noBalls') 
          ? prev[teamField].balls + 1 
          : prev[teamField].balls
      }
    }));
  };

  // Save live score
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const isCricket = match.sport?.toLowerCase().includes('cricket');
      
      const updateData = {
        team1Score: isCricket ? formData.team1Cricket.runs : formData.team1Score,
        team2Score: isCricket ? formData.team2Cricket.runs : formData.team2Score,
        status: formData.matchStatus,
        notes: formData.notes,
        sport: match.sport,
        updateType: 'live_score',
        timestamp: new Date().toISOString()
      };

      if (isCricket) {
        updateData.team1Cricket = {
          runs: formData.team1Cricket.runs,
          wickets: formData.team1Cricket.wickets,
          overs: formData.team1Cricket.overs,
          balls: formData.team1Cricket.balls,
          extras: formData.team1Cricket.extras
        };
        updateData.team2Cricket = {
          runs: formData.team2Cricket.runs,
          wickets: formData.team2Cricket.wickets,
          overs: formData.team2Cricket.overs,
          balls: formData.team2Cricket.balls,
          extras: formData.team2Cricket.extras
        };
        updateData.cricketConfig = {
          format: formData.cricketConfig.format,
          totalOvers: formData.cricketConfig.totalOvers,
          currentInnings: formData.cricketConfig.currentInnings,
          target: formData.cricketConfig.target
        };
      }

      console.log('Updating live score with data:', updateData);
      const response = await matchService.updateLiveScore(matchId, updateData);
      
      if (response.success) {
        setSuccess('Live score updated successfully!');
        setMatch(response.match);
        setLastUpdated(new Date());
        setTimeout(() => setSuccess(''), 3000);
        
        // Refresh match data to get latest updates from server
        setTimeout(() => fetchMatchData(), 1000);
      } else {
        setError(response.message || 'Failed to update live score');
      }
    } catch (error) {
      console.error('Error updating live score:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to update live score'
      );
    } finally {
      setSaving(false);
    }
  };

  // Toss and innings handlers
  const handleTossRecorded = (updatedMatch) => {
    setMatch(updatedMatch);
    setShowTossModal(false);
    setSuccess('Toss recorded successfully!');
    setLastUpdated(new Date());
    setTimeout(() => setSuccess(''), 3000);
    
    // Refresh match data
    setTimeout(() => fetchMatchData(), 1000);
  };

  const handleInningsSwitched = (updatedMatch) => {
    setMatch(updatedMatch);
    setShowInningsSwitchModal(false);
    setSuccess('Innings switched successfully!');
    setLastUpdated(new Date());
    setTimeout(() => setSuccess(''), 3000);
    
    // Update form data for second innings
    const cricketConfig = updatedMatch.matchConfig?.cricketConfig;
    if (cricketConfig) {
      setFormData(prev => ({
        ...prev,
        cricketConfig: {
          ...prev.cricketConfig,
          currentInnings: cricketConfig.currentInnings || 2,
          target: cricketConfig.innings?.second?.chasing || 0
        }
      }));
    }
    
    // Refresh match data
    setTimeout(() => fetchMatchData(), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match data...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Match Not Found</h2>
          <p className="text-gray-600 mb-4">The requested match could not be loaded.</p>
          <button
            onClick={() => navigate('/admin/matches')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const isCricket = match.sport?.toLowerCase().includes('cricket');
  const currentBattingTeam = formData.cricketConfig.currentInnings === 1 ? 'team1' : 'team2';
  const bowlingTeam = currentBattingTeam === 'team1' ? 'team2' : 'team1';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/matches')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Matches</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-800">Live Score Update</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Auto-refresh controls */}
              {match.status === 'live' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      autoRefresh
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                  </button>
                  {lastUpdated && (
                    <span className="text-xs text-gray-500">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
              
              {match.status === 'live' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  LIVE
                </div>
              )}
              
              {/* Manual Refresh Button */}
              <button
                onClick={() => fetchMatchData()}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Activity size={14} />
                )}
                Refresh
              </button>
              
              {/* Save Button in Header */}
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Live Score
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={16} />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={16} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Auto-refresh info for live matches */}
      {match?.status === 'live' && autoRefresh && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-blue-700 text-xs">Auto-refreshing every 30 seconds for live updates</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Match Info Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Match Information</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{match.title}</h3>
                  <p className="text-sm text-gray-600">{match.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium">
                      {new Date(match.matchDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <p className="font-medium">
                      {new Date(match.matchDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Venue:</span>
                    <p className="font-medium text-sm">{match.venue}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sport:</span>
                    <p className="font-medium">{match.sport}</p>
                  </div>
                </div>

                {/* Teams */}
                <div className="pt-3 border-t">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Teams</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-xs">T1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{match.team1.name}</p>
                        <p className="text-xs text-gray-500">Team 1</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-700 font-semibold text-xs">T2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{match.team2.name}</p>
                        <p className="text-xs text-gray-500">Team 2</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Scoring Interface */}
          <div className="lg:col-span-9">
            {isCricket ? (
              <CricketScoringInterface
                match={match}
                formData={formData}
                loading={loading}
                onRunsUpdate={addCricketRuns}
                onWicketUpdate={addCricketWicket}
                onExtrasUpdate={handleCricketExtras}
                onDirectUpdate={updateCricketScore}
                onShowTossModal={() => setShowTossModal(true)}
                onShowInningsSwitchModal={() => setShowInningsSwitchModal(true)}
                currentBattingTeam={currentBattingTeam}
                bowlingTeam={bowlingTeam}
              />
            ) : (
              <GeneralScoringInterface
                match={match}
                formData={formData}
                onScoreUpdate={updateGeneralScore}
              />
            )}

            {/* Match Status and Notes */}
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Match Status & Notes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Match Status
                  </label>
                  <select
                    value={formData.matchStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, matchStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Match Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Add match notes..."
                  />
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Modals */}
      <TossManagementModal
        isOpen={showTossModal}
        onClose={() => setShowTossModal(false)}
        match={match}
        onTossRecorded={handleTossRecorded}
      />
      
      <InningsSwitchModal
        isOpen={showInningsSwitchModal}
        onClose={() => setShowInningsSwitchModal(false)}
        match={match}
        onInningsSwitched={handleInningsSwitched}
      />
    </div>
  );
};

// Cricket Scoring Interface Component
const CricketScoringInterface = ({ 
  match, 
  formData, 
  loading,
  onRunsUpdate, 
  onWicketUpdate, 
  onExtrasUpdate, 
  onDirectUpdate,
  onShowTossModal,
  onShowInningsSwitchModal,
  currentBattingTeam,
  bowlingTeam
}) => {
  const currentTeamData = formData[`${currentBattingTeam}Cricket`];
  const bowlingTeamData = formData[`${bowlingTeam}Cricket`];

  return (
    <div className="space-y-4">
      {/* Cricket Scoreboard */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            Cricket Live Score
            {loading && (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin ml-2"></div>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {formData.cricketConfig.format}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Innings {formData.cricketConfig.currentInnings}
            </span>
          </div>
        </div>

        {/* Current Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Batting Team */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800">
                {match[currentBattingTeam].name}
              </h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Batting
              </span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {currentTeamData.runs}/{currentTeamData.wickets}
            </div>
            <div className="text-sm text-gray-600">
              Overs: {currentTeamData.overs}.{currentTeamData.balls}
            </div>
            {formData.cricketConfig.target > 0 && formData.cricketConfig.currentInnings === 2 && (
              <div className="text-xs text-blue-600 mt-1">
                Target: {formData.cricketConfig.target} | 
                Need: {Math.max(0, formData.cricketConfig.target - currentTeamData.runs)} runs
              </div>
            )}
          </div>

          {/* Bowling Team */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800">
                {match[bowlingTeam].name}
              </h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Bowling
              </span>
            </div>
            {formData.cricketConfig.currentInnings === 1 ? (
              <div className="text-base text-gray-600">Yet to Bat</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {bowlingTeamData.runs}/{bowlingTeamData.wickets}
                </div>
                <div className="text-sm text-gray-600">
                  Overs: {bowlingTeamData.overs}.{bowlingTeamData.balls}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Match Management */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Settings size={16} />
          Match Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <button
            onClick={onShowTossModal}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              match.matchConfig?.cricketConfig?.toss?.completed
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
            }`}
            disabled={match.matchConfig?.cricketConfig?.toss?.completed}
          >
            <Trophy size={14} />
            {match.matchConfig?.cricketConfig?.toss?.completed ? 'Toss Completed' : 'Record Toss'}
          </button>

          <button
            onClick={onShowInningsSwitchModal}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              formData.cricketConfig.currentInnings === 2
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : match.matchConfig?.cricketConfig?.toss?.completed
                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
            disabled={
              formData.cricketConfig.currentInnings === 2 || 
              !match.matchConfig?.cricketConfig?.toss?.completed
            }
          >
            <ArrowRightLeft size={14} />
            {formData.cricketConfig.currentInnings === 2 ? 'Second Innings' : 'Switch Innings'}
          </button>
        </div>

        {/* Toss Status */}
        {match.matchConfig?.cricketConfig?.toss?.completed && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-700">
              <strong>Toss:</strong> {match[match.matchConfig.cricketConfig.toss.wonBy]?.name} won and chose to{' '}
              {match.matchConfig.cricketConfig.toss.decision}
              {match.matchConfig.cricketConfig.innings?.first?.battingTeam && (
                <>
                  {' • '}
                  <strong>{match[match.matchConfig.cricketConfig.innings.first.battingTeam]?.name}</strong> batting first
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Score Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Quick Score Update</h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {[0, 1, 2, 3, 4, 6].map(runs => (
            <button
              key={runs}
              onClick={() => onRunsUpdate(currentBattingTeam, runs)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                runs === 0 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : runs === 4
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : runs === 6
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {runs === 0 ? 'Dot' : `${runs}${runs > 1 ? 's' : ''}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => onWicketUpdate(currentBattingTeam)}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Wicket
          </button>
          <button
            onClick={() => onExtrasUpdate(currentBattingTeam, 'wides')}
            className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
          >
            Wide
          </button>
          <button
            onClick={() => onExtrasUpdate(currentBattingTeam, 'noBalls')}
            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
          >
            No Ball
          </button>
          <button
            onClick={() => onExtrasUpdate(currentBattingTeam, 'byes')}
            className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
          >
            Bye
          </button>
        </div>

        {/* Manual Entry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Runs</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDirectUpdate(currentBattingTeam, 'runs', 'decrement')}
                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={currentTeamData.runs}
                onChange={(e) => onDirectUpdate(currentBattingTeam, 'runs', 'set', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                min="0"
              />
              <button
                onClick={() => onDirectUpdate(currentBattingTeam, 'runs', 'increment')}
                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Wickets</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDirectUpdate(currentBattingTeam, 'wickets', 'decrement')}
                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={currentTeamData.wickets}
                onChange={(e) => onDirectUpdate(currentBattingTeam, 'wickets', 'set', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                min="0"
                max="10"
              />
              <button
                onClick={() => onDirectUpdate(currentBattingTeam, 'wickets', 'increment')}
                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Overs</label>
            <input
              type="number"
              value={currentTeamData.overs}
              onChange={(e) => onDirectUpdate(currentBattingTeam, 'overs', 'set', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm"
              min="0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Balls</label>
            <input
              type="number"
              value={currentTeamData.balls}
              onChange={(e) => onDirectUpdate(currentBattingTeam, 'balls', 'set', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm"
              min="0"
              max="5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// General Scoring Interface Component
const GeneralScoringInterface = ({ match, formData, onScoreUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Activity size={24} />
          Live Score
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team 1 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{match.team1.name}</h3>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">{formData.team1Score}</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => onScoreUpdate('team1', 'decrement')}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 shadow-sm"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => onScoreUpdate('team1', 'increment')}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(points => (
                <button
                  key={points}
                  onClick={() => onScoreUpdate('team1', 'increment', points)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  +{points}
                </button>
              ))}
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{match.team2.name}</h3>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-green-600 mb-2">{formData.team2Score}</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => onScoreUpdate('team2', 'decrement')}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 shadow-sm"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => onScoreUpdate('team2', 'increment')}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(points => (
                <button
                  key={points}
                  onClick={() => onScoreUpdate('team2', 'increment', points)}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  +{points}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScoreUpdate;