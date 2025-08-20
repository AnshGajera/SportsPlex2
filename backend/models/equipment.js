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

// Pre-save middleware to update availableQuantity
equipmentSchema.pre('save', function(next) {
  this.availableQuantity = this.quantity - (this.allocatedQuantity || 0) - (this.reservedQuantity || 0);
  next();
});

// Index for better query performance
equipmentSchema.index({ category: 1, isActive: 1 });
equipmentSchema.index({ availableQuantity: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
