import {
  GlobalStats,
  LeaderboardResponse,
  CharacterStatsResponse,
  StadiumStatsResponse,
} from '@/types/api';

// Base API URL - update this to match your deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8788';

export async function fetchGlobalStats(): Promise<GlobalStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/global`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error('Failed to fetch global stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching global stats:', error);
    // Return fallback data
    return {
      totalPlayers: 0,
      gamesPlayedToday: 0,
      totalGamesPlayed: 0,
      totalHomeRuns: 0,
      totalHits: 0,
      totalRuns: 0,
      averageGameLength: 8.5,
      activePlayers: 0,
      mostPopularStadium: {
        id: 'stadium_005',
        name: 'Beach Bash',
        percentage: 34,
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function fetchLeaderboard(
  limit: number = 10,
  statType: string = 'wins'
): Promise<LeaderboardResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stats/leaderboard?limit=${limit}&stat=${statType}`,
      {
        next: { revalidate: 120 }, // Cache for 2 minutes
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      leaderboard: [],
      totalPlayers: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function fetchCharacterStats(): Promise<CharacterStatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/characters`, {
      next: { revalidate: 180 }, // Cache for 3 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch character stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching character stats:', error);
    return {
      characters: [],
      totalPlayers: 0,
      mostPopular: null,
      leastPopular: null,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function fetchStadiumStats(): Promise<StadiumStatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/stadiums`, {
      next: { revalidate: 180 }, // Cache for 3 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stadium stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stadium stats:', error);
    return {
      stadiums: [],
      totalPlayers: 0,
      mostPopular: null,
      lastUpdated: new Date().toISOString(),
    };
  }
}
