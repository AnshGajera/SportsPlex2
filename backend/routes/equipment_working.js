
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const EquipmentAllocation = require('../models/equipmentAllocation');
const EquipmentRequest = require('../models/equipmentRequest');
const Equipment = require('../models/equipment');
const User = require('../models/user');

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`🔧 Equipment Route: ${req.method} ${req.path}`);
  next();
});

// Public test route
router.get('/test', (req, res) => {
  console.log('🧪 Public test route hit!');
  res.json({ message: 'Equipment routes are working!' });
});

// Public equipment list (for mobile app without authentication)
router.get('/public', async (req, res) => {
  try {
    console.log('📱 Public equipment route hit for mobile app');
    const equipment = await Equipment.find().select('name description quantity category');
    console.log(`📦 Found ${equipment.length} equipment items`);
    res.json(equipment);
  } catch (error) {
    console.error('❌ Error fetching public equipment:', error);
    res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  }
});

// Public allocations (for mobile app to check availability)
router.get('/allocations/public', async (req, res) => {
  try {
    console.log('📱 Public allocations route hit for mobile app');
    const allocations = await EquipmentAllocation.find({ status: 'allocated' })
      .populate('equipment', 'name category')
      .select('equipment quantityAllocated allocationDate expectedReturnDate status');
    console.log(`📦 Found ${allocations.length} active allocations`);
    res.json(allocations);
  } catch (error) {
    console.error('❌ Error fetching public allocations:', error);
    res.status(500).json({ message: 'Error fetching allocations', error: error.message });
  }
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

// Admin: Return equipment and update quantities
router.post('/return/:allocationId', protect, isAdmin, async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { returnCondition, returnNotes } = req.body;
    const allocation = await EquipmentAllocation.findById(allocationId).populate('equipment');
    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    if (allocation.status !== 'allocated' && allocation.status !== 'overdue') {
      return res.status(400).json({ error: 'Equipment is not currently allocated' });
    }
    allocation.status = 'returned';
    allocation.actualReturnDate = new Date();
    allocation.returnCondition = returnCondition;
    allocation.returnNotes = returnNotes;
    await allocation.save();
    // Update equipment quantities
    const equipment = allocation.equipment;
    equipment.allocatedQuantity = (equipment.allocatedQuantity || 0) - allocation.quantityAllocated;
    equipment.availableQuantity = (equipment.availableQuantity || 0) + allocation.quantityAllocated;
    await equipment.save();
    res.json({ message: 'Equipment returned successfully', allocation });
  } catch (error) {
    console.error('Error returning equipment:', error);
    res.status(500).json({ error: 'Failed to return equipment' });
  }
});

// Admin: Approve or reject equipment request
router.put('/requests/:id', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expectedReturnDate, adminNotes } = req.body;
    const request = await EquipmentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (status === 'approved') {
      // Allocate equipment immediately
      const equipment = await Equipment.findById(request.equipment);
      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      // Check available quantity
      if ((equipment.availableQuantity || equipment.quantity) < request.quantityRequested) {
        return res.status(400).json({ error: 'Insufficient equipment available for allocation' });
      }
      // Create allocation
        // Use the requested start date if it's in the future, otherwise use current date
        const allocationDate = request.requestStartDate && new Date(request.requestStartDate) > new Date() 
          ? new Date(request.requestStartDate) 
          : new Date();
          
        const allocation = new EquipmentAllocation({
          equipment: equipment._id,
          allocatedTo: request.requester,
          request: request._id,
          quantityAllocated: request.quantityRequested,
          allocationDate,
          expectedReturnDate: request.expectedReturnDate ? new Date(request.expectedReturnDate) : undefined,
          status: 'allocated',
          allocatedBy: req.user._id,
        });
      await allocation.save();
      // Update equipment quantities
      equipment.allocatedQuantity = (equipment.allocatedQuantity || 0) + request.quantityRequested;
      equipment.availableQuantity = (equipment.availableQuantity || equipment.quantity) - request.quantityRequested;
      await equipment.save();
      request.status = 'allocated';
      if (expectedReturnDate) request.expectedReturnDate = expectedReturnDate;
      if (adminNotes) request.adminNotes = adminNotes;
      request.reviewedBy = req.user._id;
      await request.save();
      res.json({ message: 'Request approved and equipment allocated', request });
    } else {
      if (status) request.status = status;
      if (expectedReturnDate) request.expectedReturnDate = expectedReturnDate;
      if (adminNotes) request.adminNotes = adminNotes;
      request.reviewedBy = req.user._id;
      await request.save();
      res.json({ message: 'Request updated successfully', request });
    }
  } catch (error) {
    console.error('Error updating equipment request:', error);
    res.status(500).json({ error: 'Failed to update equipment request' });
  }
});

// Admin: Get all current allocations
router.get('/allocations', protect, isAdmin, async (req, res) => {
  try {
    const { status = 'allocated' } = req.query;
    const allocations = await EquipmentAllocation.find({ status })
      .populate('equipment', 'name category image')
      .populate('allocatedTo', 'firstName lastName email department')
      .populate('allocatedBy', 'firstName lastName')
      .sort({ allocationDate: -1 });
    res.json(allocations);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
});

// Admin: Get all equipment requests (for approval/management)
router.get('/requests', protect, isAdmin, async (req, res) => {
  try {
    // Optionally filter by status (pending, approved, etc.)
    const { status } = req.query;
    const query = status ? { status } : {};
    const requests = await EquipmentRequest.find(query)
      .populate('equipment', 'name category image')
      .populate('requester', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching equipment requests:', error);
    res.status(500).json({ error: 'Failed to fetch equipment requests' });
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

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔧 Equipment Route: ${req.method} ${req.path}`);
  next();
});

// Get equipment with availability details
router.get('/availability/:equipmentId', protect, async (req, res) => {
  try {
    const { equipmentId } = req.params;
    console.log('📊 GET /availability/:equipmentId - Equipment ID:', equipmentId);
    
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Get current allocations for this equipment
    const currentAllocations = await EquipmentAllocation.find({
      equipment: equipmentId,
      status: { $in: ['allocated', 'overdue'] }
    })
    .populate('allocatedTo', 'firstName lastName email')
    .sort({ allocationDate: -1 });
    
    // Calculate availability statistics
    const totalQuantity = equipment.quantity || 0;
    const allocatedQuantity = equipment.allocatedQuantity || 0;
    const availableQuantity = equipment.availableQuantity || totalQuantity;
    
    const availabilityData = {
      equipment: {
        _id: equipment._id,
        name: equipment.name,
        category: equipment.category,
        description: equipment.description,
        totalQuantity,
        allocatedQuantity,
        availableQuantity
      },
      currentAllocations: currentAllocations.map(allocation => ({
        id: allocation._id,
        user: {
          name: `${allocation.allocatedTo?.firstName || ''} ${allocation.allocatedTo?.lastName || ''}`.trim(),
          email: allocation.allocatedTo?.email
        },
        quantityAllocated: allocation.quantityAllocated,
        allocationDate: allocation.allocationDate,
        expectedReturnDate: allocation.expectedReturnDate,
        status: allocation.status,
        daysSinceAllocation: Math.floor((new Date() - new Date(allocation.allocationDate)) / (1000 * 60 * 60 * 24))
      })),
      availabilityStats: {
        totalQuantity,
        allocatedQuantity,
        availableQuantity,
        utilizationRate: totalQuantity > 0 ? Math.round((allocatedQuantity / totalQuantity) * 100) : 0
      }
    };
    
    res.json(availabilityData);
  } catch (error) {
    console.error('❌ Equipment availability error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment availability' });
  }
});

// Get all equipment
router.get('/', protect, equipmentController.getAllEquipment);

// Submit equipment request
router.post('/request', protect, async (req, res) => {
  try {
    console.log('📝 POST /request - Request body:', req.body);
    console.log('👤 User making request:', req.user?.email);
    
  const { equipmentId, requestStartDate, expectedReturnDate, quantityRequested = 1, purpose } = req.body;
    
    // Validate dates
    if (!requestStartDate || !expectedReturnDate) {
      console.log('❌ Missing required dates');
      return res.status(400).json({ error: 'Both start date and return date are required' });
    }
    
    const startDate = new Date(requestStartDate);
    const returnDate = new Date(expectedReturnDate);
    const now = new Date();
    
    if (startDate < now) {
      console.log('❌ Start date in the past');
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }
    
    if (returnDate <= startDate) {
      console.log('❌ Return date before or same as start date');
      return res.status(400).json({ error: 'Return date must be after start date' });
    }
    
    // Check if equipment exists
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      console.log('❌ Equipment not found:', equipmentId);
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    console.log('🔍 Equipment found:', equipment.name);
    
    if (!equipment.isActive) {
      console.log('❌ Equipment not active');
      return res.status(400).json({ error: 'Equipment is not available for requests' });
    }
    
    const availableQty = equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.quantity;
    console.log('📊 Available quantity:', availableQty, 'Requested:', quantityRequested);
    
    if (availableQty < quantityRequested) {
      console.log('❌ Insufficient quantity');
      return res.status(400).json({ 
        error: `Insufficient quantity available. Only ${availableQty} units available.` 
      });
    }
    
    // Check for existing pending request
    const existingRequest = await EquipmentRequest.findOne({
      equipment: equipmentId,
      requester: req.user._id,
      status: 'pending'
    });
    
    if (existingRequest) {
      console.log('❌ Existing pending request found');
      return res.status(400).json({ 
        error: 'You already have a pending request for this equipment' 
      });
    }
    
    const newRequest = new EquipmentRequest({
      equipment: equipmentId,
      requester: req.user._id,
      quantityRequested,
      requestStartDate: startDate,
      expectedReturnDate: returnDate,
      purpose
    });
    
    await newRequest.save();
    console.log('✅ Request saved successfully');
    
    const populatedRequest = await EquipmentRequest.findById(newRequest._id)
      .populate('equipment', 'name category')
      .populate('requester', 'firstName lastName email');
    
    res.status(201).json({ 
      message: 'Request submitted successfully',
      request: populatedRequest
    });
  } catch (error) {
    console.error('❌ Equipment request error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// Get user's equipment requests
router.get('/requests/my', protect, async (req, res) => {
  try {
    console.log('📋 GET /requests/my - User:', req.user?.email);
    const requests = await EquipmentRequest.find({ requester: req.user._id })
      .populate('equipment', 'name category image')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    console.log('📋 Found requests:', requests.length);
    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching user requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get equipment request analytics (simplified version)
router.get('/requests/analytics', protect, async (req, res) => {
  try {
    console.log('📊 GET /requests/analytics - User:', req.user?.email);
    
    // Simple analytics count
    const totalRequests = await EquipmentRequest.countDocuments({ requester: req.user._id });
    const pendingRequests = await EquipmentRequest.countDocuments({ 
      requester: req.user._id, 
      status: 'pending' 
    });
    
    const analytics = {
      totalEquipment: 0,
      totalAllocated: 0,
      overdueAllocations: 0,
      pending: pendingRequests,
      approved: 0,
      rejected: 0,
      allocated: 0,
      returned: 0
    };
    
    console.log('📊 Analytics:', analytics);
    res.json(analytics);
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// === BOOKING VISIBILITY ENDPOINTS ===

// Public booking view (privacy-protected)
router.get('/bookings/public', protect, async (req, res) => {
  try {
    console.log('👥 Fetching public booking data...');
    
    // Get active allocations with basic info
    const allocations = await EquipmentAllocation.find({
      status: { $in: ['allocated', 'overdue'] }
    })
    .populate('equipment', 'name category')
    .populate('request')
    .sort({ allocationDate: -1 })
    .limit(50);

    // Transform data to protect privacy
    const publicBookings = allocations.map(allocation => ({
      id: allocation._id,
      equipment: {
        name: allocation.equipment.name,
        category: allocation.equipment.category
      },
      quantity: allocation.quantityAllocated,
      status: allocation.status,
      allocationDate: allocation.allocationDate,
      expectedReturnDate: allocation.expectedReturnDate,
      // Hide personal information - show only initials
      userInitials: allocation.request?.requester ? 
        `${allocation.request.requester.toString().slice(-3)}...` : 'Anonymous'
    }));

    res.json({
      bookings: publicBookings,
      total: publicBookings.length,
      message: 'Public booking data (privacy protected)'
    });
  } catch (error) {
    console.error('❌ Error fetching public bookings:', error);
    res.status(500).json({ error: 'Failed to fetch public booking data' });
  }
});

// Admin booking view (detailed)
router.get('/bookings/admin', protect, isAdmin, async (req, res) => {
  try {
    console.log('🔧 Admin fetching detailed booking data...');
    
    const { 
      status = 'all', 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'allocationDate', 
      sortOrder = 'desc',
      equipmentId,
      timeRange 
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 items per page

    // Validate sort parameters
    const validSortFields = ['allocationDate', 'expectedReturnDate', 'equipment.name', 'user.name', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'allocationDate';
    const sortDirection = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

    let query = {};
    
    // Filter by status with validation
    const validStatuses = ['allocated', 'returned', 'overdue', 'all'];
    if (status !== 'all' && validStatuses.includes(status)) {
      query.status = status;
    }

    // Filter by equipment ID for timeline view with validation
    if (equipmentId && equipmentId !== 'undefined' && equipmentId.match(/^[0-9a-fA-F]{24}$/)) {
      query.equipment = equipmentId;
    }

    // Filter by time range with validation
    const validTimeRanges = ['week', 'month', 'quarter'];
    if (timeRange && validTimeRanges.includes(timeRange)) {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      query.allocationDate = { $gte: startDate };
    }

    // Build search query with validation
    let searchQuery = query;
    if (search && search.trim() !== '' && search.length <= 100) { // Limit search length
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // Escape special regex chars
      searchQuery = {
        ...query,
        $or: [
          { 'allocationNotes': searchRegex },
          { 'returnNotes': searchRegex }
        ]
      };
    }

    // Build sort object
    const sort = {};
    sort[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Get allocations with full details
    const allocations = await EquipmentAllocation.find(searchQuery)
      .populate({
        path: 'equipment',
        select: 'name category image totalQuantity availableQuantity'
      })
      .populate({
        path: 'request',
        populate: {
          path: 'requester',
          select: 'name email profileImage'
        }
      })
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await EquipmentAllocation.countDocuments(searchQuery);

    // Transform for admin view
    const adminBookings = allocations.map(allocation => ({
      id: allocation._id,
      equipment: allocation.equipment,
      user: allocation.request?.requester ? {
        id: allocation.request.requester._id,
        name: allocation.request.requester.name,
        email: allocation.request.requester.email,
        profileImage: allocation.request.requester.profileImage
      } : null,
      quantity: allocation.quantityAllocated,
      status: allocation.status,
      allocationDate: allocation.allocationDate,
      expectedReturnDate: allocation.expectedReturnDate,
      actualReturnDate: allocation.actualReturnDate,
      allocationNotes: allocation.allocationNotes,
      returnCondition: allocation.returnCondition,
      returnNotes: allocation.returnNotes,
      isOverdue: allocation.status === 'overdue' || 
                (allocation.status === 'allocated' && 
                 new Date() > new Date(allocation.expectedReturnDate))
    }));

    res.json({
      bookings: adminBookings,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: (pageNum * limitNum) < total,
      limit: limitNum,
      search: search.trim(),
      status,
      sortBy: sortField,
      sortOrder: sortDirection
    });
  } catch (error) {
    console.error('❌ Error fetching admin bookings:', error);
    res.status(500).json({ error: 'Failed to fetch admin booking data' });
  }
});

// Equipment with booking status
router.get('/with-bookings', protect, async (req, res) => {
  try {
    console.log('📦 Fetching equipment with booking status...');
    
    const equipment = await Equipment.find({ isActive: true })
      .select('name category image totalQuantity availableQuantity allocatedQuantity')
      .lean();

    // Get current allocations for each equipment
    const equipmentWithBookings = await Promise.all(
      equipment.map(async (item) => {
        const activeAllocations = await EquipmentAllocation.countDocuments({
          equipment: item._id,
          status: { $in: ['allocated', 'overdue'] }
        });

        const overdueCount = await EquipmentAllocation.countDocuments({
          equipment: item._id,
          status: 'overdue'
        });

        return {
          ...item,
          activeBookings: activeAllocations,
          overdueBookings: overdueCount,
          utilizationRate: item.totalQuantity > 0 ? 
            ((item.allocatedQuantity || 0) / item.totalQuantity * 100).toFixed(1) : 0
        };
      })
    );

    res.json({
      equipment: equipmentWithBookings,
      total: equipmentWithBookings.length
    });
  } catch (error) {
    console.error('❌ Error fetching equipment with bookings:', error);
    res.status(500).json({ error: 'Failed to fetch equipment with booking status' });
  }
});

// Update allocation status (admin only)
router.patch('/allocations/:allocationId', protect, isAdmin, async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { status, returnCondition, returnNotes } = req.body;
    
    console.log(`🔧 Admin updating allocation ${allocationId} to status: ${status}`);
    
    const allocation = await EquipmentAllocation.findById(allocationId)
      .populate('equipment')
      .populate({
        path: 'request',
        populate: { path: 'requester', select: 'name email' }
      });
    
    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    
    const oldStatus = allocation.status;
    allocation.status = status;
    
    // Handle return process
    if (status === 'returned' && oldStatus !== 'returned') {
      allocation.actualReturnDate = new Date();
      if (returnCondition) allocation.returnCondition = returnCondition;
      if (returnNotes) allocation.returnNotes = returnNotes;
      
      // Update equipment quantities
      const equipment = allocation.equipment;
      equipment.allocatedQuantity = Math.max(0, (equipment.allocatedQuantity || 0) - allocation.quantityAllocated);
      equipment.availableQuantity = (equipment.availableQuantity || 0) + allocation.quantityAllocated;
      await equipment.save();
      
      console.log(`📦 Updated equipment quantities: available=${equipment.availableQuantity}, allocated=${equipment.allocatedQuantity}`);
    }
    
    await allocation.save();
    
    console.log(`✅ Allocation status updated from ${oldStatus} to ${status}`);
    
    res.json({
      message: 'Allocation status updated successfully',
      allocation: {
        id: allocation._id,
        status: allocation.status,
        actualReturnDate: allocation.actualReturnDate,
        returnCondition: allocation.returnCondition,
        returnNotes: allocation.returnNotes
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating allocation:', error);
    res.status(500).json({ error: 'Failed to update allocation status' });
  }
});

// Extend booking deadline (admin only)
router.patch('/allocations/:allocationId/extend', protect, isAdmin, async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { days } = req.body;
    
    if (!days || days < 1 || days > 90) {
      return res.status(400).json({ error: 'Extension days must be between 1 and 90' });
    }
    
    console.log(`🔧 Admin extending allocation ${allocationId} by ${days} days`);
    
    const allocation = await EquipmentAllocation.findById(allocationId);
    
    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    
    if (allocation.status !== 'allocated' && allocation.status !== 'overdue') {
      return res.status(400).json({ error: 'Can only extend active or overdue allocations' });
    }
    
    const oldDate = new Date(allocation.expectedReturnDate);
    const newDate = new Date(oldDate.getTime() + (days * 24 * 60 * 60 * 1000));
    
    allocation.expectedReturnDate = newDate;
    allocation.allocationNotes = `${allocation.allocationNotes || ''}\nExtended by ${days} days on ${new Date().toLocaleDateString()}`.trim();
    
    // Update status to allocated if it was overdue
    if (allocation.status === 'overdue') {
      allocation.status = 'allocated';
    }
    
    await allocation.save();
    
    console.log(`✅ Allocation extended from ${oldDate.toLocaleDateString()} to ${newDate.toLocaleDateString()}`);
    
    res.json({
      message: `Booking extended by ${days} days successfully`,
      allocation: {
        id: allocation._id,
        expectedReturnDate: allocation.expectedReturnDate,
        status: allocation.status,
        allocationNotes: allocation.allocationNotes
      }
    });
    
  } catch (error) {
    console.error('❌ Error extending allocation:', error);
    res.status(500).json({ error: 'Failed to extend booking' });
  }
});

module.exports = router;
