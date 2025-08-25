const mongoose = require('mongoose');

const equipmentRequestSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantityRequested: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'allocated', 'returned'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    maxlength: 500
  },
  expectedReturnDate: {
    type: Date
  },
  actualReturnDate: {
    type: Date
  },
  purpose: {
    type: String,
    maxlength: 300
  }
}, {
  timestamps: true
});

// Index for better query performance
equipmentRequestSchema.index({ requester: 1, status: 1 });
equipmentRequestSchema.index({ equipment: 1, status: 1 });
equipmentRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('EquipmentRequest', equipmentRequestSchema);
