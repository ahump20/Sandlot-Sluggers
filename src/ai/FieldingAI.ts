import { Vector3, Mesh, Scene } from "@babylonjs/core";
import { Player } from "../core/GameEngine";

/**
 * Intelligent fielding AI system
 * Handles fielder positioning, ball tracking, and defensive plays
 */

export interface Fielder {
  player: Player;
  position: string; // P, C, 1B, 2B, 3B, SS, LF, CF, RF
  mesh: Mesh;
  currentTarget: Vector3;
  isMoving: boolean;
  catchRange: number; // meters
  throwPower: number; // meters per second
}

export interface BallTrajectory {
  points: Vector3[];
  landingPoint: Vector3;
  hangTime: number; // seconds
  exitVelocity: number; // m/s
  launchAngle: number; // degrees
}

export class FieldingAI {
  private scene: Scene;
  private fielders: Map<string, Fielder> = new Map();

  // Standard defensive positioning (in meters from home plate)
  private static readonly POSITIONS: { [key: string]: Vector3 } = {
    P: new Vector3(0, 0, 18.44),          // Pitcher
    C: new Vector3(0, 0, -2),             // Catcher
    "1B": new Vector3(22, 0, 22),         // First base
    "2B": new Vector3(8, 0, 28),          // Second base
    "3B": new Vector3(-22, 0, 22),        // Third base
    SS: new Vector3(-8, 0, 28),           // Shortstop
    LF: new Vector3(-35, 0, 45),          // Left field
    CF: new Vector3(0, 0, 60),            // Center field
    RF: new Vector3(35, 0, 45)            // Right field
  };

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Add a fielder to the AI system
   */
  public addFielder(player: Player, mesh: Mesh): void {
    const catchRange = 2 + (player.fieldingRange * 0.5); // 2-7 meters
    const throwPower = 15 + (player.fieldingAccuracy * 2); // 15-35 m/s

    const fielder: Fielder = {
      player,
      position: player.position,
      mesh,
      currentTarget: FieldingAI.POSITIONS[player.position] || Vector3.Zero(),
      isMoving: false,
      catchRange,
      throwPower
    };

    this.fielders.set(player.id, fielder);

    // Position fielder at default location
    mesh.position = fielder.currentTarget.clone();
  }

  /**
   * Reset all fielders to default positions
   */
  public resetPositions(): void {
    this.fielders.forEach(fielder => {
      fielder.currentTarget = FieldingAI.POSITIONS[fielder.position] || Vector3.Zero();
      fielder.isMoving = false;
    });
  }

  /**
   * Shift defense based on batter tendency (pull hitter, opposite field, etc.)
   */
  public shiftDefense(batterTendency: "pull" | "opposite" | "balanced"): void {
    this.fielders.forEach(fielder => {
      const basePos = FieldingAI.POSITIONS[fielder.position];
      if (!basePos) return;

      let shift = Vector3.Zero();

      switch (batterTendency) {
        case "pull":
          // Shift toward pull side (right for righty)
          shift = new Vector3(5, 0, 0);
          break;

        case "opposite":
          // Shift toward opposite field
          shift = new Vector3(-5, 0, 0);
          break;

        case "balanced":
          // No shift
          break;
      }

      fielder.currentTarget = basePos.add(shift);
    });
  }

  /**
   * React to batted ball and assign fielders to make play
   */
  public reactToBattedBall(trajectory: BallTrajectory): {
    primaryFielder: Fielder | null;
    backupFielders: Fielder[];
    estimatedPlayType: "flyout" | "groundout" | "lineout" | "hit";
  } {
    const landingPoint = trajectory.landingPoint;
    const hangTime = trajectory.hangTime;

    // Determine play type based on trajectory
    const playType = this.determinePlayType(trajectory);

    // Find closest fielders
    const fielderDistances = Array.from(this.fielders.values()).map(fielder => ({
      fielder,
      distance: Vector3.Distance(fielder.mesh.position, landingPoint),
      timeToReach: this.calculateTimeToReach(fielder, landingPoint)
    }));

    // Sort by time to reach
    fielderDistances.sort((a, b) => a.timeToReach - b.timeToReach);

    // Primary fielder is closest who can reach in time
    const primary = fielderDistances.find(fd => fd.timeToReach < hangTime * 1.1);

    // Backup fielders
    const backups = fielderDistances
      .filter(fd => fd.fielder !== primary?.fielder)
      .slice(0, 2)
      .map(fd => fd.fielder);

    if (primary) {
      // Move primary fielder to intercept
      this.moveFielderToPoint(primary.fielder, landingPoint);

      // Move backups to support positions
      backups.forEach((backup, index) => {
        const supportPos = this.calculateSupportPosition(
          landingPoint,
          primary.fielder.mesh.position,
          index
        );
        this.moveFielderToPoint(backup, supportPos);
      });
    }

    return {
      primaryFielder: primary?.fielder || null,
      backupFielders: backups,
      estimatedPlayType: primary && primary.timeToReach < hangTime ? playType : "hit"
    };
  }

  /**
   * Determine play type based on trajectory
   */
  private determinePlayType(trajectory: BallTrajectory): "flyout" | "groundout" | "lineout" | "hit" {
    const launchAngle = trajectory.launchAngle;
    const exitVelo = trajectory.exitVelocity;
    const distance = Vector3.Distance(trajectory.landingPoint, Vector3.Zero());

    if (launchAngle < 10) {
      return "groundout";
    } else if (launchAngle < 25 && exitVelo > 30) {
      return "lineout";
    } else if (launchAngle > 25 && launchAngle < 50) {
      return distance < 80 ? "flyout" : "hit";
    } else {
      return "hit";
    }
  }

  /**
   * Calculate time for fielder to reach a point
   */
  private calculateTimeToReach(fielder: Fielder, target: Vector3): number {
    const distance = Vector3.Distance(fielder.mesh.position, target);
    const speed = 5 + (fielder.player.speed * 0.5); // 5-10 m/s

    // Add reaction time
    const reactionTime = 0.3 - (fielder.player.fieldingRange * 0.02); // 0.1-0.3 seconds

    return reactionTime + (distance / speed);
  }

  /**
   * Move fielder toward target point
   */
  private moveFielderToPoint(fielder: Fielder, target: Vector3): void {
    fielder.currentTarget = target;
    fielder.isMoving = true;
  }

  /**
   * Calculate support position for backup fielders
   */
  private calculateSupportPosition(
    ballPos: Vector3,
    primaryPos: Vector3,
    backupIndex: number
  ): Vector3 {
    // Position behind primary fielder
    const direction = ballPos.subtract(primaryPos).normalize();
    const offset = direction.scale(-8 - backupIndex * 5);
    return ballPos.add(offset);
  }

  /**
   * Update fielders' positions (call in game loop)
   */
  public update(deltaTime: number): void {
    this.fielders.forEach(fielder => {
      if (!fielder.isMoving) return;

      const currentPos = fielder.mesh.position;
      const targetPos = fielder.currentTarget;
      const distance = Vector3.Distance(currentPos, targetPos);

      if (distance < 0.5) {
        // Reached target
        fielder.mesh.position = targetPos;
        fielder.isMoving = false;
        return;
      }

      // Move toward target
      const speed = 5 + (fielder.player.speed * 0.5); // 5-10 m/s
      const moveDistance = speed * deltaTime;
      const direction = targetPos.subtract(currentPos).normalize();

      fielder.mesh.position = currentPos.add(direction.scale(moveDistance));

      // Rotate fielder to face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      fielder.mesh.rotation.y = angle;
    });
  }

  /**
   * Check if any fielder can catch the ball at current position
   */
  public checkForCatch(ballPosition: Vector3): {
    caught: boolean;
    fielder: Fielder | null;
  } {
    for (const fielder of this.fielders.values()) {
      const distance = Vector3.Distance(fielder.mesh.position, ballPosition);

      if (distance < fielder.catchRange) {
        // Ball is in catch range
        const catchProbability = this.calculateCatchProbability(fielder, distance);

        if (Math.random() < catchProbability) {
          return { caught: true, fielder };
        }
      }
    }

    return { caught: false, fielder: null };
  }

  /**
   * Calculate probability of successful catch
   */
  private calculateCatchProbability(fielder: Fielder, distance: number): number {
    // Base probability from fielding accuracy stat
    const baseProb = fielder.player.fieldingAccuracy / 10; // 0.1 - 1.0

    // Adjust based on distance (easier catches closer to fielder)
    const distanceFactor = 1 - (distance / fielder.catchRange);

    // Adjust based on whether fielder is moving
    const movementPenalty = fielder.isMoving ? 0.9 : 1.0;

    return baseProb * distanceFactor * movementPenalty;
  }

  /**
   * Fielder throws ball to a base
   */
  public throwToBase(
    fielder: Fielder,
    targetBase: "1B" | "2B" | "3B" | "home"
  ): {
    throwTime: number; // seconds
    accuracy: number;  // 0-1
  } {
    const targetPos = FieldingAI.POSITIONS[targetBase] || Vector3.Zero();
    const distance = Vector3.Distance(fielder.mesh.position, targetPos);

    // Calculate throw time based on throw power
    const throwTime = distance / fielder.throwPower;

    // Calculate accuracy based on fielding accuracy stat and distance
    const baseAccuracy = fielder.player.fieldingAccuracy / 10;
    const distancePenalty = Math.max(0, 1 - (distance / 50)); // Penalty for long throws
    const accuracy = baseAccuracy * distancePenalty;

    return { throwTime, accuracy };
  }

  /**
   * Get fielder by position
   */
  public getFielderByPosition(position: string): Fielder | undefined {
    return Array.from(this.fielders.values()).find(f => f.position === position);
  }

  /**
   * Get all fielders
   */
  public getAllFielders(): Fielder[] {
    return Array.from(this.fielders.values());
  }

  /**
   * Position fielders for specific situation (e.g., infield in for close game)
   */
  public setSpecialFormation(formation: "normal" | "infield_in" | "double_play" | "no_doubles"): void {
    const adjustments: { [key: string]: Vector3 } = {};

    switch (formation) {
      case "infield_in":
        // Bring infielders closer to home
        adjustments["1B"] = new Vector3(15, 0, 15);
        adjustments["2B"] = new Vector3(5, 0, 20);
        adjustments["3B"] = new Vector3(-15, 0, 15);
        adjustments["SS"] = new Vector3(-5, 0, 20);
        break;

      case "double_play":
        // Position for turning double play
        adjustments["2B"] = new Vector3(10, 0, 26);
        adjustments["SS"] = new Vector3(-10, 0, 26);
        break;

      case "no_doubles":
        // Outfielders play deep
        adjustments["LF"] = new Vector3(-40, 0, 55);
        adjustments["CF"] = new Vector3(0, 0, 70);
        adjustments["RF"] = new Vector3(40, 0, 55);
        break;

      case "normal":
      default:
        // Reset to normal positions
        this.resetPositions();
        return;
    }

    // Apply adjustments
    this.fielders.forEach(fielder => {
      if (adjustments[fielder.position]) {
        fielder.currentTarget = adjustments[fielder.position];
      }
    });
  }

  /**
   * Dispose all fielders
   */
  public dispose(): void {
    this.fielders.clear();
  }
}
