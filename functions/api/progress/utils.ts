export interface PlayerProgress {
  playerId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalRuns: number;
  totalHits: number;
  totalHomeRuns: number;
  unlockedCharacters: string[];
  unlockedStadiums: string[];
  currentLevel: number;
  experience: number;
}

export interface PlayerProgressRow {
  player_id: string;
  games_played: number;
  wins: number;
  losses: number;
  total_runs: number;
  total_hits: number;
  total_home_runs: number;
  unlocked_characters: string;
  unlocked_stadiums: string;
  current_level: number;
  experience: number;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_PROGRESS: PlayerProgress = {
  playerId: "",
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
};

function safeParseArray(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rowToProgress(row: PlayerProgressRow | null): PlayerProgress | null {
  if (!row) {
    return null;
  }

  return {
    playerId: row.player_id,
    gamesPlayed: row.games_played ?? DEFAULT_PROGRESS.gamesPlayed,
    wins: row.wins ?? DEFAULT_PROGRESS.wins,
    losses: row.losses ?? DEFAULT_PROGRESS.losses,
    totalRuns: row.total_runs ?? DEFAULT_PROGRESS.totalRuns,
    totalHits: row.total_hits ?? DEFAULT_PROGRESS.totalHits,
    totalHomeRuns: row.total_home_runs ?? DEFAULT_PROGRESS.totalHomeRuns,
    unlockedCharacters: safeParseArray(row.unlocked_characters),
    unlockedStadiums: safeParseArray(row.unlocked_stadiums),
    currentLevel: row.current_level ?? DEFAULT_PROGRESS.currentLevel,
    experience: row.experience ?? DEFAULT_PROGRESS.experience
  };
}

export async function ensurePlayerRow(db: D1Database, playerId: string): Promise<PlayerProgressRow> {
  await db
    .prepare("INSERT OR IGNORE INTO player_progress (player_id) VALUES (?)")
    .bind(playerId)
    .run();

  const row = await fetchPlayerRow(db, playerId);
  if (!row) {
    throw new Error("Failed to initialize player progress row");
  }
  return row;
}

export async function fetchPlayerRow(db: D1Database, playerId: string): Promise<PlayerProgressRow | null> {
  const row = await db
    .prepare("SELECT * FROM player_progress WHERE player_id = ?")
    .bind(playerId)
    .first<PlayerProgressRow>();

  return row ?? null;
}

export function withCorsHeaders(init?: ResponseInit): ResponseInit {
  const baseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, PATCH, POST, OPTIONS"
  };

  if (!init) {
    return { headers: baseHeaders };
  }

  const headers = new Headers(init.headers ?? {});
  for (const [key, value] of Object.entries(baseHeaders)) {
    headers.set(key, value);
  }

  return { ...init, headers };
}

export function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), withCorsHeaders({
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : init?.headers ?? {})
    }
  }));
}
