/**
 * Pitching Strategy and Stamina System
 *
 * Comprehensive pitching system with stamina/fatigue management, pitch sequencing,
 * arsenal management, confidence tracking, and strategic decision making.
 * Includes injury risk, performance degradation, and hot/cold zone tracking.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Pitch types and their characteristics
 */
export type PitchType =
  | 'fourseam_fastball'
  | 'twoseam_fastball'
  | 'cutter'
  | 'curveball'
  | 'slider'
  | 'changeup'
  | 'splitter'
  | 'knuckleball'
  | 'sinker'
  | 'screwball'
  | 'eephus';

/**
 * Individual pitch characteristics
 */
export interface PitchCharacteristics {
  type: PitchType;
  baseVelocity: number; // mph (70-105)
  velocityVariance: number; // mph variance (+/-)
  horizontalMovement: number; // inches (-20 to 20)
  verticalMovement: number; // inches (-20 to 20)
  spinRate: number; // rpm (1000-3500)
  releasePoint: { x: number; y: number; z: number };
  breakPoint: number; // distance from plate where break occurs (ft)
  control: number; // 0-100 (ability to hit spots)
  deception: number; // 0-100 (how hard to pick up)
  energyCost: number; // 0-100 (stamina drain per pitch)
  injuryRisk: number; // 0-100 (risk of injury)
  confidence: number; // 0-100 (pitcher's confidence in this pitch)
}

/**
 * Pitcher's full arsenal
 */
export interface PitcherArsenal {
  pitches: Map<PitchType, PitchCharacteristics>;
  primaryPitch: PitchType;
  outPitch: PitchType; // Best strikeout pitch
  preferredSequences: PitchSequence[];
  wheelhouse: PitchType[]; // Pitches they're most comfortable with
}

/**
 * Pitch sequence pattern
 */
export interface PitchSequence {
  name: string;
  sequence: PitchType[];
  effectiveness: number; // 0-100
  usageCount: number;
  successRate: number; // 0-100
  situationalUse: {
    ahead: boolean; // Use when ahead in count
    behind: boolean; // Use when behind in count
    twoStrikes: boolean; // Use with 2 strikes
    runnersOn: boolean; // Use with runners on base
  };
}

/**
 * Stamina and fatigue tracking
 */
export interface StaminaState {
  current: number; // 0-100
  max: number; // 0-100
  fatigueLevel: number; // 0-100 (0 = fresh, 100 = exhausted)
  pitchCount: number;
  highStressPitches: number; // Pitches over 95% effort
  recoveryRate: number; // stamina per second of rest

  // Performance degradation from fatigue
  velocityPenalty: number; // % reduction
  controlPenalty: number; // % reduction
  movementPenalty: number; // % reduction

  // Fatigue effects
  armSpeed: number; // 0-100
  legDrive: number; // 0-100
  coreStrength: number; // 0-100
  mentalSharpness: number; // 0-100

  // Injury risk
  injuryRiskLevel: number; // 0-100
  pitchesUntilRisk: number; // Pitches until high injury risk
  recommendedPitchLimit: number;
}

/**
 * Pitcher confidence and composure
 */
export interface PitcherMentality {
  confidence: number; // 0-100 (overall confidence)
  composure: number; // 0-100 (ability to handle pressure)
  focus: number; // 0-100 (concentration level)
  temperament: 'fiery' | 'calm' | 'nervous' | 'cocky' | 'professional';

  // Situational confidence
  confidenceByCount: Map<string, number>; // e.g., "0-0", "3-2"
  confidenceWithRunners: number; // Confidence with RISP
  confidenceInJams: number; // Confidence with bases loaded

  // Performance under pressure
  clutchRating: number; // 0-100
  rattleResistance: number; // 0-100 (resistance to getting rattled)
  momentumSwing: number; // -50 to 50 (current momentum)
}

/**
 * Pitch location targeting
 */
export interface PitchTarget {
  x: number; // -1 to 1 (inside to outside)
  y: number; // 0 to 1 (low to high)
  z: number; // -1 to 1 (depth variance)
  intentional: 'strike' | 'ball' | 'waste' | 'corner' | 'chase';
  locationName: string; // e.g., "low and away", "high and tight"
}

/**
 * Pitch result and outcome
 */
export interface PitchResult {
  pitch: PitchCharacteristics;
  target: PitchTarget;
  actualLocation: { x: number; y: number; z: number };
  locationError: number; // Distance from target

  outcome:
    | 'called_strike'
    | 'swinging_strike'
    | 'foul'
    | 'ball'
    | 'hit_into_play'
    | 'hit_by_pitch';

  batterReaction: 'swing' | 'take' | 'check_swing';
  contactQuality?: 'barrel' | 'solid' | 'weak' | 'miss';

  // Effectiveness
  effectiveness: number; // 0-100
  sequenceBonus: number; // Bonus from good sequencing
  deceptionBonus: number; // Bonus from deception

  // Stamina impact
  staminaCost: number;
  stressLevel: 'low' | 'medium' | 'high' | 'max';
}

/**
 * Hot/cold zones for pitcher
 */
export interface PitcherZone {
  x: number;
  y: number;
  pitchesThrownHere: number;
  strikeRate: number; // 0-100
  whiffRate: number; // 0-100
  contactRate: number; // 0-100
  hardContactRate: number; // 0-100
  expectedBA: number; // xBA when pitching here
  effectiveness: number; // 0-100 composite score
}

/**
 * Pitch analytics for a pitcher
 */
export interface PitchingAnalytics {
  pitcherId: string;
  totalPitches: number;
  totalBattersFaced: number;

  // By pitch type
  usageByType: Map<PitchType, number>; // % usage
  effectivenessByType: Map<PitchType, number>; // 0-100
  whiffRateByType: Map<PitchType, number>; // 0-100

  // By count
  performanceByCount: Map<string, {
    pitches: number;
    strikes: number;
    balls: number;
    whiffs: number;
  }>;

  // By situation
  performanceWithRunners: {
    none: number; // ERA equivalent
    risp: number; // ERA with RISP
    basesLoaded: number;
  };

  // Sequencing
  favoriteSequences: PitchSequence[];
  sequenceEffectiveness: number; // 0-100

  // Zone effectiveness
  zones: PitcherZone[][]; // 9x9 grid

  // Stamina trends
  fatigueThreshold: number; // Pitch count where performance drops
  avgPitchesPerAppearance: number;
  qualityStartPercentage: number; // % of starts with 6+ IP, 3 or fewer ER

  // Recent performance (last 10 batters)
  recentForm: PitchResult[];
}

/**
 * Pitch selection recommendation
 */
export interface PitchRecommendation {
  pitchType: PitchType;
  target: PitchTarget;
  confidence: number; // 0-100 (AI confidence in this choice)
  reasoning: string[];
  expectedEffectiveness: number; // 0-100

  // Alternative options
  alternatives: Array<{
    pitchType: PitchType;
    target: PitchTarget;
    effectiveness: number;
  }>;
}

/**
 * Game situation context
 */
export interface GameSituation {
  inning: number;
  outs: number;
  balls: number;
  strikes: number;
  runners: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
  score: {
    us: number;
    them: number;
  };
  batterId: string;
  batterStats: {
    handedness: 'left' | 'right' | 'switch';
    battingAverage: number;
    slugging: number;
    discipline: number;
    power: number;
    hotZones: number[][]; // 9x9 grid
  };
}

// ============================================================================
// Pitching Strategy and Stamina System Class
// ============================================================================

export class PitchingStrategyStaminaSystem {
  private pitchers: Map<string, {
    arsenal: PitcherArsenal;
    stamina: StaminaState;
    mentality: PitcherMentality;
    analytics: PitchingAnalytics;
  }>;

  private readonly ZONE_GRID_SIZE = 9;
  private readonly FATIGUE_VELOCITY_IMPACT = 0.15; // 15% max velo loss when exhausted
  private readonly FATIGUE_CONTROL_IMPACT = 0.25; // 25% max control loss when exhausted
  private readonly HIGH_STRESS_THRESHOLD = 95; // Pitches over 95% effort
  private readonly INJURY_RISK_THRESHOLD = 80; // Fatigue level for injury risk

  constructor() {
    this.pitchers = new Map();
  }

  // ========================================================================
  // Public API
  // ========================================================================

  /**
   * Initialize a pitcher with their arsenal
   */
  public initializePitcher(
    pitcherId: string,
    arsenal: PitcherArsenal,
    maxStamina: number = 100
  ): void {
    this.pitchers.set(pitcherId, {
      arsenal,
      stamina: this.createInitialStamina(maxStamina),
      mentality: this.createInitialMentality(),
      analytics: this.createInitialAnalytics(pitcherId)
    });
  }

  /**
   * Get pitch recommendation based on situation
   */
  public getPitchRecommendation(
    pitcherId: string,
    situation: GameSituation
  ): PitchRecommendation | null {
    const pitcher = this.pitchers.get(pitcherId);
    if (!pitcher) return null;

    // Analyze the situation
    const countKey = `${situation.balls}-${situation.strikes}`;
    const isAhead = situation.strikes > situation.balls;
    const isBehind = situation.balls > situation.strikes;
    const hasTwoStrikes = situation.strikes === 2;
    const hasRunners = situation.runners.first || situation.runners.second || situation.runners.third;

    // Filter available sequences
    const availableSequences = pitcher.arsenal.preferredSequences.filter(seq => {
      const usage = seq.situationalUse;
      if (isAhead && !usage.ahead) return false;
      if (isBehind && !usage.behind) return false;
      if (hasTwoStrikes && !usage.twoStrikes) return false;
      if (hasRunners && !usage.runnersOn) return false;
      return true;
    });

    // Get recent pitch history for sequencing
    const recentPitches = pitcher.analytics.recentForm.slice(-3).map(r => r.pitch.type);

    // Score each pitch type
    const pitchScores = new Map<PitchType, number>();

    pitcher.arsenal.pitches.forEach((pitch, type) => {
      let score = 50; // Base score

      // Confidence bonus
      score += pitcher.mentality.confidence * 0.2;
      score += pitch.confidence * 0.3;

      // Control bonus/penalty
      const effectiveControl = this.getEffectiveControl(pitcher.stamina, pitch.control);
      score += effectiveControl * 0.2;

      // Situational adjustments
      if (hasTwoStrikes && type === pitcher.arsenal.outPitch) {
        score += 20; // Use out pitch with 2 strikes
      }

      if (isBehind && pitch.control > 70) {
        score += 15; // Use high-control pitch when behind
      }

      if (isAhead && pitch.deception > 70) {
        score += 10; // Use deceptive pitch when ahead
      }

      // Batter matchup
      const batterHotZones = situation.batterStats.hotZones;
      const pitchEffectivenessVsBatter = this.calculatePitchEffectivenessVsBatter(
        pitch,
        batterHotZones
      );
      score += pitchEffectivenessVsBatter * 0.25;

      // Sequence variety bonus (avoid repeating same pitch)
      if (recentPitches.includes(type)) {
        score -= 10 * recentPitches.filter(p => p === type).length;
      }

      // Stamina cost penalty
      if (pitcher.stamina.fatigueLevel > 60) {
        score -= pitch.energyCost * 0.3;
      }

      // Injury risk penalty
      if (pitcher.stamina.injuryRiskLevel > this.INJURY_RISK_THRESHOLD) {
        score -= pitch.injuryRisk * 0.5;
      }

      pitchScores.set(type, Math.max(0, Math.min(100, score)));
    });

    // Find best pitch
    let bestPitch: PitchType | null = null;
    let bestScore = 0;

    pitchScores.forEach((score, type) => {
      if (score > bestScore) {
        bestScore = score;
        bestPitch = type;
      }
    });

    if (!bestPitch) return null;

    // Determine target location
    const target = this.selectTargetLocation(
      pitcher,
      pitcher.arsenal.pitches.get(bestPitch)!,
      situation
    );

    // Generate alternatives
    const alternatives: PitchRecommendation['alternatives'] = [];
    const sortedPitches = Array.from(pitchScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(1, 4); // Get top 3 alternatives

    sortedPitches.forEach(([type, score]) => {
      const pitch = pitcher.arsenal.pitches.get(type)!;
      alternatives.push({
        pitchType: type,
        target: this.selectTargetLocation(pitcher, pitch, situation),
        effectiveness: score
      });
    });

    // Generate reasoning
    const reasoning = this.generateRecommendationReasoning(
      bestPitch,
      pitcher,
      situation
    );

    return {
      pitchType: bestPitch,
      target,
      confidence: bestScore,
      reasoning,
      expectedEffectiveness: bestScore,
      alternatives
    };
  }

  /**
   * Execute a pitch and update all stats
   */
  public executePitch(
    pitcherId: string,
    pitchType: PitchType,
    target: PitchTarget,
    batterReaction: 'swing' | 'take' | 'check_swing',
    contactQuality?: 'barrel' | 'solid' | 'weak' | 'miss'
  ): PitchResult | null {
    const pitcher = this.pitchers.get(pitcherId);
    if (!pitcher) return null;

    const pitch = pitcher.arsenal.pitches.get(pitchType);
    if (!pitch) return null;

    // Calculate actual location with control variance
    const actualLocation = this.calculateActualLocation(
      target,
      pitch,
      pitcher.stamina
    );

    // Calculate location error
    const locationError = Math.sqrt(
      Math.pow(actualLocation.x - target.x, 2) +
      Math.pow(actualLocation.y - target.y, 2)
    );

    // Determine outcome
    const outcome = this.determinePitchOutcome(
      actualLocation,
      target,
      batterReaction,
      pitch
    );

    // Calculate effectiveness
    const effectiveness = this.calculatePitchEffectiveness(
      outcome,
      actualLocation,
      target,
      locationError,
      pitch
    );

    // Calculate sequence bonus
    const sequenceBonus = this.calculateSequenceBonus(
      pitchType,
      pitcher.analytics.recentForm
    );

    // Determine stress level
    const stressLevel = this.determineStressLevel(pitch, target);

    // Calculate stamina cost
    const staminaCost = this.calculateStaminaCost(pitch, stressLevel);

    const result: PitchResult = {
      pitch,
      target,
      actualLocation,
      locationError,
      outcome,
      batterReaction,
      contactQuality,
      effectiveness,
      sequenceBonus,
      deceptionBonus: pitch.deception * 0.1,
      staminaCost,
      stressLevel
    };

    // Update pitcher state
    this.updatePitcherState(pitcherId, result);

    return result;
  }

  /**
   * Update stamina (called between pitches/innings)
   */
  public updateStamina(pitcherId: string, deltaTime: number): void {
    const pitcher = this.pitchers.get(pitcherId);
    if (!pitcher) return;

    // Natural stamina recovery during rest
    pitcher.stamina.current = Math.min(
      pitcher.stamina.max,
      pitcher.stamina.current + pitcher.stamina.recoveryRate * deltaTime
    );

    // Reduce fatigue slowly during rest
    if (deltaTime > 30) { // Significant rest (30+ seconds)
      pitcher.stamina.fatigueLevel = Math.max(
        0,
        pitcher.stamina.fatigueLevel - deltaTime * 0.5
      );
    }

    // Update performance penalties based on current fatigue
    this.updateFatigueEffects(pitcher.stamina);

    // Update mentality
    this.updateMentality(pitcher.mentality, pitcher.stamina, pitcher.analytics);
  }

  /**
   * Get current pitcher state
   */
  public getPitcherState(pitcherId: string) {
    return this.pitchers.get(pitcherId);
  }

  /**
   * Get stamina percentage
   */
  public getStaminaPercentage(pitcherId: string): number {
    const pitcher = this.pitchers.get(pitcherId);
    return pitcher ? (pitcher.stamina.current / pitcher.stamina.max) * 100 : 0;
  }

  /**
   * Get fatigue level
   */
  public getFatigueLevel(pitcherId: string): number {
    const pitcher = this.pitchers.get(pitcherId);
    return pitcher ? pitcher.stamina.fatigueLevel : 0;
  }

  /**
   * Check if pitcher should be pulled
   */
  public shouldPullPitcher(pitcherId: string): {
    shouldPull: boolean;
    reasons: string[];
  } {
    const pitcher = this.pitchers.get(pitcherId);
    if (!pitcher) return { shouldPull: false, reasons: [] };

    const reasons: string[] = [];
    let shouldPull = false;

    // Stamina check
    if (pitcher.stamina.current < 20) {
      reasons.push('Low stamina (below 20%)');
      shouldPull = true;
    }

    // Fatigue check
    if (pitcher.stamina.fatigueLevel > 85) {
      reasons.push('High fatigue level (above 85%)');
      shouldPull = true;
    }

    // Injury risk check
    if (pitcher.stamina.injuryRiskLevel > this.INJURY_RISK_THRESHOLD) {
      reasons.push('Injury risk too high');
      shouldPull = true;
    }

    // Pitch count check
    if (pitcher.stamina.pitchCount > pitcher.stamina.recommendedPitchLimit) {
      reasons.push(`Exceeded recommended pitch limit (${pitcher.stamina.recommendedPitchLimit})`);
      shouldPull = true;
    }

    // Performance check
    const recentEffectiveness = this.calculateRecentEffectiveness(pitcher.analytics);
    if (recentEffectiveness < 30) {
      reasons.push('Poor recent performance (effectiveness below 30%)');
      shouldPull = true;
    }

    // Mental state check
    if (pitcher.mentality.confidence < 30) {
      reasons.push('Low confidence (below 30%)');
    }

    if (pitcher.mentality.composure < 30 && reasons.length > 0) {
      reasons.push('Low composure (below 30%)');
      shouldPull = true;
    }

    return { shouldPull, reasons };
  }

  /**
   * Reset pitcher for new game
   */
  public resetForNewGame(pitcherId: string): void {
    const pitcher = this.pitchers.get(pitcherId);
    if (!pitcher) return;

    pitcher.stamina = this.createInitialStamina(pitcher.stamina.max);
    pitcher.mentality.confidence = 75;
    pitcher.mentality.focus = 100;
    pitcher.mentality.momentumSwing = 0;
  }

  /**
   * Get analytics
   */
  public getAnalytics(pitcherId: string): PitchingAnalytics | null {
    const pitcher = this.pitchers.get(pitcherId);
    return pitcher ? pitcher.analytics : null;
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private createInitialStamina(max: number): StaminaState {
    return {
      current: max,
      max,
      fatigueLevel: 0,
      pitchCount: 0,
      highStressPitches: 0,
      recoveryRate: 0.5, // per second
      velocityPenalty: 0,
      controlPenalty: 0,
      movementPenalty: 0,
      armSpeed: 100,
      legDrive: 100,
      coreStrength: 100,
      mentalSharpness: 100,
      injuryRiskLevel: 0,
      pitchesUntilRisk: 100,
      recommendedPitchLimit: 100
    };
  }

  private createInitialMentality(): PitcherMentality {
    return {
      confidence: 75,
      composure: 75,
      focus: 100,
      temperament: 'professional',
      confidenceByCount: new Map(),
      confidenceWithRunners: 70,
      confidenceInJams: 60,
      clutchRating: 70,
      rattleResistance: 70,
      momentumSwing: 0
    };
  }

  private createInitialAnalytics(pitcherId: string): PitchingAnalytics {
    return {
      pitcherId,
      totalPitches: 0,
      totalBattersFaced: 0,
      usageByType: new Map(),
      effectivenessByType: new Map(),
      whiffRateByType: new Map(),
      performanceByCount: new Map(),
      performanceWithRunners: {
        none: 0,
        risp: 0,
        basesLoaded: 0
      },
      favoriteSequences: [],
      sequenceEffectiveness: 50,
      zones: this.createEmptyZoneGrid(),
      fatigueThreshold: 75,
      avgPitchesPerAppearance: 0,
      qualityStartPercentage: 0,
      recentForm: []
    };
  }

  private createEmptyZoneGrid(): PitcherZone[][] {
    const grid: PitcherZone[][] = [];

    for (let i = 0; i < this.ZONE_GRID_SIZE; i++) {
      grid[i] = [];
      for (let j = 0; j < this.ZONE_GRID_SIZE; j++) {
        grid[i][j] = {
          x: (j / (this.ZONE_GRID_SIZE - 1)) * 2 - 1,
          y: i / (this.ZONE_GRID_SIZE - 1),
          pitchesThrownHere: 0,
          strikeRate: 0,
          whiffRate: 0,
          contactRate: 0,
          hardContactRate: 0,
          expectedBA: 0,
          effectiveness: 50
        };
      }
    }

    return grid;
  }

  private getEffectiveControl(stamina: StaminaState, baseControl: number): number {
    return baseControl * (1 - stamina.controlPenalty);
  }

  private calculatePitchEffectivenessVsBatter(
    pitch: PitchCharacteristics,
    batterHotZones: number[][]
  ): number {
    // Simplified: calculate how effective this pitch is against batter's tendencies
    let totalEffectiveness = 0;
    let count = 0;

    // Sample a few zones
    for (let i = 0; i < this.ZONE_GRID_SIZE; i += 3) {
      for (let j = 0; j < this.ZONE_GRID_SIZE; j += 3) {
        const batterSuccess = batterHotZones[i]?.[j] || 0;
        // Lower batter success = higher pitcher effectiveness
        totalEffectiveness += (100 - batterSuccess);
        count++;
      }
    }

    return count > 0 ? totalEffectiveness / count : 50;
  }

  private selectTargetLocation(
    pitcher: any,
    pitch: PitchCharacteristics,
    situation: GameSituation
  ): PitchTarget {
    const isAhead = situation.strikes > situation.balls;
    const isBehind = situation.balls > situation.strikes;
    const hasTwoStrikes = situation.strikes === 2;

    let x = 0;
    let y = 0.5;
    let intentional: PitchTarget['intentional'] = 'strike';
    let locationName = 'middle-middle';

    // Batter handedness affects location
    const isLefty = situation.batterStats.handedness === 'left';

    if (hasTwoStrikes) {
      // With 2 strikes, go for chase pitches or corners
      if (pitch.deception > 70) {
        // Waste pitch just off the plate
        x = isLefty ? -1.2 : 1.2;
        y = 0.2 + Math.random() * 0.6;
        intentional = 'chase';
        locationName = isLefty ? 'low and inside' : 'low and away';
      } else {
        // Paint the corner
        x = isLefty ? -0.8 : 0.8;
        y = 0.3;
        intentional = 'corner';
        locationName = isLefty ? 'low and inside corner' : 'low and away corner';
      }
    } else if (isAhead) {
      // When ahead, try to induce weak contact or chase
      x = isLefty ? 0.7 : -0.7;
      y = 0.3 + Math.random() * 0.4;
      intentional = 'chase';
      locationName = 'off the plate';
    } else if (isBehind) {
      // When behind, throw strikes
      x = (Math.random() - 0.5) * 0.8;
      y = 0.4 + Math.random() * 0.3;
      intentional = 'strike';
      locationName = 'in the zone';
    } else {
      // Even count, mix it up
      x = (Math.random() - 0.5) * 1.0;
      y = 0.3 + Math.random() * 0.5;
      intentional = Math.random() > 0.5 ? 'strike' : 'corner';
      locationName = 'mixed location';
    }

    return {
      x,
      y,
      z: (Math.random() - 0.5) * 0.2, // Depth variance
      intentional,
      locationName
    };
  }

  private generateRecommendationReasoning(
    pitchType: PitchType,
    pitcher: any,
    situation: GameSituation
  ): string[] {
    const reasons: string[] = [];
    const pitch = pitcher.arsenal.pitches.get(pitchType)!;
    const countKey = `${situation.balls}-${situation.strikes}`;

    reasons.push(`Selected ${pitchType.replace('_', ' ')} for this situation`);

    if (pitch.confidence > 80) {
      reasons.push(`High confidence in this pitch (${Math.round(pitch.confidence)}%)`);
    }

    if (situation.strikes === 2) {
      if (pitchType === pitcher.arsenal.outPitch) {
        reasons.push('Using out pitch with 2 strikes');
      }
    }

    if (situation.balls > situation.strikes && pitch.control > 75) {
      reasons.push('Need strike - using high-control pitch');
    }

    if (pitcher.stamina.fatigueLevel > 60 && pitch.energyCost < 50) {
      reasons.push('Conserving energy with lower-effort pitch');
    }

    if (situation.runners.second || situation.runners.third) {
      reasons.push('Pitching carefully with runners in scoring position');
    }

    return reasons;
  }

  private calculateActualLocation(
    target: PitchTarget,
    pitch: PitchCharacteristics,
    stamina: StaminaState
  ): { x: number; y: number; z: number } {
    const effectiveControl = this.getEffectiveControl(stamina, pitch.control);

    // Control determines variance
    const variance = (100 - effectiveControl) / 100 * 0.3;

    return {
      x: target.x + (Math.random() - 0.5) * variance * 2,
      y: target.y + (Math.random() - 0.5) * variance,
      z: target.z + (Math.random() - 0.5) * variance * 0.5
    };
  }

  private determinePitchOutcome(
    actualLocation: { x: number; y: number; z: number },
    target: PitchTarget,
    batterReaction: 'swing' | 'take' | 'check_swing',
    pitch: PitchCharacteristics
  ): PitchResult['outcome'] {
    const inZone = Math.abs(actualLocation.x) <= 0.85 &&
                   actualLocation.y >= 0.2 &&
                   actualLocation.y <= 0.9;

    if (batterReaction === 'swing') {
      // Determine if contact was made
      const swingDifficulty = this.calculateSwingDifficulty(actualLocation, pitch);
      const contactMade = Math.random() > swingDifficulty;

      if (contactMade) {
        // Contact - determine if foul or in play
        return Math.random() > 0.3 ? 'hit_into_play' : 'foul';
      } else {
        return 'swinging_strike';
      }
    } else if (batterReaction === 'take') {
      return inZone ? 'called_strike' : 'ball';
    } else {
      // Check swing
      return Math.random() > 0.5 ? 'swinging_strike' : 'ball';
    }
  }

  private calculateSwingDifficulty(
    location: { x: number; y: number; z: number },
    pitch: PitchCharacteristics
  ): number {
    // Distance from middle of zone
    const distance = Math.sqrt(
      location.x * location.x +
      (location.y - 0.55) * (location.y - 0.55)
    );

    // Base difficulty from location
    let difficulty = distance * 0.3;

    // Add deception
    difficulty += pitch.deception / 100 * 0.3;

    // Add movement
    const totalMovement = Math.sqrt(
      pitch.horizontalMovement * pitch.horizontalMovement +
      pitch.verticalMovement * pitch.verticalMovement
    );
    difficulty += (totalMovement / 20) * 0.2;

    return Math.min(0.95, Math.max(0.05, difficulty));
  }

  private calculatePitchEffectiveness(
    outcome: PitchResult['outcome'],
    actualLocation: { x: number; y: number; z: number },
    target: PitchTarget,
    locationError: number,
    pitch: PitchCharacteristics
  ): number {
    let effectiveness = 50;

    // Outcome-based scoring
    switch (outcome) {
      case 'swinging_strike':
        effectiveness += 40;
        break;
      case 'called_strike':
        effectiveness += 30;
        break;
      case 'foul':
        effectiveness += 10;
        break;
      case 'ball':
        effectiveness -= 20;
        break;
      case 'hit_into_play':
        effectiveness -= 10; // Neutral, depends on contact quality
        break;
      case 'hit_by_pitch':
        effectiveness -= 50;
        break;
    }

    // Location accuracy bonus
    effectiveness += (1 - locationError) * 20;

    // Hit target intent bonus
    const inZone = Math.abs(actualLocation.x) <= 0.85 &&
                   actualLocation.y >= 0.2 &&
                   actualLocation.y <= 0.9;

    if (target.intentional === 'strike' && inZone) {
      effectiveness += 10;
    } else if (target.intentional === 'ball' && !inZone) {
      effectiveness += 10;
    }

    return Math.max(0, Math.min(100, effectiveness));
  }

  private calculateSequenceBonus(
    currentPitch: PitchType,
    recentForm: PitchResult[]
  ): number {
    if (recentForm.length < 2) return 0;

    const lastPitch = recentForm[recentForm.length - 1]?.pitch.type;
    const secondLastPitch = recentForm[recentForm.length - 2]?.pitch.type;

    let bonus = 0;

    // Bonus for variety
    if (currentPitch !== lastPitch) {
      bonus += 5;
    }

    // Bonus for not repeating last two pitches
    if (currentPitch !== lastPitch && currentPitch !== secondLastPitch) {
      bonus += 5;
    }

    // Bonus for good sequencing patterns
    if (lastPitch === 'fourseam_fastball' && currentPitch === 'changeup') {
      bonus += 10; // Classic sequence
    }

    if (lastPitch === 'slider' && currentPitch === 'fourseam_fastball') {
      bonus += 8; // Off-speed to fastball
    }

    return bonus;
  }

  private determineStressLevel(
    pitch: PitchCharacteristics,
    target: PitchTarget
  ): PitchResult['stressLevel'] {
    let stress = 0;

    // Base stress from pitch type
    stress += pitch.energyCost;

    // Stress from max effort location (corners, edges)
    const locationStress = Math.max(
      Math.abs(target.x),
      Math.abs(target.y - 0.5) * 2
    ) * 30;
    stress += locationStress;

    // Intentional waste pitches are high stress
    if (target.intentional === 'waste' || target.intentional === 'chase') {
      stress += 15;
    }

    if (stress < 30) return 'low';
    if (stress < 60) return 'medium';
    if (stress < 85) return 'high';
    return 'max';
  }

  private calculateStaminaCost(
    pitch: PitchCharacteristics,
    stressLevel: PitchResult['stressLevel']
  ): number {
    let cost = pitch.energyCost * 0.5;

    switch (stressLevel) {
      case 'low':
        cost *= 0.8;
        break;
      case 'medium':
        cost *= 1.0;
        break;
      case 'high':
        cost *= 1.3;
        break;
      case 'max':
        cost *= 1.6;
        break;
    }

    return cost;
  }

  private updatePitcherState(pitcherId: string, result: PitchResult): void {
    const pitcher = this.pitchers.get(pitcherId);
    if (!pitcher) return;

    // Update stamina
    pitcher.stamina.current = Math.max(0, pitcher.stamina.current - result.staminaCost);
    pitcher.stamina.pitchCount++;

    if (result.stressLevel === 'high' || result.stressLevel === 'max') {
      pitcher.stamina.highStressPitches++;
    }

    // Update fatigue
    const fatigueIncrease = result.staminaCost * 0.2;
    pitcher.stamina.fatigueLevel = Math.min(100, pitcher.stamina.fatigueLevel + fatigueIncrease);

    // Update fatigue effects
    this.updateFatigueEffects(pitcher.stamina);

    // Update injury risk
    this.updateInjuryRisk(pitcher.stamina);

    // Update confidence based on result
    this.updateConfidenceFromResult(pitcher.mentality, result);

    // Update analytics
    this.updateAnalytics(pitcher.analytics, result);
  }

  private updateFatigueEffects(stamina: StaminaState): void {
    const fatigue = stamina.fatigueLevel / 100;

    stamina.velocityPenalty = fatigue * this.FATIGUE_VELOCITY_IMPACT;
    stamina.controlPenalty = fatigue * this.FATIGUE_CONTROL_IMPACT;
    stamina.movementPenalty = fatigue * 0.1;

    stamina.armSpeed = Math.max(0, 100 - fatigue * 30);
    stamina.legDrive = Math.max(0, 100 - fatigue * 40);
    stamina.coreStrength = Math.max(0, 100 - fatigue * 35);
    stamina.mentalSharpness = Math.max(0, 100 - fatigue * 25);
  }

  private updateInjuryRisk(stamina: StaminaState): void {
    let riskLevel = 0;

    // Fatigue-based risk
    if (stamina.fatigueLevel > 70) {
      riskLevel += (stamina.fatigueLevel - 70) * 2;
    }

    // Pitch count risk
    if (stamina.pitchCount > 90) {
      riskLevel += (stamina.pitchCount - 90) * 0.5;
    }

    // High stress pitches risk
    if (stamina.highStressPitches > 30) {
      riskLevel += (stamina.highStressPitches - 30);
    }

    stamina.injuryRiskLevel = Math.min(100, riskLevel);
    stamina.pitchesUntilRisk = Math.max(0, (this.INJURY_RISK_THRESHOLD - riskLevel) * 2);
  }

  private updateConfidenceFromResult(mentality: PitcherMentality, result: PitchResult): void {
    const effectivenessImpact = (result.effectiveness - 50) * 0.1;

    mentality.confidence = Math.max(
      0,
      Math.min(100, mentality.confidence + effectivenessImpact)
    );

    // Update momentum
    if (result.outcome === 'swinging_strike' || result.outcome === 'called_strike') {
      mentality.momentumSwing = Math.min(50, mentality.momentumSwing + 3);
    } else if (result.outcome === 'hit_into_play' && result.contactQuality === 'barrel') {
      mentality.momentumSwing = Math.max(-50, mentality.momentumSwing - 5);
    }

    // Momentum affects confidence
    mentality.confidence += mentality.momentumSwing * 0.05;
    mentality.confidence = Math.max(0, Math.min(100, mentality.confidence));
  }

  private updateMentality(
    mentality: PitcherMentality,
    stamina: StaminaState,
    analytics: PitchingAnalytics
  ): void {
    // Fatigue affects focus
    mentality.focus = stamina.mentalSharpness;

    // Recent performance affects confidence
    const recentEffectiveness = this.calculateRecentEffectiveness(analytics);
    const performanceImpact = (recentEffectiveness - 50) * 0.2;

    mentality.confidence = Math.max(
      0,
      Math.min(100, mentality.confidence + performanceImpact * 0.1)
    );
  }

  private updateAnalytics(analytics: PitchingAnalytics, result: PitchResult): void {
    analytics.totalPitches++;

    // Update usage by type
    const currentUsage = analytics.usageByType.get(result.pitch.type) || 0;
    analytics.usageByType.set(result.pitch.type, currentUsage + 1);

    // Update effectiveness by type
    const currentEffectiveness = analytics.effectivenessByType.get(result.pitch.type) || 50;
    const newEffectiveness = (currentEffectiveness + result.effectiveness) / 2;
    analytics.effectivenessByType.set(result.pitch.type, newEffectiveness);

    // Update whiff rate
    if (result.outcome === 'swinging_strike') {
      const currentWhiff = analytics.whiffRateByType.get(result.pitch.type) || 0;
      const pitchUsage = analytics.usageByType.get(result.pitch.type) || 1;
      const newWhiff = ((currentWhiff * (pitchUsage - 1)) + 100) / pitchUsage;
      analytics.whiffRateByType.set(result.pitch.type, newWhiff);
    }

    // Update recent form
    analytics.recentForm.push(result);
    if (analytics.recentForm.length > 10) {
      analytics.recentForm.shift();
    }

    // Update zones (simplified)
    const zoneX = Math.floor(((result.actualLocation.x + 1) / 2) * (this.ZONE_GRID_SIZE - 1));
    const zoneY = Math.floor(result.actualLocation.y * (this.ZONE_GRID_SIZE - 1));
    const x = Math.max(0, Math.min(this.ZONE_GRID_SIZE - 1, zoneX));
    const y = Math.max(0, Math.min(this.ZONE_GRID_SIZE - 1, zoneY));

    const zone = analytics.zones[y][x];
    zone.pitchesThrownHere++;

    if (result.outcome === 'called_strike' || result.outcome === 'swinging_strike') {
      const totalStrikes = zone.strikeRate * (zone.pitchesThrownHere - 1);
      zone.strikeRate = (totalStrikes + 1) / zone.pitchesThrownHere;
    }

    if (result.outcome === 'swinging_strike') {
      const totalWhiffs = zone.whiffRate * (zone.pitchesThrownHere - 1);
      zone.whiffRate = (totalWhiffs + 1) / zone.pitchesThrownHere;
    }
  }

  private calculateRecentEffectiveness(analytics: PitchingAnalytics): number {
    if (analytics.recentForm.length === 0) return 50;

    const total = analytics.recentForm.reduce((sum, r) => sum + r.effectiveness, 0);
    return total / analytics.recentForm.length;
  }
}
