import { Vector3 } from "@babylonjs/core";

/**
 * Advanced baseball physics simulation
 * Implements realistic ball flight including:
 * - Air drag (quadratic)
 * - Magnus effect (spin-induced movement)
 * - Seam effects
 * - Wind resistance
 * - Gravity
 */

export interface BallState {
  position: Vector3;
  velocity: Vector3;
  spin: Vector3; // Rotation axis and magnitude (rad/s)
  mass: number;
  radius: number;
}

export interface PitchParameters {
  velocity: number; // mph
  spinRate: number; // rpm
  spinAxis: Vector3; // Direction of spin axis
  releasePoint: Vector3;
  releaseAngle: number; // degrees
}

export interface HitParameters {
  exitVelocity: number; // mph
  launchAngle: number; // degrees
  sprayAngle: number; // degrees left/right
  backspin: number; // rpm
  sidespin: number; // rpm
}

export class BaseballPhysics {
  // Physical constants
  private static readonly AIR_DENSITY = 1.225; // kg/m³ at sea level
  private static readonly BALL_MASS = 0.145; // kg (official MLB weight)
  private static readonly BALL_RADIUS = 0.0366; // meters (official MLB radius)
  private static readonly BALL_CIRCUMFERENCE = 0.2298; // meters
  private static readonly DRAG_COEFFICIENT = 0.3; // Typical for baseball
  private static readonly LIFT_COEFFICIENT = 0.4; // Magnus effect coefficient
  private static readonly GRAVITY = 9.81; // m/s²
  private static readonly SEAM_EFFECT = 0.15; // Additional drag from seams

  // Conversion factors
  private static readonly MPH_TO_MS = 0.44704; // miles per hour to meters per second
  private static readonly RPM_TO_RADS = 0.10472; // rpm to radians per second
  private static readonly DEG_TO_RAD = Math.PI / 180;

  // Wind conditions (can be modified per stadium)
  private windVelocity: Vector3 = Vector3.Zero();

  constructor(windVelocity?: Vector3) {
    if (windVelocity) {
      this.windVelocity = windVelocity;
    }
  }

  /**
   * Calculate pitch trajectory with realistic physics
   */
  public calculatePitchTrajectory(params: PitchParameters, timeStep: number = 0.01): Vector3[] {
    const trajectory: Vector3[] = [];

    // Initial conditions
    const velocity = params.velocity * BaseballPhysics.MPH_TO_MS;
    const spinRate = params.spinRate * BaseballPhysics.RPM_TO_RADS;

    const state: BallState = {
      position: params.releasePoint.clone(),
      velocity: new Vector3(
        0,
        -Math.sin(params.releaseAngle * BaseballPhysics.DEG_TO_RAD) * velocity,
        -Math.cos(params.releaseAngle * BaseballPhysics.DEG_TO_RAD) * velocity
      ),
      spin: params.spinAxis.scale(spinRate),
      mass: BaseballPhysics.BALL_MASS,
      radius: BaseballPhysics.BALL_RADIUS
    };

    // Simulate until ball crosses home plate (z = 0) or hits ground
    while (state.position.z > 0 && state.position.y > 0) {
      trajectory.push(state.position.clone());
      this.updateBallState(state, timeStep);
    }

    return trajectory;
  }

  /**
   * Calculate hit trajectory with realistic physics
   */
  public calculateHitTrajectory(params: HitParameters, initialPosition: Vector3, timeStep: number = 0.01): Vector3[] {
    const trajectory: Vector3[] = [];

    // Initial conditions
    const exitVelo = params.exitVelocity * BaseballPhysics.MPH_TO_MS;
    const launchRad = params.launchAngle * BaseballPhysics.DEG_TO_RAD;
    const sprayRad = params.sprayAngle * BaseballPhysics.DEG_TO_RAD;

    // Decompose velocity into components
    const horizontalSpeed = exitVelo * Math.cos(launchRad);
    const verticalSpeed = exitVelo * Math.sin(launchRad);

    const state: BallState = {
      position: initialPosition.clone(),
      velocity: new Vector3(
        horizontalSpeed * Math.sin(sprayRad),
        verticalSpeed,
        horizontalSpeed * Math.cos(sprayRad)
      ),
      spin: new Vector3(
        params.sidespin * BaseballPhysics.RPM_TO_RADS,
        params.backspin * BaseballPhysics.RPM_TO_RADS,
        0
      ),
      mass: BaseballPhysics.BALL_MASS,
      radius: BaseballPhysics.BALL_RADIUS
    };

    // Simulate until ball hits ground or goes out of bounds
    let maxTime = 10; // Maximum 10 seconds of flight
    let time = 0;

    while (state.position.y > 0.1 && time < maxTime) {
      trajectory.push(state.position.clone());
      this.updateBallState(state, timeStep);
      time += timeStep;
    }

    return trajectory;
  }

  /**
   * Update ball state using physics simulation
   */
  private updateBallState(state: BallState, dt: number): void {
    // Relative velocity (ball velocity relative to air)
    const relativeVelocity = state.velocity.subtract(this.windVelocity);
    const speed = relativeVelocity.length();

    if (speed < 0.01) return; // Ball essentially stopped

    // Direction of motion
    const direction = relativeVelocity.normalize();

    // Cross-sectional area
    const area = Math.PI * state.radius * state.radius;

    // Calculate drag force (opposes motion)
    const dragMagnitude = 0.5 * BaseballPhysics.AIR_DENSITY *
                         BaseballPhysics.DRAG_COEFFICIENT *
                         area * speed * speed;
    const dragForce = direction.scale(-dragMagnitude);

    // Calculate Magnus force (perpendicular to velocity and spin)
    const magnusForce = this.calculateMagnusForce(state, relativeVelocity, area);

    // Gravity force
    const gravityForce = new Vector3(0, -state.mass * BaseballPhysics.GRAVITY, 0);

    // Total force
    const totalForce = dragForce.add(magnusForce).add(gravityForce);

    // Acceleration (F = ma)
    const acceleration = totalForce.scale(1 / state.mass);

    // Update velocity (Euler integration)
    state.velocity.addInPlace(acceleration.scale(dt));

    // Update position
    state.position.addInPlace(state.velocity.scale(dt));

    // Spin decay (friction with air)
    const spinDecay = 0.99; // Spin decreases slightly over time
    state.spin.scaleInPlace(spinDecay);
  }

  /**
   * Calculate Magnus force from ball spin
   * Magnus effect causes balls to curve based on spin
   */
  private calculateMagnusForce(state: BallState, velocity: Vector3, area: number): Vector3 {
    const speed = velocity.length();
    if (speed < 0.01) return Vector3.Zero();

    // Angular velocity magnitude
    const spinMagnitude = state.spin.length();
    if (spinMagnitude < 0.1) return Vector3.Zero();

    // Spin parameter (determines strength of Magnus effect)
    const spinParameter = (state.radius * spinMagnitude) / speed;

    // Magnus force magnitude
    // F_magnus = 0.5 * ρ * A * C_L * v² * S
    const magnusMagnitude = 0.5 * BaseballPhysics.AIR_DENSITY *
                           area * BaseballPhysics.LIFT_COEFFICIENT *
                           speed * speed * spinParameter;

    // Direction: perpendicular to both velocity and spin axis
    // Cross product: spin × velocity gives Magnus force direction
    const forceDirection = Vector3.Cross(state.spin, velocity).normalize();

    return forceDirection.scale(magnusMagnitude);
  }

  /**
   * Calculate realistic pitch characteristics based on pitcher stats and pitch type
   */
  public generatePitch(
    pitchSpeed: number, // 1-10 stat
    pitchControl: number, // 1-10 stat
    pitchType: "fastball" | "curveball" | "slider" | "changeup",
    releasePoint: Vector3
  ): PitchParameters {
    // Convert stats to realistic values
    const baseVelocity = 60 + (pitchSpeed * 3); // 63-90 mph range

    let velocity: number;
    let spinRate: number;
    let spinAxis: Vector3;
    let releaseAngle: number;

    switch (pitchType) {
      case "fastball":
        velocity = baseVelocity;
        spinRate = 2200 + Math.random() * 400; // 2200-2600 rpm (high backspin)
        spinAxis = new Vector3(1, 0, 0); // Backspin (horizontal axis)
        releaseAngle = 0; // Straight
        break;

      case "curveball":
        velocity = baseVelocity * 0.85; // ~15% slower
        spinRate = 2400 + Math.random() * 600; // 2400-3000 rpm (high topspin)
        spinAxis = new Vector3(-1, 0, 0); // Topspin
        releaseAngle = -5; // Downward break
        break;

      case "slider":
        velocity = baseVelocity * 0.90; // ~10% slower
        spinRate = 2000 + Math.random() * 500; // 2000-2500 rpm
        spinAxis = new Vector3(-0.5, 0, 0.866); // Angled spin (sweeping break)
        releaseAngle = -2;
        break;

      case "changeup":
        velocity = baseVelocity * 0.75; // ~25% slower
        spinRate = 1400 + Math.random() * 400; // 1400-1800 rpm (low spin)
        spinAxis = new Vector3(0.707, 0, 0.707); // Mixed spin
        releaseAngle = -3;
        break;
    }

    // Add control variance (lower control = more random movement)
    const controlVariance = (11 - pitchControl) * 0.05;
    velocity += (Math.random() - 0.5) * velocity * controlVariance;
    spinRate += (Math.random() - 0.5) * spinRate * controlVariance;

    return {
      velocity,
      spinRate,
      spinAxis: spinAxis.normalize(),
      releasePoint,
      releaseAngle
    };
  }

  /**
   * Calculate realistic hit characteristics based on contact quality and batter stats
   */
  public generateHit(
    contactQuality: number, // 0-1 (1 = perfect contact)
    battingPower: number, // 1-10 stat
    battingAccuracy: number, // 1-10 stat
    pitchVelocity: number // mph
  ): HitParameters {
    // Exit velocity depends on contact quality, power, and pitch speed
    const maxExitVelo = 80 + (battingPower * 5); // 85-130 mph range
    const pitchFactor = Math.min(pitchVelocity / 90, 1.2); // Faster pitches = harder hits
    const exitVelocity = maxExitVelo * contactQuality * pitchFactor;

    // Launch angle (sweet spot is 25-35 degrees for home runs)
    const optimalAngle = 28;
    const angleSpiread = (1 - contactQuality) * 30;
    const launchAngle = optimalAngle + (Math.random() - 0.5) * angleSpiread;

    // Spray angle (pull vs opposite field)
    const maxSpray = (11 - battingAccuracy) * 5; // 5-50 degree spread
    const sprayAngle = (Math.random() - 0.5) * maxSpray;

    // Spin rates (good contact = more backspin)
    const backspin = 2000 + contactQuality * 2000; // 2000-4000 rpm
    const sidespin = Math.abs(sprayAngle) * 50; // More side spin for pulled/opposite field hits

    return {
      exitVelocity,
      launchAngle,
      sprayAngle,
      backspin,
      sidespin: sprayAngle > 0 ? sidespin : -sidespin
    };
  }

  /**
   * Set wind conditions for the game
   */
  public setWind(velocity: Vector3): void {
    this.windVelocity = velocity;
  }

  /**
   * Get the hang time (air time) for a given trajectory
   */
  public static getHangTime(trajectory: Vector3[]): number {
    return trajectory.length * 0.01; // Assuming 0.01s time step
  }

  /**
   * Get the distance traveled for a hit
   */
  public static getDistanceTraveled(trajectory: Vector3[]): number {
    if (trajectory.length < 2) return 0;

    const start = trajectory[0];
    const end = trajectory[trajectory.length - 1];

    return Math.sqrt(
      Math.pow(end.x - start.x, 2) +
      Math.pow(end.z - start.z, 2)
    );
  }

  /**
   * Determine hit outcome based on distance and fielder positions
   */
  public static determineHitOutcome(
    distance: number, // meters
    hangTime: number, // seconds
    landingPosition: Vector3,
    fielderPositions: Map<string, Vector3>
  ): "out" | "single" | "double" | "triple" | "homerun" {
    // Convert to feet for easier baseball metrics
    const distanceFeet = distance * 3.28084;

    // Home run distance (varies by ballpark, ~300-400 feet)
    if (distanceFeet > 300) {
      return "homerun";
    }

    // Check if any fielder can reach the ball
    // This is simplified - real game would use more complex AI
    const catchable = Array.from(fielderPositions.values()).some(pos => {
      const dist = Vector3.Distance(pos, landingPosition);
      const timeToReach = dist / 8; // Average fielder speed ~8 m/s
      return timeToReach < hangTime;
    });

    if (catchable && hangTime > 2) {
      return "out"; // Fly out
    }

    if (distanceFeet < 150) {
      return catchable ? "out" : "single";
    } else if (distanceFeet < 250) {
      return "double";
    } else {
      return "triple";
    }
  }
}
