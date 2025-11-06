# Sandlot Sluggers - Integration Guide

## Overview

This guide explains how to integrate all the new advanced systems into the game engine. The overhaul includes:

1. **Realistic Baseball Physics** - Air drag, Magnus effect, spin dynamics
2. **Advanced Graphics** - PBR materials, lighting, shadows, post-processing
3. **Realistic Field** - Accurate MLB dimensions, detailed visual elements
4. **Dynamic Camera System** - Cinematic views, ball tracking
5. **Fielding AI** - Intelligent positioning and defensive plays
6. **Animation System** - Character animations for all actions
7. **Audio System** - Sound effects, music, ambient sounds
8. **Polished UI** - HUD, notifications, inspired by Backyard Baseball 2001

## Architecture

```
src/
├── core/
│   └── GameEngine.ts           # Main game engine (needs integration)
├── physics/
│   └── BaseballPhysics.ts      # NEW: Realistic physics simulation
├── graphics/
│   ├── AdvancedRenderer.ts     # NEW: PBR materials, lighting, effects
│   └── FieldBuilder.ts         # NEW: Realistic field construction
├── camera/
│   └── CameraController.ts     # NEW: Dynamic camera system
├── ai/
│   └── FieldingAI.ts           # NEW: Intelligent fielding
├── animation/
│   └── AnimationController.ts  # NEW: Character animations
├── audio/
│   └── AudioManager.ts         # NEW: Audio management
└── ui/
    └── GameUI.ts               # NEW: Game UI system
```

## Step 1: Update GameEngine to Use New Systems

### Import New Systems

```typescript
// Add to GameEngine.ts imports
import { BaseballPhysics, HitParameters, PitchParameters } from "../physics/BaseballPhysics";
import { AdvancedRenderer } from "../graphics/AdvancedRenderer";
import { FieldBuilder } from "../graphics/FieldBuilder";
import { CameraController } from "../camera/CameraController";
import { FieldingAI } from "../ai/FieldingAI";
import { AnimationController } from "../animation/AnimationController";
import { AudioManager } from "../audio/AudioManager";
import { GameUI } from "../ui/GameUI";
```

### Add System Instances

```typescript
export class GameEngine {
  // ... existing properties ...

  // New systems
  private physics: BaseballPhysics;
  private renderer: AdvancedRenderer;
  private fieldBuilder: FieldBuilder;
  private cameraController: CameraController;
  private fieldingAI: FieldingAI;
  private animationController: AnimationController;
  private audioManager: AudioManager;
  private gameUI: GameUI;

  // ... rest of class ...
}
```

### Initialize in Constructor

```typescript
constructor(config: GameConfig) {
  // ... existing initialization ...

  // Initialize new systems
  this.renderer = new AdvancedRenderer(this.scene, this.engine);
  this.physics = new BaseballPhysics();
  this.fieldBuilder = new FieldBuilder(this.scene, this.renderer);
  this.cameraController = new CameraController(this.scene, config.canvas);
  this.fieldingAI = new FieldingAI(this.scene);
  this.animationController = new AnimationController(this.scene);
  this.audioManager = new AudioManager(this.scene);
  this.gameUI = new GameUI();

  // Build realistic field
  this.buildRealisticField();

  // Load audio
  this.audioManager.loadAudio().then(() => {
    this.audioManager.playMusic("gameplay_upbeat");
    this.audioManager.playAmbience("stadium_crowd");
  });

  // Set up UI event handlers
  this.setupUIHandlers();
}
```

### Build Realistic Field

```typescript
private buildRealisticField(): void {
  // Use current stadium dimensions or default
  const dimensions = {
    left: 35,
    center: 40,
    right: 35
  };

  this.fieldBuilder.buildField(dimensions);

  // Load stadium skybox
  this.renderer.loadSkybox("/textures/stadium_sky.env");
}
```

### Replace Pitch Logic

```typescript
public startPitch(): void {
  if (this.isPitching || !this.pitcher) return;

  this.isPitching = true;
  this.createBall();

  if (!this.ball || !this.ballPhysics) return;

  // Play pitcher animation
  this.animationController.playAnimation(
    this.gameState.currentPitcher.id,
    "pitch_windup",
    false,
    () => {
      this.animationController.playAnimation(
        this.gameState.currentPitcher.id,
        "pitch_throw"
      );
    }
  );

  // Generate realistic pitch using new physics
  const pitchParams = this.physics.generatePitch(
    this.gameState.currentPitcher.pitchSpeed,
    this.gameState.currentPitcher.pitchControl,
    "fastball", // Can vary pitch type
    this.pitcher.position
  );

  // Calculate trajectory
  const trajectory = this.physics.calculatePitchTrajectory(pitchParams);

  // Animate ball along trajectory
  this.animateBallAlongTrajectory(trajectory);

  // Play sound
  this.audioManager.playSFX("glove_pound");

  // Camera follows pitch
  this.cameraController.toPitchView(800);
}
```

### Replace Hit Logic

```typescript
private executeHit(contactQuality: number, power: number, accuracy: number): void {
  if (!this.ball || !this.ballPhysics) return;

  // Play bat animation
  this.animationController.playAnimation(
    this.gameState.currentBatter.id,
    contactQuality > 0.5 ? "bat_hit" : "bat_miss"
  );

  // Generate realistic hit
  const hitParams = this.physics.generateHit(
    contactQuality,
    power,
    accuracy,
    70 // Assume 70 mph pitch
  );

  // Calculate trajectory
  const trajectory = this.physics.calculateHitTrajectory(
    hitParams,
    this.ball.position
  );

  // Animate ball
  this.animateBallAlongTrajectory(trajectory);

  // Play sound based on contact quality
  if (contactQuality > 0.8) {
    this.audioManager.playSFX("bat_crack_homerun");
    this.cameraController.shake(0.8, 200);
  } else if (contactQuality > 0.3) {
    this.audioManager.playSFX("bat_crack");
  } else {
    this.audioManager.playSFX("bat_miss");
  }

  // Camera follows ball
  this.cameraController.followBall(true);
  this.cameraController.setBall(this.ball);

  // Fielders react
  const distance = BaseballPhysics.getDistanceTraveled(trajectory);
  const hangTime = BaseballPhysics.getHangTime(trajectory);

  const fieldingResult = this.fieldingAI.reactToBattedBall({
    points: trajectory,
    landingPoint: trajectory[trajectory.length - 1],
    hangTime,
    exitVelocity: hitParams.exitVelocity,
    launchAngle: hitParams.launchAngle
  });

  // Track for result
  this.trackBallForFielding();
}
```

### Animate Ball Along Trajectory

```typescript
private animateBallAlongTrajectory(trajectory: Vector3[]): void {
  if (!this.ball) return;

  const fps = 60;
  const frameTime = 1000 / fps;
  let currentFrame = 0;

  const animate = () => {
    if (!this.ball || currentFrame >= trajectory.length) {
      return;
    }

    this.ball.position = trajectory[currentFrame];
    currentFrame++;

    setTimeout(animate, frameTime);
  };

  animate();
}
```

### Update UI in Game Loop

```typescript
private updateGameState(): void {
  this.gameUI.updateScoreboard(
    this.gameState.awayScore,
    this.gameState.homeScore,
    this.gameState.inning,
    this.gameState.isTopOfInning
  );

  this.gameUI.updateCount(
    this.gameState.balls,
    this.gameState.strikes
  );

  this.gameUI.updateBases(this.gameState.bases);
  this.gameUI.updateOuts(this.gameState.outs);

  this.onStateChange(this.gameState);
}
```

### Add Fielding Check

```typescript
private trackBallForFielding(): void {
  const checkInterval = setInterval(() => {
    if (!this.ball) {
      clearInterval(checkInterval);
      return;
    }

    // Check if fielder can catch
    const catchResult = this.fieldingAI.checkForCatch(this.ball.position);

    if (catchResult.caught) {
      clearInterval(checkInterval);

      // Play catch animation and sound
      if (catchResult.fielder) {
        this.animationController.playAnimation(
          catchResult.fielder.player.id,
          "catch"
        );
      }

      this.audioManager.playSFX("catch", 1.0, this.ball.position);
      this.audioManager.playCommentary("great_catch");

      this.gameUI.showNotification("OUT!", 2000, "error");
      this.registerOut("caught");

      // Camera to fielding view
      if (catchResult.fielder) {
        this.cameraController.toFieldingView(
          catchResult.fielder.mesh.position,
          this.ball.position,
          800
        );
      }

      return;
    }

    // Ball hit ground
    if (this.ball.position.y < 0.2) {
      clearInterval(checkInterval);
      this.determineBallInPlay();
    }

    // Ball out of play (home run)
    if (this.ball.position.z > 40 || Math.abs(this.ball.position.x) > 40) {
      clearInterval(checkInterval);
      this.registerHomeRun();
    }
  }, 50);
}
```

### Handle Home Runs

```typescript
private registerHomeRun(): void {
  this.advanceRunners(4);

  // Special home run effects
  this.gameUI.showNotification("HOME RUN!", 3000, "homerun");
  this.audioManager.playCommentary("homerun");
  this.cameraController.homeRunCamera(this.ball!.position);

  // Celebration animation
  this.animationController.playAnimation(
    this.gameState.currentBatter.id,
    "celebrate",
    true
  );

  setTimeout(() => {
    this.cameraController.toOverview(1500);
  }, 3000);
}
```

### Setup UI Handlers

```typescript
private setupUIHandlers(): void {
  const pitchBtn = this.gameUI.getPitchButton();
  if (pitchBtn) {
    pitchBtn.addEventListener("click", () => {
      this.startPitch();
      this.audioManager.playSFX("button_click");
    });
  }

  const pauseBtn = this.gameUI.getPauseButton();
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      // Implement pause logic
      this.audioManager.playSFX("menu_select");
    });
  }
}
```

### Update Game Loop

```typescript
private update(): void {
  const deltaTime = this.engine.getDeltaTime() / 1000; // Convert to seconds

  // Update fielders
  this.fieldingAI.update(deltaTime);

  // Update camera if following ball
  // (handled automatically by camera controller)
}
```

### Dispose All Systems

```typescript
public dispose(): void {
  this.cameraController.dispose();
  this.fieldingAI.dispose();
  this.animationController.dispose();
  this.audioManager.dispose();
  this.gameUI.dispose();
  this.renderer.dispose();

  this.scene.dispose();
  this.engine.dispose();
}
```

## Step 2: Update index.html

Replace the basic UI in `index.html` with minimal structure since GameUI handles everything:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sandlot Sluggers - Backyard Baseball</title>
  <link rel="manifest" href="/manifest.json">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
      overflow: hidden;
      background: #000;
    }

    #renderCanvas {
      width: 100%;
      height: 100vh;
      display: block;
      touch-action: none;
    }

    #loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a5490 0%, #2d7cbc 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    #loading-screen h1 {
      color: #ffd700;
      font-size: 48px;
      text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
      margin-bottom: 30px;
    }

    .spinner {
      border: 8px solid rgba(255,255,255,0.3);
      border-top: 8px solid #ffd700;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="loading-screen">
    <h1>⚾ SANDLOT SLUGGERS ⚾</h1>
    <div class="spinner"></div>
    <p style="color: white; margin-top: 20px; font-size: 18px;">Loading the field...</p>
  </div>

  <canvas id="renderCanvas"></canvas>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

## Step 3: Update main.ts

```typescript
import { GameEngine } from "./core/GameEngine";

// Show loading screen
const loadingScreen = document.getElementById("loading-screen");

// Initialize game
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

const gameEngine = new GameEngine({
  canvas,
  onGameStateChange: (state) => {
    console.log("Game state updated:", state);
  }
});

// Hide loading screen after initialization
setTimeout(() => {
  if (loadingScreen) {
    loadingScreen.style.opacity = "0";
    loadingScreen.style.transition = "opacity 0.5s";
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }
}, 2000);

// Handle window close
window.addEventListener("beforeunload", () => {
  gameEngine.dispose();
});
```

## Step 4: Asset Pipeline Setup

### Create Asset Directory Structure

```
public/
├── audio/
│   ├── sfx/
│   │   ├── bat_crack.mp3
│   │   ├── bat_crack_homerun.mp3
│   │   ├── catch.mp3
│   │   └── ... (all other sound effects)
│   ├── music/
│   │   ├── main_menu.mp3
│   │   ├── gameplay_upbeat.mp3
│   │   └── ... (all music tracks)
│   └── ambience/
│       ├── stadium_crowd.mp3
│       ├── birds.mp3
│       └── ... (ambient sounds)
├── models/
│   ├── characters/
│   │   ├── rocket_rodriguez.glb
│   │   ├── ace_mckenzie.glb
│   │   └── ... (all character models)
│   └── stadiums/
│       ├── dusty_acres.glb
│       ├── frostbite_field.glb
│       └── ... (all stadium models)
├── textures/
│   ├── stadium_sky.env
│   ├── field_diffuse.jpg
│   ├── field_normal.jpg
│   └── ... (textures)
└── icons/
    ├── icon-192x192.png
    └── icon-512x512.png
```

### Upload Assets to Cloudflare R2

```bash
# Upload all assets to R2 bucket
wrangler r2 object put sandlot-sluggers-assets/audio --dir=./public/audio
wrangler r2 object put sandlot-sluggers-assets/models --dir=./public/models
wrangler r2 object put sandlot-sluggers-assets/textures --dir=./public/textures
```

## Step 5: Performance Optimization

### Detect Platform and Optimize

```typescript
// Add to GameEngine constructor
const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
this.renderer.optimizeForPlatform(isMobile);

if (isMobile) {
  // Reduce shadow quality
  // Disable some post-processing
  // Lower texture resolution
}
```

### Progressive Loading

Load assets progressively based on priority:

1. Essential gameplay assets first
2. Audio next
3. High-quality textures last
4. Stadium models on demand

## Testing

1. **Physics**: Test pitch trajectories and hit distances
2. **Graphics**: Verify lighting, shadows, and materials
3. **Camera**: Test all camera modes
4. **AI**: Verify fielders react appropriately
5. **Audio**: Check all sound effects trigger correctly
6. **UI**: Test all HUD elements update properly

## Next Steps

1. Create actual 3D models for characters
2. Record/source audio files
3. Fine-tune physics parameters
4. Add multiplayer support
5. Implement career mode
6. Add achievement system

## Troubleshooting

### Physics Not Working
- Check Havok WASM loaded correctly
- Verify CORS headers in vite.config.ts

### Graphics Issues
- Check WebGL 2.0 support
- Verify PBR materials have proper values
- Check shadow generator map size

### Audio Not Playing
- Ensure audio files are in correct format (MP3/OGG)
- Check browser autoplay policies
- Verify R2 bucket CORS settings

### UI Not Showing
- Check z-index values
- Verify pointer-events settings
- Check console for JavaScript errors

## Support

For issues or questions:
- GitHub: https://github.com/ahump20/Sandlot-Sluggers/issues
- Discord: [Your Discord Server]
- Email: support@sandlotslugging.com
