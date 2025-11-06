/// <reference types="@cloudflare/workers-types" />

export interface Env {
  PROGRESSION_DB: D1Database;
}

interface ProgressionRow {
  player_id: string;
  level: number;
  experience: number;
  unlocked_badges: string;
  updated_at: string;
}

const fallbackProgression: Record<string, ProgressionRow> = {
  "ace-pitch": {
    player_id: "ace-pitch",
    level: 12,
    experience: 18450,
    unlocked_badges: "Ace Pilot,Heat Seeker",
    updated_at: new Date().toISOString()
  }
};

export const onRequest: PagesFunction<Env> = async ({ params, env, request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: createHeaders(request.headers.get("origin"))
    });
  }

  const playerId = params.playerId?.toString();
  if (!playerId) {
    return new Response(JSON.stringify({ error: "Missing playerId" }), {
      status: 400,
      headers: createHeaders(request.headers.get("origin"))
    });
  }

  let record: ProgressionRow | null = null;

  if (env.PROGRESSION_DB) {
    const statement = env.PROGRESSION_DB.prepare(
      "SELECT player_id, level, experience, unlocked_badges, updated_at FROM player_progress WHERE player_id = ?"
    ).bind(playerId);
    const result = await statement.first<ProgressionRow>();
    if (result) {
      record = result;
    }
  }

  if (!record && fallbackProgression[playerId]) {
    record = fallbackProgression[playerId];
  }

  if (!record) {
    return new Response(JSON.stringify({ error: "Player not found" }), {
      status: 404,
      headers: createHeaders(request.headers.get("origin"))
    });
  }

  const responseBody = {
    playerId: record.player_id,
    level: record.level,
    experience: record.experience,
    unlockedBadges: record.unlocked_badges.split(",").map((badge) => badge.trim()).filter(Boolean),
    lastUpdated: record.updated_at
  };

  return new Response(JSON.stringify(responseBody), {
    headers: createHeaders(request.headers.get("origin"))
  });
};

function createHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    "content-type": "application/json",
    "cache-control": "no-store"
  };

  if (origin) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-methods"] = "GET, OPTIONS";
    headers["access-control-allow-headers"] = "Content-Type";
  }

  return headers;
}
