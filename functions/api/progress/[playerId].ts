import { ensurePlayerRow, fetchPlayerRow, jsonResponse, PlayerProgress, rowToProgress, withCorsHeaders } from "./utils";

interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

function badRequest(message: string): Response {
  return jsonResponse({ error: message }, { status: 400 });
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, withCorsHeaders({ status: 204 }));
};

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const playerId = params.playerId as string | undefined;
  if (!playerId) {
    return badRequest("playerId is required");
  }

  const row = await fetchPlayerRow(env.DB, playerId);
  const progress = rowToProgress(row);

  if (progress) {
    return jsonResponse(progress);
  }

  const initializedRow = await ensurePlayerRow(env.DB, playerId);
  return jsonResponse(rowToProgress(initializedRow)!);
};

export const onRequestPatch: PagesFunction<Env> = async ({ params, request, env }) => {
  const playerId = params.playerId as string | undefined;
  if (!playerId) {
    return badRequest("playerId is required");
  }

  let payload: Partial<PlayerProgress>;
  try {
    payload = await request.json<Partial<PlayerProgress>>();
  } catch {
    return badRequest("Invalid JSON payload");
  }

  await ensurePlayerRow(env.DB, playerId);

  const updates: string[] = [];
  const values: unknown[] = [];

  const columnMappings: Record<string, string> = {
    playerId: "player_id",
    gamesPlayed: "games_played",
    wins: "wins",
    losses: "losses",
    totalRuns: "total_runs",
    totalHits: "total_hits",
    totalHomeRuns: "total_home_runs",
    unlockedCharacters: "unlocked_characters",
    unlockedStadiums: "unlocked_stadiums",
    currentLevel: "current_level",
    experience: "experience"
  };

  for (const [key, value] of Object.entries(payload) as [keyof PlayerProgress, unknown][]) {
    if (value === undefined || key === "playerId") {
      continue;
    }

    const column = columnMappings[key];
    if (!column) {
      return badRequest(`Unknown field '${key}'`);
    }
    if (key === "unlockedCharacters" || key === "unlockedStadiums") {
      if (!Array.isArray(value)) {
        return badRequest(`Field '${key}' must be an array`);
      }
      updates.push(`${column} = ?`);
      values.push(JSON.stringify(value));
    } else if (typeof value === "number") {
      updates.push(`${column} = ?`);
      values.push(value);
    } else {
      return badRequest(`Field '${key}' must be a number`);
    }
  }

  if (updates.length === 0) {
    return badRequest("No valid fields supplied for update");
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");

  const statement = `UPDATE player_progress SET ${updates.join(", ")} WHERE player_id = ?`;
  values.push(playerId);

  await env.DB.prepare(statement).bind(...values).run();

  const updated = await fetchPlayerRow(env.DB, playerId);
  return jsonResponse(rowToProgress(updated)!);
};
