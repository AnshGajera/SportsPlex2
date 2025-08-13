const express = require('express');
const router = express.Router();
const StudentHeadRequest = require('../models/studentHeadRequest');
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware');

// Submit a request to become student head (student only)
router.post('/request', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const studentId = req.user.id;

    // Check if user is already a student_head or admin
    const user = await User.findById(studentId);
    if (user.role !== 'student') {
      return res.status(400).json({ 
        message: 'Only students can request to become Student Head' 
      });
    }

    // Check if there's already a pending request
    const existingRequest = await StudentHeadRequest.findOne({
      student: studentId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending request for Student Head role' 
      });
    }

    // Create new request
    const newRequest = new StudentHeadRequest({
      student: studentId,
      reason: reason
    });

    await newRequest.save();

    res.status(201).json({
      message: 'Student Head request submitted successfully',
      request: newRequest
    });

  } catch (error) {
    console.error('Error submitting student head request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own requests (student only)
router.get('/my-requests', protect, async (req, res) => {
  try {
    const studentId = req.user.id;

    const requests = await StudentHeadRequest.find({ student: studentId })
      .populate('reviewedBy', 'firstName lastName')
      .sort({ submittedAt: -1 });

    res.json(requests);

  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user can submit a request
router.get('/can-request', protect, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Check user role
    const user = await User.findById(studentId);
    if (user.role !== 'student') {
      return res.json({ 
        canRequest: false, 
        reason: 'Only students can request Student Head role' 
      });
    }

    // Check for pending request
    const pendingRequest = await StudentHeadRequest.findOne({
      student: studentId,
      status: 'pending'
    });

    if (pendingRequest) {
      return res.json({ 
        canRequest: false, 
        reason: 'You already have a pending request. Please wait for admin review.' 
      });
    }

    // Check if user was already approved (shouldn't be able to request again)
    const approvedRequest = await StudentHeadRequest.findOne({
      student: studentId,
      status: 'approved'
    });

    if (approvedRequest) {
      return res.json({ 
        canRequest: false, 
        reason: 'You are already a Student Head or have been approved.' 
      });
    }

    res.json({ canRequest: true });

  } catch (error) {
    console.error('Error checking request eligibility:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
