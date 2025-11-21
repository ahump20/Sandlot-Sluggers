# MMI Quick Reference

Quick commands and reference for MMI system.

## Formula

```
MMI = z(LI)·35% + z(Pressure)·20% + z(Fatigue)·20% + z(Execution)·15% + z(Bio)·10%

Scale: 0-100
- 70-100: Elite Pressure
- 55-70: High Difficulty
- 40-55: Moderate
- 0-40: Routine
```

## Deployment Commands

```bash
# One-command deploy
./deploy-mmi.sh prod

# Manual steps
wrangler d1 create mmi-db
wrangler d1 execute mmi-db --file=./schema.sql
wrangler kv:namespace create "MMI_KV"
wrangler deploy --env production

# Deploy dashboard
wrangler pages deploy mmi-dashboard.html --project-name=mmi-live
```

## API Endpoints

```bash
# Today's games
curl https://blazesportsintel.com/mmi/games/today

# Live MMI for game
curl https://blazesportsintel.com/mmi/717715

# Player history
curl https://blazesportsintel.com/mmi/history/12345?limit=20

# Top moments (last 7 days)
curl https://blazesportsintel.com/mmi/top?limit=10&timeframe=7
```

## Testing

```bash
# Run test suite
node test-mmi.js

# Start local dev server
node dev-server.js
# Test at http://localhost:8787

# Test endpoints locally
curl http://localhost:8787/mmi/717715
```

## Database Commands

```bash
# List tables
wrangler d1 execute mmi-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Count moments
wrangler d1 execute mmi-db --command="SELECT COUNT(*) FROM mmi_moments;"

# Recent moments
wrangler d1 execute mmi-db --command="SELECT * FROM mmi_moments ORDER BY created_at DESC LIMIT 10;"

# Top moments
wrangler d1 execute mmi-db --command="SELECT * FROM mmi_moments ORDER BY mmi_score DESC LIMIT 10;"

# Player history
wrangler d1 execute mmi-db --command="SELECT * FROM mmi_moments WHERE player_id='12345' ORDER BY created_at DESC LIMIT 20;"
```

## KV Commands

```bash
# List namespaces
wrangler kv:namespace list

# Get cached value
wrangler kv:key get "mmi:717715:latest" --namespace-id=YOUR_KV_ID

# List all keys (requires script)
wrangler kv:key list --namespace-id=YOUR_KV_ID
```

## Monitoring

```bash
# Check Worker logs
wrangler tail --env production

# Database size
wrangler d1 execute mmi-db --command="SELECT COUNT(*) as total FROM mmi_moments;"

# Recent activity
wrangler d1 execute mmi-db --command="SELECT COUNT(*) FROM mmi_moments WHERE created_at >= datetime('now', '-1 day');"
```

## Component Weights

| Component | Weight | Description |
|-----------|--------|-------------|
| Leverage Index | 35% | Win probability impact |
| Pressure | 20% | Game situation intensity |
| Fatigue | 20% | Physical/mental workload |
| Execution | 15% | Pitch difficulty |
| Bio | 10% | Behavioral indicators |

## Z-Score Parameters

```javascript
{
  leverageIndex: { mean: 1.0, std: 0.8 },
  pressure: { mean: 50, std: 25 },
  fatigue: { mean: 50, std: 20 },
  execution: { mean: 50, std: 15 },
  bio: { mean: 50, std: 15 }
}
```

## MMI Categories

| Score | Category | Examples |
|-------|----------|----------|
| 70-100 | Elite Pressure | Bases loaded, full count, bottom 9th, tie game |
| 55-70 | High Difficulty | Runners on, 2-2 count, late innings |
| 40-55 | Moderate | League-average situation |
| 0-40 | Routine | Early innings, big lead, empty bases |

## Troubleshooting

```bash
# Check Worker status
wrangler whoami

# Verify database exists
wrangler d1 list

# Verify KV exists
wrangler kv:namespace list

# Check routes
# (In Cloudflare Dashboard: Workers & Pages → Routes)

# Test locally first
node dev-server.js
curl http://localhost:8787/mmi/717715
```

## File Locations

- **Worker:** `/workspace/mmi-live/worker-mmi-engine.js`
- **Schema:** `/workspace/mmi-live/schema.sql`
- **Dashboard:** `/workspace/mmi-live/mmi-dashboard.html`
- **Config:** `/workspace/mmi-live/wrangler.toml`

## URLs

- **API Base:** `https://blazesportsintel.com/mmi`
- **Dashboard:** `https://mmi-live.pages.dev` (after Pages deployment)
- **MLB StatsAPI:** `https://statsapi.mlb.com/api/v1`

## Quick Test

```bash
# Full test flow
node test-mmi.js                    # Validate calculations
node dev-server.js &                # Start local server
sleep 2
curl http://localhost:8787/mmi/717715  # Test endpoint
pkill -f dev-server.js              # Stop server
```

## Common Tasks

### Update Worker Code
```bash
# Edit worker-mmi-engine.js
wrangler deploy --env production
```

### Update Database Schema
```bash
# Edit schema.sql
wrangler d1 execute mmi-db --file=./schema.sql
```

### View Recent Moments
```bash
wrangler d1 execute mmi-db --command="SELECT game_id, player_id, mmi_score, created_at FROM mmi_moments ORDER BY created_at DESC LIMIT 20;"
```

### Clear KV Cache
```bash
# Delete specific key
wrangler kv:key delete "mmi:717715:latest" --namespace-id=YOUR_KV_ID
```

### Check Error Rate
```bash
# In Cloudflare Dashboard:
# Workers & Pages → Your Worker → Metrics → Errors
```

## Cost Monitoring

```bash
# Check usage in Cloudflare Dashboard:
# - Workers: 100k requests/day (free tier)
# - D1: 5M reads, 100k writes/month (free tier)
# - KV: 100k reads, 1k writes/day (free tier)
```

## Support

- **Documentation:** See `README.md`, `DEPLOY.md`, `SUMMARY.md`
- **Testing:** Run `node test-mmi.js`
- **Local Dev:** Use `node dev-server.js`
- **Issues:** Check Cloudflare Dashboard logs
