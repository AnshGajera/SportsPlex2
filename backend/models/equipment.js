const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, required: true }, // Total quantity
  availableQuantity: { type: Number }, // Auto-calculated available quantity
  allocatedQuantity: { type: Number, default: 0 }, // Currently allocated
  reservedQuantity: { type: Number, default: 0 }, // Reserved for approved requests
  description: { type: String },
  condition: { type: String },
  location: { type: String },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Virtual to calculate available quantity
equipmentSchema.virtual('calculatedAvailableQuantity').get(function() {
  return this.quantity - (this.allocatedQuantity || 0) - (this.reservedQuantity || 0);
});

// Virtual to check if equipment is fully booked
equipmentSchema.virtual('isFullyBooked').get(function() {
  return this.calculatedAvailableQuantity <= 0;
});

// Virtual to get booking status
equipmentSchema.virtual('bookingStatus').get(function() {
  const available = this.calculatedAvailableQuantity;
  const total = this.quantity;
  
  if (available <= 0) return 'fully-booked';
  if (available <= total * 0.2) return 'low-availability';
  if (available <= total * 0.5) return 'medium-availability';
  return 'available';
});

// Virtual to calculate utilization percentage
equipmentSchema.virtual('utilizationRate').get(function() {
  const allocated = (this.allocatedQuantity || 0) + (this.reservedQuantity || 0);
  return this.quantity > 0 ? Math.round((allocated / this.quantity) * 100) : 0;
});

// Method to check if quantity is available for booking
equipmentSchema.methods.checkAvailability = function(requestedQuantity) {
  return this.calculatedAvailableQuantity >= requestedQuantity;
};

// Method to get current active bookings
equipmentSchema.methods.getActiveBookings = async function() {
  const EquipmentAllocation = require('./equipmentAllocation');
  return await EquipmentAllocation.find({
    equipment: this._id,
    status: 'allocated'
  }).populate('allocatedTo', 'firstName lastName');
};

// Method to update allocation quantities
equipmentSchema.methods.updateAllocationQuantities = async function() {
  const EquipmentAllocation = require('./equipmentAllocation');
  const EquipmentRequest = require('./equipmentRequest');
  
  // Calculate currently allocated quantity
  const allocatedResult = await EquipmentAllocation.aggregate([
    { $match: { equipment: this._id, status: 'allocated' } },
    { $group: { _id: null, total: { $sum: '$quantityAllocated' } } }
  ]);
  
  // Calculate reserved quantity (approved but not yet allocated)
  const reservedResult = await EquipmentRequest.aggregate([
    { $match: { equipment: this._id, status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);
  
  this.allocatedQuantity = allocatedResult.length > 0 ? allocatedResult[0].total : 0;
  this.reservedQuantity = reservedResult.length > 0 ? reservedResult[0].total : 0;
  
  return this.save();
};

// Pre-save middleware to update availableQuantity
equipmentSchema.pre('save', function(next) {
  this.availableQuantity = this.quantity - (this.allocatedQuantity || 0) - (this.reservedQuantity || 0);
  next();
});

// Index for better query performance
equipmentSchema.index({ category: 1, isActive: 1 });
equipmentSchema.index({ availableQuantity: 1 });

// Ensure virtual fields are serialized
equipmentSchema.set('toJSON', { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
