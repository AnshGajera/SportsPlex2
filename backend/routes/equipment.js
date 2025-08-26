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

// Import dependencies after basic route setup
const equipmentController = require('../controllers/equipmentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const equipmentUpload = require('../middleware/equipmentUpload');
const EquipmentRequest = require('../models/equipmentRequest');
const EquipmentAllocation = require('../models/equipmentAllocation');
const Equipment = require('../models/equipment');

// Get all equipment (user & admin)
router.get('/', protect, equipmentController.getAllEquipment);

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
