# CLAUDE.md - AI Assistant Guide for Sandlot Sluggers

## Project Overview

**Sandlot Sluggers** (also known as "Blaze Backyard Baseball") is a mobile-first, physics-driven baseball game built with modern web technologies. It features realistic baseball physics, stunning 3D graphics powered by Babylon.js, and edge-deployed infrastructure via Cloudflare Pages.

**Key Characteristics:**
- 100% original IP (no borrowed assets from Backyard Baseball)
- Progressive Web App (PWA) with mobile-first design
- Physics-based gameplay using Havok Physics engine
- Real-time 3D rendering with WebGPU support
- Edge-deployed with Cloudflare Pages, D1, KV, and R2
- TypeScript-first codebase with strict type checking

---

## Tech Stack

### Frontend
- **Babylon.js 7.31** - 3D rendering engine with WebGPU support
- **Havok Physics 1.3.9** - Realistic physics simulation
- **TypeScript 5.6** - Primary programming language (strict mode)
- **Vite 5.4** - Build tool and dev server

### Backend/Infrastructure
- **Cloudflare Pages** - Static site hosting and serverless functions
- **Cloudflare D1** - SQLite database for player progression
- **Cloudflare KV** - Key-value store for caching and leaderboards
- **Cloudflare R2** - Object storage for 3D models, textures, audio
- **Cloudflare Analytics Engine** - Gameplay telemetry

### Additional
- **Next.js 14** - Landing page (in `landing-page/` directory)
- **Wrangler** - Cloudflare CLI tool for deployment

---

## Repository Structure

```
Sandlot-Sluggers/
├── src/                          # Main game source code
│   ├── core/
│   │   └── GameEngine.ts         # Main game engine orchestrator
│   ├── physics/
│   │   └── BaseballPhysics.ts    # Realistic physics (drag, Magnus effect, spin)
│   ├── graphics/
│   │   ├── AdvancedRenderer.ts   # PBR materials, lighting, post-processing
│   │   └── FieldBuilder.ts       # MLB-accurate field construction
│   ├── camera/
│   │   └── CameraController.ts   # Dynamic camera system (multiple views)
│   ├── ai/
│   │   └── FieldingAI.ts         # Intelligent fielding AI
│   ├── animation/
│   │   └── AnimationController.ts # Character animations (11 types)
│   ├── audio/
│   │   └── AudioManager.ts       # Sound effects, music, ambient audio
│   ├── ui/
│   │   └── GameUI.ts             # HUD, scoreboard, notifications
│   ├── data/
│   │   ├── characters.ts         # 12 playable characters with stats
│   │   └── stadiums.ts           # 5 unique stadiums
│   ├── api/
│   │   └── progression.ts        # API client for player progress
│   └── main.ts                   # Entry point
├── functions/                    # Cloudflare Pages Functions (serverless)
│   └── api/
│       ├── progress/             # Player progression endpoints
│       └── stats/                # Analytics API endpoints
├── landing-page/                 # Next.js marketing site
│   ├── src/
│   ├── components/
│   └── package.json
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # App icons
├── index.html                    # Main HTML entry
├── schema.sql                    # D1 database schema
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite bundler config
├── wrangler.toml                 # Cloudflare deployment config
└── vercel.json                   # Vercel deployment config (landing page)
```

### Key Documentation Files
- **README.md** - General project information and quick start
- **OVERHAUL_SUMMARY.md** - Details on recent production-ready overhaul
- **INTEGRATION_GUIDE.md** - How to integrate new systems into GameEngine
- **ASSETS_GUIDE.md** - Asset creation specifications (3D, audio, textures)
- **DEPLOYMENT.md** - Production deployment instructions
- **API_DOCUMENTATION.md** - Analytics API endpoint reference

---

## Development Workflows

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd Sandlot-Sluggers

# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:5173
```

### Development Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview production build locally
npm run deploy    # Deploy to Cloudflare Pages
```

### Working with Cloudflare Services

```bash
# Authenticate
wrangler login

# D1 Database
wrangler d1 create sandlot-sluggers-db
wrangler d1 execute sandlot-sluggers-db --file=./schema.sql
wrangler d1 execute sandlot-sluggers-db --command="SELECT * FROM player_progress"

# KV Namespace
wrangler kv:namespace create "SLUGGERS_KV"
wrangler kv:key list --namespace-id=<id>

# R2 Bucket
wrangler r2 bucket create sandlot-sluggers-assets
wrangler r2 object list sandlot-sluggers-assets

# Local development with bindings
wrangler pages dev dist --d1=DB=sandlot-sluggers-db --kv=KV=<id>
```

### Testing the Game

1. **Local Development**: `npm run dev` provides hot-reload
2. **Production Build**: `npm run build && npm run preview`
3. **With Cloudflare Bindings**: Use `wrangler pages dev dist` after building
4. **Landing Page**: `cd landing-page && npm run dev`

---

## Code Conventions and Standards

### TypeScript Standards

1. **Strict Mode**: All code must pass TypeScript strict checks
2. **No `any` types**: Use proper typing or `unknown` with type guards
3. **Interfaces over Types**: Prefer `interface` for object shapes
4. **Explicit Return Types**: Always specify return types on functions
5. **Null Safety**: Use optional chaining (`?.`) and nullish coalescing (`??`)

### Code Style

```typescript
// ✅ GOOD: Explicit types, clear naming
export class BaseballPhysics {
  private readonly dragCoefficient: number = 0.3;

  public calculateTrajectory(
    initialVelocity: Vector3,
    spin: Vector3,
    deltaTime: number
  ): Vector3 {
    // Implementation
  }
}

// ❌ BAD: Implicit types, unclear naming
class BP {
  drag = 0.3;

  calc(v, s, dt) {
    // Implementation
  }
}
```

### Naming Conventions

- **Classes**: PascalCase (`GameEngine`, `BaseballPhysics`)
- **Interfaces**: PascalCase (`GameState`, `HitParameters`)
- **Variables/Functions**: camelCase (`currentBatter`, `calculateForce`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PITCH_SPEED`, `STRIKE_ZONE_WIDTH`)
- **Private Members**: Prefix with underscore (`_fielders`, `_audioContext`)
- **Files**: PascalCase for classes (`GameEngine.ts`), camelCase for others (`main.ts`)

### File Organization

1. **Imports**: Group by external, internal, types
2. **Interfaces/Types**: Define before classes
3. **Class Structure**:
   - Public properties
   - Private properties
   - Constructor
   - Public methods
   - Private methods

### Comments

```typescript
/**
 * Calculates realistic ball trajectory with air drag and Magnus effect
 * @param velocity - Initial velocity vector (m/s)
 * @param spin - Spin vector in rpm (x=backspin, y=sidespin, z=gyrospin)
 * @param deltaTime - Time step in seconds
 * @returns New velocity vector after physics simulation
 */
public updateBallVelocity(
  velocity: Vector3,
  spin: Vector3,
  deltaTime: number
): Vector3 {
  // Calculate drag force (quadratic air resistance)
  const speed = velocity.length();
  const dragMagnitude = 0.5 * this.airDensity * this.dragCoefficient
    * this.ballArea * speed * speed;
  // ... rest of implementation
}
```

---

## Architecture Overview

### System Architecture

The game follows a **modular, component-based architecture** where each major system is independent and communicates through well-defined interfaces.

```
┌─────────────────────────────────────────────────────────┐
│                     GameEngine                          │
│  (Orchestrates all systems, manages game state)         │
└──────────┬──────────────────────────────────────────────┘
           │
    ┌──────┴───────┬──────────┬──────────┬──────────┬────────┬──────────┬────────┐
    │              │          │          │          │        │          │        │
┌───▼────┐  ┌─────▼─────┐  ┌─▼──────┐ ┌─▼────┐  ┌──▼───┐  ┌─▼───┐   ┌──▼──┐  ┌─▼──┐
│Physics │  │ Renderer  │  │ Field  │ │Camera│  │  AI  │  │Anim │   │Audio│  │ UI │
│        │  │           │  │Builder │ │      │  │      │  │     │   │     │  │    │
└────────┘  └───────────┘  └────────┘ └──────┘  └──────┘  └─────┘   └─────┘  └────┘
```

### Key System Responsibilities

1. **GameEngine** (`src/core/GameEngine.ts`):
   - Game loop and render loop
   - State management (innings, outs, score, bases)
   - Event handling (pitch, bat, field)
   - System orchestration

2. **BaseballPhysics** (`src/physics/BaseballPhysics.ts`):
   - Realistic ball trajectory with air drag
   - Magnus effect (spin-induced movement)
   - Pitch physics (fastball, curveball, slider, changeup)
   - Hit physics (exit velocity, launch angle, spin)

3. **AdvancedRenderer** (`src/graphics/AdvancedRenderer.ts`):
   - PBR (Physically-Based Rendering) materials
   - Dynamic lighting and shadows
   - Post-processing (bloom, DOF, color grading)
   - Platform-specific optimization

4. **FieldBuilder** (`src/graphics/FieldBuilder.ts`):
   - MLB-accurate field dimensions (90' bases, 60.5' mound)
   - Field elements (dirt, grass, bases, fences)
   - Visual details (mowing patterns, chalk lines)

5. **CameraController** (`src/camera/CameraController.ts`):
   - Multiple camera modes (pitch, bat, ball tracking, replay)
   - Smooth transitions and interpolation
   - Camera shake effects

6. **FieldingAI** (`src/ai/FieldingAI.ts`):
   - Defensive positioning (9 positions)
   - Ball reaction and pursuit
   - Catch probability calculation
   - Throw mechanics

7. **AnimationController** (`src/animation/AnimationController.ts`):
   - 11 animation types (pitch, swing, catch, run, etc.)
   - Procedural animations for placeholder meshes
   - GLB/GLTF skeletal animation support

8. **AudioManager** (`src/audio/AudioManager.ts`):
   - 22+ sound effects
   - 7 music tracks
   - 4 ambient sounds
   - Spatial 3D audio

9. **GameUI** (`src/ui/GameUI.ts`):
   - HUD (scoreboard, count, bases, outs)
   - Power meter
   - Action buttons
   - Notifications

### Data Flow

```
User Input → GameEngine → Physics/AI/Animation → Renderer → Screen
     ↑                           ↓
     └──────── Audio ←───────────┘
                 ↓
            UI Updates
```

---

## Important Configuration Files

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,              // ⚠️ Strict mode enabled
    "noUnusedLocals": false,     // Disabled for development
    "types": ["@cloudflare/workers-types"]
  }
}
```

**Key Points:**
- Strict mode is enabled - all code must be type-safe
- Cloudflare Workers types are included for Functions
- Bundler mode for Vite compatibility

### vite.config.ts

```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['@babylonjs/havok']  // ⚠️ Havok must be excluded
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'  // ⚠️ Required for SharedArrayBuffer
    }
  }
})
```

**Key Points:**
- Havok Physics requires special handling (uses WASM)
- COOP/COEP headers enable SharedArrayBuffer for physics engine
- Manual chunk splitting for better caching

### wrangler.toml

```toml
name = "sandlot-sluggers"
compatibility_date = "2024-11-06"
pages_build_output_dir = "dist"

[env.production]
# D1, KV, R2, Analytics bindings
```

**Key Points:**
- Separate production and development environments
- Bindings for D1, KV, R2 must be configured
- Database IDs must be added after creation

---

## Common Development Tasks

### Adding a New Character

1. Edit `src/data/characters.ts`
2. Add character object with stats (1-10 scale)
3. Specify `modelPath` (GLB file in R2 bucket)
4. Add unlock condition if secret character

```typescript
{
  id: "char_013",
  name: "Lightning Larry",
  battingPower: 8,
  battingAccuracy: 6,
  speed: 9,
  pitchSpeed: 7,
  pitchControl: 5,
  fieldingRange: 8,
  fieldingAccuracy: 7,
  position: "Center Field",
  modelPath: "/models/lightning_larry.glb",
  isUnlockable: true,
  unlockCondition: "Hit 5 home runs in one game"
}
```

### Adding a New Stadium

1. Edit `src/data/stadiums.ts`
2. Add stadium object with dimensions
3. Specify `modelPath` and `skyboxPath`

```typescript
{
  id: "stadium_006",
  name: "Mountain Peak",
  description: "High-altitude stadium with thin air",
  dimensions: {
    leftField: 320,
    centerField: 400,
    rightField: 315
  },
  modelPath: "/models/mountain_peak.glb",
  skyboxPath: "/textures/mountain_sky.env",
  difficulty: "hard"
}
```

### Adding a New API Endpoint

1. Create file in `functions/api/<name>.ts`
2. Export `onRequestGet` or `onRequestPost` function
3. Use environment bindings (DB, KV, R2)
4. Implement caching with KV

```typescript
// functions/api/example.ts
export async function onRequestGet(context) {
  const { env } = context;

  // Check cache
  const cached = await env.KV.get("example-key");
  if (cached) return new Response(cached);

  // Query D1
  const result = await env.DB.prepare(
    "SELECT * FROM table"
  ).all();

  // Cache and return
  const data = JSON.stringify(result);
  await env.KV.put("example-key", data, { expirationTtl: 60 });

  return new Response(data, {
    headers: { "Content-Type": "application/json" }
  });
}
```

### Integrating a New System

Follow the step-by-step guide in **INTEGRATION_GUIDE.md**. General process:

1. Import the new system in `GameEngine.ts`
2. Add as private property
3. Initialize in constructor
4. Call methods in appropriate lifecycle hooks (update loop, event handlers)
5. Test thoroughly

---

## Testing and Quality Assurance

### Manual Testing Checklist

- [ ] Game loads without console errors
- [ ] Pitching works (ball moves to home plate)
- [ ] Batting works (swing on click/tap, ball launches)
- [ ] Score updates correctly
- [ ] Inning progression works
- [ ] Balls/strikes/outs tracked properly
- [ ] UI displays correctly on mobile and desktop
- [ ] Performance is smooth (60 FPS target)
- [ ] Physics feels realistic (not too fast/slow)
- [ ] Audio plays correctly (SFX and music)

### Performance Benchmarks

- **Target FPS**: 60 FPS
- **Physics Update Rate**: 60 Hz
- **Mobile Target**: 30+ FPS on mid-range devices
- **Load Time**: <5 seconds on 4G connection
- **Asset Size**: <50MB total (before compression)

### Browser Compatibility

- **Primary**: Chrome/Edge (WebGPU support)
- **Fallback**: WebGL 2 for Firefox/Safari
- **Mobile**: iOS Safari 14+, Chrome Android 90+
- **Not Supported**: IE11, old Android browsers

---

## Deployment Process

### Prerequisites

1. Cloudflare account with Pages enabled
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Authenticated (`wrangler login`)
4. D1 database created and migrated
5. KV namespace created
6. R2 bucket created with assets uploaded

### Production Deployment Steps

```bash
# 1. Build the project
npm run build

# 2. Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=sandlot-sluggers

# 3. Configure bindings in Cloudflare Dashboard
# Pages → sandlot-sluggers → Settings → Functions
# Add: DB, KV, ASSETS, ANALYTICS bindings

# 4. Verify deployment
curl https://sandlot-sluggers.pages.dev/api/stats/global
```

### Landing Page Deployment (Vercel)

```bash
cd landing-page
npm install
npm run build

# Deploy
vercel --prod

# Set environment variables in Vercel Dashboard
NEXT_PUBLIC_API_URL=https://sandlot-sluggers.pages.dev
```

### Environment Variables

No environment variables are needed for the game itself (uses Cloudflare bindings). For the landing page:

- `NEXT_PUBLIC_API_URL` - Points to game API (production or dev)

---

## Gotchas and Important Notes

### Critical Issues to Avoid

1. **Havok Physics WASM Loading**
   - Must be excluded from Vite optimization
   - Requires COOP/COEP headers for SharedArrayBuffer
   - Never try to import synchronously

2. **TypeScript Strict Mode**
   - All code must pass strict type checking
   - No `any` types allowed
   - Use type guards for unknowns

3. **Cloudflare Bindings**
   - Only available in Pages Functions (not in client code)
   - Must be configured in Dashboard after deployment
   - Use `wrangler pages dev` for local testing with bindings

4. **Asset Paths**
   - 3D models, textures, audio must be in R2 bucket
   - Paths in code should be `/models/file.glb` (R2 serves at root)
   - Don't put large assets in `public/` folder

5. **Performance on Mobile**
   - Disable post-processing on mobile devices
   - Reduce shadow map resolution
   - Use LOD (Level of Detail) for 3D models
   - Test on actual devices, not just browser DevTools

6. **IP and Legal**
   - 100% original content only
   - No Backyard Baseball assets or character names
   - No copyrighted audio or music
   - "Inspired by" is OK, copying is not

### Common Errors and Solutions

**Error: "SharedArrayBuffer is not defined"**
- Solution: Add COOP/COEP headers in `vite.config.ts`

**Error: "Cannot find module '@babylonjs/havok'"**
- Solution: Exclude from `optimizeDeps` in Vite config

**Error: "DB is not defined" in Functions**
- Solution: Configure D1 binding in Cloudflare Dashboard

**Error: "Physics not working"**
- Solution: Ensure Havok initialized with `await HavokPhysics()`

**Error: "Build fails with TypeScript errors"**
- Solution: Fix type errors (no `any` allowed in strict mode)

---

## Database Schema

### player_progress Table

```sql
CREATE TABLE player_progress (
  player_id TEXT PRIMARY KEY,           -- UUID generated client-side
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  total_hits INTEGER DEFAULT 0,
  total_home_runs INTEGER DEFAULT 0,
  unlocked_characters TEXT DEFAULT '[]', -- JSON array
  unlocked_stadiums TEXT DEFAULT '[]',   -- JSON array
  current_level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### leaderboard Table

```sql
CREATE TABLE leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  player_name TEXT,
  stat_type TEXT NOT NULL,               -- 'wins', 'home_runs', etc.
  stat_value INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES player_progress(player_id)
);
```

---

## Useful Resources

### Documentation
- [Babylon.js Docs](https://doc.babylonjs.com/)
- [Havok Physics](https://doc.babylonjs.com/features/featuresDeepDive/physics/havok)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Project-Specific
- README.md - General information
- INTEGRATION_GUIDE.md - System integration steps
- ASSETS_GUIDE.md - Asset creation specs
- DEPLOYMENT.md - Deployment instructions
- API_DOCUMENTATION.md - API reference

---

## Quick Reference Commands

```bash
# Development
npm run dev                        # Start dev server
npm run build                      # Build for production
npm run preview                    # Preview production build

# Cloudflare
wrangler login                     # Authenticate
wrangler pages deploy dist         # Deploy to Pages
wrangler d1 execute <db> --file=schema.sql  # Run SQL
wrangler kv:key get <key>          # Get KV value
wrangler r2 object list <bucket>   # List R2 objects

# Database
wrangler d1 execute sandlot-sluggers-db --command="SELECT COUNT(*) FROM player_progress"
wrangler d1 execute sandlot-sluggers-db --command="SELECT * FROM leaderboard ORDER BY stat_value DESC LIMIT 10"

# Landing Page
cd landing-page && npm run dev     # Dev server
cd landing-page && vercel --prod   # Deploy to Vercel
```

---

## Contributing Guidelines for AI Assistants

When making changes to this codebase:

1. **Understand the Context**: Read relevant documentation (README, INTEGRATION_GUIDE, etc.) before making changes
2. **Follow Conventions**: Use established naming, file organization, and code style
3. **Type Safety**: Ensure all TypeScript code passes strict type checking
4. **Test Thoroughly**: Verify changes work in both dev and production builds
5. **Update Documentation**: If you change architecture or add features, update relevant .md files
6. **Preserve IP**: Never suggest using copyrighted content from Backyard Baseball or similar games
7. **Performance First**: Consider mobile performance impact of all changes
8. **Modular Design**: Keep systems independent and loosely coupled
9. **Comment Complex Logic**: Especially physics calculations and game mechanics
10. **Ask Before Major Changes**: If unsure about architectural decisions, ask the user first

---

## Project Status (as of November 2025)

### Completed ✅
- Core game engine with Babylon.js
- Realistic baseball physics (drag, Magnus effect)
- Advanced graphics (PBR, lighting, post-processing)
- MLB-accurate field construction
- Dynamic camera system
- Fielding AI
- Character animations (procedural + skeletal support)
- Audio system (SFX, music, ambience)
- Polished UI (HUD, notifications)
- Analytics API (4 endpoints)
- Landing page (Next.js)
- Cloudflare deployment setup

### In Progress 🔄
- 3D character models (system ready, need assets)
- 3D stadium models (system ready, need assets)
- Audio files (system ready, need assets)
- Full system integration into GameEngine

### Planned 📋
- Career mode
- Multiplayer (Durable Objects)
- Achievement system
- Character customization
- Mobile app (Capacitor/Cordova)
- Tournament mode

---

**Last Updated**: November 21, 2025
**Version**: 1.0.0
**Maintainer**: Development Team
