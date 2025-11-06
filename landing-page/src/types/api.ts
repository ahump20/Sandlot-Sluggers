export interface GlobalStats {
  totalPlayers: number;
  gamesPlayedToday: number;
  totalGamesPlayed: number;
  totalHomeRuns: number;
  totalHits: number;
  totalRuns: number;
  averageGameLength: number;
  activePlayers: number;
  mostPopularStadium: {
    id: string;
    name: string;
    percentage: number;
  };
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  wins: number;
  totalHomeRuns: number;
  totalHits: number;
  totalRuns: number;
  gamesPlayed: number;
  winRate: number;
  level: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: string;
}

export interface CharacterStats {
  id: string;
  name: string;
  unlockRate: number;
  usageCount: number;
  usagePercentage: number;
  isSecret: boolean;
}

export interface CharacterStatsResponse {
  characters: CharacterStats[];
  totalPlayers: number;
  mostPopular: CharacterStats | null;
  leastPopular: CharacterStats | null;
  lastUpdated: string;
}

export interface StadiumStats {
  id: string;
  name: string;
  description: string;
  dimensions: {
    leftField: number;
    centerField: number;
    rightField: number;
  };
  unlockRate: number;
  usageCount: number;
  usagePercentage: number;
  popularityRank: number;
}

export interface StadiumStatsResponse {
  stadiums: StadiumStats[];
  totalPlayers: number;
  mostPopular: StadiumStats | null;
  lastUpdated: string;
}

export interface Character {
  id: string;
  name: string;
  battingPower: number;
  battingAccuracy: number;
  speed: number;
  pitchSpeed: number;
  pitchControl: number;
  fieldingRange: number;
  fieldingAccuracy: number;
  position: string;
  isSecret?: boolean;
}
