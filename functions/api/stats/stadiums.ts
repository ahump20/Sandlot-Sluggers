interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

interface StadiumStats {
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

interface StadiumStatsResponse {
  stadiums: StadiumStats[];
  totalPlayers: number;
  mostPopular: StadiumStats | null;
  lastUpdated: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const CACHE_KEY = "stats:stadiums";
  const CACHE_TTL = 180; // 3 minutes cache

  try {
    // Try to get cached data from KV
    const cached = await context.env.KV.get(CACHE_KEY, "json");
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=180"
        }
      });
    }

    // Stadium definitions
    const stadiumDefinitions = [
      {
        id: "stadium_001",
        name: "Dusty Acres",
        description: "A dusty desert diamond with tumbleweeds and cacti",
        dimensions: { leftField: 32, centerField: 38, rightField: 32 }
      },
      {
        id: "stadium_002",
        name: "Frostbite Field",
        description: "Snow-covered outfield with icy patches",
        dimensions: { leftField: 30, centerField: 35, rightField: 30 }
      },
      {
        id: "stadium_003",
        name: "Treehouse Park",
        description: "Elevated platform among giant trees",
        dimensions: { leftField: 28, centerField: 33, rightField: 28 }
      },
      {
        id: "stadium_004",
        name: "Rooftop Rally",
        description: "City rooftop with skyscraper backdrop",
        dimensions: { leftField: 34, centerField: 40, rightField: 34 }
      },
      {
        id: "stadium_005",
        name: "Beach Bash",
        description: "Sandy diamond with ocean waves",
        dimensions: { leftField: 31, centerField: 36, rightField: 31 }
      }
    ];

    // Get total players
    const totalPlayersResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as count FROM player_progress"
    ).first();
    const totalPlayers = Number(totalPlayersResult?.count || 0);

    // Get all player stadium unlocks
    const playerUnlocks = await context.env.DB.prepare(`
      SELECT unlocked_stadiums FROM player_progress
      WHERE unlocked_stadiums != '[]'
    `).all();

    // Count stadium unlocks
    const stadiumCounts: Record<string, number> = {};

    // Initialize all stadiums with 0 count
    stadiumDefinitions.forEach(stadium => {
      stadiumCounts[stadium.id] = 0;
    });

    // Count unlocks from database
    playerUnlocks.results.forEach((row: any) => {
      try {
        const unlocked = JSON.parse(row.unlocked_stadiums);
        unlocked.forEach((stadiumId: string) => {
          if (stadiumCounts[stadiumId] !== undefined) {
            stadiumCounts[stadiumId]++;
          }
        });
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Calculate total usage (sum of all stadium counts)
    const totalUsage = Object.values(stadiumCounts).reduce((sum, count) => sum + count, 0);

    // Build stadium stats
    const stadiumStats: StadiumStats[] = stadiumDefinitions.map(stadium => {
      const count = stadiumCounts[stadium.id];
      const unlockRate = totalPlayers > 0
        ? Math.round((count / totalPlayers) * 100)
        : 0;
      const usagePercentage = totalUsage > 0
        ? Math.round((count / totalUsage) * 100 * 10) / 10
        : 20; // Default 20% each if no data

      return {
        id: stadium.id,
        name: stadium.name,
        description: stadium.description,
        dimensions: stadium.dimensions,
        unlockRate,
        usageCount: count,
        usagePercentage,
        popularityRank: 0 // Will be set after sorting
      };
    });

    // Sort by usage count (descending)
    stadiumStats.sort((a, b) => b.usageCount - a.usageCount);

    // Assign popularity ranks
    stadiumStats.forEach((stadium, index) => {
      stadium.popularityRank = index + 1;
    });

    const mostPopular = stadiumStats[0] || null;

    const response: StadiumStatsResponse = {
      stadiums: stadiumStats,
      totalPlayers,
      mostPopular,
      lastUpdated: new Date().toISOString()
    };

    // Cache the result in KV
    await context.env.KV.put(CACHE_KEY, JSON.stringify(response), {
      expirationTtl: CACHE_TTL
    });

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=180",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Error fetching stadium stats:", error);

    const fallbackResponse: StadiumStatsResponse = {
      stadiums: [],
      totalPlayers: 0,
      mostPopular: null,
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
