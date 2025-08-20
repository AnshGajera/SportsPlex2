const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Match title is required'],
    trim: true,
    maxlength: [100, 'Match title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Match description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  sport: {
    type: String,
    required: [true, 'Sport type is required'],
    trim: true
  },
  team1: {
    name: {
      type: String,
      required: [true, 'Team 1 name is required'],
      trim: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null
    },
    score: {
      type: Number,
      default: 0
    }
  },
  team2: {
    name: {
      type: String,
      required: [true, 'Team 2 name is required'],
      trim: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null
    },
    score: {
      type: Number,
      default: 0
    }
  },
  matchDate: {
    type: Date,
    required: [true, 'Match date is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  result: {
    winner: {
      type: String,
      enum: ['team1', 'team2', 'draw'],
      default: null
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Result notes cannot exceed 200 characters']
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
matchSchema.index({ matchDate: 1, status: 1 });
matchSchema.index({ sport: 1 });
matchSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Match', matchSchema);