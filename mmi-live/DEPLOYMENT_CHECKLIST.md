# MMI Deployment Checklist

## Pre-Deployment Verification

✅ **All files created:**
- `worker-mmi-engine.js` (15KB) - Cloudflare Worker
- `schema.sql` (5.5KB) - D1 database schema
- `mmi-dashboard.html` (17KB) - Dashboard UI
- `deploy-mmi.sh` - Deployment script (executable)
- `wrangler.toml` - Cloudflare configuration
- `test-mmi.js` - Test suite (5 tests, all passing ✅)
- `dev-server.js` - Local testing server
- Documentation (README, DEPLOY, SUMMARY, QUICK-REF)

✅ **Tests passing:**
```bash
cd /workspace/mmi-live
node test-mmi.js
# Result: 5 passed, 0 failed
```

## Deployment Steps

### 1. Install Wrangler (if not already installed)
```bash
npm install -g wrangler
wrangler login
```

### 2. Verify Domain Access
Ensure `blazesportsintel.com` is in your Cloudflare account and DNS is configured.

### 3. Run Deployment Script
```bash
cd /workspace/mmi-live
./deploy-mmi.sh prod
```

This will:
- Create D1 database (`mmi-db`)
- Apply database schema
- Create KV namespace (`MMI_KV`)
- Update `wrangler.toml` with IDs
- Deploy Worker to Cloudflare

### 4. Configure Routes (if needed)
In Cloudflare Dashboard:
1. Workers & Pages → Routes
2. Add route: `blazesportsintel.com/mmi/*`
3. Select Worker: `mmi-engine-prod`

### 5. Deploy Dashboard
```bash
wrangler pages deploy mmi-dashboard.html --project-name=mmi-live
```

Or via Cloudflare Dashboard:
1. Workers & Pages → Create → Pages
2. Upload `mmi-dashboard.html`
3. Project name: `mmi-live`

### 6. Verify Deployment

**Test API:**
```bash
# Today's games
curl https://blazesportsintel.com/mmi/games/today

# Live MMI (use actual game ID)
curl https://blazesportsintel.com/mmi/717715
```

**Test Dashboard:**
- Open: `https://mmi-live.pages.dev`
- Select a game
- Verify MMI displays correctly

**Verify Database:**
```bash
wrangler d1 execute mmi-db --command="SELECT COUNT(*) FROM mmi_moments;"
```

## Post-Deployment

### Monitor Performance
- Cloudflare Dashboard → Workers & Pages → Metrics
- Check request count, error rate, CPU time

### Check Logs
```bash
wrangler tail --env production
```

### Verify Data Collection
```bash
# After a few API calls, check database
wrangler d1 execute mmi-db --command="SELECT * FROM mmi_moments ORDER BY created_at DESC LIMIT 10;"
```

## Troubleshooting

### If deployment script fails:
1. Check `wrangler.toml` for correct configuration
2. Verify you're authenticated: `wrangler whoami`
3. Check domain access in Cloudflare Dashboard
4. Review error messages and fix issues

### If API returns errors:
1. Check Worker logs: `wrangler tail --env production`
2. Verify database bindings in `wrangler.toml`
3. Test locally first: `node dev-server.js`
4. Check MLB StatsAPI status

### If dashboard doesn't load:
1. Verify Pages deployment completed
2. Check API URL in dashboard matches Worker route
3. Check browser console for CORS errors
4. Verify CORS headers in Worker code

## File Locations

All files are in `/workspace/mmi-live/`:
- Worker: `worker-mmi-engine.js`
- Schema: `schema.sql`
- Dashboard: `mmi-dashboard.html`
- Config: `wrangler.toml`
- Deploy script: `deploy-mmi.sh`

## Quick Commands Reference

```bash
# Deploy everything
./deploy-mmi.sh prod

# Update Worker only
wrangler deploy --env production

# Update database schema
wrangler d1 execute mmi-db --file=./schema.sql

# View logs
wrangler tail --env production

# Test locally
node dev-server.js
```

## Next Steps After Deployment

1. **Monitor for 24 hours** - Check error rates, performance
2. **Collect data** - Run during live games
3. **Validate MMI** - Compare predictions to actual outcomes
4. **Calibrate** - After 1 month, update z-score parameters
5. **Expand** - Add batter MMI, defensive play MMI

## Support

- Documentation: See `README.md`, `DEPLOY.md`, `SUMMARY.md`
- Quick Reference: See `QUICK-REF.md`
- Testing: Run `node test-mmi.js`
- Local Dev: Use `node dev-server.js`

---

**Status:** Ready for deployment
**All tests:** Passing ✅
**Files:** Complete ✅
