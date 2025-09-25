const express = require('express');
const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`🔧 Equipment Route: ${req.method} ${req.path}`);
  next();
});

// Test route to verify router is working
router.get('/test', (req, res) => {
  console.log('🧪 Test route hit!');
  res.json({ message: 'Equipment routes are working!' });
});

// Test admin route
router.get('/admin-test', protect, isAdmin, (req, res) => {
  console.log('🧪 Admin test route hit by user:', req.user.email);
  res.json({ 
    message: 'Admin routes are working!', 
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Create sample booking data for testing (admin only)
router.post('/create-sample-bookings', protect, isAdmin, async (req, res) => {
  try {
    console.log('🧪 Creating sample booking data...');
    
    // Get a sample equipment item
    const equipment = await Equipment.findOne({ isActive: true });
    if (!equipment) {
      return res.status(404).json({ error: 'No equipment found to create sample bookings' });
    }

    // Get a sample user (not admin)
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      return res.status(404).json({ error: 'No regular users found to create sample bookings' });
    }

    // Create a sample equipment request
    const sampleRequest = new EquipmentRequest({
      equipment: equipment._id,
      requester: user._id,
      quantity: 2,
      requestDate: new Date(),
      expectedStartDate: new Date(),
      expectedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      purpose: 'Sample booking for testing analytics',
      status: 'approved',
      reviewedBy: req.user._id,
      reviewDate: new Date()
    });

    await sampleRequest.save();

    // Create a sample allocation
    const sampleAllocation = new EquipmentAllocation({
      equipment: equipment._id,
      allocatedTo: user._id,
      request: sampleRequest._id,
      quantityAllocated: 2,
      allocationDate: new Date(),
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      allocatedBy: req.user._id,
      status: 'allocated'
    });

    await sampleAllocation.save();

    // Update equipment quantities
    equipment.allocatedQuantity = (equipment.allocatedQuantity || 0) + 2;
    equipment.availableQuantity = equipment.quantity - equipment.allocatedQuantity;
    await equipment.save();

    console.log('✅ Sample booking data created successfully');
    
    res.json({ 
      message: 'Sample booking data created successfully',
      data: {
        request: sampleRequest,
        allocation: sampleAllocation,
        equipment: equipment.name,
        user: user.firstName + ' ' + user.lastName
      }
    });

  } catch (error) {
    console.error('❌ Error creating sample booking data:', error);
    res.status(500).json({ error: 'Failed to create sample booking data', details: error.message });
  }
});

// Import dependencies after basic route setup
const equipmentController = require('../controllers/equipmentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const equipmentUpload = require('../middleware/equipmentUpload');
const EquipmentRequest = require('../models/equipmentRequest');
const EquipmentAllocation = require('../models/equipmentAllocation');
const Equipment = require('../models/equipment');
const User = require('../models/user');
const EquipmentAllocation = require('../models/equipmentAllocation');
const Equipment = require('../models/equipment');

// Get all equipment (user & admin)
router.get('/', protect, equipmentController.getAllEquipment);

// Get public equipment bookings (visible to all users)
router.get('/bookings/public', protect, async (req, res) => {
  try {
    const activeBookings = await EquipmentAllocation.find({
      status: 'allocated'
    })
    .populate('equipment', 'name category image')
    .populate('allocatedTo', 'firstName lastName')
    .select('equipment allocatedTo quantityAllocated allocationDate expectedReturnDate status')
    .sort({ allocationDate: -1 });

    // Format the response for public view
    const publicBookings = activeBookings.map(booking => ({
      equipmentId: booking.equipment._id,
      equipmentName: booking.equipment.name,
      category: booking.equipment.category,
      image: booking.equipment.image,
      quantity: booking.quantityAllocated,
      allocatedDate: booking.allocationDate,
      expectedReturnDate: booking.expectedReturnDate,
      status: booking.status,
      // Hide specific user details for privacy, show only initials
      allocatedToInitials: `${booking.allocatedTo.firstName[0]}${booking.allocatedTo.lastName[0]}`,
      daysRemaining: Math.ceil((new Date(booking.expectedReturnDate) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json(publicBookings);
  } catch (error) {
    console.error('Error fetching public bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get detailed equipment bookings (admin only - includes full user details)
router.get('/bookings/admin', protect, isAdmin, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    const [bookings, totalCount] = await Promise.all([
      EquipmentAllocation.find(filter)
        .populate('equipment', 'name category image location')
        .populate('allocatedTo', 'firstName lastName email studentId')
        .populate('allocatedBy', 'firstName lastName')
        .populate('request', 'purpose requestDate')
        .sort({ allocationDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EquipmentAllocation.countDocuments(filter)
    ]);

    // Enhanced response with calculated fields
    const detailedBookings = bookings.map(booking => {
      const now = new Date();
      const returnDate = new Date(booking.expectedReturnDate);
      const daysRemaining = Math.ceil((returnDate - now) / (1000 * 60 * 60 * 24));
      const isOverdue = daysRemaining < 0;
      
      return {
        _id: booking._id,
        equipment: booking.equipment,
        allocatedTo: booking.allocatedTo,
        allocatedBy: booking.allocatedBy,
        request: booking.request,
        quantityAllocated: booking.quantityAllocated,
        allocationDate: booking.allocationDate,
        expectedReturnDate: booking.expectedReturnDate,
        actualReturnDate: booking.actualReturnDate,
        status: isOverdue && booking.status === 'allocated' ? 'overdue' : booking.status,
        returnCondition: booking.returnCondition,
        returnNotes: booking.returnNotes,
        daysRemaining,
        isOverdue,
        urgencyLevel: daysRemaining <= 1 ? 'high' : daysRemaining <= 3 ? 'medium' : 'low'
      };
    });

    res.json({
      bookings: detailedBookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + bookings.length < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ error: 'Failed to fetch detailed bookings' });
  }
});

// Get equipment with current booking status
router.get('/with-bookings', protect, async (req, res) => {
  try {
    const equipment = await Equipment.find({ isActive: true });
    const activeAllocations = await EquipmentAllocation.find({
      status: 'allocated'
    }).populate('allocatedTo', 'firstName lastName');

    // Create a map of equipment bookings
    const bookingMap = {};
    activeAllocations.forEach(allocation => {
      const equipId = allocation.equipment.toString();
      if (!bookingMap[equipId]) {
        bookingMap[equipId] = [];
      }
      bookingMap[equipId].push({
        quantity: allocation.quantityAllocated,
        allocatedDate: allocation.allocationDate,
        expectedReturnDate: allocation.expectedReturnDate,
        allocatedToInitials: `${allocation.allocatedTo.firstName[0]}${allocation.allocatedTo.lastName[0]}`,
        daysRemaining: Math.ceil((new Date(allocation.expectedReturnDate) - new Date()) / (1000 * 60 * 60 * 24))
      });
    });

    // Combine equipment with booking info
    const equipmentWithBookings = equipment.map(item => ({
      ...item.toObject(),
      currentBookings: bookingMap[item._id.toString()] || [],
      hasActiveBookings: (bookingMap[item._id.toString()] || []).length > 0
    }));

    res.json(equipmentWithBookings);
  } catch (error) {
    console.error('Error fetching equipment with bookings:', error);
    res.status(500).json({ error: 'Failed to fetch equipment with booking status' });
  }
});

// Migrate existing equipment data (admin only) - Run this once to update legacy data
router.post('/migrate', protect, isAdmin, async (req, res) => {
  try {
    const equipments = await Equipment.find({});
    let updatedCount = 0;
    
    for (let equipment of equipments) {
      let needsUpdate = false;
      
      // Add missing fields with default values
      if (equipment.availableQuantity === undefined) {
        equipment.availableQuantity = equipment.quantity;
        needsUpdate = true;
      }
      if (equipment.allocatedQuantity === undefined) {
        equipment.allocatedQuantity = 0;
        needsUpdate = true;
      }
      if (equipment.reservedQuantity === undefined) {
        equipment.reservedQuantity = 0;
        needsUpdate = true;
      }
      if (equipment.isActive === undefined) {
        equipment.isActive = true;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await equipment.save();
        updatedCount++;
      }
    }
    
    res.json({ 
      message: `Migration completed. Updated ${updatedCount} equipment records.`,
      totalEquipment: equipments.length,
      updatedCount
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
});

// Add equipment (admin only)
router.post('/', protect, isAdmin, equipmentUpload.single('image'), equipmentController.addEquipment);

// Update equipment (admin only)
router.put('/:id', protect, isAdmin, equipmentUpload.single('image'), equipmentController.updateEquipment);

// Delete equipment (admin only)
router.delete('/:id', protect, isAdmin, equipmentController.deleteEquipment);

// ========== EQUIPMENT REQUEST ROUTES ==========

// Submit equipment request (authenticated users)
router.post('/request', protect, async (req, res) => {
  try {
    const { equipmentId, startTime, endTime, quantityRequested = 1, purpose } = req.body;
    // Check if equipment exists and has sufficient quantity
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    if (!equipment.isActive) {
      return res.status(400).json({ error: 'Equipment is not available for requests' });
    }
    if (equipment.availableQuantity < quantityRequested) {
      return res.status(400).json({ 
        error: `Insufficient quantity available. Only ${equipment.availableQuantity} units available.` 
      });
    }
    // Check if user already has a pending request for this equipment
    const existingRequest = await EquipmentRequest.findOne({
      equipment: equipmentId,
      requester: req.user._id,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ 
        error: 'You already have a pending request for this equipment' 
      });
    }
    const newRequest = new EquipmentRequest({
      equipment: equipmentId,
      requester: req.user._id,
      quantityRequested,
      startTime,
      endTime,
      purpose
    });
    await newRequest.save();
    // Populate the request for response
    const populatedRequest = await EquipmentRequest.findById(newRequest._id)
      .populate('equipment', 'name category')
      .populate('requester', 'firstName lastName email');
    res.status(201).json({ 
      message: 'Request submitted successfully',
      request: populatedRequest
    });
  } catch (error) {
    console.error('Equipment request error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// Get user's equipment requests
router.get('/requests/my', protect, async (req, res) => {
  try {
    const requests = await EquipmentRequest.find({ requester: req.user._id })
      .populate('equipment', 'name category image')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get all equipment requests (admin only)
router.get('/requests', protect, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const requests = await EquipmentRequest.find(query)
      .populate('equipment', 'name category image')
      .populate('requester', 'firstName lastName email department college')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalRequests = await EquipmentRequest.countDocuments(query);
    
    res.json({
      requests,
      currentPage: page,
      totalPages: Math.ceil(totalRequests / limit),
      totalRequests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get equipment request analytics (admin only)
router.get('/requests/analytics', protect, isAdmin, async (req, res) => {
  try {
    const analytics = await EquipmentRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalEquipment = await Equipment.countDocuments({ isActive: true });
    const totalAllocated = await EquipmentAllocation.countDocuments({ status: 'allocated' });
    const overdueAllocations = await EquipmentAllocation.countDocuments({
      status: 'allocated',
      expectedReturnDate: { $lt: new Date() }
    });
    
    const analyticsMap = {
      totalEquipment,
      totalAllocated,
      overdueAllocations,
      pending: 0,
      approved: 0,
      rejected: 0,
      allocated: 0,
      returned: 0
    };
    
    analytics.forEach(item => {
      analyticsMap[item._id] = item.count;
    });
    
    res.json(analyticsMap);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Approve/Reject equipment request (admin only)
router.put('/requests/:requestId', protect, isAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes, expectedReturnDate } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use "approved" or "rejected"' });
    }
    
    const request = await EquipmentRequest.findById(requestId)
      .populate('equipment')
      .populate('requester');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request has already been reviewed' });
    }
    
    // If approving, check if equipment is still available
    if (status === 'approved') {
      const equipment = request.equipment;
      if (equipment.availableQuantity < request.quantityRequested) {
        return res.status(400).json({ 
          error: 'Insufficient equipment quantity available' 
        });
      }
      
      // Reserve the equipment quantity
      equipment.reservedQuantity = (equipment.reservedQuantity || 0) + request.quantityRequested;
      await equipment.save();
    }
    
    request.status = status;
    request.adminNotes = adminNotes;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    
    if (status === 'approved' && expectedReturnDate) {
      request.expectedReturnDate = new Date(expectedReturnDate);
    }
    
    await request.save();
    
    const updatedRequest = await EquipmentRequest.findById(requestId)
      .populate('equipment', 'name category')
      .populate('requester', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName');
    
    res.json({
      message: `Request ${status} successfully`,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// ========== EQUIPMENT ALLOCATION ROUTES ==========

// Allocate approved equipment to user (admin only)
router.post('/allocate/:requestId', protect, isAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { expectedReturnDate, notes } = req.body;
    
    const request = await EquipmentRequest.findById(requestId)
      .populate('equipment')
      .populate('requester');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Request must be approved before allocation' });
    }
    
    const equipment = request.equipment;
    
    // Check availability again
    if (equipment.availableQuantity < request.quantityRequested) {
      return res.status(400).json({ error: 'Insufficient equipment quantity' });
    }
    
    // Create allocation record
    const allocation = new EquipmentAllocation({
      equipment: equipment._id,
      allocatedTo: request.requester._id,
      request: request._id,
      quantityAllocated: request.quantityRequested,
      expectedReturnDate: new Date(expectedReturnDate),
      allocatedBy: req.user._id
    });
    
    await allocation.save();
    
    // Update equipment quantities
    equipment.allocatedQuantity = (equipment.allocatedQuantity || 0) + request.quantityRequested;
    equipment.reservedQuantity = (equipment.reservedQuantity || 0) - request.quantityRequested;
    await equipment.save();
    
    // Update request status
    request.status = 'allocated';
    await request.save();
    
    const populatedAllocation = await EquipmentAllocation.findById(allocation._id)
      .populate('equipment', 'name category')
      .populate('allocatedTo', 'firstName lastName email')
      .populate('allocatedBy', 'firstName lastName');
    
    res.json({
      message: 'Equipment allocated successfully',
      allocation: populatedAllocation
    });
  } catch (error) {
    console.error('Error allocating equipment:', error);
    res.status(500).json({ error: 'Failed to allocate equipment' });
  }
});

// Get all current allocations (admin only)
router.get('/allocations', protect, isAdmin, async (req, res) => {
  try {
    const { status = 'allocated' } = req.query;
    
    const allocations = await EquipmentAllocation.find({ status })
      .populate('equipment', 'name category')
      .populate('allocatedTo', 'firstName lastName email department')
      .populate('allocatedBy', 'firstName lastName')
      .sort({ allocationDate: -1 });
    
    res.json(allocations);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
});

// Return equipment (admin only)
router.post('/return/:allocationId', protect, isAdmin, async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { returnCondition, returnNotes } = req.body;
    
    const allocation = await EquipmentAllocation.findById(allocationId)
      .populate('equipment');
    
    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    
    if (allocation.status === 'returned') {
      return res.status(400).json({ error: 'Equipment already returned' });
    }
    
    // Update allocation
    allocation.status = 'returned';
    allocation.actualReturnDate = new Date();
    allocation.returnCondition = returnCondition;
    allocation.returnNotes = returnNotes;
    allocation.returnedTo = req.user._id;
    
    await allocation.save();
    
    // Update equipment quantities
    const equipment = allocation.equipment;
    equipment.allocatedQuantity = Math.max(0, (equipment.allocatedQuantity || 0) - allocation.quantityAllocated);
    await equipment.save();
    
    // Update request status
    await EquipmentRequest.findByIdAndUpdate(allocation.request, { status: 'returned' });
    
    res.json({
      message: 'Equipment returned successfully',
      allocation
    });
  } catch (error) {
    console.error('Error returning equipment:', error);
    res.status(500).json({ error: 'Failed to return equipment' });
  }
});

// Get user's current allocations
router.get('/allocations/my', protect, async (req, res) => {
  try {
    const allocations = await EquipmentAllocation.find({ 
      allocatedTo: req.user._id,
      status: { $in: ['allocated', 'overdue'] }
    })
      .populate('equipment', 'name category image')
      .sort({ allocationDate: -1 });
    
    res.json(allocations);
  } catch (error) {
    console.error('Error fetching user allocations:', error);
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
});

module.exports = router;
