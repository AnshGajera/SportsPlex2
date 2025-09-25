const Announcement = require('../models/announcement');
const User = require('../models/user');
const { sendAnnouncementEmailToAllUsers } = require('../services/emailService');

const createAnnouncement = async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      content: req.body.content,
      type: req.body.type || 'general',
      priority: req.body.priority || 'medium',
      category: req.body.category || '',
      targetAudience: req.body.targetAudience || 'all',
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
      isUrgent: !!req.body.isUrgent,
      allowComments: req.body.allowComments !== undefined ? !!req.body.allowComments : true,
      status: req.body.status || 'active',
      createdBy: req.user._id,
    };

    const announcement = await Announcement.create(payload);

    // Fire-and-forget email broadcast (don't block response)
    try {
      sendAnnouncementEmailToAllUsers({
        title: announcement.title,
        content: announcement.content,
      }).catch(() => {});
    } catch (_) {}

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getActiveAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      status: 'active',
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: now } },
      ],
    })
      .sort({ isUrgent: -1, priority: -1, createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.expiryDate) updates.expiryDate = new Date(updates.expiryDate);
    const announcement = await Announcement.findByIdAndUpdate(id, updates, { new: true });
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, announcement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const matchActive = {
      status: 'active',
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: now } },
      ],
    };

    const [total, highPriority, generalCount, importantCount] = await Promise.all([
      Announcement.countDocuments(matchActive),
      Announcement.countDocuments({ ...matchActive, priority: 'high' }),
      Announcement.countDocuments({ ...matchActive, type: 'general' }),
      Announcement.countDocuments({ ...matchActive, priority: 'medium' }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        highPriority,
        general: generalCount,
        important: importantCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getActiveAnnouncements,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getAnalytics,
};
