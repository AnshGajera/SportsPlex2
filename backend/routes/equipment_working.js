
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const EquipmentAllocation = require('../models/equipmentAllocation');
const EquipmentRequest = require('../models/equipmentRequest');
const Equipment = require('../models/equipment');

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
        const allocation = new EquipmentAllocation({
          equipment: equipment._id,
          allocatedTo: request.requester,
          request: request._id,
          quantityAllocated: request.quantityRequested,
          allocationDate: new Date(),
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

// Get all equipment
router.get('/', protect, equipmentController.getAllEquipment);

// Submit equipment request
router.post('/request', protect, async (req, res) => {
  try {
    console.log('📝 POST /request - Request body:', req.body);
    console.log('👤 User making request:', req.user?.email);
    
  const { equipmentId, expectedReturnDate, quantityRequested = 1, purpose } = req.body;
    
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
      expectedReturnDate,
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

module.exports = router;
