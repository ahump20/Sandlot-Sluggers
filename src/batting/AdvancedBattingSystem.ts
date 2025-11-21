/**
 * Advanced Batting Mechanics System
 *
 * Comprehensive batting system with realistic swing mechanics, contact quality analysis,
 * and advanced analytics tracking. Includes exit velocity calculations, launch angle
 * optimization, barrel percentage, hot/cold zones, and plate discipline metrics.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Swing timing and execution metrics
 */
export interface SwingMechanics {
  swingSpeed: number; // mph (40-90)
  swingPath: 'uppercut' | 'level' | 'downward' | 'inside-out' | 'outside-in';
  timingOffset: number; // ms early (-) or late (+)
  contactPoint: {
    x: number; // horizontal position (-1 to 1, relative to plate)
    y: number; // vertical position (0 to 1, 0 = ground, 1 = letters)
    z: number; // depth (-1 to 1, relative to plate front)
  };
  batAngle: number; // degrees at contact
  followThrough: boolean;
  hipRotation: number; // degrees (0-180)
  weightTransfer: number; // 0-1 (back to front)
  handPath: 'direct' | 'looping' | 'casting';
  headStability: number; // 0-1 (1 = perfect)
}

/**
 * Contact quality analysis
 */
export interface ContactAnalysis {
  contactQuality: 'barrel' | 'solid' | 'flare' | 'weak' | 'topped' | 'under' | 'miss';
  exitVelocity: number; // mph
  launchAngle: number; // degrees (-90 to 90)
  spinRate: number; // rpm
  spinAxis: { x: number; y: number; z: number }; // backspin, sidespin, gyrospin
  sweetSpotHit: boolean;
  barrelPercentage: number; // 0-100
  hardHitRate: number; // 0-100 (95+ mph exit velo)
  expectedBattingAverage: number; // xBA based on exit velo and launch angle
  expectedSlugging: number; // xSLG
  hitProbability: number; // 0-1
  trajectory: 'ground_ball' | 'line_drive' | 'fly_ball' | 'popup';
}

/**
 * Plate approach and discipline
 */
export interface PlateApproach {
  approachType: 'aggressive' | 'patient' | 'contact' | 'power' | 'situational';
  swingDecision: 'swing' | 'take' | 'check_swing';
  pitchRecognition: number; // 0-1 (ability to identify pitch type)
  strikeZoneJudgment: number; // 0-1 (ability to recognize strikes)
  chaseRate: number; // 0-100 (swing % outside zone)
  contactRate: number; // 0-100 (contact % on swings)
  whiffRate: number; // 0-100 (whiff % on swings)
  swingPercentage: {
    inZone: number; // Z-Swing%
    outOfZone: number; // O-Swing%
    overall: number; // Swing%
  };
  watchRate: number; // 0-100 (called strikes %)
  discipline: number; // 0-100 composite score
}

/**
 * Hot and cold zones for a batter
 */
export interface HotZone {
  x: number; // horizontal position
  y: number; // vertical position
  battingAverage: number;
  sluggingPercentage: number;
  whiffRate: number;
  swingRate: number;
  sampleSize: number;
}

/**
 * Swing tendencies and patterns
 */
export interface SwingTendencies {
  preferredSwingPath: string;
  avgSwingSpeed: number;
  avgBatAngle: number;
  earlyTiming: number; // % of swings that are early
  lateTiming: number; // % of swings that are late
  onTimeTiming: number; // % of swings that are on time
  upperBodyDominance: number; // 0-1 (vs lower body)
  aggressivenessLevel: number; // 0-100
  pitchTypePreferences: {
    fastball: number;
    curveball: number;
    slider: number;
    changeup: number;
    cutter: number;
    splitter: number;
  };
  countBehavior: {
    ahead: PlateApproach;
    behind: PlateApproach;
    even: PlateApproach;
    twoStrikes: PlateApproach;
  };
}

/**
 * Batting analytics for a player
 */
export interface BattingAnalytics {
  playerId: string;
  totalSwings: number;
  totalPitchesSeen: number;

  // Contact metrics
  contactRate: number;
  barrelRate: number;
  hardHitRate: number;
  avgExitVelocity: number;
  maxExitVelocity: number;
  avgLaunchAngle: number;
  sweetSpotPercentage: number;

  // Quality of contact distribution
  contactDistribution: {
    barrel: number;
    solid: number;
    flare: number;
    weak: number;
    topped: number;
    under: number;
    miss: number;
  };

  // Trajectory distribution
  groundBallRate: number;
  lineDriveRate: number;
  flyBallRate: number;
  popupRate: number;

  // Expected stats
  expectedBA: number;
  expectedSLG: number;
  expectedOPS: number;

  // Plate discipline
  zoneSwingRate: number; // Z-Swing%
  oSwingRate: number; // O-Swing%
  zContactRate: number; // Z-Contact%
  oContactRate: number; // O-Contact%
  chaseRate: number;
  whiffRate: number;

  // Hot/cold zones (9x9 grid)
  zones: HotZone[][];

  // Tendencies
  tendencies: SwingTendencies;

  // Performance by count
  countStats: Map<string, { ba: number; slg: number; ops: number }>;

  // Recent form (last 10 at-bats)
  recentForm: ContactAnalysis[];
}

/**
 * Pitch recognition data
 */
export interface PitchRecognitionData {
  pitchType: string;
  velocity: number;
  movement: { x: number; y: number };
  location: { x: number; y: number };
  releasePoint: { x: number; y: number; z: number };
  spinRate: number;

  // Recognition windows (ms)
  identificationTime: number; // time to identify pitch type
  decisionTime: number; // time to decide swing/take
  reactionTime: number; // total time from release to swing

  // Recognition accuracy
  correctIdentification: boolean;
  confidenceLevel: number; // 0-1
}

/**
 * Swing analysis result
 */
export interface SwingAnalysisResult {
  mechanics: SwingMechanics;
  contact: ContactAnalysis;
  approach: PlateApproach;
  recognition: PitchRecognitionData;

  // Feedback and recommendations
  mechanicalIssues: string[];
  strengths: string[];
  recommendations: string[];

  // Grades (0-100)
  timingGrade: number;
  mechanicsGrade: number;
  contactGrade: number;
  approachGrade: number;
  overallGrade: number;
}

// ============================================================================
// Advanced Batting System Class
// ============================================================================

export class AdvancedBattingSystem {
  private analytics: Map<string, BattingAnalytics>;
  private swingHistory: Map<string, SwingAnalysisResult[]>;

  // Physics constants
  private readonly SWEET_SPOT_SIZE: number = 0.08; // 8cm diameter
  private readonly BARREL_MIN_EXIT_VELO: number = 98; // mph
  private readonly BARREL_MIN_LAUNCH_ANGLE: number = 26; // degrees
  private readonly BARREL_MAX_LAUNCH_ANGLE: number = 30; // degrees
  private readonly HARD_HIT_THRESHOLD: number = 95; // mph

  // Timing windows (ms)
  private readonly PERFECT_TIMING_WINDOW: number = 15; // ms
  private readonly GOOD_TIMING_WINDOW: number = 30; // ms
  private readonly FAIR_TIMING_WINDOW: number = 50; // ms

  // Zone grid size
  private readonly ZONE_GRID_SIZE: number = 9; // 9x9 grid

  constructor() {
    this.analytics = new Map();
    this.swingHistory = new Map();
  }

  // ========================================================================
  // Public API
  // ========================================================================

  /**
   * Analyze a swing and return comprehensive results
   */
  public analyzeSwing(
    playerId: string,
    mechanics: SwingMechanics,
    pitchData: {
      type: string;
      velocity: number;
      location: { x: number; y: number };
      movement: { x: number; y: number };
      spinRate: number;
    }
  ): SwingAnalysisResult {
    // Calculate contact quality
    const contact = this.calculateContactQuality(mechanics, pitchData);

    // Determine plate approach
    const approach = this.evaluatePlateApproach(mechanics, pitchData);

    // Assess pitch recognition
    const recognition = this.assessPitchRecognition(mechanics, pitchData);

    // Identify issues and strengths
    const mechanicalIssues = this.identifyMechanicalIssues(mechanics);
    const strengths = this.identifyStrengths(mechanics, contact);
    const recommendations = this.generateRecommendations(mechanics, contact);

    // Calculate grades
    const timingGrade = this.gradeTimingQuality(mechanics.timingOffset);
    const mechanicsGrade = this.gradeMechanics(mechanics);
    const contactGrade = this.gradeContact(contact);
    const approachGrade = this.gradeApproach(approach);
    const overallGrade = (timingGrade + mechanicsGrade + contactGrade + approachGrade) / 4;

    const result: SwingAnalysisResult = {
      mechanics,
      contact,
      approach,
      recognition,
      mechanicalIssues,
      strengths,
      recommendations,
      timingGrade,
      mechanicsGrade,
      contactGrade,
      approachGrade,
      overallGrade
    };

    // Update analytics
    this.updateAnalytics(playerId, result, pitchData);

    // Store in history
    if (!this.swingHistory.has(playerId)) {
      this.swingHistory.set(playerId, []);
    }
    this.swingHistory.get(playerId)!.push(result);

    // Keep only last 100 swings
    const history = this.swingHistory.get(playerId)!;
    if (history.length > 100) {
      history.shift();
    }

    return result;
  }

  /**
   * Get batting analytics for a player
   */
  public getAnalytics(playerId: string): BattingAnalytics | null {
    return this.analytics.get(playerId) || null;
  }

  /**
   * Get swing history for a player
   */
  public getSwingHistory(playerId: string, limit: number = 10): SwingAnalysisResult[] {
    const history = this.swingHistory.get(playerId) || [];
    return history.slice(-limit);
  }

  /**
   * Get hot zones for a player
   */
  public getHotZones(playerId: string): HotZone[][] {
    const analytics = this.analytics.get(playerId);
    return analytics?.zones || this.createEmptyZoneGrid();
  }

  /**
   * Get swing tendencies for a player
   */
  public getTendencies(playerId: string): SwingTendencies | null {
    const analytics = this.analytics.get(playerId);
    return analytics?.tendencies || null;
  }

  /**
   * Reset analytics for a player
   */
  public resetAnalytics(playerId: string): void {
    this.analytics.delete(playerId);
    this.swingHistory.delete(playerId);
  }

  // ========================================================================
  // Contact Quality Calculation
  // ========================================================================

  private calculateContactQuality(
    mechanics: SwingMechanics,
    pitchData: any
  ): ContactAnalysis {
    // Calculate exit velocity based on swing speed and timing
    const exitVelocity = this.calculateExitVelocity(mechanics, pitchData);

    // Calculate launch angle based on bat angle and contact point
    const launchAngle = this.calculateLaunchAngle(mechanics);

    // Calculate spin based on contact point and swing path
    const { spinRate, spinAxis } = this.calculateSpin(mechanics, pitchData);

    // Determine if sweet spot was hit
    const sweetSpotHit = this.isSweetSpotHit(mechanics);

    // Calculate barrel percentage
    const barrelPercentage = this.calculateBarrelPercentage(exitVelocity, launchAngle);

    // Calculate hard hit rate
    const hardHitRate = exitVelocity >= this.HARD_HIT_THRESHOLD ? 100 : 0;

    // Determine contact quality category
    const contactQuality = this.categorizeContactQuality(
      exitVelocity,
      launchAngle,
      sweetSpotHit
    );

    // Calculate expected stats
    const expectedBattingAverage = this.calculateExpectedBA(exitVelocity, launchAngle);
    const expectedSlugging = this.calculateExpectedSLG(exitVelocity, launchAngle);

    // Calculate hit probability
    const hitProbability = this.calculateHitProbability(exitVelocity, launchAngle);

    // Determine trajectory
    const trajectory = this.determineTrajectory(launchAngle);

    return {
      contactQuality,
      exitVelocity,
      launchAngle,
      spinRate,
      spinAxis,
      sweetSpotHit,
      barrelPercentage,
      hardHitRate,
      expectedBattingAverage,
      expectedSlugging,
      hitProbability,
      trajectory
    };
  }

  private calculateExitVelocity(mechanics: SwingMechanics, pitchData: any): number {
    // Base exit velo from swing speed and pitch velocity
    const baseExitVelo = mechanics.swingSpeed * 1.2 + pitchData.velocity * 0.2;

    // Timing penalty/bonus
    const absTimingOffset = Math.abs(mechanics.timingOffset);
    let timingMultiplier = 1.0;

    if (absTimingOffset <= this.PERFECT_TIMING_WINDOW) {
      timingMultiplier = 1.15; // 15% bonus for perfect timing
    } else if (absTimingOffset <= this.GOOD_TIMING_WINDOW) {
      timingMultiplier = 1.05; // 5% bonus for good timing
    } else if (absTimingOffset <= this.FAIR_TIMING_WINDOW) {
      timingMultiplier = 0.95; // 5% penalty for fair timing
    } else {
      timingMultiplier = 0.75; // 25% penalty for poor timing
    }

    // Sweet spot bonus
    const sweetSpotBonus = this.isSweetSpotHit(mechanics) ? 1.1 : 0.9;

    // Weight transfer bonus
    const weightTransferBonus = 0.9 + (mechanics.weightTransfer * 0.2);

    // Hip rotation bonus
    const hipRotationBonus = 0.9 + (mechanics.hipRotation / 180 * 0.2);

    // Calculate final exit velocity
    let exitVelo = baseExitVelo * timingMultiplier * sweetSpotBonus *
                   weightTransferBonus * hipRotationBonus;

    // Clamp to realistic range
    exitVelo = Math.max(20, Math.min(120, exitVelo));

    return Math.round(exitVelo * 10) / 10;
  }

  private calculateLaunchAngle(mechanics: SwingMechanics): number {
    // Base angle from bat angle
    let launchAngle = mechanics.batAngle;

    // Adjust based on swing path
    switch (mechanics.swingPath) {
      case 'uppercut':
        launchAngle += 10;
        break;
      case 'downward':
        launchAngle -= 10;
        break;
      case 'level':
        // No adjustment
        break;
      case 'inside-out':
        launchAngle += 3;
        break;
      case 'outside-in':
        launchAngle -= 3;
        break;
    }

    // Adjust based on contact point vertical position
    launchAngle += (mechanics.contactPoint.y - 0.5) * 20;

    // Clamp to realistic range
    launchAngle = Math.max(-45, Math.min(80, launchAngle));

    return Math.round(launchAngle * 10) / 10;
  }

  private calculateSpin(
    mechanics: SwingMechanics,
    pitchData: any
  ): { spinRate: number; spinAxis: { x: number; y: number; z: number } } {
    // Base spin rate from swing speed and contact point
    const baseSpinRate = mechanics.swingSpeed * 25 + pitchData.spinRate * 0.3;

    // Spin direction based on swing path and contact point
    const spinAxis = {
      x: mechanics.swingPath === 'uppercut' ? 0.7 : mechanics.swingPath === 'downward' ? -0.7 : 0,
      y: mechanics.contactPoint.x * 0.5, // Side spin from contact point
      z: mechanics.swingPath === 'level' ? 0.8 : 0.3
    };

    // Normalize spin axis
    const magnitude = Math.sqrt(
      spinAxis.x * spinAxis.x +
      spinAxis.y * spinAxis.y +
      spinAxis.z * spinAxis.z
    );

    return {
      spinRate: Math.round(baseSpinRate),
      spinAxis: {
        x: spinAxis.x / magnitude,
        y: spinAxis.y / magnitude,
        z: spinAxis.z / magnitude
      }
    };
  }

  private isSweetSpotHit(mechanics: SwingMechanics): boolean {
    // Sweet spot is center of bat, within SWEET_SPOT_SIZE
    const distanceFromCenter = Math.sqrt(
      mechanics.contactPoint.x * mechanics.contactPoint.x +
      (mechanics.contactPoint.y - 0.5) * (mechanics.contactPoint.y - 0.5)
    );

    return distanceFromCenter <= this.SWEET_SPOT_SIZE;
  }

  private calculateBarrelPercentage(exitVelocity: number, launchAngle: number): number {
    // Barrel: 98+ mph exit velo, 26-30 degree launch angle
    if (exitVelocity >= this.BARREL_MIN_EXIT_VELO &&
        launchAngle >= this.BARREL_MIN_LAUNCH_ANGLE &&
        launchAngle <= this.BARREL_MAX_LAUNCH_ANGLE) {
      return 100;
    }

    // Partial barrel for close hits
    const veloScore = Math.max(0, Math.min(100, (exitVelocity - 85) / (this.BARREL_MIN_EXIT_VELO - 85) * 100));
    const angleScore = Math.max(0, 100 - Math.abs(launchAngle - 28) * 10);

    return Math.round((veloScore + angleScore) / 2);
  }

  private categorizeContactQuality(
    exitVelocity: number,
    launchAngle: number,
    sweetSpotHit: boolean
  ): ContactAnalysis['contactQuality'] {
    // Miss
    if (exitVelocity < 40) {
      return 'miss';
    }

    // Barrel
    if (exitVelocity >= this.BARREL_MIN_EXIT_VELO &&
        launchAngle >= this.BARREL_MIN_LAUNCH_ANGLE &&
        launchAngle <= this.BARREL_MAX_LAUNCH_ANGLE &&
        sweetSpotHit) {
      return 'barrel';
    }

    // Topped
    if (launchAngle < -10) {
      return 'topped';
    }

    // Under
    if (launchAngle > 50) {
      return 'under';
    }

    // Solid
    if (exitVelocity >= 90 && launchAngle >= 8 && launchAngle <= 40) {
      return 'solid';
    }

    // Flare/Burner
    if (exitVelocity >= 70 && exitVelocity < 90) {
      return 'flare';
    }

    // Weak
    return 'weak';
  }

  private calculateExpectedBA(exitVelocity: number, launchAngle: number): number {
    // Simplified expected BA calculation based on exit velo and launch angle
    // Real formula would use Statcast data lookup tables

    if (exitVelocity < 60) return 0.05;
    if (exitVelocity > 110) return 0.85;

    // Optimal launch angle is 15-30 degrees
    const anglePenalty = Math.max(0, Math.abs(launchAngle - 20) * 0.01);

    const baseBA = (exitVelocity - 60) / 50 * 0.7 + 0.1;
    const adjustedBA = Math.max(0, Math.min(1, baseBA - anglePenalty));

    return Math.round(adjustedBA * 1000) / 1000;
  }

  private calculateExpectedSLG(exitVelocity: number, launchAngle: number): number {
    // Expected slugging based on exit velo and launch angle

    if (exitVelocity < 60) return 0.1;
    if (exitVelocity > 110 && launchAngle >= 20 && launchAngle <= 35) return 2.5;

    const baseSLG = (exitVelocity - 60) / 50 * 1.5 + 0.2;

    // Bonus for fly balls
    const angleBonus = launchAngle >= 15 && launchAngle <= 35 ? 0.5 : 0;

    const adjustedSLG = Math.max(0, Math.min(4, baseSLG + angleBonus));

    return Math.round(adjustedSLG * 1000) / 1000;
  }

  private calculateHitProbability(exitVelocity: number, launchAngle: number): number {
    // Probability of a hit based on exit velo and launch angle

    if (exitVelocity < 50) return 0.05;
    if (exitVelocity > 100 && launchAngle >= 10 && launchAngle <= 35) return 0.9;

    const veloProb = Math.min(1, (exitVelocity - 50) / 60);
    const angleProb = Math.max(0, 1 - Math.abs(launchAngle - 20) * 0.02);

    const hitProb = (veloProb + angleProb) / 2;

    return Math.round(hitProb * 1000) / 1000;
  }

  private determineTrajectory(launchAngle: number): ContactAnalysis['trajectory'] {
    if (launchAngle < -10) return 'ground_ball';
    if (launchAngle >= -10 && launchAngle < 10) return 'ground_ball';
    if (launchAngle >= 10 && launchAngle < 25) return 'line_drive';
    if (launchAngle >= 25 && launchAngle < 50) return 'fly_ball';
    return 'popup';
  }

  // ========================================================================
  // Plate Approach Evaluation
  // ========================================================================

  private evaluatePlateApproach(
    mechanics: SwingMechanics,
    pitchData: any
  ): PlateApproach {
    // Determine if pitch was in strike zone
    const inZone = this.isPitchInZone(pitchData.location);

    // Pitch recognition ability (simplified)
    const pitchRecognition = 0.7 + Math.random() * 0.3; // Would use ML model in reality

    // Strike zone judgment
    const strikeZoneJudgment = this.evaluateZoneJudgment(pitchData.location, inZone);

    // Swing decision
    const swingDecision = Math.abs(mechanics.timingOffset) < 100 ? 'swing' :
                         Math.abs(mechanics.timingOffset) < 150 ? 'check_swing' : 'take';

    // Calculate rates
    const chaseRate = !inZone && swingDecision === 'swing' ? 100 : 0;
    const contactRate = mechanics.contactPoint.x !== 0 && mechanics.contactPoint.y !== 0 ? 100 : 0;
    const whiffRate = 100 - contactRate;

    // Swing percentages
    const swingPercentage = {
      inZone: inZone && swingDecision === 'swing' ? 100 : 0,
      outOfZone: !inZone && swingDecision === 'swing' ? 100 : 0,
      overall: swingDecision === 'swing' ? 100 : 0
    };

    // Watch rate
    const watchRate = swingDecision === 'take' && inZone ? 100 : 0;

    // Discipline score
    const discipline = this.calculateDisciplineScore(
      chaseRate,
      contactRate,
      strikeZoneJudgment
    );

    // Approach type (simplified)
    const approachType = this.determineApproachType(mechanics, pitchData);

    return {
      approachType,
      swingDecision,
      pitchRecognition,
      strikeZoneJudgment,
      chaseRate,
      contactRate,
      whiffRate,
      swingPercentage,
      watchRate,
      discipline
    };
  }

  private isPitchInZone(location: { x: number; y: number }): boolean {
    // Strike zone: -0.708 to 0.708 ft horizontal, 1.5 to 3.5 ft vertical
    // Normalized: x: -1 to 1, y: 0 to 1
    return Math.abs(location.x) <= 0.85 && location.y >= 0.2 && location.y <= 0.9;
  }

  private evaluateZoneJudgment(location: { x: number; y: number }, actuallyInZone: boolean): number {
    // How well the batter judges the strike zone
    const perceivedInZone = this.isPitchInZone(location);

    // Correct judgment = high score
    return perceivedInZone === actuallyInZone ? 0.9 : 0.3;
  }

  private calculateDisciplineScore(
    chaseRate: number,
    contactRate: number,
    zoneJudgment: number
  ): number {
    // Lower chase rate = better discipline
    const chaseScore = 100 - chaseRate;

    // Higher contact rate = better discipline
    const contactScore = contactRate;

    // Better zone judgment = better discipline
    const judgmentScore = zoneJudgment * 100;

    const discipline = (chaseScore * 0.4 + contactScore * 0.3 + judgmentScore * 0.3);

    return Math.round(discipline * 10) / 10;
  }

  private determineApproachType(
    mechanics: SwingMechanics,
    pitchData: any
  ): PlateApproach['approachType'] {
    // Simplified approach type determination
    if (mechanics.swingSpeed > 75) return 'power';
    if (Math.abs(mechanics.timingOffset) < 20) return 'contact';
    if (pitchData.location.y > 0.7) return 'patient';
    if (mechanics.swingPath === 'level') return 'contact';
    return 'aggressive';
  }

  // ========================================================================
  // Pitch Recognition
  // ========================================================================

  private assessPitchRecognition(
    mechanics: SwingMechanics,
    pitchData: any
  ): PitchRecognitionData {
    // Simplified pitch recognition
    // In reality, would use ML model trained on pitch characteristics

    const identificationTime = 200 + Math.random() * 100; // ms
    const decisionTime = 150 + Math.random() * 100; // ms
    const reactionTime = identificationTime + decisionTime;

    // Correct identification (simplified)
    const correctIdentification = Math.random() > 0.3;

    // Confidence level
    const confidenceLevel = 0.5 + Math.random() * 0.5;

    return {
      pitchType: pitchData.type,
      velocity: pitchData.velocity,
      movement: pitchData.movement,
      location: pitchData.location,
      releasePoint: { x: 0, y: 6, z: 60.5 }, // Simplified
      spinRate: pitchData.spinRate,
      identificationTime,
      decisionTime,
      reactionTime,
      correctIdentification,
      confidenceLevel
    };
  }

  // ========================================================================
  // Mechanical Analysis
  // ========================================================================

  private identifyMechanicalIssues(mechanics: SwingMechanics): string[] {
    const issues: string[] = [];

    // Timing issues
    if (Math.abs(mechanics.timingOffset) > this.FAIR_TIMING_WINDOW) {
      if (mechanics.timingOffset < 0) {
        issues.push('Swinging too early - wait longer on the pitch');
      } else {
        issues.push('Swinging too late - start swing sooner');
      }
    }

    // Weight transfer issues
    if (mechanics.weightTransfer < 0.5) {
      issues.push('Poor weight transfer - shift weight from back to front');
    }

    // Hip rotation issues
    if (mechanics.hipRotation < 120) {
      issues.push('Insufficient hip rotation - rotate hips more explosively');
    }

    // Hand path issues
    if (mechanics.handPath === 'casting') {
      issues.push('Casting hands - keep hands closer to body');
    } else if (mechanics.handPath === 'looping') {
      issues.push('Looping swing - take a more direct path to ball');
    }

    // Head stability issues
    if (mechanics.headStability < 0.7) {
      issues.push('Head moving too much - keep eyes on ball');
    }

    // Follow through issues
    if (!mechanics.followThrough) {
      issues.push('Incomplete follow through - finish the swing');
    }

    return issues;
  }

  private identifyStrengths(mechanics: SwingMechanics, contact: ContactAnalysis): string[] {
    const strengths: string[] = [];

    // Timing strengths
    if (Math.abs(mechanics.timingOffset) <= this.PERFECT_TIMING_WINDOW) {
      strengths.push('Excellent timing on this pitch');
    }

    // Contact strengths
    if (contact.contactQuality === 'barrel') {
      strengths.push('Perfect barrel contact - ideal exit velo and launch angle');
    } else if (contact.contactQuality === 'solid') {
      strengths.push('Solid contact with good exit velocity');
    }

    // Mechanical strengths
    if (mechanics.weightTransfer > 0.8) {
      strengths.push('Great weight transfer through the swing');
    }

    if (mechanics.hipRotation > 150) {
      strengths.push('Excellent hip rotation generating power');
    }

    if (mechanics.headStability > 0.9) {
      strengths.push('Perfect head stability - eyes stayed on ball');
    }

    if (mechanics.handPath === 'direct') {
      strengths.push('Direct hand path to ball');
    }

    return strengths;
  }

  private generateRecommendations(
    mechanics: SwingMechanics,
    contact: ContactAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Launch angle recommendations
    if (contact.launchAngle < 10) {
      recommendations.push('Try to get under the ball more for better launch angle');
    } else if (contact.launchAngle > 40) {
      recommendations.push('Level out swing to reduce launch angle');
    }

    // Exit velocity recommendations
    if (contact.exitVelocity < 80) {
      recommendations.push('Focus on bat speed and solid contact for more exit velocity');
    }

    // Swing path recommendations
    if (mechanics.swingPath === 'downward') {
      recommendations.push('Consider a more level or slightly uppercut swing path');
    }

    // Timing recommendations
    if (Math.abs(mechanics.timingOffset) > this.GOOD_TIMING_WINDOW) {
      recommendations.push('Work on pitch recognition to improve timing');
    }

    return recommendations;
  }

  // ========================================================================
  // Grading System
  // ========================================================================

  private gradeTimingQuality(timingOffset: number): number {
    const absOffset = Math.abs(timingOffset);

    if (absOffset <= this.PERFECT_TIMING_WINDOW) return 100;
    if (absOffset <= this.GOOD_TIMING_WINDOW) return 85;
    if (absOffset <= this.FAIR_TIMING_WINDOW) return 70;
    if (absOffset <= 75) return 55;
    if (absOffset <= 100) return 40;
    return 20;
  }

  private gradeMechanics(mechanics: SwingMechanics): number {
    let score = 0;

    // Weight transfer (20 points)
    score += mechanics.weightTransfer * 20;

    // Hip rotation (20 points)
    score += (mechanics.hipRotation / 180) * 20;

    // Head stability (20 points)
    score += mechanics.headStability * 20;

    // Hand path (20 points)
    if (mechanics.handPath === 'direct') score += 20;
    else if (mechanics.handPath === 'looping') score += 12;
    else score += 8;

    // Follow through (10 points)
    if (mechanics.followThrough) score += 10;

    // Swing path (10 points)
    if (mechanics.swingPath === 'level' || mechanics.swingPath === 'inside-out') score += 10;
    else if (mechanics.swingPath === 'uppercut') score += 7;
    else score += 5;

    return Math.round(score);
  }

  private gradeContact(contact: ContactAnalysis): number {
    let score = 0;

    // Contact quality (40 points)
    switch (contact.contactQuality) {
      case 'barrel': score += 40; break;
      case 'solid': score += 35; break;
      case 'flare': score += 25; break;
      case 'weak': score += 15; break;
      case 'topped': score += 10; break;
      case 'under': score += 10; break;
      case 'miss': score += 0; break;
    }

    // Exit velocity (30 points)
    if (contact.exitVelocity >= 100) score += 30;
    else if (contact.exitVelocity >= 90) score += 25;
    else if (contact.exitVelocity >= 80) score += 20;
    else score += (contact.exitVelocity / 80) * 15;

    // Launch angle (20 points)
    const idealAngle = 20;
    const angleDiff = Math.abs(contact.launchAngle - idealAngle);
    score += Math.max(0, 20 - angleDiff);

    // Sweet spot (10 points)
    if (contact.sweetSpotHit) score += 10;

    return Math.round(score);
  }

  private gradeApproach(approach: PlateApproach): number {
    return Math.round(approach.discipline);
  }

  // ========================================================================
  // Analytics Tracking
  // ========================================================================

  private updateAnalytics(
    playerId: string,
    result: SwingAnalysisResult,
    pitchData: any
  ): void {
    // Get or create analytics
    let analytics = this.analytics.get(playerId);

    if (!analytics) {
      analytics = this.createNewAnalytics(playerId);
      this.analytics.set(playerId, analytics);
    }

    // Update totals
    analytics.totalSwings++;
    analytics.totalPitchesSeen++;

    // Update contact metrics
    if (result.contact.contactQuality !== 'miss') {
      const totalContacts = analytics.totalSwings * (analytics.contactRate / 100);
      analytics.contactRate = ((totalContacts + 1) / analytics.totalSwings) * 100;

      // Update exit velocity
      const totalExitVelo = analytics.avgExitVelocity * totalContacts;
      analytics.avgExitVelocity = (totalExitVelo + result.contact.exitVelocity) / (totalContacts + 1);

      // Update max exit velocity
      analytics.maxExitVelocity = Math.max(analytics.maxExitVelocity, result.contact.exitVelocity);

      // Update launch angle
      const totalLaunchAngle = analytics.avgLaunchAngle * totalContacts;
      analytics.avgLaunchAngle = (totalLaunchAngle + result.contact.launchAngle) / (totalContacts + 1);
    }

    // Update barrel rate
    if (result.contact.barrelPercentage === 100) {
      const totalBarrels = analytics.totalSwings * (analytics.barrelRate / 100);
      analytics.barrelRate = ((totalBarrels + 1) / analytics.totalSwings) * 100;
    }

    // Update hard hit rate
    if (result.contact.hardHitRate === 100) {
      const totalHardHits = analytics.totalSwings * (analytics.hardHitRate / 100);
      analytics.hardHitRate = ((totalHardHits + 1) / analytics.totalSwings) * 100;
    }

    // Update sweet spot percentage
    if (result.contact.sweetSpotHit) {
      const totalSweetSpots = analytics.totalSwings * (analytics.sweetSpotPercentage / 100);
      analytics.sweetSpotPercentage = ((totalSweetSpots + 1) / analytics.totalSwings) * 100;
    }

    // Update contact distribution
    analytics.contactDistribution[result.contact.contactQuality]++;

    // Update trajectory distribution
    const totalTrajectories = analytics.groundBallRate + analytics.lineDriveRate +
                              analytics.flyBallRate + analytics.popupRate;
    const trajectoryIncrement = 1 / (totalTrajectories + 1) * 100;

    switch (result.contact.trajectory) {
      case 'ground_ball':
        analytics.groundBallRate += trajectoryIncrement;
        break;
      case 'line_drive':
        analytics.lineDriveRate += trajectoryIncrement;
        break;
      case 'fly_ball':
        analytics.flyBallRate += trajectoryIncrement;
        break;
      case 'popup':
        analytics.popupRate += trajectoryIncrement;
        break;
    }

    // Normalize trajectory rates
    const totalRate = analytics.groundBallRate + analytics.lineDriveRate +
                     analytics.flyBallRate + analytics.popupRate;
    if (totalRate > 0) {
      analytics.groundBallRate = (analytics.groundBallRate / totalRate) * 100;
      analytics.lineDriveRate = (analytics.lineDriveRate / totalRate) * 100;
      analytics.flyBallRate = (analytics.flyBallRate / totalRate) * 100;
      analytics.popupRate = (analytics.popupRate / totalRate) * 100;
    }

    // Update expected stats
    const totalExpectedBA = analytics.expectedBA * (analytics.totalSwings - 1);
    analytics.expectedBA = (totalExpectedBA + result.contact.expectedBattingAverage) / analytics.totalSwings;

    const totalExpectedSLG = analytics.expectedSLG * (analytics.totalSwings - 1);
    analytics.expectedSLG = (totalExpectedSLG + result.contact.expectedSlugging) / analytics.totalSwings;

    analytics.expectedOPS = analytics.expectedBA + analytics.expectedSLG;

    // Update plate discipline
    const inZone = this.isPitchInZone(pitchData.location);

    if (inZone && result.approach.swingDecision === 'swing') {
      const totalZoneSwings = analytics.totalPitchesSeen * (analytics.zoneSwingRate / 100);
      analytics.zoneSwingRate = ((totalZoneSwings + 1) / analytics.totalPitchesSeen) * 100;

      if (result.contact.contactQuality !== 'miss') {
        const totalZoneContacts = analytics.totalPitchesSeen * (analytics.zContactRate / 100);
        analytics.zContactRate = ((totalZoneContacts + 1) / analytics.totalPitchesSeen) * 100;
      }
    }

    if (!inZone && result.approach.swingDecision === 'swing') {
      const totalOSwings = analytics.totalPitchesSeen * (analytics.oSwingRate / 100);
      analytics.oSwingRate = ((totalOSwings + 1) / analytics.totalPitchesSeen) * 100;

      const totalChases = analytics.totalPitchesSeen * (analytics.chaseRate / 100);
      analytics.chaseRate = ((totalChases + 1) / analytics.totalPitchesSeen) * 100;

      if (result.contact.contactQuality !== 'miss') {
        const totalOContacts = analytics.totalPitchesSeen * (analytics.oContactRate / 100);
        analytics.oContactRate = ((totalOContacts + 1) / analytics.totalPitchesSeen) * 100;
      }
    }

    // Update whiff rate
    if (result.contact.contactQuality === 'miss' && result.approach.swingDecision === 'swing') {
      const totalWhiffs = analytics.totalSwings * (analytics.whiffRate / 100);
      analytics.whiffRate = ((totalWhiffs + 1) / analytics.totalSwings) * 100;
    }

    // Update hot/cold zones
    this.updateZones(analytics, pitchData.location, result.contact);

    // Update tendencies
    this.updateTendencies(analytics, result.mechanics, pitchData);

    // Update recent form
    analytics.recentForm.push(result.contact);
    if (analytics.recentForm.length > 10) {
      analytics.recentForm.shift();
    }
  }

  private createNewAnalytics(playerId: string): BattingAnalytics {
    return {
      playerId,
      totalSwings: 0,
      totalPitchesSeen: 0,
      contactRate: 0,
      barrelRate: 0,
      hardHitRate: 0,
      avgExitVelocity: 0,
      maxExitVelocity: 0,
      avgLaunchAngle: 0,
      sweetSpotPercentage: 0,
      contactDistribution: {
        barrel: 0,
        solid: 0,
        flare: 0,
        weak: 0,
        topped: 0,
        under: 0,
        miss: 0
      },
      groundBallRate: 0,
      lineDriveRate: 0,
      flyBallRate: 0,
      popupRate: 0,
      expectedBA: 0,
      expectedSLG: 0,
      expectedOPS: 0,
      zoneSwingRate: 0,
      oSwingRate: 0,
      zContactRate: 0,
      oContactRate: 0,
      chaseRate: 0,
      whiffRate: 0,
      zones: this.createEmptyZoneGrid(),
      tendencies: {
        preferredSwingPath: 'level',
        avgSwingSpeed: 0,
        avgBatAngle: 0,
        earlyTiming: 0,
        lateTiming: 0,
        onTimeTiming: 0,
        upperBodyDominance: 0.5,
        aggressivenessLevel: 50,
        pitchTypePreferences: {
          fastball: 0,
          curveball: 0,
          slider: 0,
          changeup: 0,
          cutter: 0,
          splitter: 0
        },
        countBehavior: {
          ahead: this.createDefaultApproach(),
          behind: this.createDefaultApproach(),
          even: this.createDefaultApproach(),
          twoStrikes: this.createDefaultApproach()
        }
      },
      countStats: new Map(),
      recentForm: []
    };
  }

  private createEmptyZoneGrid(): HotZone[][] {
    const grid: HotZone[][] = [];

    for (let i = 0; i < this.ZONE_GRID_SIZE; i++) {
      grid[i] = [];
      for (let j = 0; j < this.ZONE_GRID_SIZE; j++) {
        grid[i][j] = {
          x: (j / (this.ZONE_GRID_SIZE - 1)) * 2 - 1, // -1 to 1
          y: i / (this.ZONE_GRID_SIZE - 1), // 0 to 1
          battingAverage: 0,
          sluggingPercentage: 0,
          whiffRate: 0,
          swingRate: 0,
          sampleSize: 0
        };
      }
    }

    return grid;
  }

  private createDefaultApproach(): PlateApproach {
    return {
      approachType: 'contact',
      swingDecision: 'take',
      pitchRecognition: 0.5,
      strikeZoneJudgment: 0.5,
      chaseRate: 30,
      contactRate: 75,
      whiffRate: 25,
      swingPercentage: {
        inZone: 65,
        outOfZone: 25,
        overall: 45
      },
      watchRate: 15,
      discipline: 50
    };
  }

  private updateZones(
    analytics: BattingAnalytics,
    location: { x: number; y: number },
    contact: ContactAnalysis
  ): void {
    // Find the zone this pitch was in
    const zoneX = Math.floor(((location.x + 1) / 2) * (this.ZONE_GRID_SIZE - 1));
    const zoneY = Math.floor(location.y * (this.ZONE_GRID_SIZE - 1));

    // Clamp to grid bounds
    const x = Math.max(0, Math.min(this.ZONE_GRID_SIZE - 1, zoneX));
    const y = Math.max(0, Math.min(this.ZONE_GRID_SIZE - 1, zoneY));

    const zone = analytics.zones[y][x];

    // Update sample size
    zone.sampleSize++;

    // Update batting average (if contact was made)
    if (contact.contactQuality !== 'miss') {
      const totalBA = zone.battingAverage * (zone.sampleSize - 1);
      const isHit = contact.hitProbability > 0.5 ? 1 : 0;
      zone.battingAverage = (totalBA + isHit) / zone.sampleSize;

      // Update slugging
      const totalSLG = zone.sluggingPercentage * (zone.sampleSize - 1);
      const bases = contact.expectedSlugging;
      zone.sluggingPercentage = (totalSLG + bases) / zone.sampleSize;
    }

    // Update whiff rate
    if (contact.contactQuality === 'miss') {
      const totalWhiffs = zone.whiffRate * (zone.sampleSize - 1);
      zone.whiffRate = (totalWhiffs + 1) / zone.sampleSize;
    }

    // Update swing rate
    const totalSwings = zone.swingRate * (zone.sampleSize - 1);
    zone.swingRate = (totalSwings + 1) / zone.sampleSize;
  }

  private updateTendencies(
    analytics: BattingAnalytics,
    mechanics: SwingMechanics,
    pitchData: any
  ): void {
    const n = analytics.totalSwings;

    // Update swing speed
    analytics.tendencies.avgSwingSpeed =
      (analytics.tendencies.avgSwingSpeed * (n - 1) + mechanics.swingSpeed) / n;

    // Update bat angle
    analytics.tendencies.avgBatAngle =
      (analytics.tendencies.avgBatAngle * (n - 1) + mechanics.batAngle) / n;

    // Update timing distribution
    if (mechanics.timingOffset < -this.GOOD_TIMING_WINDOW) {
      analytics.tendencies.earlyTiming++;
    } else if (mechanics.timingOffset > this.GOOD_TIMING_WINDOW) {
      analytics.tendencies.lateTiming++;
    } else {
      analytics.tendencies.onTimeTiming++;
    }

    // Normalize timing percentages
    const totalTiming = analytics.tendencies.earlyTiming +
                       analytics.tendencies.lateTiming +
                       analytics.tendencies.onTimeTiming;
    analytics.tendencies.earlyTiming = (analytics.tendencies.earlyTiming / totalTiming) * 100;
    analytics.tendencies.lateTiming = (analytics.tendencies.lateTiming / totalTiming) * 100;
    analytics.tendencies.onTimeTiming = (analytics.tendencies.onTimeTiming / totalTiming) * 100;

    // Update pitch type preferences (simplified)
    const pitchType = pitchData.type.toLowerCase();
    if (pitchType in analytics.tendencies.pitchTypePreferences) {
      const key = pitchType as keyof typeof analytics.tendencies.pitchTypePreferences;
      analytics.tendencies.pitchTypePreferences[key]++;
    }
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Export analytics to JSON
   */
  public exportAnalytics(playerId: string): string {
    const analytics = this.analytics.get(playerId);
    if (!analytics) return '{}';

    return JSON.stringify(analytics, null, 2);
  }

  /**
   * Import analytics from JSON
   */
  public importAnalytics(playerId: string, json: string): void {
    try {
      const analytics = JSON.parse(json) as BattingAnalytics;
      this.analytics.set(playerId, analytics);
    } catch (error) {
      console.error('Failed to import analytics:', error);
    }
  }

  /**
   * Get top performers by metric
   */
  public getLeaderboard(
    metric: keyof BattingAnalytics,
    limit: number = 10
  ): Array<{ playerId: string; value: number }> {
    const leaderboard: Array<{ playerId: string; value: number }> = [];

    this.analytics.forEach((analytics, playerId) => {
      const value = analytics[metric];
      if (typeof value === 'number') {
        leaderboard.push({ playerId, value });
      }
    });

    leaderboard.sort((a, b) => b.value - a.value);

    return leaderboard.slice(0, limit);
  }
}
