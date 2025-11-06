import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { stadiums } from '../data/stadiums';

const StadiumSelectScreen = ({ onSelect, onBack }) => {
  const [selectedStadium, setSelectedStadium] = useState(null);

  const handleStadiumPress = (stadium) => {
    setSelectedStadium(stadium);
  };

  const handleConfirm = () => {
    if (selectedStadium) {
      onSelect(selectedStadium);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return '#4CAF50';
      case 'Medium':
        return '#FFC107';
      case 'Hard':
        return '#FF5722';
      default:
        return '#999999';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Pick Your Field!</Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.stadiumsContainer}>
        {stadiums.map((stadium) => (
          <TouchableOpacity
            key={stadium.id}
            style={[
              styles.stadiumCard,
              selectedStadium?.id === stadium.id && styles.selectedCard,
              { backgroundColor: stadium.backgroundColor }
            ]}
            onPress={() => handleStadiumPress(stadium)}
          >
            <View style={styles.stadiumHeader}>
              <Text style={styles.stadiumName}>{stadium.name}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(stadium.difficulty) }]}>
                <Text style={styles.difficultyText}>{stadium.difficulty}</Text>
              </View>
            </View>
            
            <View style={[styles.fieldPreview, { backgroundColor: stadium.grassColor }]}>
              <View style={[styles.diamond, { backgroundColor: stadium.groundColor }]} />
            </View>

            {selectedStadium?.id === stadium.id && (
              <Text style={styles.selectedIndicator}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedStadium && (
        <View style={[styles.detailsPanel, { backgroundColor: selectedStadium.backgroundColor }]}>
          <Text style={styles.detailsTitle}>{selectedStadium.name}</Text>
          <Text style={styles.detailsDescription}>{selectedStadium.description}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⚡ Special:</Text>
            <Text style={styles.infoText}>{selectedStadium.specialFeature}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📏 Size:</Text>
            <Text style={styles.infoText}>{selectedStadium.outfieldSize}</Text>
          </View>

          <Text style={styles.funFact}>💡 {selectedStadium.funFact}</Text>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Play Here! →</Text>
          </TouchableOpacity>
        </View>
      )}

      {!selectedStadium && (
        <View style={styles.detailsPanel}>
          <Text style={styles.instructionText}>👆 Choose your stadium!</Text>
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
  scrollView: {
    maxHeight: 200,
  },
  stadiumsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  stadiumCard: {
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 10,
    width: 150,
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
  stadiumHeader: {
    marginBottom: 8,
  },
  stadiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 5,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'center',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fieldPreview: {
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  diamond: {
    width: 40,
    height: 40,
    transform: [{ rotate: '45deg' }],
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 24,
    color: '#FFD700',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    borderWidth: 4,
    borderColor: '#4ECDC4',
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '600',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  funFact: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    fontStyle: 'italic',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
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
    marginTop: 20,
  },
});

export default StadiumSelectScreen;
