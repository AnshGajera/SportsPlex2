# Live Score Update Feature

## Overview
This feature allows Admins and Student Heads to update live scores for sports matches in real-time. Users can view live scores as they're updated during matches.

## Features

### For Admins & Student Heads
- **Live Score Updates**: Update team scores in real-time during matches
- **Match Status Management**: Change match status (upcoming → live → completed)
- **Score History**: Track all score updates with timestamps
- **Interactive UI**: Easy-to-use modal with increment/decrement buttons
- **Match Notes**: Add notes about match events (penalties, cards, etc.)

### For Users
- **Real-time Display**: See live scores updated in real-time
- **Visual Indicators**: Clear "LIVE" indicators for ongoing matches
- **Score History**: View completed match results

## Implementation Details

### Backend Changes

#### Match Model Updates
- Added `liveUpdates` array to track score history
- Added `lastUpdated` and `lastUpdatedBy` fields
- Enhanced score tracking capabilities

#### New API Endpoints
- `PUT /api/matches/:id/live-score` - Update live scores
- `PUT /api/matches/:id/status` - Update match status
- `GET /api/matches/:id/live-updates` - Get score history

#### Authentication
- Requires admin or student_head role for score updates
- JWT token authentication for API access

### Frontend Changes

#### New Components
- `LiveScoreUpdateModal.js` - Modal for updating scores
- Enhanced MatchCard components with update buttons

#### Updated Pages
- **AdminMatches.js**: Added live score update functionality
- **StudentHead.js**: Added matches management with live scores
- **UserMatches.js**: Enhanced display of live scores

#### Services
- `matchService.js` - Dedicated service for match operations

## User Interface

### Live Score Update Modal Features
- **Score Controls**: Plus/minus buttons and direct input
- **Team Display**: Clear team names and current scores
- **Status Selection**: Radio buttons for match status
- **Match Notes**: Text area for additional information
- **Visual Feedback**: Color-coded buttons based on match status

### Match Cards
- **Live Indicator**: Red "LIVE" badge for ongoing matches
- **Score Display**: Large, prominent score numbers
- **Update Button**: Context-sensitive button text
- **Real-time Updates**: Automatic refresh every minute

## Usage Instructions

### For Admins
1. Navigate to "Matches Management"
2. Find the match to update
3. Click "Update Live Score" or "Start Match"
4. Use the modal to:
   - Update scores using +/- buttons or direct input
   - Change match status (upcoming/live/completed)
   - Add match notes
5. Click "Update Score" to save changes

### For Student Heads
1. Navigate to "Live Matches" tab in Student Head portal
2. View live and upcoming matches
3. Click update buttons to manage match scores
4. Same modal interface as admins

### For Users
1. Navigate to "Matches" page
2. View live scores in real-time
3. See "LIVE" indicators for ongoing matches
4. Check completed match results

## Technical Architecture

### Data Flow
1. Admin/Student Head updates score via modal
2. Frontend sends API request to backend
3. Backend validates user permissions
4. Score update is saved to database
5. Frontend updates UI with new data
6. Other users see updates on next refresh

### Real-time Updates
- Automatic polling every 60 seconds
- Immediate UI updates after score changes
- Optimistic UI updates for better UX

### Security
- Role-based access control
- JWT authentication required
- Input validation on backend
- XSS protection in frontend

## File Structure
```
backend/
├── models/match.js (updated)
├── controllers/matchController.js (new)
└── routes/matches.js (updated)

src/
├── components/Modals/
│   └── LiveScoreUpdateModal.js (new)
├── pages/
│   ├── AdminMatches.js (updated)
│   ├── StudentHead.js (updated)
│   └── UserMatches.js (updated)
└── services/
    └── matchService.js (new)
```

## Future Enhancements
- Real-time WebSocket updates
- Match event tracking (goals, cards, substitutions)
- Live match statistics
- Push notifications for score updates
- Match commentary system
- Live streaming integration