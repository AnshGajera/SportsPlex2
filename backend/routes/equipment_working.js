const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const EquipmentRequest = require('../models/equipmentRequest');
const Equipment = require('../models/equipment');

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
    
    const { equipmentId, duration, quantityRequested = 1, purpose } = req.body;
    
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
      duration,
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
