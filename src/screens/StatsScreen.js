import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getGameStats, getHighScores, resetGameStats } from '../utils/storage';

const StatsScreen = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [highScores, setHighScores] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const gameStats = await getGameStats();
    const scores = await getHighScores();
    setStats(gameStats);
    setHighScores(scores);
  };

  const handleReset = async () => {
    const confirmed = confirm('Are you sure you want to reset all statistics?');
    if (confirmed) {
      await resetGameStats();
      loadStats();
    }
  };

  const getWinPercentage = () => {
    if (!stats || stats.totalGames === 0) return '0.0';
    return ((stats.wins / stats.totalGames) * 100).toFixed(1);
  };

  const getAverageRuns = () => {
    if (!stats || stats.totalGames === 0) return '0.0';
    return (stats.totalRuns / stats.totalGames).toFixed(1);
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📊 Your Stats 📊</Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Statistics</Text>
          
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalGames}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statValue, styles.winColor]}>{stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statValue, styles.loseColor]}>{stats.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{getWinPercentage()}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalRuns}</Text>
              <Text style={styles.statLabel}>Total Runs</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{getAverageRuns()}</Text>
              <Text style={styles.statLabel}>Avg Runs/Game</Text>
            </View>
          </View>
        </View>

        {/* High Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 10 Scores</Text>
          
          {highScores.length === 0 ? (
            <Text style={styles.emptyText}>No high scores yet. Play a game to set one!</Text>
          ) : (
            <View style={styles.highScoresList}>
              {highScores.map((score, index) => (
                <View key={index} style={styles.highScoreItem}>
                  <Text style={styles.highScoreRank}>#{index + 1}</Text>
                  <View style={styles.highScoreInfo}>
                    <Text style={styles.highScoreName}>{score.characterName}</Text>
                    <Text style={styles.highScoreStadium}>{score.stadiumName}</Text>
                  </View>
                  <Text style={styles.highScoreValue}>{score.score}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Achievements Section (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <Text style={styles.comingSoonText}>Coming Soon!</Text>
          <Text style={styles.achievementHint}>
            Future achievements will include milestones like "First Win", "10 Home Runs", "Perfect Game", and more!
          </Text>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>🔄 Reset All Stats</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    padding: 15,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  loadingText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 100,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 15,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
    textAlign: 'center',
  },
  winColor: {
    color: '#4CAF50',
  },
  loseColor: {
    color: '#FF5722',
  },
  highScoresList: {
    gap: 8,
  },
  highScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  highScoreRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    width: 40,
  },
  highScoreInfo: {
    flex: 1,
    marginLeft: 10,
  },
  highScoreName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  highScoreStadium: {
    fontSize: 12,
    color: '#666666',
  },
  highScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  achievementHint: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginTop: 10,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default StatsScreen;
