const Match = require('../models/match');
const User = require('../models/user');

// Update live score for a match
const updateLiveScore = async (req, res) => {
  try {
    const { id: matchId } = req.params;
    const { 
      team1Score, 
      team2Score, 
      status, 
      notes, 
      winner, 
      sport,
      team1Cricket,
      team2Cricket,
      cricketConfig
    } = req.body;
    const updatedBy = req.user._id;

    // Find the match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ 
        success: false, 
        message: 'Match not found' 
      });
    }

    const isCricket = match.sport?.toLowerCase().includes('cricket');

    // Validate scores based on sport
    if (isCricket) {
      // Cricket-specific validation
      if (team1Cricket?.runs < 0 || team2Cricket?.runs < 0) {
        return res.status(400).json({
          success: false,
          message: 'Runs cannot be negative'
        });
      }
      if (team1Cricket?.wickets > 10 || team2Cricket?.wickets > 10) {
        return res.status(400).json({
          success: false,
          message: 'Wickets cannot exceed 10'
        });
      }
      if (team1Cricket?.balls > 5 || team2Cricket?.balls > 5) {
        return res.status(400).json({
          success: false,
          message: 'Balls in an over cannot exceed 5'
        });
      }
    } else {
      // General sports validation
      if (team1Score < 0 || team2Score < 0) {
        return res.status(400).json({
          success: false,
          message: 'Scores cannot be negative'
        });
      }
    }

    // Create live update entry
    const liveUpdate = {
      updatedBy,
      updateType: isCricket ? 'cricket_event' : 'score_update',
      team1Score: isCricket ? team1Cricket.runs : parseInt(team1Score),
      team2Score: isCricket ? team2Cricket.runs : parseInt(team2Score),
      status,
      notes: notes || '',
      timestamp: new Date()
    };

    // Add cricket-specific update data
    if (isCricket && team1Cricket && team2Cricket) {
      const currentBattingTeam = cricketConfig?.currentInnings === 1 ? 'team1' : 'team2';
      liveUpdate.cricketUpdate = {
        team: currentBattingTeam,
        runs: currentBattingTeam === 'team1' ? team1Cricket.runs : team2Cricket.runs,
        wickets: currentBattingTeam === 'team1' ? team1Cricket.wickets : team2Cricket.wickets,
        overs: currentBattingTeam === 'team1' ? team1Cricket.overs : team2Cricket.overs,
        balls: currentBattingTeam === 'team1' ? team1Cricket.balls : team2Cricket.balls,
        extras: currentBattingTeam === 'team1' ? team1Cricket.extras : team2Cricket.extras
      };
    }

    // Prepare update data
    const updateData = {
      status,
      lastUpdated: new Date(),
      lastUpdatedBy: updatedBy,
      $push: { liveUpdates: liveUpdate }
    };

    if (isCricket) {
      // Update cricket-specific scores
      updateData['team1.score'] = team1Cricket.runs;
      updateData['team2.score'] = team2Cricket.runs;
      updateData['team1.cricketScore'] = team1Cricket;
      updateData['team2.cricketScore'] = team2Cricket;
      if (cricketConfig) {
        updateData['matchConfig.cricketConfig'] = cricketConfig;
      }
    } else {
      // Update general scores
      updateData['team1.score'] = parseInt(team1Score);
      updateData['team2.score'] = parseInt(team2Score);
    }

    // If match is completed, set the result
    if (status === 'completed') {
      let matchWinner = winner;
      if (!matchWinner) {
        const score1 = isCricket ? team1Cricket.runs : team1Score;
        const score2 = isCricket ? team2Cricket.runs : team2Score;
        
        if (score1 > score2) {
          matchWinner = 'team1';
        } else if (score2 > score1) {
          matchWinner = 'team2';
        } else {
          matchWinner = 'draw';
        }
      }
      
      updateData['result.winner'] = matchWinner;
      updateData['result.notes'] = notes || '';
    }

    // Update the match
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('team1.club', 'name')
      .populate('team2.club', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Live score updated successfully',
      match: updatedMatch
    });

  } catch (error) {
    console.error('Error updating live score:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating live score'
    });
  }
};

// Get live updates history for a match
const getLiveUpdatesHistory = async (req, res) => {
  try {
    const { id: matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate('liveUpdates.updatedBy', 'firstName lastName role')
      .select('liveUpdates title team1.name team2.name');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Sort updates by timestamp (newest first)
    const sortedUpdates = match.liveUpdates.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({
      success: true,
      match: {
        id: match._id,
        title: match.title,
        teams: {
          team1: match.team1.name,
          team2: match.team2.name
        }
      },
      liveUpdates: sortedUpdates
    });

  } catch (error) {
    console.error('Error fetching live updates history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching live updates history'
    });
  }
};

// Change match status (upcoming -> live -> completed)
const updateMatchStatus = async (req, res) => {
  try {
    const { id: matchId } = req.params;
    const { status } = req.body;
    const updatedBy = req.user._id;

    // Validate status
    const validStatuses = ['upcoming', 'live', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Create live update entry for status change
    const liveUpdate = {
      updatedBy,
      updateType: 'status_change',
      team1Score: match.team1.score,
      team2Score: match.team2.score,
      status,
      notes: `Status changed from ${match.status} to ${status}`,
      timestamp: new Date()
    };

    // Update match
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      {
        status,
        lastUpdated: new Date(),
        lastUpdatedBy: updatedBy,
        $push: { liveUpdates: liveUpdate }
      },
      { new: true, runValidators: true }
    )
      .populate('team1.club', 'name')
      .populate('team2.club', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Match status updated successfully',
      match: updatedMatch
    });

  } catch (error) {
    console.error('Error updating match status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating match status'
    });
  }
};

// Record toss result for cricket matches
const recordToss = async (req, res) => {
  try {
    const { id: matchId } = req.params;
    const { tossWinner, decision } = req.body;
    const updatedBy = req.user._id;

    // Validate input
    if (!['team1', 'team2'].includes(tossWinner)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid toss winner. Must be team1 or team2'
      });
    }

    if (!['bat', 'bowl'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid toss decision. Must be bat or bowl'
      });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if it's a cricket match
    if (!match.sport?.toLowerCase().includes('cricket')) {
      return res.status(400).json({
        success: false,
        message: 'Toss recording is only available for cricket matches'
      });
    }

    // Check if toss is already completed
    if (match.matchConfig?.cricketConfig?.toss?.completed) {
      return res.status(400).json({
        success: false,
        message: 'Toss has already been recorded for this match'
      });
    }

    // Determine batting order based on toss result
    const battingFirst = decision === 'bat' ? tossWinner : (tossWinner === 'team1' ? 'team2' : 'team1');
    const battingSecond = battingFirst === 'team1' ? 'team2' : 'team1';

    // Create live update for toss
    const liveUpdate = {
      updatedBy,
      updateType: 'cricket_event',
      team1Score: match.team1.score || 0,
      team2Score: match.team2.score || 0,
      status: match.status,
      notes: `Toss: ${match[tossWinner].name} won and chose to ${decision}. ${match[battingFirst].name} will bat first.`,
      cricketUpdate: {
        eventType: 'toss',
        team: tossWinner
      },
      timestamp: new Date()
    };

    // Update match with toss information
    const updateData = {
      'matchConfig.cricketConfig.toss.completed': true,
      'matchConfig.cricketConfig.toss.wonBy': tossWinner,
      'matchConfig.cricketConfig.toss.decision': decision,
      'matchConfig.cricketConfig.innings.first.battingTeam': battingFirst,
      'matchConfig.cricketConfig.innings.second.battingTeam': battingSecond,
      'matchConfig.cricketConfig.currentBattingTeam': battingFirst,
      'matchConfig.cricketConfig.matchPhase': 'toss_completed',
      lastUpdated: new Date(),
      lastUpdatedBy: updatedBy,
      $push: { liveUpdates: liveUpdate }
    };

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('team1.club', 'name')
      .populate('team2.club', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Toss recorded successfully',
      match: updatedMatch
    });

  } catch (error) {
    console.error('Error recording toss:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording toss'
    });
  }
};

// Switch innings for cricket matches
const switchInnings = async (req, res) => {
  try {
    const { id: matchId } = req.params;
    const { target } = req.body;
    const updatedBy = req.user._id;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if it's a cricket match
    if (!match.sport?.toLowerCase().includes('cricket')) {
      return res.status(400).json({
        success: false,
        message: 'Innings switching is only available for cricket matches'
      });
    }

    const cricketConfig = match.matchConfig?.cricketConfig;
    if (!cricketConfig) {
      return res.status(400).json({
        success: false,
        message: 'Cricket configuration not found'
      });
    }

    // Check if toss is completed
    if (!cricketConfig.toss?.completed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot switch innings before toss is completed'
      });
    }

    // Check current innings
    if (cricketConfig.currentInnings === 2) {
      return res.status(400).json({
        success: false,
        message: 'Match is already in second innings'
      });
    }

    // Calculate target for second innings
    const firstInningsBattingTeam = cricketConfig.innings.first.battingTeam;
    const firstInningsScore = match[firstInningsBattingTeam].cricketScore.runs;
    const calculatedTarget = firstInningsScore + 1;

    // Determine chasing team and required runs
    const secondInningsBattingTeam = cricketConfig.innings.second.battingTeam;
    const requiredRuns = calculatedTarget;
    const totalOvers = cricketConfig.totalOvers || 20;
    const requiredRunRate = (requiredRuns / totalOvers).toFixed(2);

    // Create live update for innings switch
    const liveUpdate = {
      updatedBy,
      updateType: 'cricket_event',
      team1Score: match.team1.cricketScore.runs,
      team2Score: match.team2.cricketScore.runs,
      status: match.status,
      notes: `End of first innings. ${match[firstInningsBattingTeam].name}: ${firstInningsScore} runs. Target for ${match[secondInningsBattingTeam].name}: ${calculatedTarget} runs. Required run rate: ${requiredRunRate}`,
      cricketUpdate: {
        eventType: 'innings_break',
        team: secondInningsBattingTeam
      },
      timestamp: new Date()
    };

    // Update match for second innings
    const updateData = {
      'matchConfig.cricketConfig.currentInnings': 2,
      'matchConfig.cricketConfig.innings.first.completed': true,
      'matchConfig.cricketConfig.innings.first.target': calculatedTarget,
      'matchConfig.cricketConfig.innings.second.chasing': requiredRuns,
      'matchConfig.cricketConfig.innings.second.requiredRunRate': parseFloat(requiredRunRate),
      'matchConfig.cricketConfig.currentBattingTeam': secondInningsBattingTeam,
      'matchConfig.cricketConfig.matchPhase': 'second_innings',
      lastUpdated: new Date(),
      lastUpdatedBy: updatedBy,
      $push: { liveUpdates: liveUpdate }
    };

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('team1.club', 'name')
      .populate('team2.club', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Innings switched successfully',
      match: updatedMatch,
      target: calculatedTarget,
      requiredRunRate: parseFloat(requiredRunRate)
    });

  } catch (error) {
    console.error('Error switching innings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while switching innings'
    });
  }
};

module.exports = {
  updateLiveScore,
  getLiveUpdatesHistory,
  updateMatchStatus,
  recordToss,
  switchInnings
};