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
  // Sport-specific match configuration
  matchConfig: {
    // Cricket configuration
    cricketConfig: {
      format: {
        type: String,
        enum: ['T20', 'ODI', 'Test', 'T10'],
        default: 'T20'
      },
      totalOvers: { type: Number, default: 20 },
      currentInnings: { type: Number, default: 1 }, // 1 or 2
      
      // Enhanced toss management
      toss: {
        completed: { type: Boolean, default: false },
        wonBy: { 
          type: String,
          enum: ['team1', 'team2', ''],
          default: ''
        },
        decision: { 
          type: String,
          enum: ['bat', 'bowl', ''],
          default: ''
        }
      },
      
      // Innings management
      innings: {
        first: {
          battingTeam: { 
            type: String,
            enum: ['team1', 'team2', ''],
            default: ''
          },
          completed: { type: Boolean, default: false },
          target: { type: Number, default: 0 }
        },
        second: {
          battingTeam: { 
            type: String,
            enum: ['team1', 'team2', ''],
            default: ''
          },
          completed: { type: Boolean, default: false },
          chasing: { type: Number, default: 0 },
          requiredRunRate: { type: Number, default: 0 }
        }
      },
      
      // Current batting team (derived from innings and current innings)
      currentBattingTeam: {
        type: String,
        enum: ['team1', 'team2', ''],
        default: ''
      },
      
      // Match state
      matchPhase: {
        type: String,
        enum: ['pre_toss', 'toss_completed', 'first_innings', 'innings_break', 'second_innings', 'completed'],
        default: 'pre_toss'
      }
    },
    // Football configuration
    footballConfig: {
      duration: { type: Number, default: 90 }, // minutes
      currentHalf: { type: Number, default: 1 }, // 1 or 2
      extraTime: { type: Number, default: 0 }
    },
    // Basketball configuration
    basketballConfig: {
      currentQuarter: { type: Number, default: 1 }, // 1-4
      quarterDuration: { type: Number, default: 12 } // minutes
    }
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
    },
    // Cricket-specific fields
    cricketScore: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 }, // balls in current over (0-5)
      extras: {
        wides: { type: Number, default: 0 },
        noBalls: { type: Number, default: 0 },
        byes: { type: Number, default: 0 },
        legByes: { type: Number, default: 0 }
      }
    },
    // Football-specific fields
    footballScore: {
      goals: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
      corners: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 }
    },
    // Basketball-specific fields
    basketballScore: {
      points: { type: Number, default: 0 },
      quarter1: { type: Number, default: 0 },
      quarter2: { type: Number, default: 0 },
      quarter3: { type: Number, default: 0 },
      quarter4: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 },
      timeouts: { type: Number, default: 0 }
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
    },
    // Cricket-specific fields
    cricketScore: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 }, // balls in current over (0-5)
      extras: {
        wides: { type: Number, default: 0 },
        noBalls: { type: Number, default: 0 },
        byes: { type: Number, default: 0 },
        legByes: { type: Number, default: 0 }
      }
    },
    // Football-specific fields
    footballScore: {
      goals: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
      corners: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 }
    },
    // Basketball-specific fields
    basketballScore: {
      points: { type: Number, default: 0 },
      quarter1: { type: Number, default: 0 },
      quarter2: { type: Number, default: 0 },
      quarter3: { type: Number, default: 0 },
      quarter4: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 },
      timeouts: { type: Number, default: 0 }
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
  liveUpdates: [{
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updateType: {
      type: String,
      enum: ['score_update', 'status_change', 'note_added', 'cricket_event', 'football_event', 'basketball_event'],
      default: 'score_update'
    },
    team1Score: Number,
    team2Score: Number,
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'cancelled']
    },
    notes: String,
    // Sport-specific update data
    cricketUpdate: {
      team: { type: String, enum: ['team1', 'team2'] },
      runs: Number,
      wickets: Number,
      overs: Number,
      balls: Number,
      eventType: { 
        type: String, 
        enum: ['runs', 'wicket', 'wide', 'no_ball', 'bye', 'leg_bye', 'six', 'four', 'dot'] 
      },
      batsmanOut: String,
      bowler: String,
      extras: {
        wides: Number,
        noBalls: Number,
        byes: Number,
        legByes: Number
      }
    },
    footballUpdate: {
      team: { type: String, enum: ['team1', 'team2'] },
      eventType: { 
        type: String, 
        enum: ['goal', 'yellow_card', 'red_card', 'corner', 'foul', 'penalty'] 
      },
      player: String,
      minute: Number
    },
    basketballUpdate: {
      team: { type: String, enum: ['team1', 'team2'] },
      eventType: { 
        type: String, 
        enum: ['2_points', '3_points', 'free_throw', 'foul', 'timeout'] 
      },
      player: String,
      quarter: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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