# Development Guide

## Architecture Overview

Sandlot Sluggers is built using React Native with Expo for cross-platform mobile development.

### Core Components

#### Screens
- **MainMenuScreen** - Entry point, navigation to game modes
- **CharacterSelectScreen** - Player selection with stat visualization
- **StadiumSelectScreen** - Field selection with difficulty levels
- **GameplayScreen** - Main game loop with batting/pitching mechanics
- **GameOverScreen** - Results display and replay options

#### Game Logic (`src/utils/gameLogic.js`)

Key functions:
- `calculateHitOutcome()` - Determines hit type based on timing and stats
- `calculatePitchQuality()` - Generates pitch characteristics
- `updateBasesAfterHit()` - Manages base runners
- `generateAIStats()` - Scales AI difficulty
- `initializeGameState()` - Sets up new game
- `advanceInning()` - Progresses through innings

#### Data Models

**Character** (`src/data/characters.js`)
```javascript
{
  id: string,
  name: string,
  description: string,
  power: number (1-10),
  speed: number (1-10),
  fielding: number (1-10),
  pitching: number (1-10),
  color: string,
  funFact: string,
  favoriteSnack: string
}
```

**Stadium** (`src/data/stadiums.js`)
```javascript
{
  id: string,
  name: string,
  description: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  backgroundColor: string,
  groundColor: string,
  grassColor: string,
  specialFeature: string,
  outfieldSize: 'Small' | 'Medium' | 'Large',
  funFact: string
}
```

**Game State**
```javascript
{
  inning: number,
  maxInnings: number,
  playerScore: number,
  aiScore: number,
  isPlayerBatting: boolean,
  outs: number,
  basesOccupied: [boolean, boolean, boolean],
  currentBatter: Character,
  currentPitcher: Character,
  gameOver: boolean
}
```

## Gameplay Mechanics

### Batting System
1. Player taps "Pitch" to start the pitch animation
2. Ball animates from left to right across screen
3. Player must tap "SWING" at the right moment
4. Timing quality (closer to center = better) + character power stats = hit outcome
5. Outcomes: Home Run, Triple, Double, Single, or Out

### Hit Calculation
```
hitPower = (power/10) × (1 - |timing|) × random(0.85, 1.15)

if hitPower > 0.8: Home Run
if hitPower > 0.6: Triple
if hitPower > 0.4: Double
if hitPower > 0.2: Single
else: Out
```

### AI Behavior
- AI skill level scales with stadium difficulty
- Random chance based on combined power+speed stats
- Simulates batting with random hit types on success

### Base Running
- Automatically advances runners based on hit type
- Tracks runners on 1st, 2nd, 3rd base
- Scores calculated when runners reach home

### Inning System
- Each team bats until 3 outs
- Game consists of 9 innings
- Higher score after 9 innings wins

## Adding New Features

### Adding a New Character
1. Add character object to `src/data/characters.js`
2. Include all required properties
3. Balance stats (total shouldn't exceed ~30)
4. Add unique personality through funFact and favoriteSnack

### Adding a New Stadium
1. Add stadium object to `src/data/stadiums.js`
2. Choose distinct color scheme
3. Define special feature (can affect gameplay)
4. Set appropriate difficulty level

### Modifying Game Logic
1. Game logic is centralized in `src/utils/gameLogic.js`
2. Test changes to ensure balanced gameplay
3. Consider edge cases (ties, extra innings, etc.)

## UI/UX Principles

### Design Philosophy
- **Bright and Colorful** - Appeal to all ages
- **Large Touch Targets** - Easy mobile interaction
- **Clear Feedback** - Players always know game state
- **Simple Navigation** - Minimal screens, clear flow

### Color Palette
- Sky Blue (`#87CEEB`) - Primary background
- Coral Red (`#FF6B6B`) - Action/Important elements
- Teal (`#4ECDC4`) - Secondary actions
- White - Contrast and clarity
- Character-specific colors for personality

### Typography
- **Bold fonts** for important information
- **Text shadows** for readability on colorful backgrounds
- **Emoji integration** for visual interest and fun

## Performance Considerations

### Optimization Tips
1. Use `useCallback` for handler functions
2. Minimize re-renders with proper state management
3. Keep animations smooth with native driver
4. Lazy load assets when possible

### Mobile-Specific
- Landscape orientation required for optimal field view
- Touch targets minimum 44x44 points
- Haptic feedback for actions (future enhancement)

## Testing

### Manual Testing Checklist
- [ ] Character selection works for all 8 characters
- [ ] Stadium selection works for all 6 stadiums
- [ ] Batting mechanics feel responsive
- [ ] Score tracking is accurate
- [ ] Innings progress correctly
- [ ] Game ends after 9 innings
- [ ] Game over screen shows correct winner
- [ ] Navigation flows work (back buttons, etc.)

### Future: Automated Testing
- Unit tests for game logic functions
- Integration tests for game flow
- UI tests for screen interactions

## Deployment

### Building for Production

**iOS:**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

**Web:**
```bash
npm run build:web
```

### App Store Guidelines
- Ensure all content is original
- No copyrighted material
- Age-appropriate rating (suitable for all ages)
- Privacy policy if collecting any data

## Known Issues / Future Improvements

### Current Limitations
- No persistent game state (no save/load)
- No multiplayer support
- AI is relatively simple
- No sound effects yet
- Limited animations

### Planned Enhancements
1. **Statistics Tracking** - Win/loss records, batting averages
2. **Tournament Mode** - Multi-game competitions
3. **Sound Effects** - Original audio for immersion
4. **More Animations** - Better hit feedback, celebrations
5. **Power-ups** - Special abilities for strategic depth
6. **Customization** - Team names, uniform colors
7. **Achievements** - Unlock system for replayability

## Contributing Guidelines

### Code Style
- Use functional components with hooks
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions focused and single-purpose

### Commit Messages
- Use descriptive commit messages
- Prefix with type: feat, fix, docs, style, refactor
- Example: "feat: add new character Speedy Stella"

## Resources

### React Native Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)

### Game Design References
- Keep gameplay simple and intuitive
- Focus on fun over complexity
- Ensure all ages can enjoy

---

Happy coding! Let's make Sandlot Sluggers the best baseball game it can be! ⚾
