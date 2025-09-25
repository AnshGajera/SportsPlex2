const express = require('express');
const Match = require('../models/match');
const Club = require('../models/club');
const { protect: authMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/user');
const matchController = require('../controllers/matchController');

const router = express.Router();

// Middleware to check if user is admin or student_head
const adminOrStudentHeadMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'student_head')) {
      return res.status(403).json({ message: 'Access denied. Admin or Student Head access required.' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin/Student Head middleware error:', error);
    return res.status(500).json({ message: 'Server error during authorization.' });
  }
};

// GET /api/matches - Get all matches with filtering
router.get('/', async (req, res) => {
  try {
    const { status, sport, limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    if (sport) {
      query.sport = new RegExp(sport, 'i');
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const matches = await Match.find(query)
      .populate('team1.club', 'name')
      .populate('team2.club', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort({ matchDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Match.countDocuments(query);
    
    res.json({
      matches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalMatches: total,
        hasNext: skip + matches.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error while fetching matches' });
  }
});

// GET /api/matches/:id - Get single match
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1.club', 'name image')
      .populate('team2.club', 'name image')
      .populate('createdBy', 'firstName lastName');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ message: 'Server error while fetching match' });
  }
});

// POST /api/matches - Create new match (Admin/Student Head only)
router.post('/', authMiddleware, adminOrStudentHeadMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      sport,
      team1,
      team2,
      matchDate,
      venue
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !sport || !team1?.name || !team2?.name || !matchDate || !venue) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    // Validate match date is in the future
    if (new Date(matchDate) <= new Date()) {
      return res.status(400).json({ message: 'Match date must be in the future' });
    }
    
    const newMatch = new Match({
      title,
      description,
      sport,
      team1: {
        name: team1.name,
        club: team1.clubId || null
      },
      team2: {
        name: team2.name,
        club: team2.clubId || null
      },
      matchDate: new Date(matchDate),
      venue,
      createdBy: req.user._id
    });
    
    await newMatch.save();
    
    // Populate the created match before returning
    const populatedMatch = await Match.findById(newMatch._id)
      .populate('team1.club', 'name')
      .populate('team2.club', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      message: 'Match created successfully',
      match: populatedMatch
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Server error while creating match' });
  }
});

// PUT /api/matches/:id - Update match (Admin/Student Head only)
router.put('/:id', authMiddleware, adminOrStudentHeadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Validate match date if being updated
    if (updateData.matchDate && new Date(updateData.matchDate) <= new Date()) {
      return res.status(400).json({ message: 'Match date must be in the future' });
    }
    
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('team1.club', 'name')
      .populate('team2.club', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.json({
      message: 'Match updated successfully',
      match: updatedMatch
    });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ message: 'Server error while updating match' });
  }
});

// PUT /api/matches/:id/result - Update match result (Admin/Student Head only)
router.put('/:id/result', authMiddleware, adminOrStudentHeadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { team1Score, team2Score, winner, notes } = req.body;
    
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const updateData = {
      'team1.score': team1Score || 0,
      'team2.score': team2Score || 0,
      'result.winner': winner || null,
      'result.notes': notes || '',
      status: 'completed'
    };
    
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('team1.club', 'name')
      .populate('team2.club', 'name')
      .populate('createdBy', 'firstName lastName');
    
    res.json({
      message: 'Match result updated successfully',
      match: updatedMatch
    });
  } catch (error) {
    console.error('Error updating match result:', error);
    res.status(500).json({ message: 'Server error while updating match result' });
  }
});

// DELETE /api/matches/:id - Delete match (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }
    
    const { id } = req.params;
    
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    await Match.findByIdAndUpdate(id, { isActive: false });
    
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Server error while deleting match' });
  }
});

// PUT /api/matches/:id/live-score - Update live score (Admin/Student Head only)
router.put('/:id/live-score', (req, res, next) => {
  console.log('🚀 Live score route hit! Match ID:', req.params.id);
  next();
}, authMiddleware, adminOrStudentHeadMiddleware, matchController.updateLiveScore);

// PUT /api/matches/:id/status - Update match status (Admin/Student Head only)
router.put('/:id/status', authMiddleware, adminOrStudentHeadMiddleware, matchController.updateMatchStatus);

// GET /api/matches/:id/live-updates - Get live updates history (Admin/Student Head only)
router.get('/:id/live-updates', authMiddleware, adminOrStudentHeadMiddleware, matchController.getLiveUpdatesHistory);

// PUT /api/matches/:id/toss - Record toss result (Admin/Student Head only)
router.put('/:id/toss', authMiddleware, adminOrStudentHeadMiddleware, matchController.recordToss);

// PUT /api/matches/:id/switch-innings - Switch innings for cricket (Admin/Student Head only)
router.put('/:id/switch-innings', authMiddleware, adminOrStudentHeadMiddleware, matchController.switchInnings);

// GET /api/matches/analytics/stats - Get match analytics (Admin only)
router.get('/analytics/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }
    
    const totalMatches = await Match.countDocuments({ isActive: true });
    const liveMatches = await Match.countDocuments({ status: 'live', isActive: true });
    const upcomingMatches = await Match.countDocuments({ status: 'upcoming', isActive: true });
    const completedMatches = await Match.countDocuments({ status: 'completed', isActive: true });
    
    res.json({
      totalMatches,
      liveMatches,
      upcomingMatches,
      completedMatches
    });
  } catch (error) {
    console.error('Error fetching match analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

module.exports = router;