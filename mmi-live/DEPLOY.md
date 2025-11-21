# MMI Deployment Guide

Complete deployment instructions for blazesportsintel.com

## Prerequisites

### 1. Cloudflare Account

- Sign up at [dash.cloudflare.com](https://dash.cloudflare.com)
- Free tier is sufficient for typical usage
- Add your domain (blazesportsintel.com) to Cloudflare DNS

### 2. Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Verify installation
wrangler --version

# Login to Cloudflare
wrangler login
```

### 3. Domain Setup

Ensure blazesportsintel.com is:
- Added to your Cloudflare account
- DNS is active (nameservers pointed to Cloudflare)
- SSL/TLS encryption mode: "Full" or "Full (strict)"

## One-Command Deployment

```bash
# Deploy to production
./deploy-mmi.sh prod

# Deploy to development
./deploy-mmi.sh dev
```

The deployment script automatically:
1. Creates D1 database (if not exists)
2. Applies schema with tables and indexes
3. Creates KV namespace (if not exists)
4. Updates wrangler.toml with resource IDs
5. Deploys Worker to Cloudflare
6. Deploys dashboard to Cloudflare Pages
7. Runs validation tests

## Manual Deployment (Step-by-Step)

If you prefer manual control or need to troubleshoot:

### Step 1: Create D1 Database

```bash
# Create database
wrangler d1 create mmi-database-prod

# Note the database ID from output
# Example: database_id = "abc123def456"

# Apply schema
wrangler d1 execute mmi-database-prod --file=./schema.sql

# Verify tables created
wrangler d1 execute mmi-database-prod --command="
  SELECT name FROM sqlite_master WHERE type='table';
"
```

### Step 2: Create KV Namespace

```bash
# Create KV namespace
wrangler kv:namespace create "mmi-cache-prod"

# Note the namespace ID from output
# Example: id = "xyz789abc012"
```

### Step 3: Update wrangler.toml

Edit `wrangler.toml` and add your resource IDs:

```toml
[[d1_databases]]
binding = "MMI_DB"
database_name = "mmi-database-prod"
database_id = "abc123def456"  # Replace with your database ID

[[kv_namespaces]]
binding = "MMI_KV"
id = "xyz789abc012"  # Replace with your KV namespace ID
```

### Step 4: Deploy Worker

```bash
# Deploy to production
wrangler deploy --env prod

# Note the Worker URL from output
# Example: https://mmi-engine-prod.your-subdomain.workers.dev
```

### Step 5: Configure Custom Domain Routes

In Cloudflare Dashboard:

1. Go to **Workers & Pages** → **mmi-engine-prod**
2. Click **Triggers** tab
3. Add custom routes:
   - `blazesportsintel.com/mmi/*`
   - `www.blazesportsintel.com/mmi/*`

Or via wrangler.toml (already configured):

```toml
[[routes]]
pattern = "blazesportsintel.com/mmi/*"
zone_name = "blazesportsintel.com"
```

### Step 6: Update Dashboard API URL

Edit `mmi-dashboard.html` (line 286):

```javascript
const API_BASE = 'https://blazesportsintel.com/mmi';  // Update this
```

### Step 7: Deploy Dashboard

```bash
# Create Pages project (first time only)
wrangler pages project create mmi-live --production-branch=main

# Deploy dashboard
wrangler pages deploy mmi-dashboard.html --project-name=mmi-live

# Note the Pages URL from output
# Example: https://mmi-live.pages.dev
```

### Step 8: Configure Custom Domain for Dashboard (Optional)

In Cloudflare Dashboard:

1. Go to **Workers & Pages** → **mmi-live**
2. Click **Custom domains** tab
3. Add: `mmi.blazesportsintel.com`

## Post-Deployment Verification

### 1. Test API Endpoints

```bash
# Test games endpoint
curl https://blazesportsintel.com/mmi/games/today

# Test MMI calculation (replace with real game ID)
curl https://blazesportsintel.com/mmi/717519

# Test leaderboard
curl https://blazesportsintel.com/mmi/top
```

### 2. Check Database

```bash
# Count moments stored
wrangler d1 execute mmi-database-prod --command="
  SELECT COUNT(*) as total FROM mmi_moments;
"

# View recent moments
wrangler d1 execute mmi-database-prod --command="
  SELECT mmi_score, category, recorded_at 
  FROM mmi_moments 
  ORDER BY recorded_at DESC 
  LIMIT 5;
"
```

### 3. Monitor Logs

```bash
# Watch live Worker logs
wrangler tail mmi-engine-prod

# Filter for errors only
wrangler tail mmi-engine-prod --status error
```

### 4. Test Dashboard

1. Open https://mmi-live.pages.dev (or your custom domain)
2. Should see "Today's Games" loading
3. Click a game to view MMI calculation
4. Check component breakdown displays
5. Verify leaderboard populates

## Environment Management

### Development Environment

```bash
# Deploy to dev
./deploy-mmi.sh dev

# Or manually
wrangler deploy --env dev

# Dev endpoints will be:
# https://mmi-engine-dev.your-subdomain.workers.dev
```

### Production Environment

```bash
# Deploy to prod
./deploy-mmi.sh prod

# Or manually
wrangler deploy --env prod
```

### Environment Variables

No environment variables needed! All configuration via Cloudflare bindings.

## Updating After Deployment

### Update Worker Logic

```bash
# Edit worker-mmi-engine.js
vim worker-mmi-engine.js

# Deploy changes
wrangler deploy --env prod
```

### Update Database Schema

```bash
# Add new migration SQL
echo "ALTER TABLE mmi_moments ADD COLUMN new_field TEXT;" > migration.sql

# Apply migration
wrangler d1 execute mmi-database-prod --file=./migration.sql
```

### Update Dashboard

```bash
# Edit mmi-dashboard.html
vim mmi-dashboard.html

# Redeploy
wrangler pages deploy mmi-dashboard.html --project-name=mmi-live
```

## Troubleshooting

### Worker Not Responding

```bash
# Check Worker status
wrangler tail mmi-engine-prod

# Common issues:
# 1. D1 binding not configured → Add in Dashboard
# 2. KV binding not configured → Add in Dashboard
# 3. MLB API unreachable → Check status at statsapi.mlb.com
```

### Database Connection Errors

```bash
# Verify database exists
wrangler d1 list

# Verify binding in wrangler.toml
cat wrangler.toml | grep -A 3 "d1_databases"

# Test database access
wrangler d1 execute mmi-database-prod --command="SELECT 1;"
```

### KV Cache Issues

```bash
# List all keys
wrangler kv:key list --namespace-id=<your-kv-id>

# Delete all keys (reset cache)
wrangler kv:key list --namespace-id=<your-kv-id> | jq -r '.[].name' | xargs -I {} wrangler kv:key delete {} --namespace-id=<your-kv-id>
```

### Dashboard Not Loading Data

1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Common issues:
   - API_BASE URL incorrect (line 286 in HTML)
   - CORS headers missing (Worker should add automatically)
   - API endpoint returning 404 (Worker not deployed to custom domain)

### Custom Domain Not Working

In Cloudflare Dashboard:

1. **Workers & Pages** → **mmi-engine-prod** → **Triggers**
2. Verify routes are active:
   - `blazesportsintel.com/mmi/*`
3. Check DNS:
   - `blazesportsintel.com` → A/AAAA record or CNAME to Cloudflare
   - Orange cloud icon enabled (proxied)
4. Wait 1-2 minutes for propagation

## Rollback

### Rollback Worker

```bash
# List recent deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --deployment-id=<deployment-id>
```

### Rollback Database

```bash
# D1 doesn't support automatic rollback
# Manual restore from backup:

# Export current data
wrangler d1 execute mmi-database-prod --command="SELECT * FROM mmi_moments" --output json > backup.json

# Drop and recreate table
wrangler d1 execute mmi-database-prod --command="DROP TABLE mmi_moments"
wrangler d1 execute mmi-database-prod --file=./schema.sql

# Re-import data (custom script required)
```

## Performance Optimization

### Enable Caching

Already configured in Worker (5 min TTL). To adjust:

```javascript
// In worker-mmi-engine.js, line ~305
await env.MMI_KV.put(cacheKey, resultJson, { 
  expirationTtl: 300  // Change to desired seconds
});
```

### Database Optimization

```sql
-- Add composite index for common query
CREATE INDEX idx_pitcher_date ON mmi_moments(pitcher_id, DATE(recorded_at));

-- Apply via:
wrangler d1 execute mmi-database-prod --command="CREATE INDEX idx_pitcher_date ON mmi_moments(pitcher_id, DATE(recorded_at));"
```

### Monitor Performance

```bash
# Worker execution time (from logs)
wrangler tail mmi-engine-prod | grep "CPU time"

# D1 query time (from logs)
wrangler tail mmi-engine-prod | grep "D1"

# KV hit rate
wrangler tail mmi-engine-prod | grep "KV cache"
```

## Security

### No API Keys Required

- MLB StatsAPI: Free, no authentication
- Cloudflare bindings: Automatic, secure
- Dashboard: Public read-only

### Rate Limiting (Optional)

```javascript
// In worker-mmi-engine.js
const RATE_LIMIT = 60; // requests per minute

// Implement IP-based rate limiting with KV
const clientIP = request.headers.get('CF-Connecting-IP');
const rateLimitKey = `rate:${clientIP}`;
const requests = await env.MMI_KV.get(rateLimitKey) || 0;

if (requests > RATE_LIMIT) {
  return new Response('Rate limit exceeded', { status: 429 });
}

await env.MMI_KV.put(rateLimitKey, requests + 1, { expirationTtl: 60 });
```

## Cost Monitoring

Free tier limits:
- **Workers**: 100k requests/day
- **D1**: 5GB storage, 5M reads/day, 100k writes/day
- **KV**: 100k reads/day, 1k writes/day
- **Pages**: Unlimited requests

Monitor usage in Cloudflare Dashboard:
- **Account Home** → **Analytics** → **Workers**

## Support Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [MLB StatsAPI Docs](https://statsapi.mlb.com/docs/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## Checklist

- [ ] Cloudflare account created
- [ ] Domain added to Cloudflare
- [ ] Wrangler CLI installed and authenticated
- [ ] D1 database created and schema applied
- [ ] KV namespace created
- [ ] wrangler.toml updated with resource IDs
- [ ] Worker deployed to production
- [ ] Custom domain routes configured
- [ ] Dashboard API_BASE updated
- [ ] Dashboard deployed to Pages
- [ ] API endpoints tested
- [ ] Database verification complete
- [ ] Logs monitored for errors
- [ ] Dashboard loads correctly

---

**Deployment complete! 🎉**

Next: Monitor usage, calibrate z-scores, validate predictions.
