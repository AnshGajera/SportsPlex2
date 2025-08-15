const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Event = require('../models/event');
const Club = require('../models/club');
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'banner') {
      cb(null, 'uploads/events/banners/');
    } else if (file.fieldname === 'documents') {
      cb(null, 'uploads/events/documents/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'banner') {
      // Allow only images for banners
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Banner must be an image file'), false);
      }
    } else if (file.fieldname === 'documents') {
      // Allow various document types
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid document type'), false);
      }
    } else {
      cb(new Error('Invalid file field'), false);
    }
  }
});

// GET /api/events - Get all events with filters
router.get('/', async (req, res) => {
  try {
    const {
      club,
      eventType,
      category,
      status,
      upcoming,
      page = 1,
      limit = 10,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (club) filter.organizedBy = club;
    if (eventType) filter.eventType = eventType;
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // Filter for upcoming events
    if (upcoming === 'true') {
      filter.startDate = { $gte: new Date() };
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Only show public events unless user is authenticated
    if (!req.user) {
      filter.isPublic = true;
      filter.status = { $in: ['published', 'registration-open', 'registration-closed', 'ongoing', 'completed'] };
    }

    const events = await Event.find(filter)
      .populate('organizedBy', 'name image category')
      .populate('createdBy', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName email rollNo')
      .populate('participants.club', 'name')
      .sort({ startDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// GET /api/events/:id - Get specific event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizedBy', 'name image category description contactEmail')
      .populate('createdBy', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName email rollNo college department')
      .populate('participants.club', 'name image')
      .populate('invitedClubs', 'name image')
      .populate('results.participant', 'firstName lastName email rollNo')
      .populate('results.club', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

// POST /api/events - Create new event (requires authentication)
router.post('/', protect, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      category,
      organizedBy,
      startDate,
      endDate,
      registrationDeadline,
      venue,
      maxParticipants,
      registrationFee,
      prizes,
      rules,
      requirements,
      contactInfo,
      invitedClubs,
      isPublic,
      tags
    } = req.body;

    // Check if user is member/admin of the organizing club
    const club = await Club.findById(organizedBy);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const isMember = club.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      ['admin', 'moderator'].includes(member.role)
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only club admins/moderators can create events' });
    }

    // Prepare event data
    const eventData = {
      title,
      description,
      eventType,
      category,
      organizedBy,
      createdBy: req.user._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline),
      venue,
      maxParticipants: maxParticipants || 50,
      registrationFee: registrationFee || 0,
      rules,
      requirements,
      isPublic: isPublic !== 'false',
      contactInfo: JSON.parse(contactInfo || '{}'),
      invitedClubs: invitedClubs ? JSON.parse(invitedClubs) : [],
      prizes: prizes ? JSON.parse(prizes) : [],
      tags: tags ? JSON.parse(tags) : []
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.banner && req.files.banner[0]) {
        eventData.banner = `/uploads/events/banners/${req.files.banner[0].filename}`;
      }
      
      if (req.files.documents && req.files.documents.length > 0) {
        eventData.documents = req.files.documents.map(file => ({
          title: file.originalname,
          filePath: `/uploads/events/documents/${file.filename}`
        }));
      }
    }

    const event = new Event(eventData);
    await event.save();

    // Populate the created event
    const populatedEvent = await Event.findById(event._id)
      .populate('organizedBy', 'name image category')
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: 'Failed to create event', error: error.message });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', protect, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const club = await Club.findById(event.organizedBy);
    const isMember = club.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      ['club_head', 'moderator'].includes(member.role)
    );

    if (!isMember && req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Update event data
    const allowedUpdates = [
      'title', 'description', 'eventType', 'category', 'startDate', 'endDate',
      'registrationDeadline', 'venue', 'maxParticipants', 'registrationFee',
      'rules', 'requirements', 'contactInfo', 'invitedClubs', 'isPublic',
      'prizes', 'tags', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (['contactInfo', 'invitedClubs', 'prizes', 'tags'].includes(field)) {
          event[field] = JSON.parse(req.body[field]);
        } else if (['startDate', 'endDate', 'registrationDeadline'].includes(field)) {
          event[field] = new Date(req.body[field]);
        } else {
          event[field] = req.body[field];
        }
      }
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.banner && req.files.banner[0]) {
        event.banner = `/uploads/events/banners/${req.files.banner[0].filename}`;
      }
      
      if (req.files.documents && req.files.documents.length > 0) {
        const newDocuments = req.files.documents.map(file => ({
          title: file.originalname,
          filePath: `/uploads/events/documents/${file.filename}`
        }));
        event.documents = [...(event.documents || []), ...newDocuments];
      }
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('organizedBy', 'name image category')
      .populate('createdBy', 'firstName lastName email');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ message: 'Failed to update event', error: error.message });
  }
});

// POST /api/events/:id/register - Register for event
router.post('/:id/register', protect, async (req, res) => {
  try {
    const { teamName, additionalInfo, clubId } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if registration is open
    if (event.registrationStatus !== 'open') {
      return res.status(400).json({ message: 'Registration is not open for this event' });
    }

    // Check if user is already registered
    const existingRegistration = event.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Add participant
    event.participants.push({
      user: req.user._id,
      club: clubId || null,
      teamName,
      additionalInfo
    });

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('participants.user', 'firstName lastName email rollNo')
      .populate('participants.club', 'name');

    res.json({ message: 'Successfully registered for event', event: updatedEvent });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(400).json({ message: 'Failed to register for event', error: error.message });
  }
});

// DELETE /api/events/:id/register - Unregister from event
router.delete('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove participant
    event.participants = event.participants.filter(
      p => p.user.toString() !== req.user._id.toString()
    );

    await event.save();
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(400).json({ message: 'Failed to unregister from event', error: error.message });
  }
});

// POST /api/events/:id/results - Add/Update results (club heads only)
router.post('/:id/results', protect, async (req, res) => {
  try {
    const { results } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const club = await Club.findById(event.organizedBy);
    const isMember = club.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      ['club_head', 'moderator'].includes(member.role)
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can add results' });
    }

    event.results = results;
    event.status = 'completed';
    await event.save();

    res.json({ message: 'Results added successfully', event });
  } catch (error) {
    console.error('Error adding results:', error);
    res.status(400).json({ message: 'Failed to add results', error: error.message });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const club = await Club.findById(event.organizedBy);
    const isMember = club.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      ['club_head', 'moderator'].includes(member.role)
    );

    if (!isMember && req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
});

// GET /api/events/club/:clubId - Get events by club
router.get('/club/:clubId', async (req, res) => {
  try {
    const events = await Event.find({ organizedBy: req.params.clubId })
      .populate('organizedBy', 'name image category')
      .populate('createdBy', 'firstName lastName email')
      .sort({ startDate: -1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching club events:', error);
    res.status(500).json({ message: 'Failed to fetch club events', error: error.message });
  }
});

module.exports = router;
