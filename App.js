import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import MainMenuScreen from './src/screens/MainMenuScreen';
import CharacterSelectScreen from './src/screens/CharacterSelectScreen';
import StadiumSelectScreen from './src/screens/StadiumSelectScreen';
import GameplayScreen from './src/screens/GameplayScreen';
import GameOverScreen from './src/screens/GameOverScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const navigateToScreen = (screen) => {
    setCurrentScreen(screen);
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    navigateToScreen('stadium');
  };

  const handleStadiumSelect = (stadium) => {
    setSelectedStadium(stadium);
    navigateToScreen('gameplay');
  };

  const handleGameOver = (result) => {
    setGameResult(result);
    navigateToScreen('gameover');
  };

  const handlePlayAgain = () => {
    setSelectedCharacter(null);
    setSelectedStadium(null);
    setGameResult(null);
    navigateToScreen('character');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return <MainMenuScreen onNavigate={navigateToScreen} />;
      case 'character':
        return <CharacterSelectScreen onSelect={handleCharacterSelect} />;
      case 'stadium':
        return <StadiumSelectScreen onSelect={handleStadiumSelect} onBack={() => navigateToScreen('character')} />;
      case 'gameplay':
        return (
          <GameplayScreen
            character={selectedCharacter}
            stadium={selectedStadium}
            onGameOver={handleGameOver}
            onBack={() => navigateToScreen('stadium')}
          />
        );
      case 'gameover':
        return (
          <GameOverScreen
            result={gameResult}
            onPlayAgain={handlePlayAgain}
            onMainMenu={() => navigateToScreen('menu')}
          />
        );
      default:
        return <MainMenuScreen onNavigate={navigateToScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
});
