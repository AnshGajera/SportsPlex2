const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Debug endpoint to list all users (REMOVE IN PRODUCTION)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('_id firstName middleName lastName email role');
    console.log('All users in database:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only certain file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, JPG, and PNG files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('=== PROFILE API DEBUG ===');
    console.log('JWT decoded user:', req.user);
    console.log('Fetching profile for user ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    console.log('Raw user from DB:', user);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Sending user data:', {
      id: user._id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      rollNo: user.rollNo,
      college: user.college,
      department: user.department,
      role: user.role
    });
    console.log('=== END PROFILE DEBUG ===');
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/profile/update
// @desc    Update user profile
// @access  Private
router.put('/update', protect, async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      college,
      department,
      rollNo
    } = req.body;

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    const updateData = {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      college,
      department,
      rollNo
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile/certificates
// @desc    Get user certificates
// @access  Private
router.get('/certificates', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('certificates');
    res.json({ certificates: user.certificates || [] });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/profile/certificates
// @desc    Upload certificate
// @access  Private
router.post('/certificates', protect, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description } = req.body;

    if (!title) {
      // Delete uploaded file if title is missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Certificate title is required' });
    }

    const certificateData = {
      title,
      description: description || '',
      filePath: `/uploads/certificates/${req.file.filename}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date()
    };

    const user = await User.findById(req.user.id);
    user.certificates.push(certificateData);
    await user.save();

    res.json({
      message: 'Certificate uploaded successfully',
      certificate: certificateData
    });
  } catch (error) {
    console.error('Error uploading certificate:', error);
    
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/profile/certificates/:id
// @desc    Delete certificate
// @access  Private
router.delete('/certificates/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const certificate = user.certificates.id(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', certificate.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove certificate from user document
    user.certificates.pull(req.params.id);
    await user.save();

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
