import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MainMenuScreen = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>⚾ SANDLOT SLUGGERS ⚾</Text>
        <Text style={styles.subtitle}>Play Ball!</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => onNavigate('character')}
        >
          <Text style={styles.menuButtonText}>🎮 Play Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.secondaryButton]}
          onPress={() => onNavigate('stats')}
        >
          <Text style={styles.menuButtonText}>📊 View Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.secondaryButton]}
          onPress={() => alert('Coming soon!')}
        >
          <Text style={styles.menuButtonText}>⚙️ Options</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>A nostalgic baseball adventure!</Text>
        <Text style={styles.footerText}>🌟 Kid-friendly fun for everyone 🌟</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  menuButton: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: '#95E1D3',
  },
  menuButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 5,
  },
});

export default MainMenuScreen;
