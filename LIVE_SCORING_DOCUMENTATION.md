# Live Scoring System Documentation

## Overview
The Live Scoring System enables real-time match score updates for multiple sports with sport-specific scoring interfaces. The system supports different scoring mechanisms for cricket (runs/wickets/overs) versus general sports (simple increment/decrement).

## Features
- ✅ **Sport-Specific Scoring**: Different interfaces for cricket vs other sports
- ✅ **Real-Time Updates**: Live score updates with instant UI refresh
- ✅ **Role-Based Access**: Only admins and student heads can update scores
- ✅ **Cricket Scoring**: Comprehensive cricket scoring with runs, wickets, overs, balls, and extras
- ✅ **General Sports**: Simple increment/decrement scoring for football, basketball, etc.
- ✅ **Validation**: Input validation for sport-specific rules
- ✅ **Live Indicators**: Visual indicators for ongoing live matches
- ✅ **Score History**: Track all score updates with timestamps

## Supported Sports

### Cricket
- **Runs**: Individual run scoring (0, 1, 2, 3, 4, 6)
- **Wickets**: Track wickets fallen (max 10 per team)
- **Overs**: Complete overs tracking with ball count
- **Extras**: Wide, bye, leg-bye, no-ball tracking
- **Display Format**: "Runs/Wickets (Overs.Balls overs)"

### General Sports (Football, Basketball, etc.)
- **Simple Scoring**: Increment/decrement team scores
- **Flexible**: Works for any sport with numeric scoring
- **Display Format**: Simple numeric score

## Architecture

### Backend Components

#### 1. Enhanced Match Model (`backend/models/match.js`)
```javascript
// Cricket-specific scoring
cricketScore: {
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  extras: {
    wide: { type: Number, default: 0 },
    bye: { type: Number, default: 0 },
    legBye: { type: Number, default: 0 },
    noBall: { type: Number, default: 0 }
  }
},

// General sports scoring
footballScore: { type: Number, default: 0 },
basketballScore: { type: Number, default: 0 },

// Live updates tracking
liveUpdates: [{
  timestamp: { type: Date, default: Date.now },
  team: { type: String, enum: ['team1', 'team2'] },
  updateType: { type: String },
  data: { type: Object },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}]
```

#### 2. Match Controller (`backend/controllers/matchController.js`)
- **`updateLiveScore`**: Main function for handling live score updates
- **Sport Detection**: Automatically detects sport type and applies appropriate logic
- **Validation**: Sport-specific validation rules
- **Cricket Logic**: Handles overs completion, wicket counting, extras
- **General Sports**: Simple increment/decrement logic

#### 3. Match Routes (`backend/routes/matches.js`)
```javascript
// Live score update endpoint
router.post('/:id/live-score', authMiddleware, updateLiveScore);
```

#### 4. Authentication Middleware (`backend/middleware/authMiddleware.js`)
- Validates JWT tokens
- Enforces role-based access (admin/student_head only)
- Protects live score update endpoints

### Frontend Components

#### 1. Live Score Update Modal (`src/components/Modals/LiveScoreUpdateModal.js`)
- **Sport Detection**: Renders different interfaces based on sport type
- **Cricket Interface**: Dedicated cricket scoring component with quick buttons
- **General Interface**: Simple increment/decrement controls
- **Real-time Validation**: Client-side validation before API calls

#### 2. Cricket Score Interface Component
```javascript
const CricketScoreInterface = ({ matchData, onUpdate }) => {
  // Quick score buttons (0, 1, 2, 3, 4, 6)
  // Wicket and extras controls
  // Manual entry fields
  // Over completion logic
}
```

#### 3. Enhanced Match Display Components
- **AdminMatches.js**: Admin interface with live score controls
- **StudentHead.js**: Student head interface with match management
- **UserMatches.js**: User view with live score display
- **Conditional Rendering**: Different score formats based on sport

#### 4. Match API Service (`src/services/matchService.js`)
```javascript
export const updateLiveScore = async (matchId, updateData) => {
  const response = await axios.post(`/api/matches/${matchId}/live-score`, updateData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

## Usage Guide

### For Administrators

1. **Navigate to Admin Matches**: Go to Admin Dashboard → Matches
2. **Find Live Match**: Look for matches with "LIVE" status
3. **Update Score**: Click "Update Live Score" button
4. **Choose Sport Interface**: 
   - Cricket matches show cricket scoring interface
   - Other sports show simple increment/decrement controls
5. **Apply Updates**: Updates are saved immediately and refresh the display

### For Student Heads

1. **Access Match Management**: Navigate to Student Head → Matches tab
2. **Select Active Match**: Find ongoing matches in your managed events
3. **Live Score Updates**: Same interface as admin for updating scores
4. **Real-time Feedback**: Scores update immediately in the interface

### Cricket Scoring Interface

#### Quick Score Buttons
- **0, 1, 2, 3**: Add runs and increment ball count
- **4, 6**: Boundary scoring (runs without ball count change)
- **Wicket**: Add wicket and increment ball count
- **Wide/Bye/Leg-bye/No-ball**: Add extras (no ball count change for wide/no-ball)

#### Manual Entry
- Direct input fields for runs, wickets, balls
- Automatic over calculation (6 balls = 1 over)
- Validation prevents invalid entries (wickets > 10, balls > 5)

#### Over Completion
- Automatically resets balls to 0 when 6 balls completed
- Increments over count
- Visual feedback for over completion

### General Sports Interface

#### Simple Controls
- **+1 Score**: Increment team score by 1
- **-1 Score**: Decrement team score by 1
- **Manual Entry**: Direct score input field
- **Team Selection**: Choose which team to update

## API Endpoints

### Update Live Score
```http
POST /api/matches/:id/live-score
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "team": "team1",
  "scoreData": {
    // For cricket
    "runs": 4,
    "wickets": 0,
    "balls": 1,
    "extras": {}
    
    // For general sports
    "increment": 1,
    "decrement": 0
  },
  "sport": "Cricket"
}
```

### Get Match Details
```http
GET /api/matches/:id

Response:
{
  "sport": "Cricket",
  "status": "live",
  "team1": {
    "name": "Team Alpha",
    "score": 45,
    "cricketScore": {
      "runs": 45,
      "wickets": 2,
      "overs": 7,
      "balls": 3
    }
  }
}
```

## Validation Rules

### Cricket Validation
- **Wickets**: Maximum 10 per team
- **Balls**: Maximum 5 per over (resets to 0 after 6th ball)
- **Runs**: Must be non-negative
- **Extras**: Must be non-negative

### General Sports Validation
- **Score**: Must be non-negative after updates
- **Increment/Decrement**: Must be valid numbers

## Testing

### Automated Testing
Run the comprehensive test suite:
```bash
node test_live_scoring.js
```

### Backend Validation
Validate backend configuration:
```bash
node validate_backend.js
```

### Manual Testing Checklist
- [ ] Cricket match scoring works correctly
- [ ] General sports scoring works correctly
- [ ] Admin can update live scores
- [ ] Student head can update live scores
- [ ] Regular users cannot update scores
- [ ] Score validation works
- [ ] UI updates in real-time
- [ ] Score display format is correct for each sport

## Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error
- **Problem**: User doesn't have permission to update scores
- **Solution**: Ensure user has admin or student_head role

#### 2. Validation Errors
- **Problem**: Invalid score data (e.g., wickets > 10)
- **Solution**: Check input validation rules for the specific sport

#### 3. Score Not Updating
- **Problem**: UI not refreshing after score update
- **Solution**: Check network requests and ensure match status is 'live'

#### 4. Wrong Sport Interface
- **Problem**: Cricket match showing general interface or vice versa
- **Solution**: Check match.sport field matches expected sport name

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests in browser dev tools
3. Check backend logs for validation errors
4. Ensure JWT token is valid and user has correct role
5. Verify match exists and has correct sport type

## Configuration

### Environment Variables
```bash
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sportsplex
JWT_SECRET=your-secret-key

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### Sport Configuration
Add new sports by updating:
1. Match model schema
2. Validation rules in controller
3. Frontend sport detection logic
4. UI components for sport-specific interfaces

## Performance Considerations

- **Real-time Updates**: Consider WebSocket implementation for truly real-time updates
- **Caching**: Cache match data to reduce database queries
- **Validation**: Client-side validation reduces server load
- **Pagination**: Implement pagination for matches list in production

## Security Notes

- **Authentication**: All live score updates require valid JWT
- **Authorization**: Role-based access control prevents unauthorized updates
- **Input Validation**: Both client and server-side validation
- **Rate Limiting**: Consider implementing rate limiting for score updates

## Future Enhancements

- **WebSocket Integration**: Real-time score broadcasting to all connected clients
- **Score History**: Detailed history view of all score updates
- **Additional Sports**: Tennis, volleyball, badminton specific scoring
- **Live Commentary**: Add commentary feature alongside scoring
- **Statistics**: Match statistics and analytics
- **Mobile App**: Dedicated mobile app for live scoring
- **Broadcast Integration**: Integration with live streaming platforms