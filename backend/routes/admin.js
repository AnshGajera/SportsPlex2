const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    console.log('=== ADMIN MIDDLEWARE DEBUG ===');
    console.log('req.user from protect middleware:', req.user);
    
    // The protect middleware should have already verified the token
    // Let's fetch the user data from database using the user ID
    const userId = req.user.id;
    console.log('Looking up user with ID:', userId);
    
    const user = await User.findById(userId);
    console.log('User found in database:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('ERROR: User not found in database');
      return res.status(404).json({ message: 'User not found.' });
    }
    
    console.log('User details:', {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName
    });
    
    if (user.role !== 'admin') {
      console.log('ERROR: User role is not admin, role:', user.role);
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }
    
    console.log('SUCCESS: User is admin, allowing access');
    console.log('=== END ADMIN MIDDLEWARE DEBUG ===');
    
    // Add complete user data to req for use in routes
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ message: 'Server error during authorization.' });
  }
};

// Get all users (admin only)
router.get('/users', protect, adminMiddleware, async (req, res) => {
  try {
    console.log('=== GET USERS ROUTE ===');
    console.log('Admin user making request:', req.user.email);
    
    const users = await User.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });
    
    console.log('Total users found:', users.length);
    console.log('Users by role:', {
      students: users.filter(u => u.role === 'student').length,
      student_heads: users.filter(u => u.role === 'student_head').length,
      admins: users.filter(u => u.role === 'admin').length
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Test endpoint to check if basic authentication works
router.get('/test', protect, async (req, res) => {
  try {
    console.log('=== TEST ENDPOINT ===');
    console.log('User from token:', req.user);
    
    const user = await User.findById(req.user.id);
    console.log('User from database:', user ? {
      id: user._id,
      email: user.email,
      role: user.role
    } : 'Not found');
    
    res.json({
      message: 'Authentication successful',
      user: user ? {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      } : null
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', protect, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['student', 'student_head', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Prevent admin from demoting themselves
    if (userId === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot change your own admin role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', protect, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// Get user statistics (admin only)
router.get('/stats', protect, adminMiddleware, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    
    const formattedStats = {
      total: totalUsers,
      students: stats.find(s => s._id === 'student')?.count || 0,
      student_heads: stats.find(s => s._id === 'student_head')?.count || 0,
      admins: stats.find(s => s._id === 'admin')?.count || 0
    };

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

// Search users (admin only)
router.get('/users/search', protect, adminMiddleware, async (req, res) => {
  try {
    const { q, role } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { rollNo: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (role && ['student', 'student_head', 'admin'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

module.exports = router;
