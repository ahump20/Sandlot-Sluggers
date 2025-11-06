interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

interface GlobalStats {
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const CACHE_KEY = "stats:global";
  const CACHE_TTL = 60; // 60 seconds cache

  try {
    // Try to get cached data from KV
    const cached = await context.env.KV.get(CACHE_KEY, "json");
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    // Get total players
    const totalPlayersResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as count FROM player_progress"
    ).first();
    const totalPlayers = totalPlayersResult?.count || 0;

    // Get aggregate stats
    const aggregateStats = await context.env.DB.prepare(`
      SELECT
        SUM(games_played) as total_games,
        SUM(total_home_runs) as total_hrs,
        SUM(total_hits) as total_hits,
        SUM(total_runs) as total_runs
      FROM player_progress
    `).first();

    // Get today's games (approximation based on recent activity)
    const todayStats = await context.env.DB.prepare(`
      SELECT COUNT(*) as games_today
      FROM player_progress
      WHERE DATE(updated_at) = DATE('now')
    `).first();

    // Calculate active players (played in last 24 hours)
    const activePlayersResult = await context.env.DB.prepare(`
      SELECT COUNT(*) as active
      FROM player_progress
      WHERE updated_at >= datetime('now', '-24 hours')
    `).first();

    // Get most popular stadium from unlocked_stadiums
    // This is a simplified calculation - in production you'd track actual usage
    const stadiumStats = await context.env.DB.prepare(`
      SELECT unlocked_stadiums FROM player_progress
      WHERE unlocked_stadiums != '[]'
    `).all();

    // Count stadium unlocks
    const stadiumCounts: Record<string, number> = {};
    stadiumStats.results.forEach((row: any) => {
      try {
        const unlocked = JSON.parse(row.unlocked_stadiums);
        unlocked.forEach((stadiumId: string) => {
          stadiumCounts[stadiumId] = (stadiumCounts[stadiumId] || 0) + 1;
        });
      } catch (e) {
        // Skip invalid JSON
      }
    });

    const mostPopularStadiumId = Object.keys(stadiumCounts).reduce((a, b) =>
      stadiumCounts[a] > stadiumCounts[b] ? a : b,
      "stadium_005" // Default to Beach Bash
    );

    const stadiumNames: Record<string, string> = {
      "stadium_001": "Dusty Acres",
      "stadium_002": "Frostbite Field",
      "stadium_003": "Treehouse Park",
      "stadium_004": "Rooftop Rally",
      "stadium_005": "Beach Bash"
    };

    const totalStadiumUnlocks = Object.values(stadiumCounts).reduce((a, b) => a + b, 0);
    const popularityPercentage = totalStadiumUnlocks > 0
      ? Math.round((stadiumCounts[mostPopularStadiumId] / totalStadiumUnlocks) * 100)
      : 34; // Default percentage

    // Calculate average game length (estimated at 8.5 minutes for now)
    const averageGameLength = 8.5;

    const stats: GlobalStats = {
      totalPlayers: Number(totalPlayers),
      gamesPlayedToday: Number(todayStats?.games_today || 0),
      totalGamesPlayed: Number(aggregateStats?.total_games || 0),
      totalHomeRuns: Number(aggregateStats?.total_hrs || 0),
      totalHits: Number(aggregateStats?.total_hits || 0),
      totalRuns: Number(aggregateStats?.total_runs || 0),
      averageGameLength,
      activePlayers: Number(activePlayersResult?.active || 0),
      mostPopularStadium: {
        id: mostPopularStadiumId,
        name: stadiumNames[mostPopularStadiumId] || "Beach Bash",
        percentage: popularityPercentage
      },
      lastUpdated: new Date().toISOString()
    };

    // Cache the result in KV
    await context.env.KV.put(CACHE_KEY, JSON.stringify(stats), {
      expirationTtl: CACHE_TTL
    });

    return new Response(JSON.stringify(stats), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Error fetching global stats:", error);

    // Return fallback stats if database fails
    const fallbackStats: GlobalStats = {
      totalPlayers: 0,
      gamesPlayedToday: 0,
      totalGamesPlayed: 0,
      totalHomeRuns: 0,
      totalHits: 0,
      totalRuns: 0,
      averageGameLength: 8.5,
      activePlayers: 0,
      mostPopularStadium: {
        id: "stadium_005",
        name: "Beach Bash",
        percentage: 34
      },
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(fallbackStats), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
