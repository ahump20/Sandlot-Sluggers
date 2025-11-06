interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

interface LeaderboardEntry {
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

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
  lastUpdated: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const statType = url.searchParams.get("stat") || "wins"; // wins, home_runs, hits, runs

  const CACHE_KEY = `stats:leaderboard:${statType}:${limit}`;
  const CACHE_TTL = 120; // 2 minutes cache

  try {
    // Try to get cached data from KV
    const cached = await context.env.KV.get(CACHE_KEY, "json");
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120"
        }
      });
    }

    // Map stat type to column name
    const statColumn: Record<string, string> = {
      wins: "wins",
      home_runs: "total_home_runs",
      hits: "total_hits",
      runs: "total_runs",
      games: "games_played"
    };

    const orderBy = statColumn[statType] || "wins";

    // Get top players
    const topPlayers = await context.env.DB.prepare(`
      SELECT
        player_id,
        games_played,
        wins,
        losses,
        total_runs,
        total_hits,
        total_home_runs,
        current_level,
        CASE
          WHEN games_played > 0 THEN ROUND((CAST(wins AS FLOAT) / games_played) * 100, 1)
          ELSE 0
        END as win_rate
      FROM player_progress
      WHERE games_played > 0
      ORDER BY ${orderBy} DESC, wins DESC
      LIMIT ?
    `).bind(limit).all();

    // Get total player count
    const totalPlayersResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as count FROM player_progress WHERE games_played > 0"
    ).first();

    const leaderboard: LeaderboardEntry[] = topPlayers.results.map((player: any, index: number) => {
      // Generate player names (in a real app, these would be user-set)
      const playerName = generatePlayerName(player.player_id);

      return {
        rank: index + 1,
        playerId: player.player_id.substring(0, 8), // Anonymize
        playerName,
        wins: player.wins,
        totalHomeRuns: player.total_home_runs,
        totalHits: player.total_hits,
        totalRuns: player.total_runs,
        gamesPlayed: player.games_played,
        winRate: parseFloat(player.win_rate),
        level: player.current_level
      };
    });

    const response: LeaderboardResponse = {
      leaderboard,
      totalPlayers: Number(totalPlayersResult?.count || 0),
      lastUpdated: new Date().toISOString()
    };

    // Cache the result in KV
    await context.env.KV.put(CACHE_KEY, JSON.stringify(response), {
      expirationTtl: CACHE_TTL
    });

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=120",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Error fetching leaderboard:", error);

    const fallbackResponse: LeaderboardResponse = {
      leaderboard: [],
      totalPlayers: 0,
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(fallbackResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

// Helper function to generate player names from IDs
function generatePlayerName(playerId: string): string {
  const adjectives = [
    "Lightning", "Thunder", "Rocket", "Flash", "Blaze",
    "Storm", "Comet", "Viper", "Phoenix", "Shadow",
    "Titan", "Nova", "Ace", "Maverick", "Legend"
  ];

  const nouns = [
    "Slugger", "Bomber", "Crusher", "Destroyer", "Master",
    "Champion", "Hunter", "Warrior", "Hero", "Star",
    "Dragon", "Tiger", "Falcon", "Eagle", "Wolf"
  ];

  // Use player ID as seed for consistent name generation
  const hash = playerId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const adjIndex = Math.abs(hash) % adjectives.length;
  const nounIndex = Math.abs(hash >> 8) % nouns.length;
  const number = Math.abs(hash >> 16) % 100;

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
}
