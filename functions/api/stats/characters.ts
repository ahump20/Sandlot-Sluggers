interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

interface CharacterStats {
  id: string;
  name: string;
  unlockRate: number;
  usageCount: number;
  usagePercentage: number;
  isSecret: boolean;
}

interface CharacterStatsResponse {
  characters: CharacterStats[];
  totalPlayers: number;
  mostPopular: CharacterStats | null;
  leastPopular: CharacterStats | null;
  lastUpdated: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const CACHE_KEY = "stats:characters";
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

    // Character definitions
    const characterDefinitions = [
      { id: "char_001", name: "Rocket Rodriguez", isSecret: false },
      { id: "char_002", name: "Ace McKenzie", isSecret: false },
      { id: "char_003", name: "Thunder Thompson", isSecret: false },
      { id: "char_004", name: "Dizzy Daniels", isSecret: false },
      { id: "char_005", name: "Flash Freeman", isSecret: false },
      { id: "char_006", name: "Brick Martinez", isSecret: false },
      { id: "char_007", name: "Pepper Sanchez", isSecret: false },
      { id: "char_008", name: "Zoom Williams", isSecret: false },
      { id: "char_009", name: "Knuckles O'Brien", isSecret: false },
      { id: "char_010", name: "Slider Jackson", isSecret: false },
      { id: "char_secret_001", name: "Comet Carter", isSecret: true },
      { id: "char_secret_002", name: "Blaze (Dog)", isSecret: true }
    ];

    // Get total players
    const totalPlayersResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as count FROM player_progress"
    ).first();
    const totalPlayers = Number(totalPlayersResult?.count || 0);

    // Get all player character unlocks
    const playerUnlocks = await context.env.DB.prepare(`
      SELECT unlocked_characters FROM player_progress
      WHERE unlocked_characters != '[]'
    `).all();

    // Count character unlocks
    const characterCounts: Record<string, number> = {};

    // Initialize all characters with 0 count
    characterDefinitions.forEach(char => {
      characterCounts[char.id] = 0;
    });

    // Count unlocks from database
    playerUnlocks.results.forEach((row: any) => {
      try {
        const unlocked = JSON.parse(row.unlocked_characters);
        unlocked.forEach((charId: string) => {
          if (characterCounts[charId] !== undefined) {
            characterCounts[charId]++;
          }
        });
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Calculate total usage (sum of all character counts)
    const totalUsage = Object.values(characterCounts).reduce((sum, count) => sum + count, 0);

    // Build character stats
    const characterStats: CharacterStats[] = characterDefinitions.map(char => {
      const count = characterCounts[char.id];
      const unlockRate = totalPlayers > 0
        ? Math.round((count / totalPlayers) * 100)
        : 0;
      const usagePercentage = totalUsage > 0
        ? Math.round((count / totalUsage) * 100 * 10) / 10
        : 0;

      return {
        id: char.id,
        name: char.name,
        unlockRate,
        usageCount: count,
        usagePercentage,
        isSecret: char.isSecret
      };
    });

    // Sort by usage count
    characterStats.sort((a, b) => b.usageCount - a.usageCount);

    // Find most and least popular (excluding secret characters for least popular)
    const regularCharacters = characterStats.filter(c => !c.isSecret);
    const mostPopular = characterStats[0] || null;
    const leastPopular = regularCharacters[regularCharacters.length - 1] || null;

    const response: CharacterStatsResponse = {
      characters: characterStats,
      totalPlayers,
      mostPopular,
      leastPopular,
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
    console.error("Error fetching character stats:", error);

    const fallbackResponse: CharacterStatsResponse = {
      characters: [],
      totalPlayers: 0,
      mostPopular: null,
      leastPopular: null,
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
