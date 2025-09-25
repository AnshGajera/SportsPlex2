# Cricket Toss & Innings Management Guide

## Overview
The SportsPlex live scoring system now includes comprehensive cricket toss management and innings switching functionality. This guide explains how to use these features effectively.

## Features Added

### 🏏 Toss Management
- Record toss winner and decision (bat/bowl)
- Automatically determine batting order
- Visual confirmation of toss results
- Prevent duplicate toss recording

### 🔄 Innings Switching  
- Switch from first to second innings
- Automatic target calculation
- Required run rate computation
- Innings break management

## How to Use

### 1. Recording the Toss

#### Prerequisites
- Match must be a cricket match
- Match status should be 'upcoming' or 'live'
- User must have admin or student_head role

#### Steps
1. **Open Live Score Update**: Click "Update Live Score" on any cricket match
2. **Access Toss Management**: In the cricket interface, click "Record Toss" button
3. **Select Toss Winner**: Choose which team won the toss (Team 1 or Team 2)
4. **Choose Decision**: Select what the toss winner chose:
   - **Bat First**: Winner chooses to bat first
   - **Bowl First**: Winner chooses to bowl first (opponent bats first)
5. **Confirm**: Review the batting order and click "Record Toss"

#### Example Workflow
```
Match: Mumbai Kings vs Chennai Lions
Toss Winner: Mumbai Kings
Decision: Bowl First
Result: Chennai Lions will bat first
```

### 2. Switching Innings

#### Prerequisites
- Toss must be completed first
- Match must be in first innings
- First innings should be complete (or ready to end)

#### Steps
1. **Open Live Score Update**: Access the cricket live scoring interface
2. **Click Switch Innings**: Button becomes available after toss completion
3. **Review First Innings**: See the summary of first innings score
4. **Confirm Target**: System automatically calculates target (first innings runs + 1)
5. **Confirm Switch**: Click "Confirm Switch" to start second innings

#### Automatic Calculations
- **Target**: First innings score + 1 run
- **Required Run Rate**: Target ÷ Total overs
- **Chasing Team**: Automatically set based on toss decision

### 3. Match Phases

The system tracks different match phases:

#### Phase 1: Pre-Toss
- **Status**: `pre_toss`
- **Available Actions**: Record toss only
- **Restrictions**: No scoring until toss completed

#### Phase 2: First Innings
- **Status**: `first_innings`
- **Available Actions**: Live scoring, switch innings
- **Current Batting**: Team determined by toss

#### Phase 3: Second Innings  
- **Status**: `second_innings`
- **Available Actions**: Live scoring only
- **Current Batting**: Chasing team
- **Display**: Shows target and required run rate

#### Phase 4: Match Complete
- **Status**: `completed`
- **Available Actions**: View results only
- **Result**: Winner determined by scores

## UI Components

### Toss Management Modal
- **Team Selection**: Visual team cards for toss winner
- **Decision Buttons**: Bat/Bowl selection with icons
- **Batting Order Preview**: Shows final batting order
- **Validation**: Prevents invalid selections

### Innings Switch Modal
- **First Innings Summary**: Complete scorecard display
- **Target Calculation**: Automatic target computation
- **Second Innings Preview**: Chasing team information
- **Confirmation**: Two-step confirmation process

### Live Score Interface Enhancements
- **Match Management Section**: Toss and innings controls
- **Toss Status Display**: Shows completed toss information
- **Phase Indicators**: Visual indicators of match phase
- **Context-Aware Controls**: Buttons enabled/disabled based on state

## API Endpoints

### Record Toss
```http
PUT /api/matches/:id/toss
{
  "tossWinner": "team1" | "team2",
  "decision": "bat" | "bowl"
}
```

### Switch Innings
```http
PUT /api/matches/:id/switch-innings
{
  // Optional: additional innings data
}
```

## Data Structure Updates

### Match Model Enhancements
```javascript
matchConfig: {
  cricketConfig: {
    // Enhanced toss management
    toss: {
      completed: Boolean,
      wonBy: "team1" | "team2" | "",
      decision: "bat" | "bowl" | ""
    },
    
    // Innings management
    innings: {
      first: {
        battingTeam: "team1" | "team2" | "",
        completed: Boolean,
        target: Number
      },
      second: {
        battingTeam: "team1" | "team2" | "",
        completed: Boolean,
        chasing: Number,
        requiredRunRate: Number
      }
    },
    
    // Match state tracking
    matchPhase: "pre_toss" | "toss_completed" | "first_innings" | "innings_break" | "second_innings" | "completed",
    currentBattingTeam: "team1" | "team2" | ""
  }
}
```

## Validation Rules

### Toss Recording
- ✅ Only once per match
- ✅ Valid team selection (team1/team2)
- ✅ Valid decision (bat/bowl)
- ✅ Cricket matches only
- ✅ Admin/Student Head access only

### Innings Switching
- ✅ Toss must be completed first
- ✅ Must be in first innings
- ✅ Cannot switch twice
- ✅ Automatic target calculation
- ✅ Admin/Student Head access only

## Error Handling

### Common Error Scenarios

#### Toss Already Recorded
```json
{
  "success": false,
  "message": "Toss has already been recorded for this match"
}
```

#### Premature Innings Switch
```json
{
  "success": false,
  "message": "Cannot switch innings before toss is completed"
}
```

#### Invalid Match Type
```json
{
  "success": false,
  "message": "Toss recording is only available for cricket matches"
}
```

## Best Practices

### 1. Toss Recording
- Record toss immediately after it happens
- Double-check team names before recording
- Ensure correct decision (bat vs bowl)
- Verify batting order before confirming

### 2. Innings Management
- Complete first innings scoring before switching
- Verify first innings total is accurate
- Confirm target calculation is correct
- Brief break before starting second innings

### 3. Live Updates
- Use live updates to track toss events
- Log innings switch with commentary
- Maintain clear communication of match phase
- Update spectators about batting order changes

## Troubleshooting

### Issue: Toss Button Disabled
**Cause**: Toss already completed or invalid match type  
**Solution**: Check match type and toss status

### Issue: Cannot Switch Innings
**Cause**: Toss not completed or already in second innings  
**Solution**: Complete toss first, check current innings

### Issue: Wrong Batting Order
**Cause**: Incorrect toss decision recording  
**Solution**: Contact admin to reset toss (if needed)

### Issue: Target Calculation Wrong
**Cause**: Incorrect first innings score  
**Solution**: Verify and correct first innings total before switching

## Future Enhancements

- **Multiple Innings**: Support for Test matches (4 innings)
- **Powerplay Management**: Track powerplay overs
- **Player-Specific Stats**: Individual batting/bowling records
- **Auto-Scoring**: Integration with scoring devices
- **Live Commentary**: Real-time match commentary
- **Weather Updates**: Rain delay management

## Support

For technical issues or feature requests:
- Check the troubleshooting section first
- Verify user permissions (admin/student_head)
- Contact system administrator
- Report bugs through the appropriate channels

---

*This guide covers the cricket toss and innings management features. For general live scoring instructions, refer to the main Live Scoring Documentation.*