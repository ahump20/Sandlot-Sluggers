import {
  Engine,
  Scene,
  Vector3,
  HavokPlugin,
  Mesh,
  AbstractMesh,
  MeshBuilder,
  StandardMaterial,
  Color3
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { BaseballPhysics, HitParameters, PitchParameters } from "../physics/BaseballPhysics";
import { AdvancedRenderer } from "../graphics/AdvancedRenderer";
import { FieldBuilder } from "../graphics/FieldBuilder";
import { CameraController } from "../camera/CameraController";
import { FieldingAI } from "../ai/FieldingAI";
import { AnimationController } from "../animation/AnimationController";
import { AudioManager } from "../audio/AudioManager";
import { GameUI } from "../ui/GameUI";

export interface GameConfig {
  canvas: HTMLCanvasElement;
  onGameStateChange: (state: GameState) => void;
}

export interface GameState {
  inning: number;
  outs: number;
  homeScore: number;
  awayScore: number;
  isTopOfInning: boolean;
  bases: [boolean, boolean, boolean]; // 1st, 2nd, 3rd
  currentBatter: Player;
  currentPitcher: Player;
  balls: number;
  strikes: number;
}

export interface Player {
  id: string;
  name: string;
  battingPower: number; // 1-10
  battingAccuracy: number; // 1-10
  speed: number; // 1-10
  pitchSpeed: number; // 1-10
  pitchControl: number; // 1-10
  fieldingRange: number; // 1-10
  fieldingAccuracy: number; // 1-10
  position: string;
  modelPath: string;
}

export interface Stadium {
  id: string;
  name: string;
  description: string;
  dimensions: {
    leftField: number;
    centerField: number;
    rightField: number;
  };
  modelPath: string;
  skyboxPath: string;
}

export class GameEngine {
  private engine: Engine;
  private scene: Scene;
  private gameState: GameState;
  private havokInstance: any;
  private ball: Mesh | null = null;
  private pitcher: AbstractMesh | null = null;
  private batter: AbstractMesh | null = null;
  private isPitching: boolean = false;
  private isBatting: boolean = false;
  private onStateChange: (state: GameState) => void;

  // Advanced systems
  private physics: BaseballPhysics;
  private renderer: AdvancedRenderer;
  private fieldBuilder: FieldBuilder;
  private cameraController: CameraController;
  private fieldingAI: FieldingAI;
  private animationController: AnimationController;
  private audioManager: AudioManager;
  private gameUI: GameUI;

  // Ball trajectory tracking
  private ballTrajectory: Vector3[] = [];
  private currentTrajectoryFrame: number = 0;

  constructor(config: GameConfig) {
    this.engine = new Engine(config.canvas, true, {
      adaptToDeviceRatio: true,
      powerPreference: "high-performance"
    });
    this.scene = new Scene(this.engine);
    this.onStateChange = config.onGameStateChange;

    this.gameState = {
      inning: 1,
      outs: 0,
      homeScore: 0,
      awayScore: 0,
      isTopOfInning: true,
      bases: [false, false, false],
      currentBatter: this.createDefaultPlayer("batter"),
      currentPitcher: this.createDefaultPlayer("pitcher"),
      balls: 0,
      strikes: 0
    };

    // Initialize advanced systems
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

    // Set up UI event handlers
    this.setupUIHandlers();

    // Initialize physics and load assets
    void this.initialize();

    this.engine.runRenderLoop(() => {
      this.scene.render();
      this.update();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private async initialize(): Promise<void> {
    await this.initializePhysics();
    await this.loadAudio();
    this.setupInputHandlers();
    await this.loadPlayers();
  }

  private buildRealisticField(): void {
    // Use default stadium dimensions
    const dimensions = {
      left: 35,
      center: 40,
      right: 35
    };

    this.fieldBuilder.buildField(dimensions);
  }

  private async loadAudio(): Promise<void> {
    try {
      await this.audioManager.loadAudio();
      this.audioManager.playMusic("gameplay_upbeat");
      this.audioManager.playAmbience("stadium_crowd");
    } catch (error) {
      console.warn("Audio loading failed:", error);
    }
  }

  private async loadPlayers(): Promise<void> {
    // Load pitcher and batter
    await this.loadPlayer(
      this.gameState.currentPitcher,
      new Vector3(0, 0, 18.44),
      "pitcher"
    );
    await this.loadPlayer(
      this.gameState.currentBatter,
      new Vector3(0, 0, 0),
      "batter"
    );

    // Position camera targets
    this.cameraController.setPitcherPosition(new Vector3(0, 0, 18.44));
    this.cameraController.setBatterPosition(new Vector3(0, 0, 0));

    // Load fielders (one at a time with positions)
    const positions = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];
    positions.forEach(pos => {
      const player = this.createDefaultPlayer(pos);
      const mesh = MeshBuilder.CreateCapsule(`fielder_${pos}`, {
        radius: 0.5,
        height: 2
      }, this.scene);
      this.fieldingAI.addFielder(player, mesh);
    });
  }

  private async initializePhysics(): Promise<void> {
    this.havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, this.havokInstance);
    this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
  }

  private createDefaultPlayer(positionType: string): Player {
    const positionNames: Record<string, string> = {
      batter: "Rookie Slugger",
      pitcher: "Ace Pitcher",
      P: "Pitcher",
      C: "Catcher",
      "1B": "First Baseman",
      "2B": "Second Baseman",
      "3B": "Third Baseman",
      SS: "Shortstop",
      LF: "Left Fielder",
      CF: "Center Fielder",
      RF: "Right Fielder"
    };

    return {
      id: `player_${positionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: positionNames[positionType] || "Player",
      battingPower: 5,
      battingAccuracy: 5,
      speed: 5,
      pitchSpeed: 5,
      pitchControl: 5,
      fieldingRange: 5,
      fieldingAccuracy: 5,
      position: positionType === "batter" ? "C" : positionType,
      modelPath: `/models/${positionType}.glb`
    };
  }

  public async loadPlayer(player: Player, position: Vector3, role: "pitcher" | "batter"): Promise<void> {
    // Simplified player representation - will be replaced with actual model loading
    const playerMesh = MeshBuilder.CreateCapsule(`${role}_${player.id}`, {
      radius: 0.5,
      height: 2
    }, this.scene);
    playerMesh.position = position;

    const playerMat = new StandardMaterial(`${role}Mat`, this.scene);
    playerMat.diffuseColor = role === "pitcher" ?
      new Color3(0.2, 0.2, 0.8) : new Color3(0.8, 0.2, 0.2);
    playerMesh.material = playerMat;

    // Enable shadows
    this.renderer.addShadowCaster(playerMesh);

    if (role === "pitcher") {
      this.pitcher = playerMesh;
    } else {
      this.batter = playerMesh;
    }
  }

  private createBall(): void {
    if (this.ball) {
      this.ball.dispose();
    }

    this.ball = MeshBuilder.CreateSphere("ball", {
      diameter: 0.0732 // Realistic baseball diameter (0.0732m = 2.88in)
    }, this.scene);
    const ballMat = new StandardMaterial("ballMat", this.scene);
    ballMat.diffuseColor = new Color3(1, 1, 1);
    this.ball.material = ballMat;

    // Enable shadows
    this.renderer.addShadowCaster(this.ball);

    // Set ball for camera tracking
    this.cameraController.setBall(this.ball);
  }

  private setupUIHandlers(): void {
    // Pitch button handler
    const pitchBtn = this.gameUI.getPitchButton();
    if (pitchBtn) {
      pitchBtn.addEventListener("click", () => {
        this.startPitch();
        this.audioManager.playSFX("button_click", 0.5);
      });
    }

    // Pause button handler
    const pauseBtn = this.gameUI.getPauseButton();
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        // TODO: Implement pause logic
        this.audioManager.playSFX("menu_select", 0.5);
        console.log("Pause requested");
      });
    }
  }

  private setupInputHandlers(): void {
    this.scene.onPointerDown = (evt) => {
      if (evt.button === 0) { // Left click/tap
        this.handleBatSwing();
      }
    };

    // Mobile swipe for fielding
    let touchStartX = 0;
    let touchStartY = 0;

    this.engine.getRenderingCanvas()?.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    this.engine.getRenderingCanvas()?.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
        this.handleFieldingSwipe(deltaX, deltaY);
      }
    });
  }

  public startPitch(): void {
    if (this.isPitching || !this.pitcher) return;

    this.isPitching = true;
    this.createBall();

    if (!this.ball) return;

    // Position ball at pitcher's hand
    this.ball.position = this.pitcher.position.clone();
    this.ball.position.y += 1.5;

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

    // Generate realistic pitch using advanced physics
    const pitchTypes = ["fastball", "curveball", "slider", "changeup"] as const;
    const pitchType = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];

    const pitchParams = this.physics.generatePitch(
      this.gameState.currentPitcher.pitchSpeed,
      this.gameState.currentPitcher.pitchControl,
      pitchType,
      this.ball.position
    );

    // Calculate trajectory
    this.ballTrajectory = this.physics.calculatePitchTrajectory(pitchParams);
    this.currentTrajectoryFrame = 0;

    // Play sound
    this.audioManager.playSFX("glove_pound", 0.6);

    // Camera follows pitch
    this.cameraController.toPitchView(800);

    // Start animating ball
    this.animateBallAlongTrajectory();

    // Check if pitch crosses plate
    setTimeout(() => {
      this.checkPitchResult();
    }, 800);
  }

  private handleBatSwing(): void {
    if (!this.isBatting || !this.ball || !this.batter) return;

    // Calculate timing and contact quality
    const ballPos = this.ball.position;
    const batterPos = this.batter.position;
    const distance = Vector3.Distance(ballPos, batterPos);

    // Contact zones
    const perfectZone = 1.5; // Perfect contact bonus
    const contactZone = 3.0; // Maximum contact range

    if (distance < contactZone) {
      // Calculate contact quality (0-1)
      let contactQuality = 1 - (distance / contactZone);

      // Perfect zone bonus
      if (distance < perfectZone) {
        contactQuality = Math.min(1.0, contactQuality * 1.2);
      }

      const power = this.gameState.currentBatter.battingPower;
      const accuracy = this.gameState.currentBatter.battingAccuracy;

      // Hit!
      this.executeHit(contactQuality, power, accuracy);
    } else {
      // Swing and miss
      this.animationController.playAnimation(
        this.gameState.currentBatter.id,
        "bat_miss"
      );
      this.audioManager.playSFX("bat_miss", 0.8);
      this.registerStrike();
    }
  }

  private executeHit(contactQuality: number, power: number, accuracy: number): void {
    if (!this.ball) return;

    // Play bat animation based on contact quality
    this.animationController.playAnimation(
      this.gameState.currentBatter.id,
      contactQuality > 0.5 ? "bat_hit" : "bat_swing"
    );

    // Generate realistic hit using advanced physics
    const hitParams = this.physics.generateHit(
      contactQuality,
      power,
      accuracy,
      70 // Assume 70 mph pitch speed for now
    );

    // Calculate trajectory
    this.ballTrajectory = this.physics.calculateHitTrajectory(
      hitParams,
      this.ball.position
    );
    this.currentTrajectoryFrame = 0;

    // Play sound based on contact quality
    if (contactQuality > 0.8) {
      this.audioManager.playSFX("bat_crack_homerun", 1.0);
      this.cameraController.shake(0.8, 200);
    } else if (contactQuality > 0.3) {
      this.audioManager.playSFX("bat_crack", 0.8);
      this.cameraController.shake(0.3, 100);
    } else {
      this.audioManager.playSFX("bat_crack", 0.5);
    }

    // Camera follows ball
    this.cameraController.followBall(true);

    this.isBatting = false;

    // Fielders react
    const distance = BaseballPhysics.getDistanceTraveled(this.ballTrajectory);
    const hangTime = BaseballPhysics.getHangTime(this.ballTrajectory);

    this.fieldingAI.reactToBattedBall({
      points: this.ballTrajectory,
      landingPoint: this.ballTrajectory[this.ballTrajectory.length - 1],
      hangTime,
      exitVelocity: hitParams.exitVelocity,
      launchAngle: hitParams.launchAngle
    });

    // Start animating ball and tracking for fielding
    this.animateBallAlongTrajectory();
    this.trackBallForFielding();
  }

  private animateBallAlongTrajectory(): void {
    if (!this.ball || this.currentTrajectoryFrame >= this.ballTrajectory.length) {
      return;
    }

    const fps = 60;
    const frameTime = 1000 / fps;

    const animate = () => {
      if (!this.ball || this.currentTrajectoryFrame >= this.ballTrajectory.length) {
        return;
      }

      this.ball.position = this.ballTrajectory[this.currentTrajectoryFrame];
      this.currentTrajectoryFrame++;

      if (this.currentTrajectoryFrame < this.ballTrajectory.length) {
        setTimeout(animate, frameTime);
      }
    };

    animate();
  }

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

          // Camera to fielding view
          this.cameraController.toFieldingView(
            catchResult.fielder.mesh.position,
            this.ball.position,
            800
          );
        }

        this.audioManager.playSFX("catch", 1.0, this.ball.position);
        this.audioManager.playCommentary("great_catch");
        this.gameUI.showNotification("OUT!", 2000, "error");

        this.registerOut("flyout");
        return;
      }

      // Ball hit ground
      if (this.ball.position.y < 0.2) {
        clearInterval(checkInterval);
        this.audioManager.playSFX("ball_land", 0.6, this.ball.position);
        this.determineBallInPlay();
      }

      // Ball out of play (home run)
      if (this.ball.position.z > 40 || Math.abs(this.ball.position.x) > 40) {
        clearInterval(checkInterval);
        this.registerHomeRun();
      }
    }, 50);
  }

  private determineBallInPlay(): void {
    if (!this.ball) return;

    const ballPos = this.ball.position;
    const distanceFromHome = Math.sqrt(
      ballPos.x * ballPos.x + ballPos.z * ballPos.z
    );

    // Simple fielding outcome based on distance
    if (distanceFromHome < 15) {
      this.audioManager.playSFX("crowd_aww");
      this.gameUI.showNotification("Ground Out", 2000, "default");
      this.registerOut("groundout");
    } else if (distanceFromHome < 25) {
      this.audioManager.playSFX("crowd_cheer");
      this.gameUI.showNotification("Single!", 2000, "success");
      this.advanceRunners(1);
    } else if (distanceFromHome < 35) {
      this.audioManager.playSFX("crowd_cheer");
      this.gameUI.showNotification("Double!", 2000, "success");
      this.advanceRunners(2);
    } else {
      this.audioManager.playSFX("crowd_cheer");
      this.gameUI.showNotification("Triple!", 2500, "success");
      this.advanceRunners(3);
    }

    // Camera back to overview after play
    setTimeout(() => {
      this.cameraController.toOverview(1000);
    }, 2000);
  }

  private handleFieldingSwipe(deltaX: number, deltaY: number): void {
    // Implement fielding mechanics for manual fielding
    // This could be used for player-controlled fielding in future
    if (!this.ball) return;

    const swipeStrength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const swipeAngle = Math.atan2(deltaY, deltaX);

    // Play sound feedback
    if (swipeStrength > 100) {
      this.audioManager.playSFX("button_click", 0.4);
    }

    // Log for future implementation
    console.log(`Fielding swipe - Strength: ${swipeStrength}, Angle: ${swipeAngle}`);
  }

  private checkPitchResult(): void {
    if (!this.ball) return;

    const ballPos = this.ball.position;

    // Strike zone check (simplified)
    const inStrikeZone =
      Math.abs(ballPos.x) < 0.5 &&
      ballPos.y > 0.5 &&
      ballPos.y < 1.8 &&
      Math.abs(ballPos.z) < 0.3;

    if (inStrikeZone) {
      this.isBatting = true;
      // Wait for player to swing or let it pass
      setTimeout(() => {
        if (this.isBatting) {
          this.registerStrike();
        }
      }, 500);
    } else {
      this.registerBall();
    }

    this.isPitching = false;
  }

  private registerStrike(): void {
    this.gameState.strikes++;
    this.audioManager.playSFX("umpire_strike", 0.6);

    if (this.gameState.strikes >= 3) {
      this.gameUI.showNotification("Strike 3! You're Out!", 2000, "error");
      this.registerOut("strikeout");
    } else {
      this.gameUI.showNotification(`Strike ${this.gameState.strikes}`, 1500, "default");
    }

    this.updateGameState();
  }

  private registerBall(): void {
    this.gameState.balls++;
    this.audioManager.playSFX("umpire_ball", 0.6);

    if (this.gameState.balls >= 4) {
      this.gameUI.showNotification("Walk!", 2000, "success");
      this.audioManager.playSFX("crowd_cheer", 0.5);
      this.advanceRunners(1); // Walk
    } else {
      this.gameUI.showNotification(`Ball ${this.gameState.balls}`, 1500, "default");
    }

    this.updateGameState();
  }

  private registerOut(outType: string): void {
    this.gameState.outs++;
    this.resetCount();

    // Log out type for stats tracking
    console.log(`Out recorded: ${outType}`);
    // TODO: Send to analytics API when implemented

    if (this.gameState.outs >= 3) {
      this.audioManager.playSFX("umpire_out", 0.7);
      this.gameUI.showNotification("3 Outs! End of inning", 2500, "default");
      setTimeout(() => {
        this.endInning();
      }, 2000);
    } else {
      this.audioManager.playSFX("umpire_out", 0.6);
    }

    this.updateGameState();
  }

  private advanceRunners(bases: number): void {
    let runsScored = 0;

    // Move runners
    for (let i = 2; i >= 0; i--) {
      if (this.gameState.bases[i]) {
        const newBase = i + bases;
        if (newBase >= 3) {
          runsScored++;
          this.gameState.bases[i] = false;
        } else {
          this.gameState.bases[newBase] = true;
          this.gameState.bases[i] = false;
        }
      }
    }

    // Batter to first (or further)
    if (bases === 1) {
      this.gameState.bases[0] = true;
    } else if (bases === 2) {
      this.gameState.bases[1] = true;
    } else if (bases === 3) {
      this.gameState.bases[2] = true;
    } else if (bases === 4) {
      runsScored++; // Batter scores
    }

    // Update score
    if (this.gameState.isTopOfInning) {
      this.gameState.awayScore += runsScored;
    } else {
      this.gameState.homeScore += runsScored;
    }

    // Play sound for runs scored
    if (runsScored > 0) {
      this.audioManager.playSFX("crowd_cheer");
    }

    this.resetCount();
    this.updateGameState();
  }

  private registerHomeRun(): void {
    // Special home run effects
    this.gameUI.showNotification("HOME RUN!", 3000, "homerun");
    this.audioManager.playCommentary("homerun");
    this.audioManager.playSFX("crowd_cheer", 1.0);

    if (this.ball) {
      this.cameraController.homeRunCamera(this.ball.position);
    }

    // Celebration animation
    this.animationController.playAnimation(
      this.gameState.currentBatter.id,
      "celebrate",
      true
    );

    this.advanceRunners(4);

    // Return camera to overview
    setTimeout(() => {
      this.cameraController.toOverview(1500);
    }, 3000);
  }

  private resetCount(): void {
    this.gameState.balls = 0;
    this.gameState.strikes = 0;
  }

  private endInning(): void {
    this.gameState.outs = 0;
    this.gameState.bases = [false, false, false];

    if (this.gameState.isTopOfInning) {
      this.gameState.isTopOfInning = false;
      this.gameUI.showNotification("Bottom of inning ▼", 2500, "default");
    } else {
      this.gameState.isTopOfInning = true;
      this.gameState.inning++;
      this.gameUI.showNotification(`Inning ${this.gameState.inning} ▲`, 2500, "default");

      // Check for game end (9 innings)
      if (this.gameState.inning > 9) {
        this.endGame();
        return;
      }
    }

    this.resetCount();
    this.updateGameState();

    // Camera back to overview
    this.cameraController.toOverview(1000);
  }

  private endGame(): void {
    const homeWins = this.gameState.homeScore > this.gameState.awayScore;
    const message = homeWins
      ? `Home Team Wins! ${this.gameState.homeScore} - ${this.gameState.awayScore}`
      : `Away Team Wins! ${this.gameState.awayScore} - ${this.gameState.homeScore}`;

    this.gameUI.showNotification(message, 5000, homeWins ? "success" : "error");

    if (homeWins) {
      this.audioManager.playMusic("victory", 0.5);
    } else {
      this.audioManager.playMusic("defeat", 0.5);
    }

    console.log("Game ended:", message);
    
    // Emit final game state to observers
    this.updateGameState();
    
    // TODO: Send final stats to API
  }

  private updateGameState(): void {
    // Update UI
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

    // Notify state change callback
    this.onStateChange(this.gameState);
  }

  private update(): void {
    const deltaTime = this.engine.getDeltaTime() / 1000; // Convert to seconds

    // Update fielding AI
    this.fieldingAI.update(deltaTime);

    // Camera updates are handled automatically by camera controller
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public dispose(): void {
    // Dispose all systems
    this.cameraController.dispose();
    this.fieldingAI.dispose();
    this.animationController.dispose();
    this.audioManager.dispose();
    this.gameUI.dispose();
    this.renderer.dispose();

    // Dispose Babylon.js resources
    this.scene.dispose();
    this.engine.dispose();
  }
}
