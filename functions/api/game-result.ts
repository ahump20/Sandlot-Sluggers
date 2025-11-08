import { ensurePlayerRow, jsonResponse, PlayerProgress, rowToProgress, withCorsHeaders } from "./progress/utils";

interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

interface GameResultPayload {
  playerId: string;
  won: boolean;
  runsScored: number;
  hitsRecorded: number;
  homeRunsHit: number;
  playerName?: string;
}

function badRequest(message: string): Response {
  return jsonResponse({ error: message }, { status: 400 });
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, withCorsHeaders({ status: 204 }));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let payload: GameResultPayload;
  try {
    payload = await request.json<GameResultPayload>();
  } catch {
    return badRequest("Invalid JSON payload");
  }

  if (!payload.playerId) {
    return badRequest("playerId is required");
  }

  const runsScored = Number(payload.runsScored ?? 0);
  const hitsRecorded = Number(payload.hitsRecorded ?? 0);
  const homeRunsHit = Number(payload.homeRunsHit ?? 0);

  const xpGain =
    (payload.won ? 120 : 45) +
    runsScored * 8 +
    hitsRecorded * 4 +
    homeRunsHit * 16;

  const currentRow = await ensurePlayerRow(env.DB, payload.playerId);
  const currentProgress = rowToProgress(currentRow)!;

  const updatedProgress: PlayerProgress = {
    ...currentProgress,
    playerId: payload.playerId,
    gamesPlayed: currentProgress.gamesPlayed + 1,
    wins: currentProgress.wins + (payload.won ? 1 : 0),
    losses: currentProgress.losses + (payload.won ? 0 : 1),
    totalRuns: currentProgress.totalRuns + runsScored,
    totalHits: currentProgress.totalHits + hitsRecorded,
    totalHomeRuns: currentProgress.totalHomeRuns + homeRunsHit,
    experience: currentProgress.experience + xpGain,
    currentLevel: Math.min(99, Math.floor((currentProgress.experience + xpGain) / 500) + 1)
  };

  await env.DB
    .prepare(
      `UPDATE player_progress
       SET games_played = ?, wins = ?, losses = ?, total_runs = ?, total_hits = ?, total_home_runs = ?, experience = ?, current_level = ?, updated_at = CURRENT_TIMESTAMP
       WHERE player_id = ?`
    )
    .bind(
      updatedProgress.gamesPlayed,
      updatedProgress.wins,
      updatedProgress.losses,
      updatedProgress.totalRuns,
      updatedProgress.totalHits,
      updatedProgress.totalHomeRuns,
      updatedProgress.experience,
      updatedProgress.currentLevel,
      payload.playerId
    )
    .run();

  if (payload.playerName) {
    await env.DB
      .prepare(
        `INSERT INTO leaderboard (player_id, player_name, stat_type, stat_value)
         VALUES (?, ?, 'wins', ?),
                (?, ?, 'experience', ?)
        `
      )
      .bind(
        payload.playerId,
        payload.playerName,
        updatedProgress.wins,
        payload.playerId,
        payload.playerName,
        updatedProgress.experience
      )
      .run();
  }

  const refreshedRow = await fetchUpdatedRow(env.DB, payload.playerId);
  if (env.KV && refreshedRow) {
    await env.KV.put(`progress:${payload.playerId}`, JSON.stringify(refreshedRow), {
      expirationTtl: 60 * 60 // 1 hour cache
    });
  }

  return jsonResponse(refreshedRow ?? updatedProgress);
};

async function fetchUpdatedRow(db: D1Database, playerId: string): Promise<PlayerProgress | null> {
  const row = await db
    .prepare("SELECT * FROM player_progress WHERE player_id = ?")
    .bind(playerId)
    .first();

  return rowToProgress(row as any);
}
