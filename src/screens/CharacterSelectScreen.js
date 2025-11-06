import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { characters } from '../data/characters';

const CharacterSelectScreen = ({ onSelect }) => {
  const [selectedChar, setSelectedChar] = useState(null);

  const handleCharacterPress = (character) => {
    setSelectedChar(character);
  };

  const handleConfirm = () => {
    if (selectedChar) {
      onSelect(selectedChar);
    }
  };

  const renderStatBar = (label, value) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}:</Text>
      <View style={styles.statBarContainer}>
        <View style={[styles.statBar, { width: `${value * 10}%`, backgroundColor: getStatColor(value) }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const getStatColor = (value) => {
    if (value >= 8) return '#4CAF50';
    if (value >= 6) return '#FFC107';
    return '#FF5722';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Player!</Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.charactersContainer}>
        {characters.map((character) => (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.characterCard,
              selectedChar?.id === character.id && styles.selectedCard,
              { borderColor: character.color }
            ]}
            onPress={() => handleCharacterPress(character)}
          >
            <View style={[styles.characterIcon, { backgroundColor: character.color }]}>
              <Text style={styles.characterEmoji}>⚾</Text>
            </View>
            <Text style={styles.characterName}>{character.name}</Text>
            {selectedChar?.id === character.id && (
              <Text style={styles.selectedIndicator}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedChar && (
        <View style={styles.detailsPanel}>
          <Text style={styles.detailsTitle}>{selectedChar.name}</Text>
          <Text style={styles.detailsDescription}>{selectedChar.description}</Text>
          
          <View style={styles.statsContainer}>
            {renderStatBar('Power', selectedChar.power)}
            {renderStatBar('Speed', selectedChar.speed)}
            {renderStatBar('Field', selectedChar.fielding)}
            {renderStatBar('Pitch', selectedChar.pitching)}
          </View>

          <Text style={styles.funFact}>💡 {selectedChar.funFact}</Text>
          <Text style={styles.snack}>🍭 Loves: {selectedChar.favoriteSnack}</Text>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Let's Play! →</Text>
          </TouchableOpacity>
        </View>
      )}

      {!selectedChar && (
        <View style={styles.detailsPanel}>
          <Text style={styles.instructionText}>👆 Tap a character to see their stats!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    padding: 15,
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
  scrollView: {
    maxHeight: 180,
  },
  charactersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  characterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 4,
    padding: 10,
    width: 110,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 6,
    transform: [{ scale: 1.05 }],
  },
  characterIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  characterEmoji: {
    fontSize: 32,
  },
  characterName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 24,
    color: '#4CAF50',
  },
  detailsPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    borderWidth: 4,
    borderColor: '#4ECDC4',
    flex: 1,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 5,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  statsContainer: {
    marginVertical: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 50,
    color: '#333333',
  },
  statBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 10,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 25,
    textAlign: 'right',
    color: '#333333',
  },
  funFact: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  snack: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  confirmButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default CharacterSelectScreen;
