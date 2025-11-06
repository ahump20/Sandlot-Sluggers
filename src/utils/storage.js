// Storage utility for persisting game data
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GAME_STATS: '@sandlot_sluggers:game_stats',
  HIGH_SCORES: '@sandlot_sluggers:high_scores',
  SETTINGS: '@sandlot_sluggers:settings',
};

// Game Statistics
export const saveGameStats = async (stats) => {
  try {
    const existingStats = await getGameStats();
    const updatedStats = {
      ...existingStats,
      totalGames: (existingStats.totalGames || 0) + 1,
      wins: existingStats.wins || 0,
      losses: existingStats.losses || 0,
      totalRuns: (existingStats.totalRuns || 0) + stats.playerScore,
      ...stats,
    };
    
    if (stats.playerWon) {
      updatedStats.wins += 1;
    } else {
      updatedStats.losses += 1;
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(updatedStats));
    return updatedStats;
  } catch (error) {
    console.error('Error saving game stats:', error);
    return null;
  }
};

export const getGameStats = async () => {
  try {
    const stats = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATS);
    return stats ? JSON.parse(stats) : {
      totalGames: 0,
      wins: 0,
      losses: 0,
      totalRuns: 0,
    };
  } catch (error) {
    console.error('Error loading game stats:', error);
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      totalRuns: 0,
    };
  }
};

export const resetGameStats = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATS);
    return true;
  } catch (error) {
    console.error('Error resetting game stats:', error);
    return false;
  }
};

// High Scores
export const saveHighScore = async (score) => {
  try {
    const highScores = await getHighScores();
    highScores.push(score);
    highScores.sort((a, b) => b.score - a.score);
    const top10 = highScores.slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(top10));
    return top10;
  } catch (error) {
    console.error('Error saving high score:', error);
    return null;
  }
};

export const getHighScores = async () => {
  try {
    const scores = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('Error loading high scores:', error);
    return [];
  }
};

// Settings
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {
      soundEnabled: true,
      musicEnabled: true,
      difficulty: 'Medium',
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      soundEnabled: true,
      musicEnabled: true,
      difficulty: 'Medium',
    };
  }
};
