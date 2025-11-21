# MMI (Moment Mentality Index) System

Production-ready system for calculating and tracking Moment Mentality Index - a quantified measure of mental pressure in baseball moments.

## Overview

MMI quantifies the mental difficulty of a baseball moment by combining:
- **Leverage Index** (35%) - Win probability impact
- **Pressure** (20%) - Game situation intensity
- **Fatigue** (20%) - Physical and mental workload
- **Execution** (15%) - Pitch difficulty
- **Bio-proxies** (10%) - Behavioral indicators

**Formula:** `MMI = z(LI)·0.35 + z(Pressure)·0.20 + z(Fatigue)·0.20 + z(Execution)·0.15 + z(Bio)·0.10`

## Architecture

### Components

1. **Cloudflare Worker** (`worker-mmi-engine.js`)
   - Integrates with MLB StatsAPI (free, unlimited)
   - Calculates MMI in real-time
   - Stores historical moments in D1
   - Caches recent calculations in KV (5 min TTL)

2. **D1 Database** (`schema.sql`)
   - `mmi_moments` - All calculated moments
   - `player_streaks` - Performance streaks
   - `game_summary` - Game-level aggregations
   - `calibration` - Z-score parameters

3. **Dashboard** (`mmi-dashboard.html`)
   - Real-time MMI display
   - Component breakdown
   - Top moments leaderboard
   - Auto-refresh every 5 seconds

### Data Flow

```
MLB StatsAPI → Worker → MMI Calculation → D1 Storage → Dashboard Display
                      ↓
                   KV Cache (5 min)
```

## API Endpoints

### `GET /mmi/games/today`
Returns today's MLB games.

**Response:**
```json
{
  "games": [
    {
      "gamePk": 717715,
      "gameDate": "2024-11-21T19:00:00Z",
      "teams": {
        "away": { "team": { "name": "Yankees" } },
        "home": { "team": { "name": "Red Sox" } }
      }
    }
  ]
}
```

### `GET /mmi/:gameId`
Calculates live MMI for current moment in game.

**Response:**
```json
{
  "gameId": "717715",
  "playerId": "12345",
  "mmi": 67.2,
  "timestamp": "2024-11-21T19:30:00Z",
  "components": {
    "leverageIndex": 2.3,
    "pressure": 75.0,
    "fatigue": 65.0,
    "execution": 70.0,
    "bio": 55.0
  },
  "gameState": {
    "inning": 9,
    "halfInning": "bottom",
    "outs": 2,
    "bases": "loaded",
    "scoreDiff": -1,
    "count": "3-2"
  }
}
```

### `GET /mmi/history/:playerId?limit=20`
Returns player's MMI history.

**Response:**
```json
{
  "history": [
    {
      "id": 1,
      "game_id": "717715",
      "player_id": "12345",
      "mmi_score": 67.2,
      "created_at": "2024-11-21T19:30:00Z"
    }
  ]
}
```

### `GET /mmi/top?limit=10&timeframe=7`
Returns top MMI moments (last N days).

**Response:**
```json
{
  "topMoments": [
    {
      "id": 1,
      "game_id": "717715",
      "player_id": "12345",
      "mmi_score": 84.5,
      "created_at": "2024-11-21T19:30:00Z"
    }
  ]
}
```

## MMI Interpretation Scale

| Score | Category | Description |
|-------|----------|-------------|
| 70-100 | Elite Pressure | Top 10% difficulty (bases loaded, full count, late innings) |
| 55-70 | High Difficulty | Elevated pressure but not max leverage |
| 40-55 | Moderate | League-average difficulty |
| 0-40 | Routine | Low-leverage, comfortable situation |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

**Quick deploy:**
```bash
./deploy-mmi.sh prod
```

## Testing

Run test suite:
```bash
node test-mmi.js
```

Start local dev server:
```bash
node dev-server.js
# Test at http://localhost:8787
```

## Validation

**Week 1:** Does current MMI predict next event's WPA swing better than LI alone?

**Month 1:** Season-long calibration (update z-score parameters from actual data)

**Season 1:** Predictive study (does high-MMI success predict future clutch performance?)

## Cost

- **Cloudflare Worker:** Free tier (100k requests/day)
- **D1 Database:** Free tier (5M reads, 100k writes/month)
- **KV:** Free tier (100k reads, 1k writes/day)
- **MLB StatsAPI:** Free, unlimited
- **Total:** $0-5/month (within free tiers)

## Methodology

MMI goes beyond traditional "clutch" narratives by quantifying:

1. **Leverage Index** - Mathematical win probability impact
2. **Pressure** - Crowd intensity, timeout frequency, game importance
3. **Fatigue** - Pitch count, rest days, role-aware workload
4. **Execution** - Pitch velocity, type difficulty, count pressure
5. **Bio-proxies** - Tempo, substitution patterns as fatigue indicators

All methodology is published for transparency and validation.

## Files

- `worker-mmi-engine.js` - Cloudflare Worker (14KB)
- `schema.sql` - D1 database schema (5.5KB)
- `mmi-dashboard.html` - Real-time dashboard (17KB)
- `deploy-mmi.sh` - One-command deployment
- `wrangler.toml` - Cloudflare configuration
- `test-mmi.js` - Test suite (5 scenarios)
- `dev-server.js` - Local testing server

## License

Proprietary - Blaze Sports Intel
