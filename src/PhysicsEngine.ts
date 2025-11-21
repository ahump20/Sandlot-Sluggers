/**
 * PhysicsEngine.ts
 * Simple 2D physics engine for baseball mechanics
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Ball {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  mass: number;
  active: boolean;
}

export interface PhysicsConfig {
  gravity: number;
  airDensity: number;
  dragCoefficient: number;
  groundLevel: number;
  fieldBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export class PhysicsEngine {
  private readonly config: PhysicsConfig;
  private readonly BALL_RADIUS = 5;
  private readonly BALL_MASS = 0.145; // kg (standard baseball mass)

  constructor(config?: Partial<PhysicsConfig>) {
    this.config = {
      gravity: 9.8, // m/s^2
      airDensity: 1.225, // kg/m^3
      dragCoefficient: 0.3, // Baseball drag coefficient
      groundLevel: 550, // y-coordinate of ground
      fieldBounds: {
        minX: 0,
        maxX: 800,
        minY: 0,
        maxY: 600
      },
      ...config
    };
  }

  /**
   * Creates a new ball object
   */
  public createBall(position: Vector2, velocity: Vector2): Ball {
    return {
      position: { ...position },
      velocity: { ...velocity },
      radius: this.BALL_RADIUS,
      mass: this.BALL_MASS,
      active: true
    };
  }

  /**
   * Updates ball physics for one frame
   * @param ball - The ball to update
   * @param deltaTime - Time step in seconds
   */
  public updateBall(ball: Ball, deltaTime: number): void {
    if (!ball.active) return;

    // Calculate drag force
    const speed = this.vectorLength(ball.velocity);
    const dragMagnitude = 0.5 * this.config.airDensity *
                          this.config.dragCoefficient *
                          Math.PI * Math.pow(this.BALL_RADIUS / 100, 2) *
                          speed * speed;

    // Drag force direction (opposite to velocity)
    const dragForce: Vector2 = {
      x: 0,
      y: 0
    };

    if (speed > 0) {
      const dragDirection: Vector2 = {
        x: -ball.velocity.x / speed,
        y: -ball.velocity.y / speed
      };
      dragForce.x = dragDirection.x * dragMagnitude;
      dragForce.y = dragDirection.y * dragMagnitude;
    }

    // Gravity force (downward)
    const gravityForce: Vector2 = {
      x: 0,
      y: ball.mass * this.config.gravity * 50 // Scale for screen coordinates
    };

    // Total force
    const totalForce: Vector2 = {
      x: dragForce.x,
      y: gravityForce.y + dragForce.y
    };

    // Acceleration (F = ma)
    const acceleration: Vector2 = {
      x: totalForce.x / ball.mass,
      y: totalForce.y / ball.mass
    };

    // Update velocity
    ball.velocity.x += acceleration.x * deltaTime;
    ball.velocity.y += acceleration.y * deltaTime;

    // Update position
    ball.position.x += ball.velocity.x * deltaTime;
    ball.position.y += ball.velocity.y * deltaTime;

    // Ground collision
    if (ball.position.y >= this.config.groundLevel - ball.radius) {
      ball.position.y = this.config.groundLevel - ball.radius;
      ball.velocity.y = -ball.velocity.y * 0.6; // Bounce with energy loss
      ball.velocity.x *= 0.8; // Friction

      // Stop if velocity is too low
      if (Math.abs(ball.velocity.y) < 5 && Math.abs(ball.velocity.x) < 5) {
        ball.velocity.x = 0;
        ball.velocity.y = 0;
        ball.active = false;
      }
    }

    // Check if ball is out of bounds
    if (ball.position.x < this.config.fieldBounds.minX ||
        ball.position.x > this.config.fieldBounds.maxX ||
        ball.position.y < this.config.fieldBounds.minY) {
      ball.active = false;
    }
  }

  /**
   * Calculates pitch trajectory
   * @param pitchSpeed - Speed of the pitch (0-100)
   * @param pitchType - Type of pitch (affects trajectory)
   */
  public calculatePitchVelocity(pitchSpeed: number, pitchType: 'fastball' | 'curveball' | 'changeup' = 'fastball'): Vector2 {
    const baseSpeed = (pitchSpeed / 100) * 300; // Max 300 pixels/sec

    const velocities: Record<string, Vector2> = {
      fastball: {
        x: baseSpeed * 0.95,
        y: baseSpeed * 0.1 // Slight downward movement
      },
      curveball: {
        x: baseSpeed * 0.8,
        y: baseSpeed * 0.3 // More downward movement
      },
      changeup: {
        x: baseSpeed * 0.7,
        y: baseSpeed * 0.15
      }
    };

    return velocities[pitchType];
  }

  /**
   * Calculates hit trajectory based on contact parameters
   * @param pitchVelocity - Velocity of the incoming pitch
   * @param swingPower - Power of the swing (0-100)
   * @param contactQuality - Quality of contact (0-1, 1 being perfect)
   * @param launchAngle - Angle in degrees (-90 to 90)
   */
  public calculateHitVelocity(
    pitchVelocity: Vector2,
    swingPower: number,
    contactQuality: number,
    launchAngle: number
  ): Vector2 {
    // Calculate exit velocity based on swing power and contact quality
    const exitSpeed = (swingPower / 100) * 400 * contactQuality;

    // Convert angle to radians
    const angleRad = (launchAngle * Math.PI) / 180;

    // Calculate velocity components
    return {
      x: exitSpeed * Math.cos(angleRad),
      y: -exitSpeed * Math.sin(angleRad) // Negative because y increases downward
    };
  }

  /**
   * Checks if ball is within catch range of a position
   */
  public isInCatchRange(ballPos: Vector2, fielderPos: Vector2, catchRadius: number): boolean {
    const distance = this.vectorLength({
      x: ballPos.x - fielderPos.x,
      y: ballPos.y - fielderPos.y
    });
    return distance <= catchRadius;
  }

  /**
   * Calculates landing position of a ball (where it will hit the ground)
   * Uses simple projectile motion prediction
   */
  public predictLandingPosition(ball: Ball): Vector2 | null {
    if (!ball.active) return null;

    // Simple prediction: extrapolate current trajectory
    const simulatedBall: Ball = {
      position: { ...ball.position },
      velocity: { ...ball.velocity },
      radius: ball.radius,
      mass: ball.mass,
      active: true
    };

    // Simulate up to 5 seconds or until ball hits ground
    const maxSteps = 300;
    const dt = 1 / 60;

    for (let i = 0; i < maxSteps; i++) {
      this.updateBall(simulatedBall, dt);

      if (simulatedBall.position.y >= this.config.groundLevel - simulatedBall.radius) {
        return { ...simulatedBall.position };
      }

      if (!simulatedBall.active) {
        return null;
      }
    }

    return null;
  }

  /**
   * Helper: Calculate vector length
   */
  private vectorLength(v: Vector2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  /**
   * Helper: Normalize a vector
   */
  public normalizeVector(v: Vector2): Vector2 {
    const length = this.vectorLength(v);
    if (length === 0) return { x: 0, y: 0 };
    return {
      x: v.x / length,
      y: v.y / length
    };
  }

  /**
   * Helper: Calculate distance between two points
   */
  public distance(p1: Vector2, p2: Vector2): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Get ground level
   */
  public getGroundLevel(): number {
    return this.config.groundLevel;
  }

  /**
   * Get field bounds
   */
  public getFieldBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    return { ...this.config.fieldBounds };
  }
}
