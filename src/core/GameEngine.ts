import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Mesh,
  AbstractMesh,
  MeshBuilder
} from "@babylonjs/core";
import { AdvancedPhysicsSystem, PhysicsMaterial } from "../physics/AdvancedPhysicsSystem";
import { AdvancedRenderer } from "../graphics/AdvancedRenderer";
import { FieldBuilder } from "../graphics/FieldBuilder";
import { DefensivePlaySystem } from "../fielding/DefensivePlaySystem";

export interface GameConfig {
  canvas: HTMLCanvasElement;
  onGameStateChange: (state: GameState) => void;
  stadium?: Stadium;
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
  currentStadium?: Stadium;
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
  private camera: ArcRotateCamera;
  private gameState: GameState;
  
  // Advanced systems
  private physicsSystem: AdvancedPhysicsSystem;
  private renderer: AdvancedRenderer;
  private fieldBuilder: FieldBuilder;
  private fieldingSystem: DefensivePlaySystem;
  
  // Game objects
  private ball: Mesh | null = null;
  private ballId: string | null = null;
  private pitcher: AbstractMesh | null = null;
  private batter: AbstractMesh | null = null;
  private fielders: Map<string, AbstractMesh> = new Map();
  
  // Game state
  private isPitching: boolean = false;
  private isBatting: boolean = false;
  private onStateChange: (state: GameState) => void;
  
  // Stats tracking
  private gameStats: {
    strikes: number;
    balls: number;
    hits: number;
    outs: number;
    runs: number;
    homeRuns: number;
    outTypes: Map<string, number>;
  } = {
    strikes: 0,
    balls: 0,
    hits: 0,
    outs: 0,
    runs: 0,
    homeRuns: 0,
    outTypes: new Map()
  };

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
      strikes: 0,
      currentStadium: config.stadium
    };

    // Initialize advanced systems
    this.renderer = new AdvancedRenderer(this.scene, this.engine);
    this.physicsSystem = new AdvancedPhysicsSystem(this.scene);
    this.fieldBuilder = new FieldBuilder(this.scene, this.renderer);
    this.fieldingSystem = new DefensivePlaySystem();

    this.camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 3,
      40,
      new Vector3(0, 0, 0),
      this.scene
    );
    this.camera.attachControl(config.canvas, true);
    this.camera.lowerRadiusLimit = 20;
    this.camera.upperRadiusLimit = 60;
    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = Math.PI / 2;

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
    try {
      // Wait for physics to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Build realistic field with stadium dimensions or defaults
      const dimensions = this.gameState.currentStadium?.dimensions || {
        leftField: 35,
        centerField: 40,
        rightField: 35
      };
      
      this.fieldBuilder.buildField(dimensions);
      
      // Load stadium skybox if available
      if (this.gameState.currentStadium?.skyboxPath) {
        this.renderer.loadSkybox(this.gameState.currentStadium.skyboxPath);
      }
      
      this.setupInputHandlers();
    } catch (error) {
      console.error("Failed to initialize game:", error);
      // Fallback to basic field
      this.fieldBuilder.buildField({
        left: 35,
        center: 40,
        right: 35
      });
    }
  }

  private createDefaultPlayer(type: string): Player {
    return {
      id: `player_${type}_${Date.now()}`,
      name: type === "batter" ? "Rookie Slugger" : "Ace Pitcher",
      battingPower: 5,
      battingAccuracy: 5,
      speed: 5,
      pitchSpeed: 5,
      pitchControl: 5,
      fieldingRange: 5,
      fieldingAccuracy: 5,
      position: type === "batter" ? "C" : "P",
      modelPath: `/models/${type}.glb`
    };
  }

  public async loadPlayer(player: Player, position: Vector3, role: "pitcher" | "batter"): Promise<void> {
    // Simplified player representation - replace with actual model loading
    const playerMesh = MeshBuilder.CreateCapsule(`${role}_${player.id}`, {
      radius: 0.5,
      height: 2
    }, this.scene);
    playerMesh.position = position;

    const playerMat = new StandardMaterial(`${role}Mat`, this.scene);
    playerMat.diffuseColor = role === "pitcher" ?
      new Color3(0.2, 0.2, 0.8) : new Color3(0.8, 0.2, 0.2);
    playerMesh.material = playerMat;

    if (role === "pitcher") {
      this.pitcher = playerMesh;
    } else {
      this.batter = playerMesh;
    }
  }

  private createBall(): void {
    if (this.ball && this.ballId) {
      this.physicsSystem.removeBall(this.ballId);
      this.ball.dispose();
    }

    // Create ball mesh first
    this.ball = MeshBuilder.CreateSphere("ball", {
      diameter: 0.0732 // MLB regulation (0.0366m radius * 2)
    }, this.scene);
    
    this.ballId = this.physicsSystem.createBaseball(
      this.ball,
      {
        mass: 0.145,
        radius: 0.0366,
        restitution: 0.55,
        drag: 0.2
      }
    );
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

    if (!this.ball || !this.ballId) return;

    // Position ball at pitcher
    this.ball.position = this.pitcher.position.clone();
    this.ball.position.y += 1.5;

    // Animate pitch using physics system
    const pitchSpeed = this.gameState.currentPitcher.pitchSpeed;
    const pitchControl = this.gameState.currentPitcher.pitchControl;

    // Add randomness based on control
    const controlVariance = (10 - pitchControl) * 0.1;
    const targetX = (Math.random() - 0.5) * controlVariance;
    const targetY = 1.2 + (Math.random() - 0.5) * controlVariance * 0.5;
    const targetZ = 0;

    const velocity = new Vector3(
      targetX * pitchSpeed,
      -2 + (targetY - 1.2) * 0.5,
      (targetZ - this.ball.position.z) * (pitchSpeed / 5)
    );

    // Apply velocity through physics system
    if (this.ballId) {
      this.physicsSystem.hitBall(
        this.ballId,
        velocity,
        Vector3.Zero() // No spin initially
      );
    }

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

    // Perfect contact zone
    // const perfectZone = 1.5; // TODO: Use for bonus contact quality
    const contactZone = 3;

    if (distance < contactZone) {
      const contactQuality = 1 - (distance / contactZone);
      const power = this.gameState.currentBatter.battingPower;
      const accuracy = this.gameState.currentBatter.battingAccuracy;

      // Hit!
      this.executeHit(contactQuality, power, accuracy);
    } else {
      // Swing and miss
      this.registerStrike();
    }
  }

  private executeHit(contactQuality: number, power: number, accuracy: number): void {
    if (!this.ball || !this.ballId) return;

    // Calculate hit vector
    const baseForce = 20 + (power * 3) + (contactQuality * 10);
    const launchAngle = 20 + (contactQuality * 30); // 20-50 degrees
    const direction = (Math.random() - 0.5) * (11 - accuracy) * 10; // Spray angle

    const hitVector = new Vector3(
      Math.sin(direction * Math.PI / 180) * baseForce,
      Math.sin(launchAngle * Math.PI / 180) * baseForce,
      Math.cos(direction * Math.PI / 180) * baseForce
    );

    // Apply hit velocity with spin through physics system
    if (this.ballId) {
      // Add backspin for fly balls, topspin for grounders
      const spin = contactQuality > 0.7 
        ? new Vector3(0, 0, -1000) // Backspin for fly balls
        : new Vector3(0, 0, 500);  // Topspin for grounders
      
      this.physicsSystem.hitBall(
        this.ballId,
        hitVector,
        spin
      );
    }
    
    this.isBatting = false;
    this.gameStats.hits++;

    // Start tracking ball for fielding
    this.trackBallForFielding();
  }

  private trackBallForFielding(): void {
    const checkInterval = setInterval(() => {
      if (!this.ball) {
        clearInterval(checkInterval);
        return;
      }

      // Ball hit ground
      if (this.ball.position.y < 0.2) {
        clearInterval(checkInterval);
        this.determineBallInPlay();
      }

      // Ball out of play
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
      this.registerOut("ground out");
    } else if (distanceFromHome < 25) {
      this.advanceRunners(1);
    } else if (distanceFromHome < 35) {
      this.advanceRunners(2);
    } else {
      this.advanceRunners(3);
    }
  }

  private handleFieldingSwipe(deltaX: number, deltaY: number): void {
    // Implement fielding mechanics using DefensivePlaySystem
    if (!this.ball || !this.ballId) return;

    const ballPos = this.ball.position;
    const ballVelocity = this.physicsSystem.getBallVelocity(this.ballId) || Vector3.Zero();
    
    // Determine swipe direction and magnitude
    const swipeMagnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const swipeDirection = Math.atan2(deltaY, deltaX);
    
    // Use fielding system to react to batted ball
    // This is a simplified implementation - full system would handle positioning, timing, etc.
    console.log(`Fielding swipe: ${deltaX}, ${deltaY}, magnitude: ${swipeMagnitude}`);
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
    this.gameStats.strikes++;
    if (this.gameState.strikes >= 3) {
      this.registerOut("strikeout");
    }
    this.updateGameState();
  }

  private registerBall(): void {
    this.gameState.balls++;
    this.gameStats.balls++;
    if (this.gameState.balls >= 4) {
      this.advanceRunners(1); // Walk
    }
    this.updateGameState();
  }

  private registerOut(type: string): void {
    this.gameState.outs++;
    this.gameStats.outs++;
    
    // Track out types for statistics
    const currentCount = this.gameStats.outTypes.get(type) || 0;
    this.gameStats.outTypes.set(type, currentCount + 1);
    
    this.resetCount();

    if (this.gameState.outs >= 3) {
      this.endInning();
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
    
    this.gameStats.runs += runsScored;

    this.resetCount();
    this.updateGameState();
  }

  private registerHomeRun(): void {
    this.advanceRunners(4);
    this.gameStats.homeRuns++;
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
  }

  private updateGameState(): void {
    this.onStateChange(this.gameState);
  }

  private update(): void {
    // Update physics system
    const deltaTime = this.engine.getDeltaTime() / 1000;
    this.physicsSystem.update(deltaTime);
    
    // Update fielding system
    // this.fieldingSystem.update(deltaTime);
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public dispose(): void {
    // Clean up systems
    if (this.ballId) {
      this.physicsSystem.removeBall(this.ballId);
    }
    this.renderer.dispose();
    
    this.scene.dispose();
    this.engine.dispose();
  }
  
  /**
   * Get game statistics
   */
  public getGameStats() {
    return { ...this.gameStats };
  }
  
  /**
   * Set stadium (rebuilds field)
   */
  public setStadium(stadium: Stadium): void {
    this.gameState.currentStadium = stadium;
    
    // Rebuild field with new dimensions
    this.fieldBuilder.buildField(stadium.dimensions);
    
    // Load new skybox
    if (stadium.skyboxPath) {
      this.renderer.loadSkybox(stadium.skyboxPath);
    }
  }
}
