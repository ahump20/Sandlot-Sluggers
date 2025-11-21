# MMI System Summary

Complete overview of the Moment Mentality Index system deployed to blazesportsintel.com.

## System Overview

**MMI (Moment Mentality Index)** quantifies the mental difficulty of baseball moments by combining five weighted components into a single 0-100 score.

### Formula

```
MMI = z(LI)·35% + z(Pressure)·20% + z(Fatigue)·20% + z(Execution)·15% + z(Bio)·10%
```

Where:
- **LI (Leverage Index)** - Win probability impact (35%)
- **Pressure** - Game situation intensity (20%)
- **Fatigue** - Physical/mental workload (20%)
- **Execution** - Pitch difficulty (15%)
- **Bio** - Behavioral indicators (10%)

All components normalized to z-scores before weighting.

## Architecture

### Stack

- **Cloudflare Worker** - Serverless compute (edge-deployed)
- **Cloudflare D1** - SQLite database (edge-deployed)
- **Cloudflare KV** - Key-value cache (5 min TTL)
- **Cloudflare Pages** - Static hosting (dashboard)
- **MLB StatsAPI** - Free, unlimited baseball data

### Components

1. **Worker** (`worker-mmi-engine.js`)
   - 14KB production code
   - Integrates MLB StatsAPI
   - Calculates MMI in real-time
   - Stores to D1, caches in KV

2. **Database** (`schema.sql`)
   - 4 tables: `mmi_moments`, `player_streaks`, `game_summary`, `calibration`
   - 2 views: `top_moments_7d`, `player_mmi_avg_30d`
   - Indexed for fast queries

3. **Dashboard** (`mmi-dashboard.html`)
   - 17KB single-file HTML
   - Real-time MMI display
   - Component breakdown
   - Top moments leaderboard
   - Auto-refresh every 5 seconds

## Test Results

All 5 test scenarios passing:

```
✅ Average situation → MMI 50.0 (Moderate)
✅ Elite pressure → MMI 84.5 (Elite Pressure)  
✅ Routine → MMI 32.8 (Routine)
✅ High difficulty → MMI 67.2 (High Difficulty)
✅ Max fatigue → MMI 67.3 (High Difficulty)

Weight validation: 100% total
```

## API Endpoints

### Production URLs

- `GET https://blazesportsintel.com/mmi/games/today` - Today's games
- `GET https://blazesportsintel.com/mmi/:gameId` - Live MMI calculation
- `GET https://blazesportsintel.com/mmi/history/:playerId?limit=20` - Player history
- `GET https://blazesportsintel.com/mmi/top?limit=10&timeframe=7` - Top moments

### Response Format

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

## MMI Interpretation

| Score | Category | Description |
|-------|----------|-------------|
| 70-100 | Elite Pressure | Top 10% difficulty (bases loaded, full count, late innings) |
| 55-70 | High Difficulty | Elevated pressure but not max leverage |
| 40-55 | Moderate | League-average difficulty |
| 0-40 | Routine | Low-leverage, comfortable situation |

## Integration Points

### MLB StatsAPI

- **Base URL:** `https://statsapi.mlb.com/api/v1`
- **Endpoints Used:**
  - `/game/:gameId/boxscore` - Game state
  - `/game/:gameId/playByPlay` - Live play data
  - `/schedule?sportId=1&date=YYYY-MM-DD` - Today's games

### Cloudflare Services

- **Worker Routes:** `blazesportsintel.com/mmi/*`
- **D1 Binding:** `DB` (database: `mmi-db`)
- **KV Binding:** `KV` (namespace: `MMI_KV`)
- **Pages Project:** `mmi-live`

## Business Value

### Why MMI Beats "Clutch" Narrative

Traditional "clutch" is vibes-based. MMI quantifies:

1. **Leverage Index** - Mathematical win probability (not subjective)
2. **Pressure** - Crowd intensity, timeout frequency (observable)
3. **Fatigue** - Pitch count, rest days, role workload (measurable)
4. **Execution** - Pitch velocity, type difficulty (objective)
5. **Bio-proxies** - Tempo, substitution patterns (data-driven)

### Use Cases

1. **Real-time Analysis** - Live MMI during games
2. **Player Evaluation** - Historical MMI performance
3. **Moment Identification** - Find highest-pressure situations
4. **Predictive Modeling** - Does high-MMI success predict future performance?

## Validation Plan

### Week 1: Predictive Power

**Question:** Does current MMI predict next event's WPA swing better than LI alone?

**Method:** Compare MMI vs LI correlation with actual WPA changes.

### Month 1: Calibration

**Question:** Are z-score parameters accurate for current season?

**Method:** Recalibrate from actual data, update `calibration` table.

### Season 1: Predictive Study

**Question:** Does high-MMI success predict future clutch performance?

**Method:** Track players with high MMI success rates, compare to future performance.

## Deployment Status

✅ **Worker** - Deployed to `blazesportsintel.com/mmi/*`
✅ **Database** - D1 created, schema applied
✅ **KV** - Namespace created, caching enabled
⏳ **Dashboard** - Ready for Pages deployment

## File Structure

```
mmi-live/
├── worker-mmi-engine.js    # Cloudflare Worker (14KB)
├── schema.sql              # D1 database schema (5.5KB)
├── mmi-dashboard.html      # Dashboard UI (17KB)
├── deploy-mmi.sh          # Deployment script
├── wrangler.toml          # Cloudflare config
├── test-mmi.js            # Test suite
├── dev-server.js          # Local testing
├── README.md              # Documentation
├── DEPLOY.md              # Deployment guide
├── SUMMARY.md             # This file
└── QUICK-REF.md          # Quick reference
```

## Cost Analysis

### Free Tier Limits

- **Workers:** 100k requests/day
- **D1:** 5M reads, 100k writes/month
- **KV:** 100k reads, 1k writes/day
- **MLB StatsAPI:** Free, unlimited

### Estimated Usage

- **Requests/day:** ~1,000 (well within free tier)
- **Database writes:** ~10k/month (well within free tier)
- **KV operations:** ~5k/day (well within free tier)

### Total Cost: **$0/month** (within free tiers)

## Next Steps

1. **Deploy Dashboard**
   ```bash
   wrangler pages deploy mmi-dashboard.html --project-name=mmi-live
   ```

2. **Monitor Performance**
   - Check Cloudflare Dashboard metrics
   - Review error rates
   - Monitor database growth

3. **Collect Data**
   - Run during live games
   - Build historical dataset
   - Validate MMI predictions

4. **Calibrate Parameters**
   - After 1 month, recalibrate z-scores
   - Update `calibration` table
   - Improve accuracy

5. **Expand Features**
   - Add batter MMI (not just pitcher)
   - Add defensive play MMI
   - Add game-level aggregations

## Methodology Transparency

All MMI calculations are:
- **Open** - Code published, formula documented
- **Reproducible** - Same inputs = same outputs
- **Validatable** - Test suite included
- **Transparent** - No black-box algorithms

This allows:
- Independent validation
- Academic research
- Community contributions
- Continuous improvement

## Support

For issues or questions:
1. Review `DEPLOY.md` for deployment issues
2. Check `QUICK-REF.md` for quick commands
3. Run `test-mmi.js` to validate calculations
4. Use `dev-server.js` for local testing

---

**Status:** Production-ready, tested, deployable
**Version:** 1.0.0
**Last Updated:** November 21, 2024
