// Game logic utilities for Sandlot Sluggers

// Calculate hit outcome based on character stats and timing
export const calculateHitOutcome = (character, timing, pitchSpeed) => {
  const powerFactor = character.power / 10;
  const timingFactor = Math.max(0, 1 - Math.abs(timing)); // timing closer to 0 is better
  const randomFactor = Math.random() * 0.3 + 0.85; // 0.85 to 1.15
  
  const hitPower = powerFactor * timingFactor * randomFactor;
  
  // Determine hit type based on power
  if (hitPower > 0.8) {
    return { type: 'homerun', bases: 4, points: 1 };
  } else if (hitPower > 0.6) {
    return { type: 'triple', bases: 3, points: 0 };
  } else if (hitPower > 0.4) {
    return { type: 'double', bases: 2, points: 0 };
  } else if (hitPower > 0.2) {
    return { type: 'single', bases: 1, points: 0 };
  } else {
    return { type: 'out', bases: 0, points: 0 };
  }
};

// Calculate pitch quality based on pitcher stats
export const calculatePitchQuality = (character) => {
  const pitchingSkill = character.pitching / 10;
  const randomVariation = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
  
  return {
    speed: pitchingSkill * randomVariation * 100,
    accuracy: pitchingSkill * randomVariation,
  };
};

// Calculate fielding success based on fielder stats
export const calculateFieldingSuccess = (character, hitType) => {
  const fieldingSkill = character.fielding / 10;
  const hitDifficulty = {
    'single': 0.3,
    'double': 0.5,
    'triple': 0.7,
    'homerun': 1.0,
  }[hitType] || 0.5;
  
  const catchChance = fieldingSkill * (1 - hitDifficulty) + Math.random() * 0.3;
  
  return catchChance > 0.6;
};

// Calculate base running outcome
export const calculateBaseRunning = (character, basesToRun) => {
  const speedFactor = character.speed / 10;
  const randomFactor = Math.random() * 0.3 + 0.85;
  
  const successChance = speedFactor * randomFactor;
  
  // Higher speed means higher chance of safe arrival
  if (basesToRun === 1) {
    return successChance > 0.3; // Easy to run to first
  } else if (basesToRun === 2) {
    return successChance > 0.5; // Moderate difficulty
  } else {
    return successChance > 0.7; // Hard to steal home or go for inside-the-park
  }
};

// Generate AI opponent difficulty scaling
export const generateAIStats = (difficulty, baseCharacter) => {
  const difficultyMultipliers = {
    'Easy': 0.7,
    'Medium': 1.0,
    'Hard': 1.3,
  };
  
  const multiplier = difficultyMultipliers[difficulty] || 1.0;
  
  return {
    ...baseCharacter,
    power: Math.min(10, Math.round(baseCharacter.power * multiplier)),
    speed: Math.min(10, Math.round(baseCharacter.speed * multiplier)),
    fielding: Math.min(10, Math.round(baseCharacter.fielding * multiplier)),
    pitching: Math.min(10, Math.round(baseCharacter.pitching * multiplier)),
  };
};


// Game state management
export const initializeGameState = (playerCharacter, aiCharacter, stadium) => {
  return {
    inning: 1,
    maxInnings: 9,
    playerScore: 0,
    aiScore: 0,
    isPlayerBatting: true,
    outs: 0,
    basesOccupied: [false, false, false], // 1st, 2nd, 3rd base
    currentBatter: playerCharacter,
    currentPitcher: aiCharacter,
    gameOver: false,
  };
};

export const advanceInning = (gameState) => {
  const newInning = gameState.inning + (gameState.isPlayerBatting ? 0 : 1);
  return {
    ...gameState,
    inning: newInning,
    isPlayerBatting: !gameState.isPlayerBatting,
    outs: 0,
    basesOccupied: [false, false, false],
    gameOver: newInning > gameState.maxInnings,
  };
};

export const updateBasesAfterHit = (gameState, hitResult) => {
  let newBases = [...gameState.basesOccupied];
  let runsScored = 0;
  
  // Move runners based on hit
  for (let i = 2; i >= 0; i--) {
    if (newBases[i]) {
      const newBase = i + hitResult.bases;
      if (newBase >= 3) {
        runsScored++;
        newBases[i] = false;
      } else {
        newBases[newBase] = true;
        newBases[i] = false;
      }
    }
  }
  
  // Place batter on base
  if (hitResult.bases > 0 && hitResult.bases < 4) {
    newBases[hitResult.bases - 1] = true;
  } else if (hitResult.bases === 4) {
    runsScored++;
  }
  
  return { newBases, runsScored };
};
