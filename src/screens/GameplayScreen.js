import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { 
  initializeGameState, 
  calculateHitOutcome, 
  updateBasesAfterHit, 
  advanceInning,
  generateAIStats,
  calculatePitchQuality
} from '../utils/gameLogic';
import { getRandomCharacter } from '../data/characters';

const GameplayScreen = ({ character, stadium, onGameOver, onBack }) => {
  const [gameState, setGameState] = useState(null);
  const [aiCharacter, setAICharacter] = useState(null);
  const [isPitching, setIsPitching] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const [pitchSpeed, setPitchSpeed] = useState(0);
  
  const ballPositionX = useRef(new Animated.Value(-200)).current;
  const ballPositionY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize game with AI opponent
    const opponent = generateAIStats(stadium.difficulty, getRandomCharacter());
    setAICharacter(opponent);
    setGameState(initializeGameState(character, opponent, stadium));
  }, [character, stadium]);

  const startPitch = () => {
    if (!gameState || isPitching) return;
    
    setIsPitching(true);
    setLastAction('');
    
    const pitcher = gameState.isPlayerBatting ? aiCharacter : character;
    const pitchQuality = calculatePitchQuality(pitcher);
    setPitchSpeed(pitchQuality.speed);
    
    // Animate the pitch
    ballPositionX.setValue(-200);
    ballPositionY.setValue(Math.random() * 40 - 20); // Some vertical variation
    
    Animated.timing(ballPositionX, {
      toValue: 200,
      duration: 2000 - (pitchQuality.speed * 5), // Faster pitches take less time
      useNativeDriver: true,
    }).start(() => {
      // Ball passed - it's a strike if not hit
      if (isPitching) {
        handleMiss();
      }
    });
  };

  const handleSwing = () => {
    if (!isPitching) return;
    
    setIsPitching(false);
    
    // Calculate timing based on ball position
    const timing = (ballPositionX._value + 200) / 400; // 0 to 1
    const perfectTiming = 0.5;
    const timingDiff = Math.abs(timing - perfectTiming);
    
    const batter = gameState.isPlayerBatting ? character : aiCharacter;
    const hitResult = calculateHitOutcome(batter, timingDiff, pitchSpeed);
    
    if (hitResult.type === 'out') {
      handleOut();
    } else {
      handleHit(hitResult);
    }
  };

  const handleHit = (hitResult) => {
    setLastAction(`${hitResult.type.toUpperCase()}! 🎉`);
    
    const { newBases, runsScored } = updateBasesAfterHit(gameState, hitResult);
    
    const newScore = gameState.isPlayerBatting
      ? gameState.playerScore + runsScored + hitResult.points
      : gameState.aiScore + runsScored + hitResult.points;
    
    setGameState({
      ...gameState,
      playerScore: gameState.isPlayerBatting ? newScore : gameState.playerScore,
      aiScore: !gameState.isPlayerBatting ? newScore : gameState.aiScore,
      basesOccupied: newBases,
    });
    
    // AI takes turn after short delay
    setTimeout(() => {
      if (!gameState.isPlayerBatting) {
        simulateAITurn();
      }
    }, 1500);
  };

  const handleOut = () => {
    setLastAction('OUT! ❌');
    
    const newOuts = gameState.outs + 1;
    
    if (newOuts >= 3) {
      // Switch sides
      const newState = advanceInning(gameState);
      
      if (newState.gameOver) {
        endGame(newState);
      } else {
        setGameState(newState);
        setLastAction(`End of inning ${gameState.inning}! ${newState.isPlayerBatting ? 'Your turn to bat!' : 'Your turn to pitch!'}`);
      }
    } else {
      setGameState({
        ...gameState,
        outs: newOuts,
      });
    }
  };

  const handleMiss = () => {
    setIsPitching(false);
    setLastAction('Strike! ⚡');
    
    // For simplicity, treat missed swings as outs
    setTimeout(() => handleOut(), 500);
  };

  const simulateAITurn = () => {
    // Simple AI behavior
    const randomChance = Math.random();
    const aiSkill = (aiCharacter.power + aiCharacter.speed) / 20;
    
    if (randomChance < aiSkill) {
      // AI gets a hit
      const hitTypes = ['single', 'double', 'triple', 'homerun'];
      const hitType = hitTypes[Math.floor(Math.random() * hitTypes.length)];
      const bases = { single: 1, double: 2, triple: 3, homerun: 4 }[hitType];
      handleHit({ type: hitType, bases, points: bases === 4 ? 1 : 0 });
    } else {
      // AI gets out
      handleOut();
    }
  };

  const endGame = (finalState) => {
    const playerWon = finalState.playerScore > finalState.aiScore;
    onGameOver({
      playerScore: finalState.playerScore,
      aiScore: finalState.aiScore,
      playerWon,
      character,
      stadium,
    });
  };

  if (!gameState || !aiCharacter) {
    return (
      <View style={[styles.container, { backgroundColor: stadium.backgroundColor }]}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: stadium.backgroundColor }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Exit</Text>
      </TouchableOpacity>

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>You</Text>
          <Text style={styles.scoreValue}>{gameState.playerScore}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.inningText}>Inning {gameState.inning}</Text>
          <Text style={styles.outsText}>Outs: {gameState.outs}/3</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>{aiCharacter.name}</Text>
          <Text style={styles.scoreValue}>{gameState.aiScore}</Text>
        </View>
      </View>

      {/* Field visualization */}
      <View style={[styles.field, { backgroundColor: stadium.grassColor }]}>
        <View style={[styles.infield, { backgroundColor: stadium.groundColor }]}>
          {/* Bases */}
          <View style={[styles.base, styles.firstBase, gameState.basesOccupied[0] && styles.baseOccupied]} />
          <View style={[styles.base, styles.secondBase, gameState.basesOccupied[1] && styles.baseOccupied]} />
          <View style={[styles.base, styles.thirdBase, gameState.basesOccupied[2] && styles.baseOccupied]} />
          <View style={styles.homePlate} />
        </View>

        {/* Ball animation */}
        {isPitching && (
          <Animated.View
            style={[
              styles.ball,
              {
                transform: [
                  { translateX: ballPositionX },
                  { translateY: ballPositionY },
                ],
              },
            ]}
          >
            <Text style={styles.ballEmoji}>⚾</Text>
          </Animated.View>
        )}
      </View>

      {/* Action message */}
      {lastAction && (
        <View style={styles.actionMessage}>
          <Text style={styles.actionText}>{lastAction}</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {gameState.isPlayerBatting ? (
          <>
            <TouchableOpacity
              style={[styles.controlButton, styles.pitchButton]}
              onPress={startPitch}
              disabled={isPitching}
            >
              <Text style={styles.controlButtonText}>
                {isPitching ? '⏳ Pitching...' : '🎯 Pitch!'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.swingButton]}
              onPress={handleSwing}
              disabled={!isPitching}
            >
              <Text style={styles.controlButtonText}>⚡ SWING!</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.aiTurnContainer}>
            <Text style={styles.aiTurnText}>AI is batting...</Text>
            <TouchableOpacity
              style={[styles.controlButton, styles.pitchButton]}
              onPress={() => {
                startPitch();
                setTimeout(() => simulateAITurn(), 1000);
              }}
              disabled={isPitching}
            >
              <Text style={styles.controlButtonText}>🎯 Pitch to AI</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Player info */}
      <View style={styles.playerInfo}>
        <Text style={styles.playerInfoText}>
          {gameState.isPlayerBatting ? '🏏 Your Turn to Bat!' : '⚡ Your Turn to Pitch!'}
        </Text>
        <Text style={styles.playerName}>{character.name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  inningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  outsText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  field: {
    flex: 1,
    marginVertical: 15,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  infield: {
    width: 200,
    height: 200,
    transform: [{ rotate: '45deg' }],
    borderWidth: 3,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  base: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#000000',
  },
  firstBase: {
    right: -10,
    top: '50%',
    marginTop: -10,
  },
  secondBase: {
    top: -10,
    left: '50%',
    marginLeft: -10,
  },
  thirdBase: {
    left: -10,
    top: '50%',
    marginTop: -10,
  },
  homePlate: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#000000',
  },
  baseOccupied: {
    backgroundColor: '#FFD700',
  },
  ball: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  ballEmoji: {
    fontSize: 32,
  },
  actionMessage: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  actionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
    marginBottom: 10,
  },
  controlButton: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  pitchButton: {
    backgroundColor: '#4ECDC4',
  },
  swingButton: {
    backgroundColor: '#FF6B6B',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  aiTurnContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  aiTurnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playerInfo: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  playerInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  playerName: {
    fontSize: 14,
    color: '#666666',
    marginTop: 3,
  },
});

export default GameplayScreen;
