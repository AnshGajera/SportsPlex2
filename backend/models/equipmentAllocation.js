const mongoose = require('mongoose');

const equipmentAllocationSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  allocatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EquipmentRequest',
    required: true
  },
  quantityAllocated: {
    type: Number,
    required: true,
    min: 1
  },
  allocationDate: {
    type: Date,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['allocated', 'returned', 'overdue', 'lost'],
    default: 'allocated'
  },
  returnCondition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'damaged']
  },
  returnNotes: {
    type: String,
    maxlength: 500
  },
  allocatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  returnedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
equipmentAllocationSchema.index({ allocatedTo: 1, status: 1 });
equipmentAllocationSchema.index({ equipment: 1, status: 1 });
equipmentAllocationSchema.index({ status: 1, expectedReturnDate: 1 });

// Virtual to check if allocation is overdue
equipmentAllocationSchema.virtual('isOverdue').get(function() {
  if (this.status === 'returned') return false;
  return new Date() > this.expectedReturnDate;
});

module.exports = mongoose.model('EquipmentAllocation', equipmentAllocationSchema);
