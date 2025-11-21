# MMI Deployment Guide

Step-by-step instructions for deploying MMI system to blazesportsintel.com.

## Prerequisites

1. **Cloudflare Account**
   - Sign up at https://dash.cloudflare.com
   - Add domain `blazesportsintel.com` (or use existing)

2. **Wrangler CLI**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **Domain Configuration**
   - Ensure `blazesportsintel.com` is in your Cloudflare account
   - DNS should point to Cloudflare

## One-Command Deployment

```bash
cd /workspace/mmi-live
./deploy-mmi.sh prod
```

This script:
1. Creates D1 database (if needed)
2. Applies database schema
3. Creates KV namespace (if needed)
4. Updates `wrangler.toml` with IDs
5. Deploys Worker to Cloudflare

## Manual Deployment Steps

If the script fails, follow these steps:

### 1. Create D1 Database

```bash
wrangler d1 create mmi-db
```

Copy the `database_id` from output and update `wrangler.toml`:
```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "mmi-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 2. Apply Schema

```bash
wrangler d1 execute mmi-db --file=./schema.sql
```

Verify:
```bash
wrangler d1 execute mmi-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 3. Create KV Namespace

```bash
wrangler kv:namespace create "MMI_KV"
```

Copy the `id` from output and update `wrangler.toml`:
```toml
[[env.production.kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID_HERE"
```

### 4. Deploy Worker

```bash
wrangler deploy --env production
```

### 5. Configure Routes

In Cloudflare Dashboard:
1. Go to Workers & Pages → Routes
2. Add route: `blazesportsintel.com/mmi/*`
3. Select your Worker: `mmi-engine-prod`

## Deploy Dashboard

```bash
# Update API URL in mmi-dashboard.html if needed
# Then deploy to Pages:
wrangler pages deploy mmi-dashboard.html --project-name=mmi-live
```

Or use Cloudflare Dashboard:
1. Workers & Pages → Create → Pages
2. Upload `mmi-dashboard.html`
3. Project name: `mmi-live`

## Post-Deployment

### 1. Verify Worker

```bash
curl https://blazesportsintel.com/mmi/games/today
```

Expected: JSON with today's games (or empty array if no games)

### 2. Test MMI Calculation

```bash
curl https://blazesportsintel.com/mmi/717715
```

Expected: JSON with MMI calculation (or error if game not active)

### 3. Verify Database

```bash
wrangler d1 execute mmi-db --command="SELECT COUNT(*) FROM mmi_moments;"
```

### 4. Check KV Cache

```bash
wrangler kv:key get "mmi:717715:latest" --namespace-id=YOUR_KV_ID
```

## Troubleshooting

### Error: "DB is not defined"

**Solution:** Database binding not configured. Check `wrangler.toml` has correct `database_id`.

### Error: "KV is not defined"

**Solution:** KV binding not configured. Check `wrangler.toml` has correct KV `id`.

### Error: "Route not found"

**Solution:** Route not configured in Cloudflare Dashboard. Add route `blazesportsintel.com/mmi/*`.

### Error: "MLB API error"

**Solution:** MLB StatsAPI may be down or rate-limited. Check API status. Worker will return error response.

### Dashboard shows "Error loading games"

**Solution:** 
1. Check CORS headers in Worker
2. Verify API URL in dashboard matches Worker route
3. Check browser console for errors

### Database queries slow

**Solution:**
1. Verify indexes created: `wrangler d1 execute mmi-db --command="SELECT name FROM sqlite_master WHERE type='index';"`
2. Check query patterns - use indexed columns
3. Consider adding more indexes if needed

## Environment Variables

No environment variables needed. All configuration in `wrangler.toml`.

## Monitoring

### Cloudflare Dashboard

1. **Workers & Pages** → Your Worker → Metrics
   - Request count
   - Error rate
   - CPU time

2. **Analytics** → Workers
   - Performance metrics
   - Geographic distribution

### Database Monitoring

```bash
# Check table sizes
wrangler d1 execute mmi-db --command="SELECT name, COUNT(*) as count FROM mmi_moments GROUP BY name;"

# Check recent activity
wrangler d1 execute mmi-db --command="SELECT COUNT(*) FROM mmi_moments WHERE created_at >= datetime('now', '-1 day');"
```

## Updates

To update Worker code:

```bash
# Edit worker-mmi-engine.js
wrangler deploy --env production
```

To update database schema:

```bash
# Edit schema.sql
wrangler d1 execute mmi-db --file=./schema.sql
```

**Note:** D1 doesn't support `ALTER TABLE` well. For schema changes, consider:
1. Creating new table
2. Migrating data
3. Dropping old table

## Rollback

If deployment fails:

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --env production
```

## Cost Monitoring

Check usage in Cloudflare Dashboard:
- **Workers:** Free tier = 100k requests/day
- **D1:** Free tier = 5M reads, 100k writes/month
- **KV:** Free tier = 100k reads, 1k writes/day

Set up alerts if approaching limits.

## Support

For issues:
1. Check Cloudflare Dashboard logs
2. Review Worker errors in Dashboard
3. Test locally with `dev-server.js`
4. Run test suite: `node test-mmi.js`
