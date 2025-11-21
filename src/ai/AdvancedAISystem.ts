/**
 * AdvancedAISystem.ts
 * Intelligent AI for fielding, pitching decisions, batting strategy, and base running
 */

import { Vector2, Ball } from '../PhysicsEngine';
import { Player } from '../Renderer';

export interface AIPersonality {
  aggression: number; // 0-100, affects base running and pitch selection
  patience: number; // 0-100, affects at-bat discipline
  riskTaking: number; // 0-100, affects stolen base attempts
  intelligence: number; // 0-100, affects situational awareness
  clutchFactor: number; // 0-100, performance in pressure situations
}

export interface GameSituation {
  inning: number;
  outs: number;
  balls: number;
  strikes: number;
  score: { home: number; away: number };
  bases: [boolean, boolean, boolean];
  isTopOfInning: boolean;
}

export interface PitchRecommendation {
  type: 'fastball' | 'curveball' | 'slider' | 'changeup';
  location: Vector2; // Target location in strike zone
  confidence: number; // 0-1
  reasoning: string;
}

export interface BattingStrategy {
  approach: 'aggressive' | 'patient' | 'contact' | 'power';
  swingZone: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  swingTiming: 'early' | 'normal' | 'late';
  confidence: number;
}

export interface FieldingDecision {
  targetPlayer: Player;
  targetPosition: Vector2;
  throwTarget?: Vector2;
  priority: 'high' | 'medium' | 'low';
  action: 'move' | 'catch' | 'throw' | 'dive';
}

export interface BaseRunningDecision {
  base: 1 | 2 | 3 | 'home';
  action: 'advance' | 'hold' | 'retreat' | 'steal';
  confidence: number;
  reasoning: string;
}

export class AdvancedAISystem {
  private readonly personality: AIPersonality;
  private pitchHistory: Array<{ type: string; location: Vector2; result: string }> = [];
  private batterTendencies: Map<string, BatterProfile> = new Map();
  private readonly STRIKE_ZONE_CENTER: Vector2 = { x: 700, y: 530 };
  private readonly STRIKE_ZONE_WIDTH = 60;
  private readonly STRIKE_ZONE_HEIGHT = 60;

  constructor(personality?: Partial<AIPersonality>) {
    this.personality = {
      aggression: 70,
      patience: 65,
      riskTaking: 60,
      intelligence: 75,
      clutchFactor: 70,
      ...personality
    };
  }

  /**
   * Recommend a pitch based on game situation and batter analysis
   */
  public recommendPitch(
    situation: GameSituation,
    batterName: string,
    pitcherStamina: number
  ): PitchRecommendation {
    const batterProfile = this.getBatterProfile(batterName);
    const pressureLevel = this.calculatePressureLevel(situation);

    // Analyze count
    const isAdvantage = situation.balls < situation.strikes;
    const isBehind = situation.balls > situation.strikes;

    // Pitch type selection
    let pitchType: 'fastball' | 'curveball' | 'slider' | 'changeup';
    let reasoning = '';

    // High leverage situations
    if (pressureLevel > 0.7 && situation.outs === 2) {
      // Go with best pitch in pressure
      pitchType = this.getBestPitchType(pitcherStamina);
      reasoning = 'High pressure situation, using best pitch';
    }
    // Ahead in count
    else if (isAdvantage && situation.strikes === 2) {
      // Waste pitch or put-away pitch
      if (Math.random() > 0.5) {
        pitchType = 'curveball';
        reasoning = 'Ahead in count, going for strikeout';
      } else {
        pitchType = 'slider';
        reasoning = 'Waste pitch out of zone';
      }
    }
    // Behind in count
    else if (isBehind && situation.balls === 3) {
      // Need strike
      pitchType = 'fastball';
      reasoning = 'Behind in count, need a strike';
    }
    // Batter weaknesses
    else if (batterProfile.weaknesses.length > 0) {
      const weakness = batterProfile.weaknesses[0];
      pitchType = weakness.pitchType as any;
      reasoning = `Exploiting batter weakness: ${weakness.description}`;
    }
    // Mix it up based on recent pitches
    else {
      pitchType = this.selectPitchForVariety();
      reasoning = 'Mixing up pitches to keep batter off balance';
    }

    // Location selection
    const location = this.selectPitchLocation(
      pitchType,
      batterProfile,
      isAdvantage,
      isBehind
    );

    // Confidence calculation
    const confidence = this.calculatePitchConfidence(
      pitchType,
      location,
      pitcherStamina,
      pressureLevel
    );

    return {
      type: pitchType,
      location,
      confidence,
      reasoning
    };
  }

  /**
   * Determine batting strategy based on situation
   */
  public determineBattingStrategy(
    situation: GameSituation,
    batterRatings: { contact: number; power: number; speed: number }
  ): BattingStrategy {
    const pressureLevel = this.calculatePressureLevel(situation);
    const isBehind = this.isTeamBehind(situation);
    const isLateInning = situation.inning >= 7;

    let approach: 'aggressive' | 'patient' | 'contact' | 'power';
    let swingTiming: 'early' | 'normal' | 'late' = 'normal';

    // Determine approach based on situation
    if (situation.balls === 3 && situation.strikes < 2) {
      // Take pitch if ball 4
      approach = 'patient';
    } else if (isBehind && isLateInning && situation.outs === 2) {
      // Need power hit to tie/win
      approach = 'power';
      swingTiming = 'early';
    } else if (this.runnersInScoringPosition(situation) && situation.outs < 2) {
      // Try to make contact to advance runners
      approach = 'contact';
    } else if (batterRatings.power > 80) {
      // Power hitter - be aggressive
      approach = 'aggressive';
    } else if (batterRatings.contact > 80) {
      // Contact hitter - focus on getting on base
      approach = 'contact';
    } else {
      // Balanced approach
      approach = this.personality.aggression > 70 ? 'aggressive' : 'patient';
    }

    // Define swing zone based on approach
    const swingZone = this.defineSwingZone(approach, situation);

    // Calculate confidence
    const confidence = this.calculateBattingConfidence(
      approach,
      batterRatings,
      pressureLevel
    );

    return {
      approach,
      swingZone,
      swingTiming,
      confidence
    };
  }

  /**
   * Make fielding decisions
   */
  public makeFieldingDecision(
    ball: Ball,
    fielders: Player[],
    situation: GameSituation
  ): FieldingDecision {
    // Predict where ball will land
    const landingPosition = this.predictBallLanding(ball);

    if (!landingPosition) {
      return {
        targetPlayer: fielders[0],
        targetPosition: ball.position,
        priority: 'low',
        action: 'move'
      };
    }

    // Find closest fielder
    const closestFielder = this.findClosestFielder(landingPosition, fielders);

    // Determine if ball is catchable
    const timeToLand = this.calculateTimeToLanding(ball);
    const distanceToFielder = this.calculateDistance(
      closestFielder.position,
      landingPosition
    );
    const timeForFielderToReach = distanceToFielder / (closestFielder.name === 'CF' ? 10 : 8);

    const isCatchable = timeForFielderToReach < timeToLand;

    // Determine action
    let action: 'move' | 'catch' | 'throw' | 'dive';
    let priority: 'high' | 'medium' | 'low';

    if (isCatchable) {
      if (timeForFielderToReach > timeToLand * 0.9) {
        // Need to dive
        action = 'dive';
        priority = 'high';
      } else {
        action = 'catch';
        priority = 'high';
      }
    } else {
      action = 'move';
      priority = 'medium';
    }

    // Determine throw target after catch
    let throwTarget: Vector2 | undefined;
    if (action === 'catch' || action === 'dive') {
      throwTarget = this.determineThrowTarget(situation, landingPosition);
    }

    return {
      targetPlayer: closestFielder,
      targetPosition: landingPosition,
      throwTarget,
      priority,
      action
    };
  }

  /**
   * Make base running decision
   */
  public makeBaseRunningDecision(
    currentBase: 0 | 1 | 2 | 3, // 0 = home plate (batting)
    ball: Ball,
    situation: GameSituation,
    runnerSpeed: number
  ): BaseRunningDecision {
    const ballInAir = ball.active && ball.position.y < 500;
    const isGroundBall = !ballInAir;

    // Default: hold
    let action: 'advance' | 'hold' | 'retreat' | 'steal' = 'hold';
    let targetBase: 1 | 2 | 3 | 'home' = (currentBase + 1) as any;
    let confidence = 0.5;
    let reasoning = 'Waiting for better opportunity';

    // On contact decisions
    if (ball.active) {
      if (ballInAir) {
        // Fly ball - tag up logic
        if (situation.outs < 2) {
          action = 'hold';
          reasoning = 'Holding to tag up on fly ball';
        } else {
          // 2 outs - run on contact
          action = 'advance';
          confidence = 0.8;
          reasoning = '2 outs - running on contact';
        }
      } else if (isGroundBall) {
        // Ground ball - always run
        if (situation.outs === 2) {
          action = 'advance';
          confidence = 0.9;
          reasoning = '2 outs - force advance';
        } else {
          // Check if force play
          const isForced = this.isForcePlay(currentBase, situation);
          if (isForced) {
            action = 'advance';
            confidence = 1.0;
            reasoning = 'Force play - must advance';
          } else {
            // Read the fielder's position
            action = 'advance';
            confidence = 0.7;
            reasoning = 'Ground ball - advancing with caution';
          }
        }
      }
    }
    // Stealing decision
    else if (!ball.active && this.personality.riskTaking > 70) {
      const stealChance = this.calculateStealSuccessChance(
        currentBase,
        runnerSpeed,
        situation
      );

      if (stealChance > 0.7) {
        action = 'steal';
        confidence = stealChance;
        reasoning = `High success chance (${(stealChance * 100).toFixed(0)}%) for stolen base`;
      }
    }

    return {
      base: targetBase,
      action,
      confidence,
      reasoning
    };
  }

  /**
   * Analyze batter and update tendencies
   */
  public analyzeBatter(
    batterName: string,
    pitchType: string,
    pitchLocation: Vector2,
    result: 'hit' | 'miss' | 'foul' | 'ball'
  ): void {
    let profile = this.batterTendencies.get(batterName);

    if (!profile) {
      profile = this.createDefaultBatterProfile(batterName);
      this.batterTendencies.set(batterName, profile);
    }

    // Update profile based on result
    profile.pitchesSeen++;

    if (result === 'hit') {
      profile.hits++;
      // Track hot zones
      const zone = this.getZoneFromLocation(pitchLocation);
      profile.hotZones.set(zone, (profile.hotZones.get(zone) || 0) + 1);
    } else if (result === 'miss') {
      profile.swingsAndMisses++;
      // Track cold zones
      const zone = this.getZoneFromLocation(pitchLocation);
      profile.coldZones.set(zone, (profile.coldZones.get(zone) || 0) + 1);
    }

    // Update weaknesses
    this.updateBatterWeaknesses(profile, pitchType, pitchLocation, result);

    // Add to pitch history
    this.pitchHistory.push({
      type: pitchType,
      location: pitchLocation,
      result
    });

    // Keep only last 20 pitches
    if (this.pitchHistory.length > 20) {
      this.pitchHistory.shift();
    }
  }

  /**
   * Calculate situational pressure level
   */
  private calculatePressureLevel(situation: GameSituation): number {
    let pressure = 0;

    // Score differential
    const scoreDiff = Math.abs(situation.score.home - situation.score.away);
    if (scoreDiff <= 1) pressure += 0.3;
    if (scoreDiff === 0) pressure += 0.1;

    // Inning
    if (situation.inning >= 7) pressure += 0.2;
    if (situation.inning >= 9) pressure += 0.2;

    // Outs
    if (situation.outs === 2) pressure += 0.2;

    // Runners
    if (this.runnersInScoringPosition(situation)) pressure += 0.2;

    // Full count
    if (situation.balls === 3 && situation.strikes === 2) pressure += 0.1;

    return Math.min(1.0, pressure);
  }

  /**
   * Get batter profile from memory
   */
  private getBatterProfile(batterName: string): BatterProfile {
    return (
      this.batterTendencies.get(batterName) ||
      this.createDefaultBatterProfile(batterName)
    );
  }

  /**
   * Create default batter profile
   */
  private createDefaultBatterProfile(batterName: string): BatterProfile {
    return {
      name: batterName,
      pitchesSeen: 0,
      hits: 0,
      swingsAndMisses: 0,
      hotZones: new Map(),
      coldZones: new Map(),
      weaknesses: [],
      strengths: []
    };
  }

  /**
   * Select pitch type for variety
   */
  private selectPitchForVariety(): 'fastball' | 'curveball' | 'slider' | 'changeup' {
    const recentPitches = this.pitchHistory.slice(-5);

    // Count pitch types
    const counts = {
      fastball: 0,
      curveball: 0,
      slider: 0,
      changeup: 0
    };

    recentPitches.forEach(p => {
      if (p.type in counts) {
        counts[p.type as keyof typeof counts]++;
      }
    });

    // Select least used pitch
    const leastUsed = Object.entries(counts).reduce((min, [type, count]) =>
      count < min[1] ? [type, count] : min
    );

    return leastUsed[0] as any;
  }

  /**
   * Select pitch location
   */
  private selectPitchLocation(
    pitchType: string,
    batterProfile: BatterProfile,
    isAdvantage: boolean,
    isBehind: boolean
  ): Vector2 {
    const center = this.STRIKE_ZONE_CENTER;
    const width = this.STRIKE_ZONE_WIDTH;
    const height = this.STRIKE_ZONE_HEIGHT;

    // Check batter's cold zones
    if (batterProfile.coldZones.size > 0) {
      const coldZone = Array.from(batterProfile.coldZones.entries())
        .sort((a, b) => b[1] - a[1])[0][0];

      return this.getLocationFromZone(coldZone);
    }

    // Behind in count - throw strike
    if (isBehind) {
      return {
        x: center.x + (Math.random() - 0.5) * width * 0.6,
        y: center.y + (Math.random() - 0.5) * height * 0.6
      };
    }

    // Ahead in count - paint corners or waste
    if (isAdvantage) {
      const wastePitch = Math.random() > 0.6;
      if (wastePitch) {
        // Outside strike zone
        return {
          x: center.x + (Math.random() > 0.5 ? 1 : -1) * width * 0.8,
          y: center.y + (Math.random() - 0.5) * height
        };
      }
    }

    // Normal - target edges
    const targetEdge = Math.random();
    if (targetEdge < 0.25) {
      // Inside corner
      return { x: center.x - width * 0.4, y: center.y };
    } else if (targetEdge < 0.5) {
      // Outside corner
      return { x: center.x + width * 0.4, y: center.y };
    } else if (targetEdge < 0.75) {
      // High
      return { x: center.x, y: center.y - height * 0.4 };
    } else {
      // Low
      return { x: center.x, y: center.y + height * 0.4 };
    }
  }

  /**
   * Calculate pitch confidence
   */
  private calculatePitchConfidence(
    pitchType: string,
    location: Vector2,
    stamina: number,
    pressure: number
  ): number {
    let confidence = 0.7;

    // Stamina factor
    confidence *= stamina / 100;

    // Pressure factor (clutch personality helps)
    const clutchBonus = this.personality.clutchFactor / 100;
    confidence *= 1 - pressure * (1 - clutchBonus);

    // Location factor (harder to hit corners)
    const distanceFromCenter = this.calculateDistance(
      location,
      this.STRIKE_ZONE_CENTER
    );
    if (distanceFromCenter > this.STRIKE_ZONE_WIDTH * 0.3) {
      confidence *= 0.9; // Harder to hit edge but also harder to locate
    }

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * Define swing zone based on approach
   */
  private defineSwingZone(approach: string, situation: GameSituation): any {
    const center = this.STRIKE_ZONE_CENTER;
    const width = this.STRIKE_ZONE_WIDTH;
    const height = this.STRIKE_ZONE_HEIGHT;

    let expansion = 0;

    switch (approach) {
      case 'aggressive':
        expansion = 1.3; // Swing at pitches outside zone
        break;
      case 'patient':
        expansion = 0.8; // Only swing at good pitches
        break;
      case 'contact':
        expansion = 1.0; // Normal zone
        break;
      case 'power':
        expansion = 1.1; // Slightly expanded
        break;
      default:
        expansion = 1.0;
    }

    return {
      minX: center.x - (width / 2) * expansion,
      maxX: center.x + (width / 2) * expansion,
      minY: center.y - (height / 2) * expansion,
      maxY: center.y + (height / 2) * expansion
    };
  }

  /**
   * Calculate batting confidence
   */
  private calculateBattingConfidence(
    approach: string,
    ratings: { contact: number; power: number },
    pressure: number
  ): number {
    let confidence = 0.6;

    // Rating factor
    if (approach === 'power') {
      confidence += (ratings.power / 100) * 0.3;
    } else {
      confidence += (ratings.contact / 100) * 0.3;
    }

    // Pressure factor
    const clutchBonus = this.personality.clutchFactor / 100;
    confidence *= 1 - pressure * (1 - clutchBonus);

    return Math.max(0.2, Math.min(1.0, confidence));
  }

  /**
   * Predict ball landing position
   */
  private predictBallLanding(ball: Ball): Vector2 | null {
    // Simple physics prediction
    const gravity = 9.8 * 50; // Scaled for canvas
    const timeToGround = (2 * ball.velocity.y) / gravity;

    if (timeToGround <= 0) return null;

    return {
      x: ball.position.x + ball.velocity.x * timeToGround,
      y: 550 // Ground level
    };
  }

  /**
   * Calculate time until ball lands
   */
  private calculateTimeToLanding(ball: Ball): number {
    const gravity = 9.8 * 50;
    return Math.abs((2 * ball.velocity.y) / gravity);
  }

  /**
   * Find closest fielder to position
   */
  private findClosestFielder(position: Vector2, fielders: Player[]): Player {
    return fielders.reduce((closest, fielder) => {
      const distClosest = this.calculateDistance(closest.position, position);
      const distFielder = this.calculateDistance(fielder.position, position);
      return distFielder < distClosest ? fielder : closest;
    });
  }

  /**
   * Determine throw target after catch
   */
  private determineThrowTarget(
    situation: GameSituation,
    catchPosition: Vector2
  ): Vector2 {
    // Throw to nearest base with runner
    if (situation.bases[2]) return { x: 650, y: 550 }; // Home
    if (situation.bases[1]) return { x: 650 - 150, y: 550 - 150 }; // Third
    if (situation.bases[0]) return { x: 650 - 150, y: 550 }; // Second

    // Default: throw to first
    return { x: 700, y: 550 };
  }

  /**
   * Calculate steal success chance
   */
  private calculateStealSuccessChance(
    currentBase: number,
    speed: number,
    situation: GameSituation
  ): number {
    let chance = 0.5;

    // Speed factor
    chance += (speed / 100) * 0.3;

    // Count factor (more likely on 3-2)
    if (situation.balls === 3 && situation.strikes === 2) {
      chance += 0.1;
    }

    // Outs factor (less likely with 2 outs)
    if (situation.outs === 2) {
      chance -= 0.15;
    }

    return Math.max(0.1, Math.min(0.95, chance));
  }

  /**
   * Check if runner is forced to advance
   */
  private isForcePlay(currentBase: number, situation: GameSituation): boolean {
    if (currentBase === 0) return true; // Batter always forced
    if (currentBase === 1 && situation.bases[0]) return true;
    if (currentBase === 2 && situation.bases[0] && situation.bases[1]) return true;
    return false;
  }

  /**
   * Check if runners in scoring position
   */
  private runnersInScoringPosition(situation: GameSituation): boolean {
    return situation.bases[1] || situation.bases[2];
  }

  /**
   * Check if team is behind
   */
  private isTeamBehind(situation: GameSituation): boolean {
    if (situation.isTopOfInning) {
      return situation.score.away < situation.score.home;
    }
    return situation.score.home < situation.score.away;
  }

  /**
   * Get best pitch type based on stamina
   */
  private getBestPitchType(stamina: number): 'fastball' | 'curveball' | 'slider' | 'changeup' {
    if (stamina > 80) return 'fastball';
    if (stamina > 60) return 'slider';
    return 'changeup';
  }

  /**
   * Get zone from pitch location
   */
  private getZoneFromLocation(location: Vector2): string {
    const center = this.STRIKE_ZONE_CENTER;
    const dx = location.x - center.x;
    const dy = location.y - center.y;

    const xZone = dx < -20 ? 'inside' : dx > 20 ? 'outside' : 'middle';
    const yZone = dy < -20 ? 'high' : dy > 20 ? 'low' : 'middle';

    return `${yZone}_${xZone}`;
  }

  /**
   * Get location from zone
   */
  private getLocationFromZone(zone: string): Vector2 {
    const [yZone, xZone] = zone.split('_');
    const center = this.STRIKE_ZONE_CENTER;

    const x =
      xZone === 'inside'
        ? center.x - 25
        : xZone === 'outside'
        ? center.x + 25
        : center.x;

    const y =
      yZone === 'high'
        ? center.y - 25
        : yZone === 'low'
        ? center.y + 25
        : center.y;

    return { x, y };
  }

  /**
   * Update batter weaknesses based on results
   */
  private updateBatterWeaknesses(
    profile: BatterProfile,
    pitchType: string,
    location: Vector2,
    result: string
  ): void {
    if (result === 'miss' || result === 'foul') {
      const zone = this.getZoneFromLocation(location);

      // Check if this is a recurring weakness
      const existing = profile.weaknesses.find(
        w => w.pitchType === pitchType && w.zone === zone
      );

      if (existing) {
        existing.frequency++;
      } else if (profile.weaknesses.length < 5) {
        profile.weaknesses.push({
          pitchType,
          zone,
          frequency: 1,
          description: `Struggles with ${pitchType} in ${zone} zone`
        });
      }
    }
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(p1: Vector2, p2: Vector2): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Get current personality
   */
  public getPersonality(): AIPersonality {
    return { ...this.personality };
  }

  /**
   * Update personality (for difficulty adjustment)
   */
  public updatePersonality(updates: Partial<AIPersonality>): void {
    Object.assign(this.personality, updates);
  }
}

/**
 * Supporting interfaces
 */
interface BatterProfile {
  name: string;
  pitchesSeen: number;
  hits: number;
  swingsAndMisses: number;
  hotZones: Map<string, number>;
  coldZones: Map<string, number>;
  weaknesses: Array<{
    pitchType: string;
    zone: string;
    frequency: number;
    description: string;
  }>;
  strengths: Array<{
    pitchType: string;
    zone: string;
    description: string;
  }>;
}
