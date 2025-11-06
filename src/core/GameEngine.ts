import {
  Engine,
  Scene,
  Vector3,
  MeshBuilder,
  Color3,
  PhysicsAggregate,
  PhysicsShapeType,
  HavokPlugin,
  Mesh,
  AbstractMesh
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
  // Core Babylon.js
  private engine: Engine;
  private scene: Scene;
  private havokInstance: any;

  // New Advanced Systems
  private physics: BaseballPhysics;
  private renderer: AdvancedRenderer;
  private fieldBuilder: FieldBuilder;
  private cameraController: CameraController;
  private fieldingAI: FieldingAI;
  private animationController: AnimationController;
  private audioManager: AudioManager;
  private gameUI: GameUI;

  // Game State
  private gameState: GameState;
  private onStateChange: (state: GameState) => void;

  // Game Objects
  private ball: Mesh | null = null;
  private ballPhysics: PhysicsAggregate | null = null;
  private pitcher: AbstractMesh | null = null;
  private batter: AbstractMesh | null = null;

  // Game Flow
  private isPitching: boolean = false;
  private isBatting: boolean = false;
  private currentPitchType: "fastball" | "curveball" | "slider" | "changeup" = "fastball";
  private ballTrajectory: Vector3[] = [];
  private lastFrameTime: number = 0;

  constructor(config: GameConfig) {
    // Initialize Babylon engine
    this.engine = new Engine(config.canvas, true, {
      adaptToDeviceRatio: true,
      powerPreference: "high-performance"
    });
    this.scene = new Scene(this.engine);
    this.onStateChange = config.onGameStateChange;

    // Initialize game state
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

    // Initialize all new systems
    this.renderer = new AdvancedRenderer(this.scene, this.engine);
    this.physics = new BaseballPhysics();
    this.fieldBuilder = new FieldBuilder(this.scene, this.renderer);
    this.cameraController = new CameraController(this.scene, config.canvas);
    this.fieldingAI = new FieldingAI(this.scene);
    this.animationController = new AnimationController(this.scene);
    this.audioManager = new AudioManager(this.scene);
    this.gameUI = new GameUI();

    // Initialize physics and build field
    this.initializeGame();

    // Start render loop
    this.engine.runRenderLoop(() => {
      const currentTime = Date.now();
      const deltaTime = this.lastFrameTime > 0 ? (currentTime - this.lastFrameTime) / 1000 : 0;
      this.lastFrameTime = currentTime;

      this.scene.render();
      this.update(deltaTime);
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private async initializeGame(): Promise<void> {
    // Initialize Havok physics
    this.havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, this.havokInstance);
    this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

    // Build realistic field
    const stadium = {
      left: 35,
      center: 40,
      right: 35
    };
    this.fieldBuilder.buildField(stadium);

    // Load skybox (fallback to procedural if not available)
    try {
      await this.renderer.loadSkybox("/textures/stadium_sky.env");
    } catch (err) {
      console.log("Using procedural skybox");
    }

    // Detect platform and optimize
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.renderer.optimizeForPlatform(isMobile);

    // Load audio assets
    await this.audioManager.loadAudio();

    // Start ambient sounds
    this.audioManager.playAmbience("stadium_crowd");
    this.audioManager.playMusic("gameplay_upbeat");

    // Create players
    await this.createPlayers();

    // Setup UI handlers
    this.setupUIHandlers();

    // Initialize game state UI
    this.updateGameState();

    // Hide loading screen
    setTimeout(() => {
      const loadingScreen = document.getElementById("loading-screen");
      if (loadingScreen) {
        loadingScreen.classList.add("hidden");
      }
    }, 1000);
  }

  private async createPlayers(): Promise<void> {
    // Create pitcher
    const pitcherMesh = MeshBuilder.CreateCapsule("pitcher", {
      radius: 0.5,
      height: 2
    }, this.scene);
    pitcherMesh.position = new Vector3(0, 1, 18.44);

    const pitcherMat = this.renderer.createCharacterMaterial(
      "pitcherMat",
      new Color3(0.2, 0.4, 0.8)
    );
    pitcherMesh.material = pitcherMat;
    this.pitcher = pitcherMesh;
    this.renderer.addShadowCaster(pitcherMesh);

    // Load animations
    this.animationController.loadAnimationsForCharacter(
      this.gameState.currentPitcher.id,
      pitcherMesh
    );
    this.animationController.playAnimation(
      this.gameState.currentPitcher.id,
      "idle",
      true
    );

    // Create batter
    const batterMesh = MeshBuilder.CreateCapsule("batter", {
      radius: 0.5,
      height: 2
    }, this.scene);
    batterMesh.position = new Vector3(0.5, 1, -1);

    const batterMat = this.renderer.createCharacterMaterial(
      "batterMat",
      new Color3(0.8, 0.2, 0.2)
    );
    batterMesh.material = batterMat;
    this.batter = batterMesh;
    this.renderer.addShadowCaster(batterMesh);

    // Load animations
    this.animationController.loadAnimationsForCharacter(
      this.gameState.currentBatter.id,
      batterMesh
    );
    this.animationController.playAnimation(
      this.gameState.currentBatter.id,
      "bat_stance",
      true
    );

    // Create fielders (simplified - 9 positions)
    const fielderPositions: { [key: string]: Vector3 } = {
      "P": new Vector3(0, 1, 18.44),
      "C": new Vector3(0, 1, -2),
      "1B": new Vector3(22, 1, 22),
      "2B": new Vector3(8, 1, 28),
      "3B": new Vector3(-22, 1, 22),
      "SS": new Vector3(-8, 1, 28),
      "LF": new Vector3(-35, 1, 45),
      "CF": new Vector3(0, 1, 60),
      "RF": new Vector3(35, 1, 45)
    };

    Object.entries(fielderPositions).forEach(([pos, position]) => {
      if (pos === "P") return; // Already created pitcher

      const fielder = this.createDefaultPlayer(pos);
      const fielderMesh = MeshBuilder.CreateCapsule(`fielder_${pos}`, {
        radius: 0.4,
        height: 1.8
      }, this.scene);
      fielderMesh.position = position;

      const fielderMat = this.renderer.createCharacterMaterial(
        `fielder_${pos}_mat`,
        new Color3(0.3, 0.6, 0.3)
      );
      fielderMesh.material = fielderMat;
      this.renderer.addShadowCaster(fielderMesh);

      this.fieldingAI.addFielder(fielder, fielderMesh);
    });

    // Set camera positions
    this.cameraController.setPitcherPosition(pitcherMesh.position);
    this.cameraController.setBatterPosition(batterMesh.position);
  }

  private createDefaultPlayer(type: string): Player {
    return {
      id: `player_${type}_${Date.now()}_${Math.random()}`,
      name: type === "batter" ? "Rookie Slugger" : type === "pitcher" ? "Ace Pitcher" : `Fielder ${type}`,
      battingPower: 5 + Math.floor(Math.random() * 3),
      battingAccuracy: 5 + Math.floor(Math.random() * 3),
      speed: 5 + Math.floor(Math.random() * 3),
      pitchSpeed: 5 + Math.floor(Math.random() * 3),
      pitchControl: 5 + Math.floor(Math.random() * 3),
      fieldingRange: 5 + Math.floor(Math.random() * 3),
      fieldingAccuracy: 5 + Math.floor(Math.random() * 3),
      position: type,
      modelPath: `/models/${type}.glb`
    };
  }

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
        this.audioManager.playSFX("menu_select");
        // TODO: Implement pause menu
      });
    }

    // Batting input
    this.scene.onPointerDown = (evt) => {
      if (evt.button === 0 && this.isBatting) {
        this.handleBatSwing();
      }
    };
  }

  public startPitch(): void {
    if (this.isPitching || !this.pitcher) return;

    this.isPitching = true;

    // Play pitcher animations
    this.animationController.playAnimation(
      this.gameState.currentPitcher.id,
      "pitch_windup",
      false,
      () => {
        this.animationController.playAnimation(
          this.gameState.currentPitcher.id,
          "pitch_throw",
          false,
          () => {
            this.animationController.playAnimation(
              this.gameState.currentPitcher.id,
              "idle",
              true
            );
          }
        );
      }
    );

    // Play sound
    this.audioManager.playSFX("glove_pound");

    // Generate realistic pitch
    setTimeout(() => {
      const pitchParams = this.physics.generatePitch(
        this.gameState.currentPitcher.pitchSpeed,
        this.gameState.currentPitcher.pitchControl,
        this.currentPitchType,
        this.pitcher!.position
      );

      // Calculate trajectory
      this.ballTrajectory = this.physics.calculatePitchTrajectory(pitchParams);

      // Create ball and animate
      this.createBall();
      this.animateBallAlongTrajectory(this.ballTrajectory, () => {
        this.checkPitchResult();
      });

      // Camera to pitch view
      this.cameraController.toPitchView(600);
    }, 400);
  }

  private createBall(): void {
    if (this.ball) {
      this.ball.dispose();
      this.ballPhysics?.dispose();
    }

    this.ball = MeshBuilder.CreateSphere("ball", {
      diameter: 0.2
    }, this.scene);

    const ballMat = this.renderer.createBaseballMaterial();
    this.ball.material = ballMat;
    this.renderer.addShadowCaster(this.ball);
    this.renderer.addGlow(this.ball, 0.3);

    this.ballPhysics = new PhysicsAggregate(
      this.ball,
      PhysicsShapeType.SPHERE,
      { mass: 0.145, restitution: 0.5 },
      this.scene
    );

    // Set camera to track ball
    this.cameraController.setBall(this.ball);
  }

  private animateBallAlongTrajectory(trajectory: Vector3[], onComplete?: () => void): void {
    if (!this.ball || trajectory.length === 0) return;

    const fps = 60;
    const frameTime = 1000 / fps;
    let currentFrame = 0;

    const animate = () => {
      if (!this.ball || currentFrame >= trajectory.length) {
        if (onComplete) onComplete();
        return;
      }

      this.ball.position = trajectory[currentFrame];
      currentFrame++;

      setTimeout(animate, frameTime);
    };

    animate();
  }

  private checkPitchResult(): void {
    if (!this.ball) return;

    const ballPos = this.ball.position;

    // Strike zone check
    const inStrikeZone =
      Math.abs(ballPos.x) < 0.5 &&
      ballPos.y > 0.5 &&
      ballPos.y < 1.8 &&
      Math.abs(ballPos.z) < 0.3;

    if (inStrikeZone) {
      this.isBatting = true;
      this.audioManager.playSFX("umpire_strike");

      // Wait for swing or called strike
      setTimeout(() => {
        if (this.isBatting) {
          // Called strike
          this.registerStrike();
          this.isBatting = false;
        }
      }, 500);
    } else {
      this.audioManager.playSFX("umpire_ball");
      this.registerBall();
    }

    this.isPitching = false;
  }

  private handleBatSwing(): void {
    if (!this.isBatting || !this.ball || !this.batter) return;

    // Calculate contact quality
    const ballPos = this.ball.position;
    const batterPos = this.batter.position;
    const distance = Vector3.Distance(ballPos, batterPos);
    const contactZone = 2.5;

    if (distance < contactZone) {
      const contactQuality = 1 - (distance / contactZone);

      // Play hit animation
      this.animationController.playAnimation(
        this.gameState.currentBatter.id,
        contactQuality > 0.5 ? "bat_hit" : "bat_miss",
        false,
        () => {
          this.animationController.playAnimation(
            this.gameState.currentBatter.id,
            "bat_stance",
            true
          );
        }
      );

      if (contactQuality > 0.3) {
        // Good contact - execute hit
        this.executeHit(contactQuality);
      } else {
        // Weak contact - foul or miss
        this.audioManager.playSFX("bat_miss");
        this.registerStrike();
      }
    } else {
      // Swing and miss
      this.animationController.playAnimation(
        this.gameState.currentBatter.id,
        "bat_miss",
        false,
        () => {
          this.animationController.playAnimation(
            this.gameState.currentBatter.id,
            "bat_stance",
            true
          );
        }
      );
      this.audioManager.playSFX("bat_miss");
      this.registerStrike();
    }

    this.isBatting = false;
  }

  private executeHit(contactQuality: number): void {
    if (!this.ball) return;

    // Generate realistic hit
    const hitParams = this.physics.generateHit(
      contactQuality,
      this.gameState.currentBatter.battingPower,
      this.gameState.currentBatter.battingAccuracy,
      70 // Assume 70 mph pitch
    );

    // Play sound based on contact quality
    if (contactQuality > 0.8) {
      this.audioManager.playSFX("bat_crack_homerun");
      this.cameraController.shake(0.8, 200);
    } else {
      this.audioManager.playSFX("bat_crack");
      this.cameraController.shake(0.5, 150);
    }

    // Calculate trajectory
    this.ballTrajectory = this.physics.calculateHitTrajectory(
      hitParams,
      this.ball.position
    );

    // Animate ball
    this.animateBallAlongTrajectory(this.ballTrajectory);

    // Camera follows ball
    this.cameraController.followBall(true);

    // Fielders react
    const distance = BaseballPhysics.getDistanceTraveled(this.ballTrajectory);
    const hangTime = BaseballPhysics.getHangTime(this.ballTrajectory);
    const landingPoint = this.ballTrajectory[this.ballTrajectory.length - 1];

    const fieldingResult = this.fieldingAI.reactToBattedBall({
      points: this.ballTrajectory,
      landingPoint,
      hangTime,
      exitVelocity: hitParams.exitVelocity,
      launchAngle: hitParams.launchAngle
    });

    // Track ball for result
    this.trackBallForFielding(fieldingResult);
  }

  private trackBallForFielding(fieldingResult: any): void {
    const checkInterval = setInterval(() => {
      if (!this.ball) {
        clearInterval(checkInterval);
        return;
      }

      // Check if fielder can catch
      const catchResult = this.fieldingAI.checkForCatch(this.ball.position);

      if (catchResult.caught) {
        clearInterval(checkInterval);
        this.cameraController.stopFollowingBall();

        // Play catch animation and sound
        if (catchResult.fielder) {
          this.animationController.playAnimation(
            catchResult.fielder.player.id,
            "catch"
          );
          this.cameraController.toFieldingView(
            catchResult.fielder.mesh.position,
            this.ball.position,
            800
          );
        }

        this.audioManager.playSFX("catch", 1.0, this.ball.position);
        this.audioManager.playCommentary("great_catch");
        this.gameUI.showNotification("OUT!", 2000, "error");

        setTimeout(() => {
          this.registerOut("caught");
          this.cameraController.toOverview(1000);
        }, 2000);

        return;
      }

      // Ball hit ground
      if (this.ball.position.y < 0.2) {
        clearInterval(checkInterval);
        this.cameraController.stopFollowingBall();
        this.audioManager.playSFX("ball_land", 1.0, this.ball.position);
        this.determineBallInPlay();
        setTimeout(() => this.cameraController.toOverview(1000), 1500);
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

    // Convert to feet for baseball metrics
    const distanceFeet = distanceFromHome * 3.28084;

    if (distanceFeet < 150) {
      this.gameUI.showNotification("SINGLE!", 2000, "success");
      this.audioManager.playSFX("crowd_cheer");
      this.advanceRunners(1);
    } else if (distanceFeet < 250) {
      this.gameUI.showNotification("DOUBLE!", 2000, "success");
      this.audioManager.playSFX("crowd_cheer");
      this.advanceRunners(2);
    } else if (distanceFeet < 300) {
      this.gameUI.showNotification("TRIPLE!", 2000, "success");
      this.audioManager.playSFX("crowd_cheer");
      this.advanceRunners(3);
    } else {
      this.registerHomeRun();
    }
  }

  private registerHomeRun(): void {
    this.cameraController.stopFollowingBall();
    this.gameUI.showNotification("HOME RUN!", 3000, "homerun");
    this.audioManager.playCommentary("homerun");

    if (this.ball) {
      this.cameraController.homeRunCamera(this.ball.position);
    }

    // Celebration animation
    this.animationController.playAnimation(
      this.gameState.currentBatter.id,
      "celebrate",
      true
    );

    setTimeout(() => {
      this.advanceRunners(4);
      this.cameraController.toOverview(1500);
      this.animationController.playAnimation(
        this.gameState.currentBatter.id,
        "bat_stance",
        true
      );
    }, 3000);
  }

  private registerStrike(): void {
    this.gameState.strikes++;
    if (this.gameState.strikes >= 3) {
      this.gameUI.showNotification("STRIKE THREE!", 2000, "error");
      this.audioManager.playSFX("umpire_out");
      this.audioManager.playCommentary("strikeout");
      this.registerOut("strikeout");
    } else {
      this.updateGameState();
    }
  }

  private registerBall(): void {
    this.gameState.balls++;
    if (this.gameState.balls >= 4) {
      this.gameUI.showNotification("WALK!", 2000, "success");
      this.advanceRunners(1);
    } else {
      this.updateGameState();
    }
  }

  private registerOut(_type: string): void {
    this.gameState.outs++;
    this.resetCount();

    if (this.gameState.outs >= 3) {
      this.gameUI.showNotification("3 OUTS - END OF INNING", 3000, "default");
      setTimeout(() => this.endInning(), 3000);
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

    // Batter advances
    if (bases === 1) {
      this.gameState.bases[0] = true;
    } else if (bases === 2) {
      this.gameState.bases[1] = true;
    } else if (bases === 3) {
      this.gameState.bases[2] = true;
    } else if (bases === 4) {
      runsScored++;
    }

    // Update score
    if (this.gameState.isTopOfInning) {
      this.gameState.awayScore += runsScored;
    } else {
      this.gameState.homeScore += runsScored;
    }

    if (runsScored > 0) {
      this.audioManager.playSFX("crowd_cheer");
    }

    this.resetCount();
    this.updateGameState();
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
    } else {
      this.gameState.isTopOfInning = true;
      this.gameState.inning++;
    }

    this.resetCount();
    this.updateGameState();

    // Reset fielders
    this.fieldingAI.resetPositions();
  }

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

  private update(deltaTime: number): void {
    // Update fielders
    this.fieldingAI.update(deltaTime);
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

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
}
