const express = require('express');
const router = express.Router();
const { protect, isAdmin, isAdminOrStudentHead } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/announcementController');

// Public/Authenticated user routes
router.get('/', protect, ctrl.getActiveAnnouncements);
router.get('/analytics', protect, ctrl.getAnalytics);

// Admin routes
router.post('/', protect, isAdminOrStudentHead, ctrl.createAnnouncement);
router.get('/all', protect, isAdminOrStudentHead, ctrl.getAllAnnouncements);
router.put('/:id', protect, isAdminOrStudentHead, ctrl.updateAnnouncement);
router.delete('/:id', protect, isAdminOrStudentHead, ctrl.deleteAnnouncement);

module.exports = router;
