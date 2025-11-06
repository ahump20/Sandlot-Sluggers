// Original stadium settings for Sandlot Sluggers
// Each stadium has unique characteristics and colorful themes

export const stadiums = [
  {
    id: 'sunny-shores',
    name: 'Sunny Shores Field',
    description: 'A beachside paradise with ocean breezes!',
    difficulty: 'Easy',
    backgroundColor: '#87CEEB',
    groundColor: '#F4A460',
    grassColor: '#90EE90',
    specialFeature: 'Wind sometimes helps hits go further',
    outfieldSize: 'Medium',
    funFact: 'Watch out for seagulls!',
  },
  {
    id: 'mountain-peak',
    name: 'Mountain Peak Park',
    description: 'High altitude baseball with amazing views!',
    difficulty: 'Medium',
    backgroundColor: '#B0E0E6',
    groundColor: '#8B7355',
    grassColor: '#228B22',
    specialFeature: 'Balls fly extra far in thin air',
    outfieldSize: 'Large',
    funFact: 'Sometimes you can see eagles flying by!',
  },
  {
    id: 'downtown-diamond',
    name: 'Downtown Diamond',
    description: 'Urban baseball in the heart of the city!',
    difficulty: 'Medium',
    backgroundColor: '#FFE4B5',
    groundColor: '#CD853F',
    grassColor: '#32CD32',
    specialFeature: 'Bouncy artificial turf',
    outfieldSize: 'Medium',
    funFact: 'City skyline makes for epic home run backdrops!',
  },
  {
    id: 'forest-field',
    name: 'Whispering Forest Field',
    description: 'Play ball among the towering trees!',
    difficulty: 'Hard',
    backgroundColor: '#98D8C8',
    groundColor: '#8B4513',
    grassColor: '#006400',
    specialFeature: 'Tricky shadows from trees',
    outfieldSize: 'Small',
    funFact: 'Squirrels cheer from the trees!',
  },
  {
    id: 'desert-dugout',
    name: 'Desert Dugout',
    description: 'Hot and sandy - stay hydrated!',
    difficulty: 'Hard',
    backgroundColor: '#FFD700',
    groundColor: '#DEB887',
    grassColor: '#BDB76B',
    specialFeature: 'Heat makes players tired faster',
    outfieldSize: 'Large',
    funFact: 'Cactus outfield decorations!',
  },
  {
    id: 'rainbow-ranch',
    name: 'Rainbow Ranch',
    description: 'Colorful country baseball fun!',
    difficulty: 'Easy',
    backgroundColor: '#FFC0CB',
    groundColor: '#D2B48C',
    grassColor: '#7CFC00',
    specialFeature: 'Lucky rainbow boosts',
    outfieldSize: 'Medium',
    funFact: 'The most colorful field ever!',
  },
];

export const getStadiumById = (id) => {
  return stadiums.find(stadium => stadium.id === id);
};

export const getStadiumsByDifficulty = (difficulty) => {
  return stadiums.filter(stadium => stadium.difficulty === difficulty);
};
