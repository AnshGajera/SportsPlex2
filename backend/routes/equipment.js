const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
// const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const equipmentUpload = require('../middleware/equipmentUpload');

// Get all equipment (user & admin)
router.get('/', protect, equipmentController.getAllEquipment);

// Add equipment (admin only)
router.post('/', protect, isAdmin, equipmentUpload.single('image'), equipmentController.addEquipment);

// Update equipment (admin only)
router.put('/:id', protect, isAdmin, equipmentUpload.single('image'), equipmentController.updateEquipment);

// Delete equipment (admin only)
router.delete('/:id', protect, isAdmin, equipmentController.deleteEquipment);

module.exports = router;
