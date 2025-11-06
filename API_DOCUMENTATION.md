# Sandlot Sluggers API Documentation

This document describes the analytics API endpoints for Sandlot Sluggers, designed to power the stats dashboard on blazesportsintel.com/sandlot-sluggers.

## Base URL

```
Production: https://your-game-deployment.pages.dev
Development: http://localhost:8788
```

## Authentication

Currently, all endpoints are public and do not require authentication. Rate limiting is handled by Cloudflare.

## Caching

All endpoints implement caching via Cloudflare KV:
- **Global Stats**: 60 seconds
- **Leaderboard**: 120 seconds (2 minutes)
- **Character Stats**: 180 seconds (3 minutes)
- **Stadium Stats**: 180 seconds (3 minutes)

## Endpoints

### 1. Global Statistics

Get overall game statistics including player counts, games played, and aggregated metrics.

**Endpoint:** `GET /api/stats/global`

**Response:**
```json
{
  "totalPlayers": 1247,
  "gamesPlayedToday": 3892,
  "totalGamesPlayed": 47621,
  "totalHomeRuns": 15234,
  "totalHits": 98765,
  "totalRuns": 234567,
  "averageGameLength": 8.5,
  "activePlayers": 342,
  "mostPopularStadium": {
    "id": "stadium_005",
    "name": "Beach Bash",
    "percentage": 34
  },
  "lastUpdated": "2025-11-06T12:34:56.789Z"
}
```

**Fields:**
- `totalPlayers` (number) - Total registered players
- `gamesPlayedToday` (number) - Games played in the last 24 hours
- `totalGamesPlayed` (number) - All-time games played
- `totalHomeRuns` (number) - All-time home runs
- `totalHits` (number) - All-time hits
- `totalRuns` (number) - All-time runs scored
- `averageGameLength` (number) - Average game duration in minutes
- `activePlayers` (number) - Players active in last 24 hours
- `mostPopularStadium` (object) - Most frequently used stadium
- `lastUpdated` (string) - ISO 8601 timestamp

**Cache:** 60 seconds

---

### 2. Leaderboard

Get top players ranked by various statistics.

**Endpoint:** `GET /api/stats/leaderboard?limit=10&stat=wins`

**Query Parameters:**
- `limit` (optional, default: 50, max: 100) - Number of entries to return
- `stat` (optional, default: "wins") - Stat to rank by
  - Values: `wins`, `home_runs`, `hits`, `runs`, `games`

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "playerId": "abc123de",
      "playerName": "LightningSlugg3r",
      "wins": 342,
      "totalHomeRuns": 1547,
      "totalHits": 4321,
      "totalRuns": 2890,
      "gamesPlayed": 456,
      "winRate": 75.0,
      "level": 47
    }
  ],
  "totalPlayers": 1247,
  "lastUpdated": "2025-11-06T12:34:56.789Z"
}
```

**LeaderboardEntry Fields:**
- `rank` (number) - Player's rank (1-based)
- `playerId` (string) - Anonymized player ID (first 8 chars)
- `playerName` (string) - Generated player name
- `wins` (number) - Total wins
- `totalHomeRuns` (number) - Total home runs
- `totalHits` (number) - Total hits
- `totalRuns` (number) - Total runs
- `gamesPlayed` (number) - Total games played
- `winRate` (number) - Win percentage (0-100)
- `level` (number) - Player level

**Cache:** 120 seconds

**Example Requests:**
```bash
# Top 10 players by wins
GET /api/stats/leaderboard?limit=10&stat=wins

# Top 25 players by home runs
GET /api/stats/leaderboard?limit=25&stat=home_runs

# Top 50 players by total hits
GET /api/stats/leaderboard?limit=50&stat=hits
```

---

### 3. Character Statistics

Get character unlock rates and usage statistics.

**Endpoint:** `GET /api/stats/characters`

**Response:**
```json
{
  "characters": [
    {
      "id": "char_001",
      "name": "Rocket Rodriguez",
      "unlockRate": 95,
      "usageCount": 1183,
      "usagePercentage": 15.7,
      "isSecret": false
    },
    {
      "id": "char_secret_001",
      "name": "Comet Carter",
      "unlockRate": 12,
      "usageCount": 149,
      "usagePercentage": 2.0,
      "isSecret": true
    }
  ],
  "totalPlayers": 1247,
  "mostPopular": {
    "id": "char_003",
    "name": "Thunder Thompson",
    "unlockRate": 96,
    "usageCount": 1523,
    "usagePercentage": 20.2,
    "isSecret": false
  },
  "leastPopular": {
    "id": "char_006",
    "name": "Brick Martinez",
    "unlockRate": 89,
    "usageCount": 421,
    "usagePercentage": 5.6,
    "isSecret": false
  },
  "lastUpdated": "2025-11-06T12:34:56.789Z"
}
```

**CharacterStats Fields:**
- `id` (string) - Character ID
- `name` (string) - Character name
- `unlockRate` (number) - Percentage of players who unlocked (0-100)
- `usageCount` (number) - Number of times character was unlocked
- `usagePercentage` (number) - Percentage of total usage (0-100)
- `isSecret` (boolean) - Whether this is a secret character

**Cache:** 180 seconds

---

### 4. Stadium Statistics

Get stadium unlock rates and popularity.

**Endpoint:** `GET /api/stats/stadiums`

**Response:**
```json
{
  "stadiums": [
    {
      "id": "stadium_005",
      "name": "Beach Bash",
      "description": "Sandy diamond with ocean waves",
      "dimensions": {
        "leftField": 31,
        "centerField": 36,
        "rightField": 31
      },
      "unlockRate": 87,
      "usageCount": 1085,
      "usagePercentage": 34.2,
      "popularityRank": 1
    }
  ],
  "totalPlayers": 1247,
  "mostPopular": {
    "id": "stadium_005",
    "name": "Beach Bash",
    "description": "Sandy diamond with ocean waves",
    "dimensions": {
      "leftField": 31,
      "centerField": 36,
      "rightField": 31
    },
    "unlockRate": 87,
    "usageCount": 1085,
    "usagePercentage": 34.2,
    "popularityRank": 1
  },
  "lastUpdated": "2025-11-06T12:34:56.789Z"
}
```

**StadiumStats Fields:**
- `id` (string) - Stadium ID
- `name` (string) - Stadium name
- `description` (string) - Stadium description
- `dimensions` (object) - Field dimensions
  - `leftField` (number) - Left field distance
  - `centerField` (number) - Center field distance
  - `rightField` (number) - Right field distance
- `unlockRate` (number) - Percentage of players who unlocked (0-100)
- `usageCount` (number) - Number of times stadium was unlocked
- `usagePercentage` (number) - Percentage of total usage (0-100)
- `popularityRank` (number) - Rank by usage (1-5)

**Cache:** 180 seconds

---

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:

**Success Response (200 OK):**
```json
{
  "data": { ... }
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "totalPlayers": 0,
  "gamesPlayedToday": 0,
  ...
}
```

Note: On error, endpoints return fallback data with zero values rather than throwing errors to ensure the landing page remains functional.

## CORS

All endpoints include CORS headers:
```
Access-Control-Allow-Origin: *
```

For production, consider restricting to specific domains:
```
Access-Control-Allow-Origin: https://blazesportsintel.com
```

## Rate Limiting

Rate limiting is handled automatically by Cloudflare:
- Burst: 100 requests per 10 seconds
- Sustained: 1000 requests per hour per IP

## Code Examples

### JavaScript/TypeScript (fetch)

```typescript
async function fetchGlobalStats() {
  const response = await fetch('https://your-api.pages.dev/api/stats/global');
  const data = await response.json();
  return data;
}
```

### React (with SWR)

```typescript
import useSWR from 'swr';

function StatsComponent() {
  const { data, error } = useSWR(
    '/api/stats/global',
    (url) => fetch(url).then(r => r.json()),
    { refreshInterval: 60000 } // Refresh every 60s
  );

  if (error) return <div>Error loading stats</div>;
  if (!data) return <div>Loading...</div>;

  return <div>Active Players: {data.activePlayers}</div>;
}
```

### Next.js (Server Component)

```typescript
async function StatsPage() {
  const stats = await fetch('https://your-api.pages.dev/api/stats/global', {
    next: { revalidate: 60 }
  }).then(r => r.json());

  return <div>{stats.totalPlayers} players</div>;
}
```

### cURL

```bash
# Get global stats
curl https://your-api.pages.dev/api/stats/global

# Get top 10 by home runs
curl "https://your-api.pages.dev/api/stats/leaderboard?limit=10&stat=home_runs"

# Get character stats
curl https://your-api.pages.dev/api/stats/characters

# Get stadium stats
curl https://your-api.pages.dev/api/stats/stadiums
```

## Monitoring

Monitor API performance via Cloudflare Analytics:
- Request count per endpoint
- Response times (p50, p95, p99)
- Error rates
- Cache hit ratio

## Future Enhancements

Planned features for the API:

- [ ] Player-specific stats endpoint (`/api/stats/player/:id`)
- [ ] Historical data endpoints (daily/weekly trends)
- [ ] Real-time WebSocket for live updates
- [ ] Authentication for private stats
- [ ] GraphQL endpoint for flexible queries
- [ ] Analytics events tracking endpoint
- [ ] Achievements and challenges endpoints
- [ ] Team/League endpoints (multiplayer)

## Support

For API issues or questions:
- GitHub Issues: https://github.com/ahump20/Sandlot-Sluggers/issues
- Email: contact@blazesportsintel.com
