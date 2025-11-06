interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { playerId } = context.params;

  const result = await context.env.DB.prepare(
    "SELECT * FROM player_progress WHERE player_id = ?"
  ).bind(playerId).first();

  if (!result) {
    return new Response(JSON.stringify({
      playerId,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalRuns: 0,
      totalHits: 0,
      totalHomeRuns: 0,
      unlockedCharacters: [],
      unlockedStadiums: [],
      currentLevel: 1,
      experience: 0
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { playerId } = context.params;
  const updates = await context.request.json() as any;

  const existing = await context.env.DB.prepare(
    "SELECT * FROM player_progress WHERE player_id = ?"
  ).bind(playerId).first();

  const parseStoredArray = (value: unknown): any[] => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  const merged = {
    gamesPlayed: updates.gamesPlayed ?? existing?.games_played ?? 0,
    wins: updates.wins ?? existing?.wins ?? 0,
    losses: updates.losses ?? existing?.losses ?? 0,
    totalRuns: updates.totalRuns ?? existing?.total_runs ?? 0,
    totalHits: updates.totalHits ?? existing?.total_hits ?? 0,
    totalHomeRuns: updates.totalHomeRuns ?? existing?.total_home_runs ?? 0,
    unlockedCharacters: updates.unlockedCharacters ?? parseStoredArray(existing?.unlocked_characters) ?? [],
    unlockedStadiums: updates.unlockedStadiums ?? parseStoredArray(existing?.unlocked_stadiums),
    currentLevel: updates.currentLevel ?? existing?.current_level ?? 1,
    experience: updates.experience ?? existing?.experience ?? 0
  };

  if (existing) {
    await context.env.DB.prepare(`
      UPDATE player_progress
      SET games_played = ?,
          wins = ?,
          losses = ?,
          total_runs = ?,
          total_hits = ?,
          total_home_runs = ?,
          unlocked_characters = ?,
          unlocked_stadiums = ?,
          current_level = ?,
          experience = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE player_id = ?
    `).bind(
      merged.gamesPlayed,
      merged.wins,
      merged.losses,
      merged.totalRuns,
      merged.totalHits,
      merged.totalHomeRuns,
      JSON.stringify(merged.unlockedCharacters),
      JSON.stringify(merged.unlockedStadiums),
      merged.currentLevel,
      merged.experience,
      playerId
    ).run();
  } else {
    await context.env.DB.prepare(`
      INSERT INTO player_progress (
        player_id,
        games_played,
        wins,
        losses,
        total_runs,
        total_hits,
        total_home_runs,
        unlocked_characters,
        unlocked_stadiums,
        current_level,
        experience
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      playerId,
      merged.gamesPlayed,
      merged.wins,
      merged.losses,
      merged.totalRuns,
      merged.totalHits,
      merged.totalHomeRuns,
      JSON.stringify(merged.unlockedCharacters),
      JSON.stringify(merged.unlockedStadiums),
      merged.currentLevel,
      merged.experience
    ).run();
  }

  const result = await context.env.DB.prepare(
    "SELECT * FROM player_progress WHERE player_id = ?"
  ).bind(playerId).first();

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
};
