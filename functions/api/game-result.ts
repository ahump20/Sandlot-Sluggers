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

  await ensurePlayerRow(env.DB, payload.playerId);

  const winIncrement = payload.won ? 1 : 0;
  const lossIncrement = payload.won ? 0 : 1;

  await env.DB
    .prepare(
      `UPDATE player_progress
       SET games_played = games_played + 1,
           wins = wins + ?,
           losses = losses + ?,
           total_runs = total_runs + ?,
           total_hits = total_hits + ?,
           total_home_runs = total_home_runs + ?,
           experience = experience + ?,
           current_level = MIN(99, CAST(((experience + ?) / 500) AS INTEGER) + 1),
           updated_at = CURRENT_TIMESTAMP
       WHERE player_id = ?`
    )
    .bind(
      winIncrement,
      lossIncrement,
      runsScored,
      hitsRecorded,
      homeRunsHit,
      xpGain,
      xpGain,
      payload.playerId
    )
    .run();

  const refreshedRow = await fetchUpdatedRow(env.DB, payload.playerId);
  if (payload.playerName && refreshedRow) {
    // Upsert 'wins' stat
    await env.DB
      .prepare(
        `INSERT INTO leaderboard (player_id, player_name, stat_type, stat_value)
         VALUES (?, ?, 'wins', ?)
         ON CONFLICT(player_id, stat_type) DO UPDATE SET
           player_name = excluded.player_name,
           stat_value = excluded.stat_value`
      )
      .bind(
        payload.playerId,
        payload.playerName,
        refreshedRow.wins
      )
      .run();

    // Upsert 'experience' stat
    await env.DB
      .prepare(
        `INSERT INTO leaderboard (player_id, player_name, stat_type, stat_value)
         VALUES (?, ?, 'experience', ?)
         ON CONFLICT(player_id, stat_type) DO UPDATE SET
           player_name = excluded.player_name,
           stat_value = excluded.stat_value`
      )
      .bind(
        payload.playerId,
        payload.playerName,
        refreshedRow.experience
      )
      .run();
  }

  if (env.KV && refreshedRow) {
    await env.KV.put(`progress:${payload.playerId}`, JSON.stringify(refreshedRow), {
      expirationTtl: 60 * 60 // 1 hour cache
    });
  }

  return jsonResponse(refreshedRow);
};

async function fetchUpdatedRow(db: D1Database, playerId: string): Promise<PlayerProgress | null> {
  const row = await db
    .prepare("SELECT * FROM player_progress WHERE player_id = ?")
    .bind(playerId)
    .first();

  return rowToProgress(row as any);
}
