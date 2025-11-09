const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    type: { type: String, enum: ['general', 'event', 'maintenance', 'policy'], default: 'general' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, trim: true },
    targetAudience: { type: String, enum: ['all', 'students', 'staff', 'club_members', 'student_heads'], default: 'all' },
    expiryDate: { type: Date },
    isUrgent: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ status: 1, expiryDate: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
