import { getSportsSummary } from "./services/sports";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

interface Env {
  DB: D1Database;
  SPORTS_CACHE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(request.headers.get("Origin") ?? "*")
      });
    }

    const routeKey = `${request.method.toUpperCase()} ${pathname}` as `${Method} ${string}`;

    switch (routeKey) {
      case "GET /sports/summary":
        return await handleSportsSummary(env);
      default:
        return new Response(JSON.stringify({ error: "Not Found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...buildCorsHeaders(request.headers.get("Origin") ?? "*")
          }
        });
    }
  }
} satisfies ExportedHandler<Env>;

async function handleSportsSummary(env: Env): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...buildCorsHeaders("*")
  };

  try {
    const payload = await getSportsSummary(env);
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("sports summary error", error);
    return new Response(
      JSON.stringify({
        error: "Unable to load sports intelligence"
      }),
      {
        status: 500,
        headers
      }
    );
  }
}

function buildCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  } satisfies Record<string, string>;
}
