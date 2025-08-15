const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Event title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['tournament', 'match', 'workshop', 'competition', 'meeting', 'training', 'other'],
    default: 'tournament'
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['inter-club', 'intra-club', 'open', 'private'],
    default: 'inter-club'
  },
  organizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  maxParticipants: {
    type: Number,
    min: [1, 'Maximum participants must be at least 1'],
    default: 50
  },
  registrationFee: {
    type: Number,
    min: [0, 'Registration fee cannot be negative'],
    default: 0
  },
  prizes: [{
    position: {
      type: String,
      required: true // e.g., "1st", "2nd", "3rd", "Best Player"
    },
    description: {
      type: String,
      required: true
    },
    value: {
      type: String // e.g., "₹5000", "Trophy + Certificate"
    }
  }],
  rules: {
    type: String,
    maxlength: [2000, 'Rules cannot exceed 2000 characters']
  },
  requirements: {
    type: String,
    maxlength: [1000, 'Requirements cannot exceed 1000 characters']
  },
  contactInfo: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    person: {
      type: String,
      required: true
    }
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    teamName: {
      type: String // For team events
    },
    additionalInfo: {
      type: String // Any additional registration info
    }
  }],
  invitedClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'registration-open', 'registration-closed', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  banner: {
    type: String // Store banner image path
  },
  documents: [{
    title: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  results: [{
    position: {
      type: String,
      required: true
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    teamName: {
      type: String
    },
    score: {
      type: String
    },
    notes: {
      type: String
    }
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (now > this.registrationDeadline) {
    return 'closed';
  }
  if (this.participants.length >= this.maxParticipants) {
    return 'full';
  }
  return 'open';
});

// Virtual for event status based on dates
eventSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  if (now < this.startDate) {
    return 'upcoming';
  }
  if (now >= this.startDate && now <= this.endDate) {
    return 'ongoing';
  }
  return 'completed';
});

// Index for efficient queries
eventSchema.index({ organizedBy: 1, startDate: -1 });
eventSchema.index({ eventType: 1, category: 1 });
eventSchema.index({ status: 1, isPublic: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
