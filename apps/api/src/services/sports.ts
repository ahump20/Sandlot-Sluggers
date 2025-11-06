interface Env {
  DB: D1Database;
  SPORTS_CACHE: KVNamespace;
}

interface AnalyticsRow {
  sport: string;
  metric: string;
  value: string;
  context: string | null;
}

export interface SportsSummaryPayload {
  generatedAt: string;
  entries: Array<{
    sport: string;
    metric: string;
    value: string;
    context: string;
  }>;
}

const CACHE_KEY = "sports:summary";
const CACHE_TTL_SECONDS = 60;

export async function getSportsSummary(env: Env): Promise<SportsSummaryPayload> {
  const cached = await env.SPORTS_CACHE.get<SportsSummaryPayload>(CACHE_KEY, "json");
  if (cached) {
    return cached;
  }

  const query = env.DB.prepare(
    `SELECT sport, metric, value, context\n     FROM analytics_summary\n     ORDER BY sport ASC, metric ASC`
  );

  const result = await query.all<AnalyticsRow>();

  const entries = result.results?.map((row) => ({
    sport: row.sport,
    metric: row.metric,
    value: row.value,
    context: row.context ?? "Context coming soon"
  })) ?? [
    {
      sport: "Basketball",
      metric: "Pace Rating",
      value: "98.7",
      context: "Sample data: Replace with real D1 insights."
    }
  ];

  const payload: SportsSummaryPayload = {
    generatedAt: new Date().toISOString(),
    entries
  };

  await env.SPORTS_CACHE.put(CACHE_KEY, JSON.stringify(payload), {
    expirationTtl: CACHE_TTL_SECONDS
  });

  return payload;
}
