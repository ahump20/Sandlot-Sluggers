# Sandlot Sluggers - Deployment Guide

## Infrastructure Overview

This project uses a hybrid deployment strategy:
- **Game Application**: Cloudflare Pages (main game engine)
- **Landing Page**: Vercel (Next.js marketing site)
- **Backend**: Cloudflare Workers + Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **Assets**: Cloudflare R2

## Prerequisites

1. **Cloudflare Account**: [Sign up](https://dash.cloudflare.com/sign-up)
2. **Vercel Account**: [Sign up](https://vercel.com/signup)
3. **Node.js**: v18+ installed
4. **Wrangler CLI**: `npm install -g wrangler`

---

## Cloudflare Setup (Game Application)

### 1. Install Wrangler and Login

```bash
npm install -g wrangler
wrangler login
```

### 2. Create D1 Database

```bash
# Production database
wrangler d1 create sandlot-sluggers-db

# Development database
wrangler d1 create sandlot-sluggers-db-dev
```

**Copy the database_id from the output and update `wrangler.toml`**

### 3. Initialize Database Schema

```bash
# Production
wrangler d1 execute sandlot-sluggers-db --file=./schema.sql --remote

# Development
wrangler d1 execute sandlot-sluggers-db-dev --file=./schema.sql --local
```

### 4. Create KV Namespace

```bash
# Production
wrangler kv:namespace create "SLUGGERS_KV"

# Development
wrangler kv:namespace create "SLUGGERS_KV" --preview
```

**Copy the namespace ID and update `wrangler.toml`**

### 5. Create R2 Bucket

```bash
# Production
wrangler r2 bucket create sandlot-sluggers-assets

# Development
wrangler r2 bucket create sandlot-sluggers-assets-dev
```

### 6. Upload Game Assets to R2

```bash
# Upload models
wrangler r2 object put sandlot-sluggers-assets/models/characters.glb --file=./assets/models/characters.glb

# Upload textures
wrangler r2 object put sandlot-sluggers-assets/textures/field_diffuse.jpg --file=./assets/textures/field_diffuse.jpg

# Upload audio
wrangler r2 object put sandlot-sluggers-assets/audio/crack.mp3 --file=./assets/audio/crack.mp3
```

### 7. Deploy to Cloudflare Pages

```bash
# Build the game
npm run build

# Deploy to production
wrangler pages deploy dist --project-name=sandlot-sluggers

# Set up automatic deployments from GitHub
wrangler pages project create sandlot-sluggers --production-branch=main
```

### 8. Configure Environment Variables

In Cloudflare Dashboard → Pages → sandlot-sluggers → Settings → Environment Variables:

```
NODE_VERSION=18
ENABLE_ANALYTICS=true
```

---

## Vercel Setup (Landing Page)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link Project to Vercel

```bash
cd landing-page
vercel link
```

### 3. Configure Environment Variables

```bash
# Set production API URL
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://sandlot-sluggers.pages.dev

# Set preview API URL
vercel env add NEXT_PUBLIC_API_URL preview
# Enter: https://sandlot-sluggers-dev.pages.dev

# Set development API URL
vercel env add NEXT_PUBLIC_API_URL development
# Enter: http://localhost:8787
```

### 4. Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Or connect to GitHub for automatic deployments
vercel git connect
```

### 5. Configure Custom Domain (Optional)

```bash
vercel domains add sandlotslugging.com
```

---

## Local Development

### 1. Set Up Development Environment

```bash
# Copy environment variables
cp .dev.vars.example .dev.vars

# Install dependencies
npm install
cd landing-page && npm install && cd ..
```

### 2. Start Game Development Server

```bash
# Terminal 1: Vite dev server with Cloudflare Pages emulation
npm run dev
```

Open http://localhost:5173

### 3. Start Landing Page Development Server

```bash
# Terminal 2: Next.js dev server
cd landing-page
npm run dev
```

Open http://localhost:3001

### 4. Test Cloudflare Functions Locally

```bash
# Terminal 3: Wrangler dev server
wrangler pages dev dist --d1=DB --kv=KV --r2=ASSETS
```

---

## CI/CD Pipeline

### GitHub Actions for Cloudflare Pages

Create `.github/workflows/deploy-game.yml`:

```yaml
name: Deploy Game to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name=sandlot-sluggers
```

### Vercel Auto-Deploy

Vercel automatically deploys on every push when connected to GitHub:
- **main** branch → Production
- **Pull requests** → Preview deployments

---

## Monitoring & Analytics

### Cloudflare Analytics

View real-time metrics:
```bash
wrangler pages deployment list --project-name=sandlot-sluggers
```

Dashboard: https://dash.cloudflare.com/pages/sandlot-sluggers

### Vercel Analytics

Dashboard: https://vercel.com/[your-username]/sandlot-sluggers-landing/analytics

---

## Troubleshooting

### D1 Database Issues

```bash
# List all databases
wrangler d1 list

# Query database directly
wrangler d1 execute sandlot-sluggers-db --command="SELECT * FROM player_progress LIMIT 10"

# Check database info
wrangler d1 info sandlot-sluggers-db
```

### R2 Asset Issues

```bash
# List objects in bucket
wrangler r2 object list sandlot-sluggers-assets

# Download object for inspection
wrangler r2 object get sandlot-sluggers-assets/models/characters.glb --file=./downloaded.glb
```

### Build Issues

```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

## Production Checklist

Before going live:

- [ ] Update wrangler.toml with actual database/KV/R2 IDs
- [ ] Upload all game assets to R2
- [ ] Test all API endpoints
- [ ] Enable Cloudflare Page Rules for caching
- [ ] Set up custom domain
- [ ] Configure SSL/TLS
- [ ] Test on mobile devices
- [ ] Run performance audit (Lighthouse)
- [ ] Set up error tracking (Sentry)
- [ ] Configure rate limiting
- [ ] Test leaderboard functionality
- [ ] Verify analytics collection

---

## Performance Optimization

### Cloudflare Cache Rules

Set up caching in Cloudflare Dashboard:

```
Cache Everything:
- *.glb (1 week)
- *.jpg, *.png (1 week)
- *.mp3, *.wav (1 week)
- *.js, *.css (1 day)
```

### Vercel Edge Config

The landing page is automatically optimized with:
- Edge caching
- Image optimization
- Code splitting

---

## Scaling Considerations

- **D1**: 100K reads/day on free tier
- **R2**: 10GB storage free
- **KV**: 100K reads/day free
- **Pages**: Unlimited requests on free tier

Upgrade to Workers Paid ($5/month) for:
- 10M requests/month
- Extended CPU time
- Durable Objects support (for multiplayer)

---

## Support

- Cloudflare Docs: https://developers.cloudflare.com/pages
- Vercel Docs: https://vercel.com/docs
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler
