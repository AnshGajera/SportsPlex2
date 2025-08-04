const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    maxlength: [100, 'Club name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Club description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Club category is required'],
    trim: true
  },
  image: {
    type: String, // Store image file path
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
clubSchema.index({ name: 1 });
clubSchema.index({ category: 1 });
clubSchema.index({ isActive: 1 });
clubSchema.index({ createdBy: 1 });
clubSchema.index({ 'members.user': 1 });

// Virtual for member count
clubSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Pre-save middleware to update member count
clubSchema.pre('save', function(next) {
  // Any additional logic can be added here
  next();
});

// Instance method to add member
clubSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => member.user.toString() === userId.toString());
  
  if (existingMember) {
    throw new Error('User is already a member of this club');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove member
clubSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(member => member.user.toString() === userId.toString());
  
  if (memberIndex === -1) {
    throw new Error('User is not a member of this club');
  }
  
  this.members.splice(memberIndex, 1);
  return this.save();
};

// Static method to find clubs by category
clubSchema.statics.findByCategory = function(category) {
  return this.find({ category: category, isActive: true });
};

// Static method to find popular clubs (by member count)
clubSchema.statics.findPopular = function(limit = 10) {
  return this.aggregate([
    { $match: { isActive: true } },
    { $addFields: { memberCount: { $size: "$members" } } },
    { $sort: { memberCount: -1 } },
    { $limit: limit }
  ]);
};

// Static method to search clubs
clubSchema.statics.searchClubs = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    isActive: true,
    $or: [
      { name: regex },
      { description: regex },
      { category: regex }
    ]
  });
};

module.exports = mongoose.model('Club', clubSchema);
