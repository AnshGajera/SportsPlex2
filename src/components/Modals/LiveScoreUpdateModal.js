import React, { useState, useEffect } from 'react';
import { X, Trophy, Plus, Minus, Activity, AlertCircle, Target, Users, Clock, ArrowRightLeft, Settings } from 'lucide-react';
import TossManagementModal from './TossManagementModal';
import InningsSwitchModal from './InningsSwitchModal';

const LiveScoreUpdateModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  match = null 
}) => {
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

  const [loading, setLoading] = useState(false);
  const [showTossModal, setShowTossModal] = useState(false);
  const [showInningsSwitchModal, setShowInningsSwitchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(match);

  useEffect(() => {
    if (match) {
      const isCricket = match.sport?.toLowerCase().includes('cricket');
      
      setFormData({
        team1Score: match.team1?.score || 0,
        team2Score: match.team2?.score || 0,
        matchStatus: match.status || 'live',
        notes: match.result?.notes || '',
        winner: match.result?.winner || null,
        // Cricket-specific data
        team1Cricket: isCricket ? {
          runs: match.team1?.cricketScore?.runs || 0,
          wickets: match.team1?.cricketScore?.wickets || 0,
          overs: match.team1?.cricketScore?.overs || 0,
          balls: match.team1?.cricketScore?.balls || 0,
          extras: match.team1?.cricketScore?.extras || { wides: 0, noBalls: 0, byes: 0, legByes: 0 }
        } : { runs: 0, wickets: 0, overs: 0, balls: 0, extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 } },
        team2Cricket: isCricket ? {
          runs: match.team2?.cricketScore?.runs || 0,
          wickets: match.team2?.cricketScore?.wickets || 0,
          overs: match.team2?.cricketScore?.overs || 0,
          balls: match.team2?.cricketScore?.balls || 0,
          extras: match.team2?.cricketScore?.extras || { wides: 0, noBalls: 0, byes: 0, legByes: 0 }
        } : { runs: 0, wickets: 0, overs: 0, balls: 0, extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 } },
        cricketConfig: isCricket ? {
          format: match.matchConfig?.cricketConfig?.format || 'T20',
          totalOvers: match.matchConfig?.cricketConfig?.totalOvers || 20,
          currentInnings: match.matchConfig?.cricketConfig?.currentInnings || 1,
          target: match.matchConfig?.cricketConfig?.target || 0
        } : { format: 'T20', totalOvers: 20, currentInnings: 1, target: 0 }
      });
    }
  }, [match, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScoreChange = (team, operation) => {
    const fieldName = team === 'team1' ? 'team1Score' : 'team2Score';
    const currentScore = formData[fieldName];
    
    if (operation === 'increment') {
      setFormData(prev => ({
        ...prev,
        [fieldName]: Math.max(0, currentScore + 1)
      }));
    } else if (operation === 'decrement') {
      setFormData(prev => ({
        ...prev,
        [fieldName]: Math.max(0, currentScore - 1)
      }));
    }
  };

  const handleDirectScoreInput = (team, value) => {
    const fieldName = team === 'team1' ? 'team1Score' : 'team2Score';
    const numValue = Math.max(0, parseInt(value) || 0);
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: numValue
    }));
  };

  // Cricket-specific handlers
  const handleCricketScoreUpdate = (team, field, value, operation = 'set') => {
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
        balls: prev[teamField].balls + 1
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

  const handleCricketExtras = (team, extraType, operation = 'increment') => {
    const teamField = team === 'team1' ? 'team1Cricket' : 'team2Cricket';
    
    setFormData(prev => ({
      ...prev,
      [teamField]: {
        ...prev[teamField],
        runs: operation === 'increment' ? prev[teamField].runs + 1 : Math.max(0, prev[teamField].runs - 1),
        extras: {
          ...prev[teamField].extras,
          [extraType]: operation === 'increment' 
            ? prev[teamField].extras[extraType] + 1 
            : Math.max(0, prev[teamField].extras[extraType] - 1)
        },
        // Don't increment balls for wides and no-balls
        balls: (extraType !== 'wides' && extraType !== 'noBalls') 
          ? prev[teamField].balls + 1 
          : prev[teamField].balls
      }
    }));
  };

  const determineWinner = () => {
    if (formData.team1Score > formData.team2Score) {
      return 'team1';
    } else if (formData.team2Score > formData.team1Score) {
      return 'team2';
    } else {
      return 'draw';
    }
  };

  // Handler for toss completion
  const handleTossRecorded = (updatedMatch) => {
    setCurrentMatch(updatedMatch);
    setShowTossModal(false);
    // Update form data with new match data
    const cricketConfig = updatedMatch.matchConfig?.cricketConfig;
    if (cricketConfig) {
      setFormData(prev => ({
        ...prev,
        cricketConfig: {
          ...prev.cricketConfig,
          currentInnings: cricketConfig.currentInnings || 1,
          target: cricketConfig.innings?.first?.target || 0
        }
      }));
    }
  };

  // Handler for innings switch
  const handleInningsSwitched = (updatedMatch) => {
    setCurrentMatch(updatedMatch);
    setShowInningsSwitchModal(false);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isCricket = match.sport?.toLowerCase().includes('cricket');
      
      const updateData = {
        team1Score: isCricket ? formData.team1Cricket.runs : formData.team1Score,
        team2Score: isCricket ? formData.team2Cricket.runs : formData.team2Score,
        status: formData.matchStatus,
        notes: formData.notes,
        winner: formData.matchStatus === 'completed' ? determineWinner() : null,
        sport: match.sport
      };

      // Add sport-specific data
      if (isCricket) {
        updateData.team1Cricket = formData.team1Cricket;
        updateData.team2Cricket = formData.team2Cricket;
        updateData.cricketConfig = formData.cricketConfig;
      }

      await onSubmit(updateData);
      onClose();
    } catch (error) {
      console.error('Error updating live score:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'live', label: 'Live', color: '#ef4444', icon: Activity },
    { value: 'completed', label: 'Completed', color: '#10b981', icon: Trophy },
    { value: 'upcoming', label: 'Upcoming', color: '#3b82f6', icon: AlertCircle }
  ];

  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Update Live Score</h2>
              <p className="text-sm text-gray-500">{match.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Match Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>📅 {new Date(match.matchDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
                <span>🏟️ {match.venue}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {match.sport}
                </span>
              </div>
            </div>

            {/* Score Update Section */}
            {match.sport?.toLowerCase().includes('cricket') ? (
              // Cricket Score Interface
              <CricketScoreInterface 
                match={currentMatch || match}
                formData={formData}
                onRunsUpdate={addCricketRuns}
                onWicketUpdate={addCricketWicket}
                onExtrasUpdate={handleCricketExtras}
                onDirectUpdate={handleCricketScoreUpdate}
                onShowTossModal={() => setShowTossModal(true)}
                onShowInningsSwitchModal={() => setShowInningsSwitchModal(true)}
              />
            ) : (
              // General Sports Score Interface
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy size={20} />
                  Live Score
                </h3>
                
                <div className="flex items-center justify-center gap-8">
                  {/* Team 1 */}
                  <div className="text-center flex-1">
                    <h4 className="font-semibold text-gray-800 mb-4">{match.team1.name}</h4>
                    
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => handleScoreChange('team1', 'decrement')}
                        className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                        disabled={formData.team1Score <= 0}
                      >
                        <Minus size={16} />
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        value={formData.team1Score}
                        onChange={(e) => handleDirectScoreInput('team1', e.target.value)}
                        className="w-20 h-16 text-3xl font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      
                      <button
                        type="button"
                        onClick={() => handleScoreChange('team1', 'increment')}
                        className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="px-6 py-3 bg-white rounded-lg shadow-sm border">
                    <span className="text-lg font-bold text-gray-500">VS</span>
                  </div>

                  {/* Team 2 */}
                  <div className="text-center flex-1">
                    <h4 className="font-semibold text-gray-800 mb-4">{match.team2.name}</h4>
                    
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => handleScoreChange('team2', 'decrement')}
                        className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                        disabled={formData.team2Score <= 0}
                      >
                        <Minus size={16} />
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        value={formData.team2Score}
                        onChange={(e) => handleDirectScoreInput('team2', e.target.value)}
                        className="w-20 h-16 text-3xl font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      
                      <button
                        type="button"
                        onClick={() => handleScoreChange('team2', 'increment')}
                        className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* Match Status */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Match Status
                </label>
                <div className="flex gap-3 justify-center">
                  {statusOptions.map(status => {
                    const IconComponent = status.icon;
                    return (
                      <label
                        key={status.value}
                        className={`flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-all ${
                          formData.matchStatus === status.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="matchStatus"
                          value={status.value}
                          checked={formData.matchStatus === status.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <IconComponent 
                          size={16} 
                          color={formData.matchStatus === status.value ? '#3b82f6' : status.color} 
                        />
                        <span className={`text-sm font-medium ${
                          formData.matchStatus === status.value ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {status.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Winner Display (for completed matches) */}
            {formData.matchStatus === 'completed' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Match Result</span>
                </div>
                <p className="text-yellow-700">
                  {formData.team1Score === formData.team2Score 

                    ? "Match ended in a draw"
                    : `Winner: ${formData.team1Score > formData.team2Score ? match.team1.name : match.team2.name}`
                  }
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Add any notes about the match (e.g., penalties, red cards, injuries, etc.)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/200 characters
              </p>
            </div>
          {/* End of form content, no extra closing div here */}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                formData.matchStatus === 'live'
                  ? 'bg-red-600 hover:bg-red-700'
                  : formData.matchStatus === 'completed'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Activity size={16} />
                  Update Score
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Toss Management Modal */}
      <TossManagementModal
        isOpen={showTossModal}
        onClose={() => setShowTossModal(false)}
        match={currentMatch || match}
        onTossRecorded={handleTossRecorded}
      />
      
      {/* Innings Switch Modal */}
      <InningsSwitchModal
        isOpen={showInningsSwitchModal}
        onClose={() => setShowInningsSwitchModal(false)}
        match={currentMatch || match}
        onInningsSwitched={handleInningsSwitched}
      />
    </div>
  );
};

// Cricket Score Interface Component
const CricketScoreInterface = ({ 
  match, 
  formData, 
  onRunsUpdate, 
  onWicketUpdate, 
  onExtrasUpdate, 
  onDirectUpdate,
  onShowTossModal,
  onShowInningsSwitchModal 
}) => {
  const currentBattingTeam = formData.cricketConfig.currentInnings === 1 ? 'team1' : 'team2';
  const bowlingTeam = currentBattingTeam === 'team1' ? 'team2' : 'team1';
  
  const currentTeamData = formData[`${currentBattingTeam}Cricket`];
  const targetTeamData = formData[`${bowlingTeam}Cricket`];

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Trophy size={20} />
          Cricket Live Score
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            {formData.cricketConfig.format}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
            Innings {formData.cricketConfig.currentInnings}
          </span>
        </div>
      </div>

      {/* Current Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Batting Team */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">
              {match[currentBattingTeam].name} (Batting)
            </h4>
            <Target size={16} className="text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {currentTeamData.runs}/{currentTeamData.wickets}
          </div>
          <div className="text-sm text-gray-600">
            Overs: {currentTeamData.overs}.{currentTeamData.balls}
          </div>
          {formData.cricketConfig.target > 0 && formData.cricketConfig.currentInnings === 2 && (
            <div className="text-sm text-blue-600 mt-1">
              Target: {formData.cricketConfig.target} | Need: {Math.max(0, formData.cricketConfig.target - currentTeamData.runs)}
            </div>
          )}
        </div>

        {/* Bowling Team */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">
              {match[bowlingTeam].name} (Bowling)
            </h4>
            <Users size={16} className="text-blue-600" />
          </div>
          {formData.cricketConfig.currentInnings === 1 ? (
            <div className="text-lg text-gray-600">Yet to Bat</div>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {targetTeamData.runs}/{targetTeamData.wickets}
              </div>
              <div className="text-sm text-gray-600">
                Overs: {targetTeamData.overs}.{targetTeamData.balls}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toss and Innings Management */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Settings size={16} />
          Match Management
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Toss Management Button */}
          <button
            type="button"
            onClick={onShowTossModal}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              match.matchConfig?.cricketConfig?.toss?.completed
                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
            }`}
            disabled={match.matchConfig?.cricketConfig?.toss?.completed}
          >
            <Trophy size={16} />
            {match.matchConfig?.cricketConfig?.toss?.completed ? 'Toss Completed' : 'Record Toss'}
          </button>

          {/* Innings Switch Button */}
          <button
            type="button"
            onClick={onShowInningsSwitchModal}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
            <ArrowRightLeft size={16} />
            {formData.cricketConfig.currentInnings === 2 ? 'Second Innings Active' : 'Switch Innings'}
          </button>
        </div>

        {/* Toss Status Display */}
        {match.matchConfig?.cricketConfig?.toss?.completed && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-700">
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
      <div className="bg-white rounded-lg p-4 mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Quick Score Update</h5>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {[0, 1, 2, 3, 4, 6].map(runs => (
            <button
              key={runs}
              type="button"
              onClick={() => onRunsUpdate(currentBattingTeam, runs)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                runs === 0 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : runs === 4
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : runs === 6
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {runs === 0 ? 'Dot' : `${runs} Run${runs > 1 ? 's' : ''}`}
            </button>
          ))}
        </div>

        {/* Wicket and Extras */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => onWicketUpdate(currentBattingTeam)}
            className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            Wicket
          </button>
          <button
            type="button"
            onClick={() => onExtrasUpdate(currentBattingTeam, 'wides')}
            className="px-3 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-medium transition-colors"
          >
            Wide
          </button>
          <button
            type="button"
            onClick={() => onExtrasUpdate(currentBattingTeam, 'noBalls')}
            className="px-3 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-medium transition-colors"
          >
            No Ball
          </button>
          <button
            type="button"
            onClick={() => onExtrasUpdate(currentBattingTeam, 'byes')}
            className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Bye
          </button>
          <button
            type="button"
            onClick={() => onExtrasUpdate(currentBattingTeam, 'legByes')}
            className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Leg Bye
          </button>
        </div>
      </div>

      {/* Detailed Score Inputs */}
      <div className="bg-white rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Manual Score Entry</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Runs</label>
            <input
              type="number"
              min="0"
              value={currentTeamData.runs}
              onChange={(e) => onDirectUpdate(currentBattingTeam, 'runs', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Wickets</label>
            <input
              type="number"
              min="0"
              max="10"
              value={currentTeamData.wickets}
              onChange={(e) => onDirectUpdate(currentBattingTeam, 'wickets', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Overs</label>
            <input
              type="number"
              min="0"
              max={formData.cricketConfig.totalOvers}
              value={currentTeamData.overs}
              onChange={(e) => onDirectUpdate(currentBattingTeam, 'overs', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Balls</label>
            <input
              type="number"
              min="0"
              max="5"
              value={currentTeamData.balls}
              onChange={(e) => onDirectUpdate(currentBattingTeam, 'balls', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Extras Display */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Object.entries(currentTeamData.extras).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-xs font-medium text-gray-600 capitalize">{type.replace(/([A-Z])/g, ' $1')}</div>
              <div className="text-sm font-bold text-gray-800">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScoreUpdateModal;