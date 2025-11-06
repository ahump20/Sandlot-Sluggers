import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { saveGameStats, saveHighScore } from '../utils/storage';

const GameOverScreen = ({ result, onPlayAgain, onMainMenu }) => {
  useEffect(() => {
    if (result) {
      // Save game statistics
      saveGameStats({
        playerScore: result.playerScore,
        playerWon: result.playerWon,
        characterId: result.character.id,
        stadiumId: result.stadium.id,
      });
      
      // Save high score if applicable
      if (result.playerScore > 0) {
        saveHighScore({
          score: result.playerScore,
          characterName: result.character.name,
          stadiumName: result.stadium.name,
          date: new Date().toISOString(),
        });
      }
    }
  }, [result]);

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  const { playerScore, aiScore, playerWon, character, stadium } = result;
  const scoreDiff = Math.abs(playerScore - aiScore);

  const getVictoryMessage = () => {
    if (playerWon) {
      if (scoreDiff >= 5) return 'CRUSHING VICTORY! 🎉';
      if (scoreDiff >= 3) return 'GREAT WIN! 🌟';
      return 'CLOSE WIN! ⚡';
    } else {
      if (scoreDiff >= 5) return 'TOUGH LOSS 😅';
      if (scoreDiff >= 3) return 'CLOSE GAME 💪';
      return 'ALMOST HAD IT! 🔥';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: stadium.backgroundColor }]}>
      <View style={styles.resultContainer}>
        <Text style={styles.gameOverTitle}>Game Over!</Text>
        
        <View style={[styles.victoryBanner, playerWon ? styles.winBanner : styles.loseBanner]}>
          <Text style={styles.victoryText}>{getVictoryMessage()}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreBoxTitle}>You</Text>
            <Text style={[styles.scoreBoxValue, playerWon && styles.winScore]}>{playerScore}</Text>
            <Text style={styles.characterName}>{character.name}</Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreBoxTitle}>AI</Text>
            <Text style={[styles.scoreBoxValue, !playerWon && styles.winScore]}>{aiScore}</Text>
            <Text style={styles.characterName}>Computer</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Game Stats:</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Stadium:</Text>
            <Text style={styles.statValue}>{stadium.name}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Difficulty:</Text>
            <Text style={styles.statValue}>{stadium.difficulty}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Score Difference:</Text>
            <Text style={styles.statValue}>{scoreDiff}</Text>
          </View>
        </View>

        {playerWon && (
          <View style={styles.achievementContainer}>
            <Text style={styles.achievementText}>🏆 Victory Unlocked! 🏆</Text>
            <Text style={styles.achievementSubtext}>Great job, champion!</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.playAgainButton]}
            onPress={onPlayAgain}
          >
            <Text style={styles.buttonText}>🔄 Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.menuButton]}
            onPress={onMainMenu}
          >
            <Text style={styles.buttonText}>🏠 Main Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resultContainer: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 5,
    borderColor: '#4ECDC4',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  gameOverTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 15,
  },
  victoryBanner: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  winBanner: {
    backgroundColor: '#4CAF50',
  },
  loseBanner: {
    backgroundColor: '#FFC107',
  },
  victoryText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#4ECDC4',
    minWidth: 120,
  },
  scoreBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 5,
  },
  scoreBoxValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#666666',
  },
  winScore: {
    color: '#4CAF50',
  },
  characterName: {
    fontSize: 12,
    color: '#999999',
    marginTop: 5,
  },
  vsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  statsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  statValue: {
    fontSize: 14,
    color: '#333333',
  },
  achievementContainer: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  achievementText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  achievementSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  menuButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default GameOverScreen;
