/**
 * main.ts
 * Simple 2D baseball game with canvas rendering and physics
 */

import { PhysicsEngine, Ball, Vector2 } from './PhysicsEngine';
import { Renderer, Player } from './Renderer';

// Game state interface
interface GameState {
  inning: number;
  isTopOfInning: boolean;
  balls: number;
  strikes: number;
  outs: number;
  awayScore: number;
  homeScore: number;
  bases: [boolean, boolean, boolean]; // 1st, 2nd, 3rd
  phase: 'waiting' | 'pitching' | 'hitting' | 'fielding';
  ball: Ball | null;
  isPitching: boolean;
  isSwinging: boolean;
}

class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: Renderer;
  private readonly physics: PhysicsEngine;
  private readonly state: GameState;

  private pitcher: Player;
  private batter: Player;
  private fielders: Player[] = [];

  private lastTime: number = 0;
  private animationFrameId: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.physics = new PhysicsEngine();

    // Initialize game state
    this.state = {
      inning: 1,
      isTopOfInning: true,
      balls: 0,
      strikes: 0,
      outs: 0,
      awayScore: 0,
      homeScore: 0,
      bases: [false, false, false],
      phase: 'waiting',
      ball: null,
      isPitching: false,
      isSwinging: false
    };

    // Initialize players
    this.pitcher = {
      position: this.renderer.getPitcherPosition(),
      name: 'Pitcher',
      role: 'pitcher',
      color: '#ff4444'
    };

    this.batter = {
      position: this.renderer.getBatterPosition(),
      name: 'Batter',
      role: 'batter',
      color: '#4444ff'
    };

    // Initialize fielders
    this.initializeFielders();

    // Set up UI event listeners
    this.setupEventListeners();

    // Update UI
    this.updateUI();
  }

  /**
   * Initialize fielder positions
   */
  private initializeFielders(): void {
    const fieldPositions: Array<{ x: number; y: number; name: string }> = [
      { x: 300, y: 300, name: 'LF' },
      { x: 400, y: 200, name: 'CF' },
      { x: 500, y: 300, name: 'RF' },
      { x: 550, y: 450, name: '1B' },
      { x: 500, y: 400, name: '2B' },
      { x: 450, y: 450, name: 'SS' },
      { x: 400, y: 450, name: '3B' }
    ];

    this.fielders = fieldPositions.map(pos => ({
      position: { x: pos.x, y: pos.y },
      name: pos.name,
      role: 'fielder' as const,
      color: '#44ff44'
    }));
  }

  /**
   * Set up event listeners for controls
   */
  private setupEventListeners(): void {
    const pitchButton = document.getElementById('pitchButton');
    const swingButton = document.getElementById('swingButton');

    if (pitchButton) {
      pitchButton.addEventListener('click', () => this.startPitch());
    }

    if (swingButton) {
      swingButton.addEventListener('click', () => this.swing());
    }

    // Canvas click for swinging
    this.canvas.addEventListener('click', () => {
      if (this.state.phase === 'pitching' && !this.state.isSwinging) {
        this.swing();
      }
    });
  }

  /**
   * Start pitching
   */
  private startPitch(): void {
    if (this.state.phase !== 'waiting') return;

    this.state.phase = 'pitching';
    this.state.isPitching = true;

    // Create ball at pitcher position
    const pitchVelocity = this.physics.calculatePitchVelocity(
      70 + Math.random() * 30,
      'fastball'
    );

    this.state.ball = this.physics.createBall(
      { ...this.pitcher.position },
      pitchVelocity
    );
  }

  /**
   * Swing the bat
   */
  private swing(): void {
    if (this.state.phase !== 'pitching' || this.state.isSwinging) return;

    this.state.isSwinging = true;

    // Check if ball is in hitting zone
    if (this.state.ball && this.state.ball.active) {
      const batterPos = this.batter.position;
      const ballPos = this.state.ball.position;

      const distance = this.physics.distance(ballPos, batterPos);

      // Hit zone
      if (distance < 50) {
        // Contact made!
        this.hitBall();
      } else {
        // Swing and miss
        setTimeout(() => {
          this.registerStrike();
        }, 200);
      }
    } else {
      // Swung too early/late
      this.registerStrike();
    }

    // Reset swing animation
    setTimeout(() => {
      this.state.isSwinging = false;
    }, 300);
  }

  /**
   * Hit the ball
   */
  private hitBall(): void {
    if (!this.state.ball) return;

    this.state.phase = 'fielding';

    // Calculate hit quality
    const contactQuality = 0.7 + Math.random() * 0.3;
    const launchAngle = -20 - Math.random() * 40; // -20 to -60 degrees
    const swingPower = 70 + Math.random() * 30;

    const hitVelocity = this.physics.calculateHitVelocity(
      this.state.ball.velocity,
      swingPower,
      contactQuality,
      launchAngle
    );

    // Reset ball with new velocity
    this.state.ball.velocity = hitVelocity;
    this.state.ball.active = true;

    console.log('Ball hit! Exit velocity:', Math.sqrt(hitVelocity.x ** 2 + hitVelocity.y ** 2).toFixed(1));
  }

  /**
   * Register a strike
   */
  private registerStrike(): void {
    this.state.strikes++;

    if (this.state.strikes >= 3) {
      this.registerOut();
    } else {
      this.resetForNextPitch();
    }

    this.updateUI();
  }

  /**
   * Register a ball
   */
  private registerBall(): void {
    this.state.balls++;

    if (this.state.balls >= 4) {
      // Walk
      this.advanceRunners(1);
      this.resetAtBat();
    } else {
      this.resetForNextPitch();
    }

    this.updateUI();
  }

  /**
   * Register an out
   */
  private registerOut(): void {
    this.state.outs++;

    if (this.state.outs >= 3) {
      this.changeInning();
    }

    this.resetAtBat();
    this.updateUI();
  }

  /**
   * Change inning
   */
  private changeInning(): void {
    if (this.state.isTopOfInning) {
      this.state.isTopOfInning = false;
    } else {
      this.state.isTopOfInning = true;
      this.state.inning++;
    }

    this.state.outs = 0;
    this.state.bases = [false, false, false];
  }

  /**
   * Advance runners
   */
  private advanceRunners(bases: number): void {
    // Simple runner advancement (can be improved)
    let runsScored = 0;

    // Check each base in reverse order
    if (this.state.bases[2]) { // 3rd base
      runsScored++;
      this.state.bases[2] = false;
    }
    if (this.state.bases[1] && bases >= 2) { // 2nd base
      runsScored++;
      this.state.bases[1] = false;
    }
    if (this.state.bases[0] && bases >= 3) { // 1st base
      runsScored++;
      this.state.bases[0] = false;
    }

    // Move runners
    if (bases >= 3) this.state.bases[2] = true;
    if (bases >= 2) this.state.bases[1] = true;
    if (bases >= 1) this.state.bases[0] = true;

    // Add runs
    if (this.state.isTopOfInning) {
      this.state.awayScore += runsScored;
    } else {
      this.state.homeScore += runsScored;
    }
  }

  /**
   * Reset for next pitch
   */
  private resetForNextPitch(): void {
    this.state.phase = 'waiting';
    this.state.ball = null;
    this.state.isPitching = false;
    this.state.isSwinging = false;
  }

  /**
   * Reset at-bat
   */
  private resetAtBat(): void {
    this.state.balls = 0;
    this.state.strikes = 0;
    this.resetForNextPitch();
  }

  /**
   * Update UI display
   */
  private updateUI(): void {
    const scoreDisplay = document.getElementById('score-display');
    const inningDisplay = document.getElementById('inning-display');
    const countDisplay = document.getElementById('count-display');
    const outsDisplay = document.getElementById('outs-display');
    const basesDisplay = document.getElementById('bases-display');

    if (scoreDisplay) {
      scoreDisplay.textContent = `${this.state.awayScore} - ${this.state.homeScore}`;
    }

    if (inningDisplay) {
      inningDisplay.textContent = `${this.state.inning} ${this.state.isTopOfInning ? 'Top' : 'Bot'}`;
    }

    if (countDisplay) {
      countDisplay.textContent = `${this.state.balls}-${this.state.strikes}`;
    }

    if (outsDisplay) {
      outsDisplay.textContent = `${this.state.outs}`;
    }

    if (basesDisplay) {
      const baseStatus = this.state.bases
        .map((occupied, i) => occupied ? `${i + 1}B` : '')
        .filter(Boolean)
        .join(', ');
      basesDisplay.textContent = baseStatus || 'Empty';
    }
  }

  /**
   * Game loop
   */
  private gameLoop = (currentTime: number): void => {
    const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;
    this.lastTime = currentTime;

    // Cap delta time to prevent large jumps
    const dt = Math.min(deltaTime, 0.1);

    // Update physics
    if (this.state.ball && this.state.ball.active) {
      this.physics.updateBall(this.state.ball, dt);

      // Check if ball reached home plate (for strike/ball detection)
      if (this.state.phase === 'pitching' && !this.state.isSwinging) {
        const homePlate = this.renderer.getHomePlatePosition();
        if (this.state.ball.position.x >= homePlate.x) {
          // Ball passed home plate
          const strikeZoneY = homePlate.y - 20;
          const inStrikeZone = Math.abs(this.state.ball.position.y - strikeZoneY) < 30;

          if (inStrikeZone) {
            this.registerStrike();
          } else {
            this.registerBall();
          }

          this.state.ball.active = false;
        }
      }

      // Check if ball landed (for fielding)
      if (this.state.phase === 'fielding' && !this.state.ball.active) {
        // Ball landed - determine hit type
        const landingX = this.state.ball.position.x;

        if (landingX < 0 || landingX > 800) {
          // Foul ball
          this.registerStrike();
        } else if (landingX < 400) {
          // Out (caught/fielded)
          this.registerOut();
        } else {
          // Hit! Advance runners
          const basesAdvanced = landingX < 500 ? 1 : landingX < 600 ? 2 : landingX < 700 ? 3 : 4;
          this.advanceRunners(basesAdvanced);
          this.resetAtBat();
        }

        this.updateUI();
      }
    }

    // Render
    this.render();

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * Render the game
   */
  private render(): void {
    // Draw field
    this.renderer.drawField();

    // Draw fielders
    this.fielders.forEach(fielder => {
      this.renderer.drawPlayer(fielder);
    });

    // Draw pitcher
    this.renderer.drawPlayer(this.pitcher, this.state.isPitching);

    // Draw batter
    this.renderer.drawPlayer(this.batter, this.state.isSwinging);

    // Draw ball
    if (this.state.ball && this.state.ball.active) {
      this.renderer.drawBall(this.state.ball);
    }

    // Draw status text
    if (this.state.phase === 'waiting') {
      this.renderer.drawText('Click PITCH to start', 400, 100, 16, '#ffff00');
    }
  }

  /**
   * Start the game
   */
  public start(): void {
    console.log('Starting Sandlot Sluggers 2D!');
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  /**
   * Stop the game
   */
  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Initialize and start the game
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

const game = new Game(canvas);
game.start();
