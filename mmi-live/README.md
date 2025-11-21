# MMI (Moment Mentality Index) System

**Production-ready system for quantifying mental toughness in baseball**

Live at: **blazesportsintel.com/mmi**

## What is MMI?

The **Moment Mentality Index** is a quantitative metric (0-100 scale) that measures the mental difficulty of baseball situations by combining:

- **Leverage Index (35%)**: How big is this moment? (Win probability math)
- **Pressure (20%)**: Crowd intensity, count pressure, late-inning stakes
- **Fatigue (20%)**: Pitch count, rest days, workload management
- **Execution (15%)**: Technical difficulty of the required pitch/at-bat
- **Bio-proxies (10%)**: Tempo, mound visits, substitution patterns

### Formula

```
MMI = z(LI)·0.35 + z(Pressure)·0.20 + z(Fatigue)·0.20 + z(Execution)·0.15 + z(Bio)·0.10
```

Where each component is normalized to a z-score, then transformed to a 0-100 scale (mean=50, stdDev=15).

### Interpretation Scale

| MMI Score | Category | Description | Frequency |
|-----------|----------|-------------|-----------|
| 70-100 | Elite Pressure | Top 10% difficulty (bases loaded, full count, late innings) | ~10% |
| 55-70 | High Difficulty | Elevated pressure but not maximum leverage | ~20% |
| 40-55 | Moderate | League-average difficulty | ~40% |
| 0-40 | Routine | Low-leverage, comfortable situations | ~30% |

## Why MMI Beats "Clutch" Narrative

Traditional "clutch" analysis is narrative-driven and confirmation-biased. MMI is **quantified mental toughness**:

- **Leverage Index** tells us how big the spot is (win probability math)
- **Pressure** layers on human factors (crowd, count, timing)
- **Fatigue** captures declining performance from workload
- **Execution** measures technical difficulty independent of outcome
- **Bio-proxies** use observable patterns as fatigue indicators

Result: **Predictive difficulty metric instead of post-hoc storytelling**

## Architecture

**Cloudflare-only stack:**

```
MLB StatsAPI (free) → Worker (MMI calculation) → D1 (storage) → Pages (dashboard)
                            ↓
                        KV (cache)
```

### Components

1. **worker-mmi-engine.js** (14KB)
   - Integrates with MLB StatsAPI (free, unlimited)
   - Calculates MMI using weighted z-score formula
   - Stores historical moments to D1
   - Caches recent calculations in KV (5 min TTL)

2. **schema.sql** (5.5KB)
   - D1 database schema with 8 tables
   - Indexed for fast queries (player history, top moments, date ranges)
   - Triggers for auto-updating game summaries
   - Views for analytics and leaderboards

3. **mmi-dashboard.html** (17KB)
   - Real-time dashboard with auto-refresh (5s)
   - Game selector, live MMI display, component breakdown
   - Top moments leaderboard (last 7 days)
   - Responsive design (mobile-friendly)

## Quick Start

### Prerequisites

- Node.js 18+ (for testing)
- Cloudflare account (free tier works)
- Wrangler CLI: `npm install -g wrangler`

### Deploy to Production

```bash
# One command deploys everything
./deploy-mmi.sh prod

# Post-deployment: Update dashboard API URL
# Edit mmi-dashboard.html line 286:
#   const API_BASE = 'https://blazesportsintel.com/mmi';

# Redeploy dashboard
wrangler pages deploy mmi-dashboard.html --project-name=mmi-live
```

That's it! Your MMI system is live.

### Local Development

```bash
# Test calculations (validates formula accuracy)
node test-mmi.js

# Run local dev server at localhost:8787
node dev-server.js

# Test endpoints
curl http://localhost:8787/mmi/games/today
curl http://localhost:8787/mmi/717519
curl http://localhost:8787/mmi/top
```

## API Endpoints

### `GET /mmi/games/today`
Returns today's live MLB games.

**Response:**
```json
{
  "date": "2024-11-21",
  "games": [
    {
      "gameId": "717519",
      "status": "Live",
      "teams": {
        "away": "New York Yankees",
        "home": "Boston Red Sox"
      },
      "time": "2024-11-21T19:05:00Z"
    }
  ]
}
```

### `GET /mmi/:gameId`
Calculate MMI for a specific game's current moment.

**Response:**
```json
{
  "gameId": "717519",
  "timestamp": "2024-11-21T21:34:15Z",
  "mmi": 84.5,
  "category": "Elite Pressure",
  "components": {
    "leverageIndex": { "raw": 4.0, "zScore": 3.75, "weight": 0.35 },
    "pressure": { "raw": 85, "zScore": 1.4, "weight": 0.20 },
    "fatigue": { "raw": 70, "zScore": 1.0, "weight": 0.20 },
    "execution": { "raw": 80, "zScore": 2.0, "weight": 0.15 },
    "bio": { "raw": 75, "zScore": 2.5, "weight": 0.10 }
  },
  "situation": {
    "inning": 9,
    "half": "bottom",
    "outs": 2,
    "count": "3-2",
    "baserunners": "1B, 3B",
    "score": "4-3"
  },
  "players": {
    "pitcher": { "id": 592789, "name": "Gerrit Cole" },
    "batter": { "id": 502110, "name": "Rafael Devers" }
  }
}
```

### `GET /mmi/history/:playerId?limit=20`
Get MMI history for a specific player.

**Response:**
```json
{
  "playerId": "592789",
  "count": 20,
  "moments": [
    {
      "game_id": "717519",
      "mmi_score": 84.5,
      "category": "Elite Pressure",
      "inning": 9,
      "recorded_at": "2024-11-21T21:34:15Z"
    }
  ]
}
```

### `GET /mmi/top?limit=10&timeframe=7`
Get highest MMI moments (leaderboard).

**Parameters:**
- `limit`: Number of results (default: 10)
- `timeframe`: Days to look back (default: 7)

**Response:**
```json
{
  "timeframe": "7 days",
  "count": 10,
  "moments": [
    {
      "game_id": "717519",
      "mmi_score": 92.3,
      "category": "Elite Pressure",
      "inning": 9,
      "outs": 2,
      "count": "3-2",
      "recorded_at": "2024-11-21T21:34:15Z"
    }
  ]
}
```

## Validation Plan

### Week 1: Predictive Power
Does current MMI predict next event's WPA swing better than LI alone?

**Method:** Collect (MMI, LI, WPA_swing) tuples, run regression analysis.

### Month 1: Calibration
Update z-score parameters from actual season data.

**Method:** Calculate mean/stdDev for each component from historical moments, update `NORMALIZATION_PARAMS` in worker.

### Season 1: Longitudinal Study
Does high-MMI success predict future clutch performance?

**Method:** Track players with multiple high-MMI successes, compare to control group in subsequent situations.

## Database Schema

### Core Tables

- **mmi_moments**: Every MMI calculation (indexed by pitcher, batter, game, date)
- **player_streaks**: Rolling window stats (high-MMI games, avg MMI, max MMI)
- **game_summary**: Aggregate MMI per game (auto-updated via trigger)
- **calibration**: Z-score parameters (updated seasonally)
- **validation**: Outcome tracking (MMI vs. actual WPA)

### Indexes

Fast queries for:
- Player history (`idx_mmi_pitcher`, `idx_mmi_batter`)
- Game timeline (`idx_mmi_game`, `idx_mmi_date`)
- Leaderboards (`idx_mmi_score`, `idx_mmi_category`)

## Cost Estimate

**Cloudflare free tier covers:**
- 100k Worker requests/day
- 5GB D1 storage (millions of moments)
- 100k KV reads/day
- Unlimited Pages deployments

**MLB StatsAPI:** Free, unlimited (no key required)

**Expected cost:** $0-5/month (well within free tier for typical traffic)

## Monitoring

```bash
# Watch live requests
wrangler tail mmi-engine-prod

# Check D1 database
wrangler d1 execute mmi-database-prod --command="SELECT COUNT(*) FROM mmi_moments"

# View recent moments
wrangler d1 execute mmi-database-prod --command="
  SELECT mmi_score, category, recorded_at 
  FROM mmi_moments 
  ORDER BY recorded_at DESC 
  LIMIT 10
"

# Check KV cache
wrangler kv:key list --namespace-id=<your-kv-id>
```

## Test Results

All tests passing ✅

```
✅ Average situation → MMI 50.0 (Moderate)
✅ Elite pressure → MMI 84.5 (Elite Pressure)
✅ Routine → MMI 32.8 (Routine)
✅ High difficulty → MMI 67.2 (High Difficulty)
✅ Max fatigue → MMI 67.3 (High Difficulty)

Weight validation: 100.0% total ✅
```

Run tests: `node test-mmi.js`

## Contributing

### Adding a Component

1. Add to `WEIGHTS` (must sum to 1.0)
2. Add to `NORMALIZATION_PARAMS`
3. Implement calculation function
4. Update schema (add column to `mmi_moments`)
5. Update tests (`test-mmi.js`)
6. Document in README

### Updating Calibration

```bash
# Export moments to CSV
wrangler d1 execute mmi-database-prod --command="
  SELECT leverage_index, pressure, fatigue, execution, bio
  FROM mmi_moments
  WHERE DATE(recorded_at) >= DATE('now', '-30 days')
" --output csv > calibration_data.csv

# Calculate new mean/stdDev (Python/R)
# Update NORMALIZATION_PARAMS in worker-mmi-engine.js
# Redeploy: wrangler deploy --env prod
```

## Roadmap

- [ ] Player MMI profiles (season-long aggregates)
- [ ] Predictive alerts ("High-MMI moment incoming")
- [ ] Historical comparison ("Highest MMI in Red Sox history")
- [ ] Integration with betting APIs (MMI as live betting signal)
- [ ] Team MMI rankings (who handles pressure best?)
- [ ] Playoff MMI tracker (postseason difficulty > regular season)

## License

MIT License - See LICENSE file for details

## Support

Issues/questions: [GitHub Issues](https://github.com/yourusername/mmi-live/issues)

## Acknowledgments

- MLB StatsAPI for free, comprehensive baseball data
- Tom Tango for Leverage Index concept
- Cloudflare for serverless infrastructure

---

**Built by Blaze Sports Intel**  
Website: [blazesportsintel.com](https://blazesportsintel.com)
