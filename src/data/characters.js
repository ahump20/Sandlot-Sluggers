// Original characters for Sandlot Sluggers - completely unique IP
// Each character has kid-friendly humor and unique stats

export const characters = [
  {
    id: 'slugger-sam',
    name: 'Slugger Sam',
    description: 'The power hitter with a love for home runs!',
    power: 9,
    speed: 5,
    fielding: 6,
    pitching: 4,
    color: '#FF6B6B',
    funFact: 'Can hit a ball into orbit!',
    favoriteSnack: 'Gummy Bears'
  },
  {
    id: 'speedy-stella',
    name: 'Speedy Stella',
    description: 'Lightning fast on the bases!',
    power: 5,
    speed: 10,
    fielding: 7,
    pitching: 5,
    color: '#4ECDC4',
    funFact: 'Once stole home plate three times in one game!',
    favoriteSnack: 'Energy Bars'
  },
  {
    id: 'ace-andy',
    name: 'Ace Andy',
    description: 'The pitching prodigy!',
    power: 4,
    speed: 6,
    fielding: 7,
    pitching: 10,
    color: '#95E1D3',
    funFact: 'Can throw a curveball that curves twice!',
    favoriteSnack: 'Pretzels'
  },
  {
    id: 'golden-glove-gina',
    name: 'Golden Glove Gina',
    description: 'Never drops a catch!',
    power: 6,
    speed: 7,
    fielding: 10,
    pitching: 5,
    color: '#F38181',
    funFact: 'Catches balls with her eyes closed for fun!',
    favoriteSnack: 'Popcorn'
  },
  {
    id: 'home-run-hank',
    name: 'Home Run Hank',
    description: 'The comeback kid!',
    power: 8,
    speed: 6,
    fielding: 7,
    pitching: 6,
    color: '#AA96DA',
    funFact: 'Hit a grand slam on his first at-bat!',
    favoriteSnack: 'Pizza Rolls'
  },
  {
    id: 'mighty-mike',
    name: 'Mighty Mike',
    description: 'Small but mighty!',
    power: 7,
    speed: 8,
    fielding: 6,
    pitching: 5,
    color: '#FCBAD3',
    funFact: 'The shortest player but highest jumper!',
    favoriteSnack: 'Fruit Snacks'
  },
  {
    id: 'captain-casey',
    name: 'Captain Casey',
    description: 'The natural leader!',
    power: 7,
    speed: 7,
    fielding: 8,
    pitching: 7,
    color: '#FFFFD2',
    funFact: 'Can play every position perfectly!',
    favoriteSnack: 'Granola'
  },
  {
    id: 'rocket-rita',
    name: 'Rocket Rita',
    description: 'Fastest arm in the league!',
    power: 6,
    speed: 7,
    fielding: 8,
    pitching: 9,
    color: '#A8E6CF',
    funFact: 'Throws so fast the ball looks invisible!',
    favoriteSnack: 'String Cheese'
  },
];

export const getCharacterById = (id) => {
  return characters.find(char => char.id === id);
};

export const getRandomCharacter = () => {
  return characters[Math.floor(Math.random() * characters.length)];
};
