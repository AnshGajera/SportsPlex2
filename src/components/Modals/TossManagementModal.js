import React, { useState } from 'react';
import { X, Trophy, Users, CheckCircle, AlertCircle } from 'lucide-react';
import matchService from '../../services/matchService';

const TossManagementModal = ({ isOpen, onClose, match, onTossRecorded }) => {
  const [tossData, setTossData] = useState({
    tossWinner: '',
    decision: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !match) return null;

  const isCricket = match.sport?.toLowerCase().includes('cricket');
  const tossCompleted = match.matchConfig?.cricketConfig?.toss?.completed;

  const handleTossSubmit = async (e) => {
    e.preventDefault();
    
    if (!tossData.tossWinner || !tossData.decision) {
      setError('Please select both toss winner and decision');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await matchService.recordToss(match._id, {
        tossWinner: tossData.tossWinner,
        decision: tossData.decision
      });

      if (response.success) {
        onTossRecorded(response.match);
        onClose();
      }
    } catch (error) {
      console.error('Error recording toss:', error);
      setError(error.response?.data?.message || 'Failed to record toss');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTossData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const getBattingTeam = () => {
    if (!tossData.tossWinner || !tossData.decision) return '';
    
    const tossWinnerName = match[tossData.tossWinner]?.name;
    const otherTeamKey = tossData.tossWinner === 'team1' ? 'team2' : 'team1';
    const otherTeamName = match[otherTeamKey]?.name;
    
    if (tossData.decision === 'bat') {
      return tossWinnerName;
    } else {
      return otherTeamName;
    }
  };

  if (!isCricket) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={24} />
              Toss Management
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-600 text-center">
            Toss management is only available for cricket matches.
          </p>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tossCompleted) {
    const toss = match.matchConfig.cricketConfig.toss;
    const tossWinnerName = match[toss.wonBy]?.name;
    const battingFirstTeam = match.matchConfig.cricketConfig.innings?.first?.battingTeam;
    const battingFirstName = match[battingFirstTeam]?.name;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={24} />
              Toss Completed
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <Trophy className="mx-auto mb-2 text-yellow-500" size={32} />
              <h3 className="font-semibold text-green-800 mb-2">Toss Result</h3>
              <p className="text-green-700">
                <strong>{tossWinnerName}</strong> won the toss and chose to{' '}
                <strong>{toss.decision}</strong>
              </p>
              <p className="text-green-600 mt-2">
                <strong>{battingFirstName}</strong> will bat first
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} />
            Record Toss Result
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleTossSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Teams Display */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users size={20} />
              Teams Playing
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="font-medium text-gray-800">{match.team1.name}</p>
                <p className="text-sm text-gray-500">Team 1</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="font-medium text-gray-800">{match.team2.name}</p>
                <p className="text-sm text-gray-500">Team 2</p>
              </div>
            </div>
          </div>

          {/* Toss Winner Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Who won the toss?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('tossWinner', 'team1')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tossData.tossWinner === 'team1'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Trophy 
                  size={20} 
                  className={`mx-auto mb-2 ${
                    tossData.tossWinner === 'team1' ? 'text-blue-500' : 'text-gray-400'
                  }`} 
                />
                <p className="font-medium">{match.team1.name}</p>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('tossWinner', 'team2')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tossData.tossWinner === 'team2'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Trophy 
                  size={20} 
                  className={`mx-auto mb-2 ${
                    tossData.tossWinner === 'team2' ? 'text-blue-500' : 'text-gray-400'
                  }`} 
                />
                <p className="font-medium">{match.team2.name}</p>
              </button>
            </div>
          </div>

          {/* Toss Decision */}
          {tossData.tossWinner && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What did {match[tossData.tossWinner]?.name} choose?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('decision', 'bat')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tossData.decision === 'bat'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      tossData.decision === 'bat' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      🏏
                    </div>
                    <p className="font-medium">Bat First</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('decision', 'bowl')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tossData.decision === 'bowl'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      tossData.decision === 'bowl' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      ⚾
                    </div>
                    <p className="font-medium">Bowl First</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Batting Order Preview */}
          {tossData.tossWinner && tossData.decision && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Batting Order</h4>
              <p className="text-blue-700">
                <strong>{getBattingTeam()}</strong> will bat first
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
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
              disabled={loading || !tossData.tossWinner || !tossData.decision}
              className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                loading || !tossData.tossWinner || !tossData.decision
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Record Toss
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TossManagementModal;