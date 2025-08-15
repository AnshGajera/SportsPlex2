const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Club = require('../models/club');
const { protect: authMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/user');

const router = express.Router();

// Configure multer for club image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/clubs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'club-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

// GET /api/clubs - Get all active clubs with search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { isActive: true };
    
    // Add search functionality
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex }
      ];
    }
    
    // Get clubs with member count
    const clubs = await Club.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Add member count to each club
    const clubsWithCount = clubs.map(club => ({
      ...club.toObject(),
      memberCount: club.members.length
    }));
    
    res.json(clubsWithCount);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Failed to fetch clubs', error: error.message });
  }
});

// GET /api/clubs/:id - Get specific club by ID
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email role college department rollNo phoneNumber')
      .populate({
        path: 'members.user'
        // Temporarily remove select to get all fields and see what's available
      });
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Debug: Log the populated member data to see if phoneNumber is included
    console.log('=== BACKEND CLUB MEMBERS DEBUG ===');
    if (club.members && club.members.length > 0) {
      club.members.forEach((member, index) => {
        console.log(`Member ${index + 1}:`, {
          name: `${member.user.firstName} ${member.user.lastName}`,
          email: member.user.email,
          phoneNumber: member.user.phoneNumber,
          phoneType: typeof member.user.phoneNumber,
          userId: member.user._id,
          fullUser: member.user
        });
      });
    }
    
    res.json(club);
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: 'Failed to fetch club', error: error.message });
  }
});

// POST /api/clubs - Create new club (requires authentication and admin/student_head role)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // Check if user has permission to create clubs
    if (!req.user || !['admin', 'student_head'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins and student heads can create clubs' });
    }
    
    const { name, description, category, contactEmail, maxMembers, requirements, status } = req.body;
    
    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description, and category are required' });
    }
    
    // Check if club name already exists
    const existingClub = await Club.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingClub) {
      return res.status(400).json({ message: 'Club with this name already exists' });
    }
    
    // Prepare club data
    const clubData = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      createdBy: req.user._id,
      isActive: true // Always set to active
    };

    // Add optional fields if provided
    if (contactEmail) {
      clubData.contactEmail = contactEmail.trim();
    }
    if (maxMembers) {
      clubData.maxMembers = parseInt(maxMembers);
    }
    if (requirements) {
      clubData.requirements = requirements.trim();
    }
    
    // Add image path if uploaded
    if (req.file) {
      clubData.image = `/uploads/clubs/${req.file.filename}`;
    }
    
    // Create club
    const club = new Club(clubData);
    
    // Add creator as admin member
    club.members.push({
      user: req.user._id,
      role: 'admin',
      joinedAt: new Date()
    });
    
    await club.save();
    
    // Populate for response
    await club.populate('createdBy', 'firstName lastName email');
    await club.populate('members.user', 'firstName lastName email');
    
    res.status(201).json(club);
  } catch (error) {
    console.error('Error creating club:', error);
    
    // Delete uploaded image if club creation fails
    if (req.file) {
      const imagePath = path.join(__dirname, '../uploads/clubs', req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Failed to create club', error: error.message });
  }
});

// PUT /api/clubs/:id - Update club (requires authentication and proper permissions)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Check permissions (club creator, admin, or club admin)
    const isCreator = club.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isClubAdmin = club.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );
    
    if (!isCreator && !isAdmin && !isClubAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    const { name, description, category, isActive } = req.body;
    
    // Check if new name conflicts with existing clubs
    if (name && name !== club.name) {
      const existingClub = await Club.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: club._id }
      });
      if (existingClub) {
        return res.status(400).json({ message: 'Club with this name already exists' });
      }
    }
    
    // Update basic fields
    if (name) club.name = name.trim();
    if (description) club.description = description.trim();
    if (category) club.category = category.trim();
    if (typeof isActive !== 'undefined') club.isActive = isActive;
    
    // Update image if new one uploaded
    if (req.file) {
      // Delete old image if exists
      if (club.image) {
        const oldImagePath = path.join(__dirname, '..', club.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      club.image = `/uploads/clubs/${req.file.filename}`;
    }
    
    await club.save();
    
    // Populate for response
    await club.populate('createdBy', 'firstName lastName email');
    await club.populate('members.user', 'firstName lastName email');
    
    res.json({ message: 'Club updated successfully', club });
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ message: 'Failed to update club', error: error.message });
  }
});

// DELETE /api/clubs/:id - Delete club (requires authentication and proper permissions)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Check permissions (only creator or admin can delete)
    const isCreator = club.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Permission denied. Only club creator or admin can delete clubs' });
    }
    
    // Delete club image if exists
    if (club.image) {
      const imagePath = path.join(__dirname, '..', club.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Club.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ message: 'Failed to delete club', error: error.message });
  }
});

// POST /api/clubs/:id/join - Join a club (requires authentication)
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    if (!club.isActive) {
      return res.status(400).json({ message: 'Cannot join inactive club' });
    }
    
    try {
      await club.addMember(req.user._id);
      await club.populate('members.user', 'firstName lastName email');
      
      res.json({ message: 'Successfully joined the club', club });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ message: 'Failed to join club', error: error.message });
  }
});

// POST /api/clubs/:id/leave - Leave a club (requires authentication)
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    try {
      await club.removeMember(req.user._id);
      await club.populate('members.user', 'firstName lastName email');
      
      res.json({ message: 'Successfully left the club', club });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Error leaving club:', error);
    res.status(500).json({ message: 'Failed to leave club', error: error.message });
  }
});

// DELETE /api/clubs/:id/members/:memberId - Remove member from club (admin only)
router.delete('/:id/members/:memberId', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check permissions - only system admin or club admin can remove members
    const isSystemAdmin = req.user.role === 'admin';
    const isClubAdmin = club.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isSystemAdmin && !isClubAdmin) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Find and remove the member
    const memberIndex = club.members.findIndex(member => member.user.toString() === req.params.memberId);
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in this club' });
    }

    // Prevent removing the last admin (unless it's a system admin doing it)
    const memberToRemove = club.members[memberIndex];
    if (memberToRemove.role === 'admin') {
      const adminCount = club.members.filter(m => m.role === 'admin').length;
      if (adminCount === 1 && !isSystemAdmin) {
        return res.status(400).json({ message: 'Cannot remove the last admin of the club' });
      }
    }

    club.members.splice(memberIndex, 1);
    await club.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
});

// PUT /api/clubs/:id/members/:memberId/role - Update member role (admin only)
router.put('/:id/members/:memberId/role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be member, moderator, or admin' });
    }

    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check permissions - only system admin or club admin can change roles
    const isSystemAdmin = req.user.role === 'admin';
    const isClubAdmin = club.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isSystemAdmin && !isClubAdmin) {
      return res.status(403).json({ message: 'Only admins can change member roles' });
    }

    // Find the member
    const memberIndex = club.members.findIndex(member => member.user.toString() === req.params.memberId);
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in this club' });
    }

    const currentMember = club.members[memberIndex];
    
    // Prevent removing admin role if it's the last admin (unless system admin)
    if (currentMember.role === 'admin' && role !== 'admin') {
      const adminCount = club.members.filter(m => m.role === 'admin').length;
      if (adminCount === 1 && !isSystemAdmin) {
        return res.status(400).json({ message: 'Cannot remove admin role from the last admin of the club' });
      }
    }

    // Update the role
    club.members[memberIndex].role = role;
    await club.save();

    res.json({ message: 'Member role updated successfully', member: club.members[memberIndex] });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Failed to update member role', error: error.message });
  }
});

// GET /api/clubs/user/my-clubs - Get current user's clubs
router.get('/user/my-clubs', authMiddleware, async (req, res) => {
  try {
    const clubs = await Club.find({ 'members.user': req.user._id })
      .populate('createdBy', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .sort({ 'members.joinedAt': -1 });
    
    // Add user's role in each club
    const clubsWithUserRole = clubs.map(club => {
      const userMembership = club.members.find(member => member.user._id.toString() === req.user._id.toString());
      return {
        ...club.toObject(),
        userRole: userMembership ? userMembership.role : null,
        joinedAt: userMembership ? userMembership.joinedAt : null
      };
    });
    
    res.json(clubsWithUserRole);
  } catch (error) {
    console.error('Error fetching user clubs:', error);
    res.status(500).json({ message: 'Failed to fetch user clubs', error: error.message });
  }
});

module.exports = router;
