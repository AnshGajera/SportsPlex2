import React, { useState } from 'react';
import { X, ArrowRightLeft, Target, Trophy, AlertCircle, CheckCircle, Timer } from 'lucide-react';
import matchService from '../../services/matchService';

const InningsSwitchModal = ({ isOpen, onClose, match, onInningsSwitched }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  if (!isOpen || !match) return null;

  const isCricket = match.sport?.toLowerCase().includes('cricket');
  const cricketConfig = match.matchConfig?.cricketConfig;
  const tossCompleted = cricketConfig?.toss?.completed;
  const currentInnings = cricketConfig?.currentInnings || 1;

  const handleInningsSwitch = async () => {
    if (!confirmSwitch) {
      setConfirmSwitch(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await matchService.switchInnings(match._id);

      if (response.success) {
        onInningsSwitched(response.match);
        onClose();
      }
    } catch (error) {
      console.error('Error switching innings:', error);
      setError(error.response?.data?.message || 'Failed to switch innings');
    } finally {
      setLoading(false);
    }
  };

  const getFirstInningsScore = () => {
    const battingTeam = cricketConfig?.innings?.first?.battingTeam;
    if (!battingTeam) return null;
    
    const teamData = match[battingTeam];
    return {
      teamName: teamData.name,
      score: teamData.cricketScore,
      runs: teamData.cricketScore?.runs || 0,
      wickets: teamData.cricketScore?.wickets || 0,
      overs: teamData.cricketScore?.overs || 0,
      balls: teamData.cricketScore?.balls || 0
    };
  };

  const getSecondInningsTeam = () => {
    const battingTeam = cricketConfig?.innings?.second?.battingTeam;
    if (!battingTeam) return null;
    
    return match[battingTeam];
  };

  const calculateTarget = () => {
    const firstInningsData = getFirstInningsScore();
    return firstInningsData ? firstInningsData.runs + 1 : 0;
  };

  const calculateRequiredRunRate = () => {
    const target = calculateTarget();
    const totalOvers = cricketConfig?.totalOvers || 20;
    return totalOvers > 0 ? (target / totalOvers).toFixed(2) : '0.00';
  };

  if (!isCricket) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={24} />
              Innings Switch
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-600 text-center">
            Innings switching is only available for cricket matches.
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

  if (!tossCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={24} />
              Cannot Switch Innings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="text-center">
            <Trophy className="mx-auto mb-3 text-yellow-500" size={48} />
            <p className="text-gray-600 mb-4">
              Toss must be completed before switching innings.
            </p>
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

  if (currentInnings === 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={24} />
              Second Innings Active
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="text-center">
            <ArrowRightLeft className="mx-auto mb-3 text-blue-500" size={48} />
            <p className="text-gray-600 mb-4">
              Match is already in the second innings.
            </p>
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

  const firstInningsData = getFirstInningsScore();
  const secondInningsTeam = getSecondInningsTeam();
  const target = calculateTarget();
  const requiredRunRate = calculateRequiredRunRate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ArrowRightLeft className="text-blue-500" size={24} />
            Switch to Second Innings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* First Innings Summary */}
        {firstInningsData && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Trophy size={20} />
              First Innings Complete
            </h3>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    {firstInningsData.teamName}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {firstInningsData.runs}/{firstInningsData.wickets}
                  </p>
                  <p className="text-sm text-gray-500">
                    ({firstInningsData.overs}.{firstInningsData.balls} overs)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Runs</p>
                  <p className="text-xl font-bold text-gray-800">
                    {firstInningsData.runs}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Second Innings Preview */}
        {secondInningsTeam && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Target size={20} />
              Second Innings Details
            </h3>
            
            <div className="space-y-3">
              {/* Chasing Team */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800">Chasing Team</h4>
                    <p className="text-lg font-semibold text-blue-700">
                      {secondInningsTeam.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600">Target</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {target}
                    </p>
                  </div>
                </div>
              </div>

              {/* Match Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="text-green-600" size={16} />
                    <p className="text-sm font-medium text-green-800">Target</p>
                  </div>
                  <p className="text-xl font-bold text-green-700">{target} runs</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="text-orange-600" size={16} />
                    <p className="text-sm font-medium text-orange-800">Required RR</p>
                  </div>
                  <p className="text-xl font-bold text-orange-700">{requiredRunRate}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!confirmSwitch ? (
          /* Initial Switch Button */
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-4">
              This will end the first innings and start the second innings with{' '}
              <strong>{secondInningsTeam?.name}</strong> chasing <strong>{target}</strong> runs.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. Make sure the first innings is truly complete.
            </p>
          </div>
        ) : (
          /* Confirmation */
          <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Confirm Innings Switch</h4>
                <p className="text-yellow-700 text-sm">
                  Are you sure you want to switch to the second innings? This cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirmSwitch) {
                setConfirmSwitch(false);
              } else {
                onClose();
              }
            }}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            {confirmSwitch ? 'Back' : 'Cancel'}
          </button>
          
          <button
            onClick={handleInningsSwitch}
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : confirmSwitch
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Switching...
              </>
            ) : confirmSwitch ? (
              <>
                <CheckCircle size={16} />
                Confirm Switch
              </>
            ) : (
              <>
                <ArrowRightLeft size={16} />
                Switch Innings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InningsSwitchModal;