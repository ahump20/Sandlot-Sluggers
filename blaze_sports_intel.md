# Blaze Sports Intel 🔥⚾

**Blaze Sports Intel** is a sports technology platform delivering quantitative analytics and interactive experiences for baseball fans, analysts, and developers. The platform lives at [blazesportsintel.com](https://blazesportsintel.com) and is built entirely on Cloudflare's edge infrastructure.

---

## Platform Overview

| Product | Description | URL |
|---------|-------------|-----|
| **MMI** | Real-time mental pressure analytics | blazesportsintel.com/mmi |
| **Sandlot Sluggers** | Mobile-first physics-driven baseball game | blazesportsintel.com/sandlot-sluggers |
| **Genie World Model** | AI-powered game simulation engine | (research / internal) |

---

## Product 1: MMI — Moment Mentality Index

The **Moment Mentality Index** quantifies the mental difficulty of every baseball pitch on a 0–100 scale. It replaces narrative-driven "clutch" analysis with a transparent, formula-based metric.

### Formula

```
MMI = z(LI)·0.35 + z(Pressure)·0.20 + z(Fatigue)·0.20 + z(Execution)·0.15 + z(Bio)·0.10

Final: MMI = 50 + (weighted_z_sum × 15), bounded [0, 100]
```

### Component Weights

| Component | Weight | Mean | StdDev | Description |
|-----------|--------|------|--------|-------------|
| Leverage Index | 35% | 1.0 | 0.8 | Win-probability impact of the moment |
| Pressure | 20% | 50 | 25 | Count, inning, and outs psychological intensity |
| Fatigue | 20% | 50 | 20 | Pitcher pitch count and days of rest |
| Execution | 15% | 50 | 15 | Technical difficulty of the required pitch |
| Bio-proxies | 10% | 50 | 10 | Observable stress indicators (mound visits, tempo) |

### Interpretation Scale

| MMI Score | Category | Frequency | Description |
|-----------|----------|-----------|-------------|
| 70–100 | Elite Pressure | ~10% | Bases loaded, full count, late innings |
| 55–70 | High Difficulty | ~20% | Elevated pressure, not maximum leverage |
| 40–55 | Moderate | ~40% | League-average difficulty |
| 0–40 | Routine | ~30% | Low-leverage, comfortable situations |

### MMI API Endpoints

Base URL: `https://blazesportsintel.com/mmi`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/mmi/games/today` | Today's live MLB games |
| `GET` | `/mmi/:gameId` | Calculate MMI for a specific game |
| `GET` | `/mmi/history/:playerId` | MMI history for a player (`?limit=20`) |
| `GET` | `/mmi/top` | Top moments leaderboard (`?limit=10&timeframe=7`) |

**Sample response for `/mmi/:gameId`:**

```json
{
  "gameId": "717519",
  "timestamp": "2024-11-21T21:34:15Z",
  "mmi": 84.5,
  "category": "Elite Pressure",
  "components": {
    "leverageIndex": { "raw": 4.0, "zScore": 3.75, "weight": 0.35 },
    "pressure":      { "raw": 85,  "zScore": 1.40, "weight": 0.20 },
    "fatigue":       { "raw": 70,  "zScore": 1.00, "weight": 0.20 },
    "execution":     { "raw": 80,  "zScore": 2.00, "weight": 0.15 },
    "bio":           { "raw": 75,  "zScore": 2.50, "weight": 0.10 }
  },
  "situation": {
    "inning": 9, "half": "bottom", "outs": 2,
    "count": "3-2", "baserunners": "1B, 3B", "score": "4-3"
  },
  "players": {
    "pitcher": { "id": 592789, "name": "Gerrit Cole" },
    "batter":  { "id": 502110, "name": "Rafael Devers" }
  }
}
```

### MMI Architecture

```
MLB StatsAPI (free) → Cloudflare Worker → D1 (storage)
                              ↓
                        KV (5 min cache)
                              ↓
                    Cloudflare Pages (dashboard)
```

**Stack:**
- `worker-mmi-engine.js` — Cloudflare Worker; parses game state, calculates MMI, stores to D1, caches in KV
- `schema.sql` — D1 SQLite schema (8 tables, 15 indexes, automated triggers)
- `mmi-dashboard.html` — Real-time dashboard with 5-second auto-refresh

**Source:** [`mmi-live/`](./mmi-live/)

### MMI Quick Start

```bash
# Run validation tests
node mmi-live/test-mmi.js

# Start local dev server (http://localhost:8787)
node mmi-live/dev-server.js

# Deploy to production (one command)
./mmi-live/deploy-mmi.sh prod
```

---

## Product 2: Sandlot Sluggers

**Sandlot Sluggers** (code name: "Blaze Backyard Baseball") is a mobile-first, physics-driven baseball game built with 100% original IP. It features realistic ball physics, 3D WebGPU rendering, and Progressive Web App (PWA) support.

### Game Features

- **Realistic Physics** — Havok Physics engine with air drag, Magnus effect, and spin-based ball movement
- **3D Rendering** — Babylon.js 7 with WebGPU + WebGL 2 fallback
- **12 Original Characters** — Power hitters, contact specialists, speed demons, crafty pitchers
- **5 Unique Stadiums** — Dusty Acres, Frostbite Field, Treehouse Park, Rooftop Rally, Beach Bash
- **Progressive Unlocks** — Secret characters (Comet Carter, Blaze the dog)
- **PWA Support** — Installable on iOS and Android for fullscreen play
- **Cross-Platform Persistence** — Cloudflare D1 for progression, KV for leaderboards

### Game Architecture

```
┌──────────────────────────────────────────────────────────┐
│                       GameEngine                         │
├──────┬──────────┬────────┬────────┬──────┬───────┬──────┤
│Physics│ Renderer │ Field  │ Camera │  AI  │ Audio │  UI  │
└──────┴──────────┴────────┴────────┴──────┴───────┴──────┘
         Babylon.js 7 + Havok Physics + Cloudflare Edge
```

**Frontend stack:**
- Babylon.js 7.31 + WebGPU/WebGL 2
- Havok Physics 1.3.9
- TypeScript 5.6 (strict)
- Vite 5.4

**Backend stack:**
- Cloudflare Pages (hosting)
- Cloudflare D1 (player progression)
- Cloudflare KV (leaderboards, caching)
- Cloudflare R2 (3D models, textures, audio)
- Cloudflare Analytics Engine (telemetry)

### Sandlot Sluggers API Endpoints

Base URL: `https://your-game-deployment.pages.dev`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats/global` | Global game statistics |
| `GET` | `/api/stats/leaderboard` | Top players by wins or home runs |
| `GET` | `/api/stats/character/:id` | Per-character performance stats |
| `GET` | `/api/stats/stadium/:id` | Per-stadium usage and score statistics |
| `GET` | `/api/progress/:playerId` | Load player progression |
| `POST` | `/api/progress/:playerId` | Save player progression |

### Sandlot Sluggers Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

**Source:** [`src/`](./src/), [`functions/`](./functions/)

---

## Product 3: Genie World Model

An adaptation of DeepMind's [Genie](https://deepmind.google/discover/blog/genie-3-a-new-frontier-for-world-models/) autoregressive world model architecture, integrated with Sandlot Sluggers gameplay for AI-driven game simulation and training data generation.

### How It Works

The Genie World Model infers latent actions from gameplay footage (no prior action labels required), then trains a dynamics model capable of predicting future game frames given an action token. This enables:

- **AI playtesting** — Simulate thousands of at-bats without human input
- **Training data generation** — Synthetic physics scenarios for model calibration
- **Predictive replays** — "What would have happened if the batter swung earlier?"

### Architecture

```
Video frames → Video Tokenizer (VQ-VAE) → Latent tokens
                                               ↓
                          Action Tokenizer (unsupervised)
                                               ↓
                          Dynamics Model (Space-Time Transformer)
                                               ↓
                          Future frame prediction
```

### Genie Quick Start

```bash
# Install Python dependencies
pip install -r genie-worldmodel/requirements.txt
export PYTHONPATH="$PYTHONPATH:$(pwd)/genie-worldmodel"

# Train video tokenizer
python genie-worldmodel/scripts/train_video_tokenizer.py \
  --config genie-worldmodel/configs/video_tokenizer.yaml

# Train with Sandlot Sluggers gameplay data
python genie-worldmodel/scripts/full_train.py \
  --config genie-worldmodel/configs/sandlot_sluggers_training.yaml

# Run inference server (integrates with game engine)
python genie-worldmodel/scripts/inference_server.py \
  --config genie-worldmodel/configs/sandlot_sluggers_inference.yaml
```

**Source:** [`genie-worldmodel/`](./genie-worldmodel/)

---

## Platform Infrastructure

All Blaze Sports Intel products share a common Cloudflare-native infrastructure stack.

### Cloudflare Services Used

| Service | Purpose |
|---------|---------|
| **Pages** | Static site hosting for game and dashboard |
| **Workers** | Serverless compute (MMI engine, game API) |
| **D1** | SQLite database for player progression and MMI moments |
| **KV** | Key-value cache for leaderboards and API responses |
| **R2** | Object storage for 3D models, textures, audio files |
| **Analytics Engine** | Gameplay telemetry and usage metrics |

### Cost Estimate

**Expected monthly cost: $0–5** (Cloudflare free tier covers all typical traffic loads)

| Service | Free Tier Limit |
|---------|----------------|
| Workers | 100k requests/day |
| D1 | 5 GB + 5M reads/day + 100k writes/day |
| KV | 100k reads/day + 1k writes/day |
| Pages | Unlimited requests |
| MLB StatsAPI | Free, unlimited (no key required) |

---

## Repository Structure

```
Sandlot-Sluggers/
├── src/                          # Sandlot Sluggers game source
│   ├── core/GameEngine.ts        # Main game orchestrator
│   ├── physics/BaseballPhysics.ts# Drag, Magnus effect, spin
│   ├── graphics/                 # Renderer, FieldBuilder
│   ├── camera/CameraController.ts# Dynamic multi-mode camera
│   ├── ai/FieldingAI.ts          # Intelligent fielding AI
│   ├── animation/                # 11 animation types
│   ├── audio/AudioManager.ts     # SFX, music, ambient
│   ├── ui/GameUI.ts              # HUD, scoreboard, notifications
│   ├── data/                     # Characters & stadiums
│   └── api/progression.ts        # Player progress API client
├── functions/api/                # Cloudflare Pages Functions
│   ├── progress/                 # Player progression endpoints
│   └── stats/                    # Analytics API endpoints
├── mmi-live/                     # MMI system
│   ├── worker-mmi-engine.js      # Cloudflare Worker
│   ├── schema.sql                # D1 database schema
│   ├── mmi-dashboard.html        # Real-time dashboard
│   └── deploy-mmi.sh             # One-command deployment
├── genie-worldmodel/             # AI world model
│   ├── models/                   # Video tokenizer, dynamics model
│   ├── scripts/                  # Training and inference scripts
│   └── configs/                  # Sandlot Sluggers configs
├── landing-page/                 # Next.js marketing site (Vercel)
├── public/                       # PWA manifest, icons
├── index.html                    # Game entry point
├── schema.sql                    # Game D1 schema
├── wrangler.toml                 # Cloudflare deployment config
└── package.json                  # Dependencies and scripts
```

---

## Development Commands

```bash
# --- Sandlot Sluggers ---
npm install                        # Install dependencies
npm run dev                        # Dev server (http://localhost:5173)
npm run build                      # Production build
npm run deploy                     # Deploy to Cloudflare Pages

# --- MMI System ---
node mmi-live/test-mmi.js          # Validate MMI calculations
node mmi-live/dev-server.js        # Local API server (localhost:8787)
./mmi-live/deploy-mmi.sh prod      # Deploy to production

# --- Genie World Model ---
pip install -r genie-worldmodel/requirements.txt
python genie-worldmodel/scripts/full_train.py \
  --config genie-worldmodel/configs/sandlot_sluggers_training.yaml
python genie-worldmodel/scripts/inference_server.py \
  --config genie-worldmodel/configs/sandlot_sluggers_inference.yaml

# --- Cloudflare CLI ---
wrangler login                     # Authenticate
wrangler d1 execute sandlot-sluggers-db --file=./schema.sql
wrangler tail mmi-engine-prod      # Live Worker logs
```

---

## Documentation Index

| File | Contents |
|------|----------|
| [README.md](./README.md) | Sandlot Sluggers quick start |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Game API endpoint reference |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |
| [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) | Adding new game systems |
| [ASSETS_GUIDE.md](./ASSETS_GUIDE.md) | 3D/audio asset specifications |
| [OVERHAUL_SUMMARY.md](./OVERHAUL_SUMMARY.md) | Production overhaul details |
| [mmi-live/README.md](./mmi-live/README.md) | MMI system documentation |
| [mmi-live/SUMMARY.md](./mmi-live/SUMMARY.md) | MMI deep dive |
| [mmi-live/QUICK-REF.md](./mmi-live/QUICK-REF.md) | MMI formula quick reference |
| [mmi-live/DEPLOY.md](./mmi-live/DEPLOY.md) | MMI deployment guide |
| [genie-worldmodel/README.md](./genie-worldmodel/README.md) | Genie world model docs |

---

## Contact

- **Website:** [blazesportsintel.com](https://blazesportsintel.com)
- **Email:** contact@blazesportsintel.com
- **Issues:** [GitHub Issues](https://github.com/ahump20/Sandlot-Sluggers/issues)

---

*Built by Blaze Sports Intel — Quantifying the game.*
