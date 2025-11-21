/**
 * Base Running Intelligence System
 *
 * Advanced base running AI with stealing mechanics, lead-off calculations,
 * read and react intelligence, tagging decisions, and comprehensive
 * situational awareness. Includes risk assessment and decision trees.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Runner attributes
 */
export interface RunnerAttributes {
  playerId: string;
  speed: number; // 0-100 (base running speed)
  acceleration: number; // 0-100 (how quickly they reach top speed)
  baseballIQ: number; // 0-100 (decision making ability)
  aggressiveness: number; // 0-100 (willingness to take risks)
  stealingAbility: number; // 0-100 (stealing technique and timing)
  slidingSkill: number; // 0-100 (sliding technique)
  readAbility: number; // 0-100 (ability to read plays)

  // Current state
  stamina: number; // 0-100
  confidence: number; // 0-100
}

/**
 * Current runner position and state
 */
export interface RunnerState {
  runnerId: string;
  currentBase: 0 | 1 | 2 | 3 | 4; // 0 = home, 4 = scored
  leadOffDistance: number; // feet from base
  isLeading: boolean;
  isRunning: boolean;
  isStealing: boolean;
  isSlidingHeadFirst: boolean;
  isSlidingFeetFirst: boolean;
  isDiving: boolean;

  // Position tracking
  position: { x: number; y: number }; // Field position in feet
  velocity: { x: number; y: number }; // ft/s
  distanceToNextBase: number; // feet
  distanceCovered: number; // feet this run
  estimatedArrivalTime: number; // seconds until next base

  // Decision state
  commitment: 'none' | 'soft' | 'medium' | 'full'; // How committed to running
  lastDecision: string;
  decisionTime: number; // timestamp of last decision
}

/**
 * Steal attempt data
 */
export interface StealAttempt {
  runnerId: string;
  fromBase: 1 | 2 | 3;
  toBase: 2 | 3 | 4; // 4 = home
  startTime: number;
  pitcherReleaseTime: number;
  catcherThrowTime: number;

  // Jump metrics
  jumpQuality: 'poor' | 'average' | 'good' | 'excellent';
  jumpTime: number; // seconds from pitcher start to runner start
  reactionTime: number; // ms

  // Outcome prediction
  estimatedSafe: boolean;
  safetyMargin: number; // seconds (positive = safe, negative = out)
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';

  // Actual outcome
  outcome?: 'safe' | 'out' | 'pickoff' | 'caught_stealing' | 'balk';
  actualTime?: number;
}

/**
 * Tag-up decision on fly ball
 */
export interface TagUpDecision {
  runnerId: string;
  currentBase: 1 | 2 | 3;
  flyBallLocation: { x: number; y: number };
  catchLocation: { x: number; y: number };
  fielderThrowStrength: number; // 0-100
  fielderAccuracy: number; // 0-100

  shouldTag: boolean;
  confidence: number; // 0-100
  estimatedSafe: boolean;
  safetyMargin: number; // seconds
  riskAssessment: string;
}

/**
 * Advance/hold decision
 */
export interface AdvanceDecision {
  runnerId: string;
  currentBase: 1 | 2 | 3;
  ballLocation: { x: number; y: number };
  fielderPositions: Array<{ x: number; y: number; throwing: boolean }>;

  decision: 'hold' | 'advance' | 'try_for_extra'; // Try for extra base
  confidence: number; // 0-100
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';

  // Factors considered
  factors: {
    outs: number;
    score: { us: number; them: number };
    inning: number;
    ballInPlay: boolean;
    fielderHasControl: boolean;
    throwInFlight: boolean;
  };
}

/**
 * Base coaching signals
 */
export interface CoachSignal {
  targetRunner: string | 'all';
  signal: 'go' | 'stop' | 'hold' | 'slide' | 'stand_up' | 'round_base' | 'tag_up';
  urgency: 'normal' | 'urgent' | 'critical';
  timestamp: number;
}

/**
 * Base running analytics
 */
export interface BaseRunningAnalytics {
  runnerId: string;

  // Stealing stats
  stealAttempts: number;
  successfulSteals: number;
  caughtStealing: number;
  pickoffs: number;
  stealSuccessRate: number; // 0-100

  // By base
  stealsOfSecond: { attempts: number; successes: number };
  stealsOfThird: { attempts: number; successes: number };
  stealsOfHome: { attempts: number; successes: number };

  // Advancement
  extraBasesT taken: number; // Times runner took extra base
  extraBasesOpportunities: number;
  extraBaseRate: number; // 0-100

  // Outs on bases
  outsOnBases: number;
  baseRunningErrors: number;

  // Decision quality
  goodDecisions: number;
  badDecisions: number;
  decisionQualityRate: number; // 0-100

  // Speed metrics
  avgTimeToSecond: number; // seconds (home to 2nd)
  avgTimeToThird: number; // seconds (1st to 3rd)
  avgTimeToHome: number; // seconds (1st to home)
  topSpeed: number; // ft/s

  // Recent performance
  recentSteals: StealAttempt[];
  recentDecisions: AdvanceDecision[];
}

/**
 * Game situation for base running decisions
 */
export interface BaseRunningSituation {
  inning: number;
  outs: number;
  score: { us: number; them: number };
  balls: number;
  strikes: number;
  batterId: string;
  batterPower: number; // 0-100
  pitcherId: string;
  pitcherToPlateTime: number; // seconds
  catcherPopTime: number; // seconds (catch to tag at 2nd base)

  // Base states
  runnerOn1st: boolean;
  runnerOn2nd: boolean;
  runnerOn3rd: boolean;

  // Field conditions
  fieldSurface: 'grass' | 'turf' | 'dirt';
  weather: 'clear' | 'rain' | 'wind';
}

// ============================================================================
// Base Running Intelligence System Class
// ============================================================================

export class BaseRunningIntelligenceSystem {
  private runners: Map<string, RunnerAttributes>;
  private runnerStates: Map<string, RunnerState>;
  private analytics: Map<string, BaseRunningAnalytics>;
  private coachSignals: CoachSignal[];

  // Base positions (in feet from home plate)
  private readonly BASE_POSITIONS = {
    home: { x: 0, y: 0 },
    first: { x: 63.64, y: 63.64 }, // 90 ft at 45 degrees
    second: { x: 0, y: 127.28 }, // 90 ft straight up
    third: { x: -63.64, y: 63.64 } // 90 ft at 135 degrees
  };

  private readonly BASE_DISTANCE = 90; // feet
  private readonly LEAD_OFF_MAX = 12; // max lead off distance (feet)
  private readonly PITCHER_TO_PLATE_AVG = 1.3; // seconds (average)
  private readonly CATCHER_POP_TIME_AVG = 2.0; // seconds (average)

  constructor() {
    this.runners = new Map();
    this.runnerStates = new Map();
    this.analytics = new Map();
    this.coachSignals = [];
  }

  // ========================================================================
  // Public API
  // ========================================================================

  /**
   * Register a runner
   */
  public registerRunner(runnerId: string, attributes: RunnerAttributes): void {
    this.runners.set(runnerId, attributes);

    if (!this.analytics.has(runnerId)) {
      this.analytics.set(runnerId, this.createInitialAnalytics(runnerId));
    }
  }

  /**
   * Place runner on base
   */
  public placeRunnerOnBase(runnerId: string, base: 1 | 2 | 3): void {
    const runner = this.runners.get(runnerId);
    if (!runner) return;

    const basePos = this.getBasePosition(base);

    const state: RunnerState = {
      runnerId,
      currentBase: base,
      leadOffDistance: 0,
      isLeading: false,
      isRunning: false,
      isStealing: false,
      isSlidingHeadFirst: false,
      isSlidingFeetFirst: false,
      isDiving: false,
      position: { ...basePos },
      velocity: { x: 0, y: 0 },
      distanceToNextBase: this.BASE_DISTANCE,
      distanceCovered: 0,
      estimatedArrivalTime: 0,
      commitment: 'none',
      lastDecision: 'placed on base',
      decisionTime: Date.now()
    };

    this.runnerStates.set(runnerId, state);
  }

  /**
   * Calculate optimal lead-off distance
   */
  public calculateLeadOff(
    runnerId: string,
    situation: BaseRunningSituation
  ): number {
    const runner = this.runners.get(runnerId);
    const state = this.runnerStates.get(runnerId);

    if (!runner || !state || state.currentBase === 0) return 0;

    // Base lead-off from speed and stealing ability
    const baseLeadOff = (runner.speed / 100) * 8 + (runner.stealingAbility / 100) * 4;

    // Aggressiveness modifier
    const aggressivenessMod = (runner.aggressiveness / 100) * 2;

    // Pitcher-specific adjustment
    const pitcherTimeMod = situation.pitcherToPlateTime > 1.4 ? 1.5 : 1.0;

    // Situational adjustments
    let situationMod = 1.0;

    if (situation.outs === 2) {
      situationMod = 1.3; // More aggressive with 2 outs
    }

    if (state.currentBase === 3) {
      situationMod *= 0.7; // More conservative at 3rd
    }

    // IQ-based fine tuning
    const iqMod = 0.9 + (runner.baseballIQ / 100) * 0.2;

    let leadOff = (baseLeadOff + aggressivenessMod) * pitcherTimeMod * situationMod * iqMod;

    // Clamp to max
    leadOff = Math.min(this.LEAD_OFF_MAX, leadOff);

    return Math.round(leadOff * 10) / 10;
  }

  /**
   * Decide whether to attempt steal
   */
  public evaluateStealOpportunity(
    runnerId: string,
    situation: BaseRunningSituation
  ): { shouldSteal: boolean; confidence: number; reasoning: string[] } {
    const runner = this.runners.get(runnerId);
    const state = this.runnerStates.get(runnerId);

    if (!runner || !state) {
      return { shouldSteal: false, confidence: 0, reasoning: ['Runner not found'] };
    }

    if (state.currentBase === 0 || state.currentBase === 4) {
      return { shouldSteal: false, confidence: 0, reasoning: ['Not on base'] };
    }

    const reasoning: string[] = [];
    let score = 50; // Base score

    // Can only steal from 1st, 2nd, or 3rd
    const nextBase = (state.currentBase + 1) as 2 | 3 | 4;

    // Check if base is occupied
    if (nextBase === 2 && situation.runnerOn2nd) {
      return { shouldSteal: false, confidence: 0, reasoning: ['Base occupied'] };
    }
    if (nextBase === 3 && situation.runnerOn3rd) {
      return { shouldSteal: false, confidence: 0, reasoning: ['Base occupied'] };
    }

    // Ability-based scoring
    score += (runner.stealingAbility - 50) * 0.4;
    score += (runner.speed - 50) * 0.3;
    score += (runner.aggressiveness - 50) * 0.2;

    // Situational scoring
    if (situation.outs === 2) {
      score += 10;
      reasoning.push('2 outs - more aggressive');
    } else if (situation.outs === 0) {
      score -= 5;
      reasoning.push('No outs - more conservative');
    }

    // Count-based
    if (situation.balls > situation.strikes) {
      score += 5;
      reasoning.push('Favorable count for running');
    }

    // Pitcher timing
    if (situation.pitcherToPlateTime > this.PITCHER_TO_PLATE_AVG + 0.1) {
      score += 15;
      reasoning.push('Slow pitcher delivery');
    } else if (situation.pitcherToPlateTime < this.PITCHER_TO_PLATE_AVG - 0.1) {
      score -= 10;
      reasoning.push('Quick pitcher delivery');
    }

    // Catcher pop time
    if (situation.catcherPopTime > this.CATCHER_POP_TIME_AVG + 0.1) {
      score += 15;
      reasoning.push('Slow catcher');
    } else if (situation.catcherPopTime < this.CATCHER_POP_TIME_AVG - 0.1) {
      score -= 10;
      reasoning.push('Strong-armed catcher');
    }

    // Game situation - score matters
    const scoreDiff = situation.score.us - situation.score.them;

    if (scoreDiff < -3 && situation.inning > 6) {
      score += 10;
      reasoning.push('Down late - need baserunners');
    } else if (scoreDiff > 5) {
      score -= 10;
      reasoning.push('Big lead - dont risk it');
    }

    // Batter power - dont steal with power hitter
    if (situation.batterPower > 80) {
      score -= 15;
      reasoning.push('Power hitter up - let them swing');
    }

    // Home steal is very rare
    if (nextBase === 4) {
      score -= 30;
      reasoning.push('Stealing home is very risky');
    }

    // Calculate actual success probability
    const successProb = this.calculateStealSuccessProbability(
      runner,
      situation,
      state.currentBase as 1 | 2 | 3
    );

    score += (successProb - 70) * 0.5; // Adjust based on success probability

    reasoning.push(`Estimated success: ${Math.round(successProb)}%`);

    // Final decision - need score > 60 and success prob > 65%
    const shouldSteal = score > 60 && successProb > 65;
    const confidence = Math.min(100, Math.max(0, score));

    if (shouldSteal) {
      reasoning.push('DECISION: Attempt steal');
    } else {
      reasoning.push('DECISION: Stay put');
    }

    return { shouldSteal, confidence, reasoning };
  }

  /**
   * Execute steal attempt
   */
  public executeSteal(
    runnerId: string,
    situation: BaseRunningSituation
  ): StealAttempt | null {
    const runner = this.runners.get(runnerId);
    const state = this.runnerStates.get(runnerId);

    if (!runner || !state || state.currentBase === 0 || state.currentBase === 4) {
      return null;
    }

    const fromBase = state.currentBase as 1 | 2 | 3;
    const toBase = (fromBase + 1) as 2 | 3 | 4;

    // Calculate jump quality
    const jumpQuality = this.calculateJumpQuality(runner);
    const reactionTime = this.calculateReactionTime(runner, jumpQuality);
    const jumpTime = reactionTime / 1000; // Convert to seconds

    // Pitcher and catcher times
    const pitcherReleaseTime = situation.pitcherToPlateTime;
    const catcherThrowTime = situation.catcherPopTime;

    // Calculate runner time to base
    const runnerTime = this.calculateRunnerTimeToBase(runner, state, fromBase, toBase);

    // Total times
    const totalDefenseTime = pitcherReleaseTime + catcherThrowTime;
    const totalRunnerTime = jumpTime + runnerTime;

    // Safety margin
    const safetyMargin = totalDefenseTime - totalRunnerTime;
    const estimatedSafe = safetyMargin > 0;

    // Risk level
    let riskLevel: StealAttempt['riskLevel'];
    if (safetyMargin > 0.3) riskLevel = 'low';
    else if (safetyMargin > 0.1) riskLevel = 'medium';
    else if (safetyMargin > -0.1) riskLevel = 'high';
    else riskLevel = 'very_high';

    const attempt: StealAttempt = {
      runnerId,
      fromBase,
      toBase,
      startTime: Date.now(),
      pitcherReleaseTime,
      catcherThrowTime,
      jumpQuality,
      jumpTime,
      reactionTime,
      estimatedSafe,
      safetyMargin,
      riskLevel
    };

    // Update runner state
    state.isStealing = true;
    state.isRunning = true;
    state.commitment = 'full';
    state.lastDecision = 'steal attempt';
    state.decisionTime = Date.now();

    // Update analytics
    const analytics = this.analytics.get(runnerId);
    if (analytics) {
      analytics.stealAttempts++;
      analytics.recentSteals.push(attempt);

      if (analytics.recentSteals.length > 20) {
        analytics.recentSteals.shift();
      }
    }

    return attempt;
  }

  /**
   * Decide on tag-up opportunity
   */
  public evaluateTagUp(
    runnerId: string,
    flyBallLocation: { x: number; y: number },
    catchLocation: { x: number; y: number },
    fielderThrowStrength: number,
    fielderAccuracy: number,
    situation: BaseRunningSituation
  ): TagUpDecision | null {
    const runner = this.runners.get(runnerId);
    const state = this.runnerStates.get(runnerId);

    if (!runner || !state || state.currentBase === 0 || state.currentBase === 4) {
      return null;
    }

    const currentBase = state.currentBase as 1 | 2 | 3;
    const nextBasePos = this.getBasePosition((currentBase + 1) as 1 | 2 | 3 | 4);
    const currentBasePos = this.getBasePosition(currentBase);

    // Calculate distance fielder must throw
    const throwDistance = Math.sqrt(
      Math.pow(nextBasePos.x - catchLocation.x, 2) +
      Math.pow(nextBasePos.y - catchLocation.y, 2)
    );

    // Calculate fielder throw time (based on distance and strength)
    const baseThrowTime = throwDistance / ((fielderThrowStrength / 100) * 120); // 120 ft/s max
    const accuracyPenalty = (100 - fielderAccuracy) / 100 * 0.3;
    const fielderThrowTime = baseThrowTime + accuracyPenalty;

    // Calculate runner time from current base to next
    const runnerTime = this.calculateRunnerTimeToBase(runner, state, currentBase, (currentBase + 1) as 2 | 3 | 4);

    // Safety margin
    const safetyMargin = fielderThrowTime - runnerTime;
    const estimatedSafe = safetyMargin > 0.2; // Need 0.2s margin

    // Decision logic
    let shouldTag = false;
    let confidence = 50;
    let riskAssessment = 'Unknown';

    if (currentBase === 3 && situation.outs < 2) {
      // From 3rd with less than 2 outs - scoring opportunity
      if (safetyMargin > 0) {
        shouldTag = true;
        confidence = 70 + Math.min(30, safetyMargin * 50);
        riskAssessment = 'Good scoring opportunity';
      } else if (safetyMargin > -0.3) {
        // Borderline - depends on game situation
        const scoreDiff = situation.score.us - situation.score.them;

        if (scoreDiff < 0 && situation.inning > 6) {
          shouldTag = true;
          confidence = 60;
          riskAssessment = 'Need runs - worth the risk';
        } else {
          shouldTag = false;
          confidence = 40;
          riskAssessment = 'Too close - play it safe';
        }
      }
    } else if (currentBase === 2 && situation.outs === 2) {
      // From 2nd with 2 outs - must tag to score
      if (estimatedSafe) {
        shouldTag = true;
        confidence = 80;
        riskAssessment = '2 outs - must go';
      }
    } else {
      // Other situations - conservative
      if (safetyMargin > 0.5) {
        shouldTag = true;
        confidence = 75;
        riskAssessment = 'Large margin - safe advance';
      }
    }

    // Baseball IQ adjustment
    confidence += (runner.baseballIQ - 50) * 0.2;
    confidence = Math.max(0, Math.min(100, confidence));

    return {
      runnerId,
      currentBase,
      flyBallLocation,
      catchLocation,
      fielderThrowStrength,
      fielderAccuracy,
      shouldTag,
      confidence,
      estimatedSafe,
      safetyMargin,
      riskAssessment
    };
  }

  /**
   * Make advance/hold decision on ball in play
   */
  public makeAdvanceDecision(
    runnerId: string,
    ballLocation: { x: number; y: number },
    fielderPositions: Array<{ x: number; y: number; throwing: boolean }>,
    situation: BaseRunningSituation
  ): AdvanceDecision | null {
    const runner = this.runners.get(runnerId);
    const state = this.runnerStates.get(runnerId);

    if (!runner || !state || state.currentBase === 0 || state.currentBase === 4) {
      return null;
    }

    const currentBase = state.currentBase as 1 | 2 | 3;
    const reasoning: string[] = [];
    let decision: AdvanceDecision['decision'] = 'hold';
    let confidence = 50;
    let riskLevel: AdvanceDecision['riskLevel'] = 'medium';

    // Check if fielder has control of ball
    const nearestFielder = this.findNearestFielder(ballLocation, fielderPositions);
    const fielderHasControl = nearestFielder.distance < 5; // Within 5 feet

    // Check for throw in flight
    const throwInFlight = fielderPositions.some(f => f.throwing);

    // Base positions
    const nextBasePos = this.getBasePosition((currentBase + 1) as 1 | 2 | 3 | 4);
    const currentBasePos = this.getBasePosition(currentBase);

    // Calculate if fielder can make play
    const distanceToNextBase = Math.sqrt(
      Math.pow(nextBasePos.x - state.position.x, 2) +
      Math.pow(nextBasePos.y - state.position.y, 2)
    );

    const distanceFielderToBase = Math.sqrt(
      Math.pow(nextBasePos.x - ballLocation.x, 2) +
      Math.pow(nextBasePos.y - ballLocation.y, 2)
    );

    // Decision tree
    if (situation.outs === 2) {
      // With 2 outs, must run on everything
      decision = 'advance';
      confidence = 90;
      riskLevel = 'low';
      reasoning.push('2 outs - must run');
    } else if (throwInFlight) {
      // Throw in flight - hold unless committed
      if (state.commitment === 'full' || distanceToNextBase < 20) {
        decision = 'advance';
        confidence = 60;
        riskLevel = 'high';
        reasoning.push('Committed to base - continue');
      } else {
        decision = 'hold';
        confidence = 80;
        riskLevel = 'medium';
        reasoning.push('Throw in flight - hold up');
      }
    } else if (!fielderHasControl) {
      // Ball is loose
      if (distanceToNextBase < distanceFielderToBase * 0.7) {
        decision = 'advance';
        confidence = 85;
        riskLevel = 'low';
        reasoning.push('Ball is loose - easy advance');

        // Check for extra base
        if (runner.speed > 80 && runner.aggressiveness > 70) {
          decision = 'try_for_extra';
          confidence = 70;
          riskLevel = 'medium';
          reasoning.push('Fast runner - try for extra');
        }
      } else {
        decision = 'hold';
        confidence = 70;
        riskLevel = 'low';
        reasoning.push('Fielder too close - play it safe');
      }
    } else {
      // Fielder has control
      const runnerTime = distanceToNextBase / ((runner.speed / 100) * 30); // 30 ft/s max
      const fielderTime = distanceFielderToBase / 100; // 100 ft/s throw speed

      if (runnerTime < fielderTime - 0.5) {
        decision = 'advance';
        confidence = 75;
        riskLevel = 'low';
        reasoning.push('Can beat the throw');
      } else if (runnerTime < fielderTime) {
        // Close play
        if (runner.aggressiveness > 70 && runner.baseballIQ > 70) {
          decision = 'advance';
          confidence = 60;
          riskLevel = 'medium';
          reasoning.push('Aggressive decision - borderline play');
        } else {
          decision = 'hold';
          confidence = 70;
          riskLevel = 'medium';
          reasoning.push('Too close - conservative choice');
        }
      } else {
        decision = 'hold';
        confidence = 90;
        riskLevel = 'low';
        reasoning.push('Would be out - hold');
      }
    }

    // Update runner state
    state.lastDecision = decision;
    state.decisionTime = Date.now();

    if (decision === 'advance' || decision === 'try_for_extra') {
      state.isRunning = true;
      state.commitment = decision === 'try_for_extra' ? 'full' : 'medium';
    } else {
      state.commitment = 'none';
    }

    // Track decision in analytics
    const advanceDecision: AdvanceDecision = {
      runnerId,
      currentBase,
      ballLocation,
      fielderPositions,
      decision,
      confidence,
      reasoning,
      riskLevel,
      factors: {
        outs: situation.outs,
        score: { ...situation.score },
        inning: situation.inning,
        ballInPlay: true,
        fielderHasControl,
        throwInFlight
      }
    };

    const analytics = this.analytics.get(runnerId);
    if (analytics) {
      analytics.recentDecisions.push(advanceDecision);
      if (analytics.recentDecisions.length > 20) {
        analytics.recentDecisions.shift();
      }
    }

    return advanceDecision;
  }

  /**
   * Update runner position and state
   */
  public updateRunner(runnerId: string, deltaTime: number): void {
    const runner = this.runners.get(runnerId);
    const state = this.runnerStates.get(runnerId);

    if (!runner || !state || !state.isRunning) return;

    // Calculate current speed based on attributes and stamina
    const maxSpeed = (runner.speed / 100) * 30; // Max 30 ft/s
    const staminaFactor = runner.stamina / 100;
    const currentSpeed = maxSpeed * staminaFactor;

    // Acceleration
    const accelerationRate = (runner.acceleration / 100) * 10; // ft/s^2

    // Update velocity
    const currentVelocityMagnitude = Math.sqrt(
      state.velocity.x * state.velocity.x +
      state.velocity.y * state.velocity.y
    );

    if (currentVelocityMagnitude < currentSpeed) {
      // Still accelerating
      const newSpeed = Math.min(currentSpeed, currentVelocityMagnitude + accelerationRate * deltaTime);

      // Direction to next base
      const nextBasePos = this.getBasePosition((state.currentBase + 1) as 1 | 2 | 3 | 4);
      const direction = {
        x: nextBasePos.x - state.position.x,
        y: nextBasePos.y - state.position.y
      };
      const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

      if (magnitude > 0) {
        state.velocity.x = (direction.x / magnitude) * newSpeed;
        state.velocity.y = (direction.y / magnitude) * newSpeed;
      }
    }

    // Update position
    state.position.x += state.velocity.x * deltaTime;
    state.position.y += state.velocity.y * deltaTime;

    // Update distance covered
    const distanceMoved = Math.sqrt(
      state.velocity.x * state.velocity.x +
      state.velocity.y * state.velocity.y
    ) * deltaTime;
    state.distanceCovered += distanceMoved;

    // Update distance to next base
    const nextBasePos = this.getBasePosition((state.currentBase + 1) as 1 | 2 | 3 | 4);
    state.distanceToNextBase = Math.sqrt(
      Math.pow(nextBasePos.x - state.position.x, 2) +
      Math.pow(nextBasePos.y - state.position.y, 2)
    );

    // Check if reached base
    if (state.distanceToNextBase < 2) {
      // Reached base
      state.currentBase = (state.currentBase + 1) as 0 | 1 | 2 | 3 | 4;
      state.position = { ...nextBasePos };
      state.velocity = { x: 0, y: 0 };
      state.isRunning = false;
      state.isStealing = false;
      state.commitment = 'none';

      // Update analytics
      this.updateAnalyticsOnBaseReached(runnerId, state);
    }

    // Update stamina (running drains stamina)
    runner.stamina = Math.max(0, runner.stamina - deltaTime * 0.5);
  }

  /**
   * Get analytics for runner
   */
  public getAnalytics(runnerId: string): BaseRunningAnalytics | null {
    return this.analytics.get(runnerId) || null;
  }

  /**
   * Send coach signal to runner
   */
  public sendCoachSignal(signal: CoachSignal): void {
    this.coachSignals.push(signal);

    // Apply signal to runner(s)
    if (signal.targetRunner === 'all') {
      this.runnerStates.forEach((state) => {
        this.applyCoachSignal(state, signal);
      });
    } else {
      const state = this.runnerStates.get(signal.targetRunner);
      if (state) {
        this.applyCoachSignal(state, signal);
      }
    }
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private createInitialAnalytics(runnerId: string): BaseRunningAnalytics {
    return {
      runnerId,
      stealAttempts: 0,
      successfulSteals: 0,
      caughtStealing: 0,
      pickoffs: 0,
      stealSuccessRate: 0,
      stealsOfSecond: { attempts: 0, successes: 0 },
      stealsOfThird: { attempts: 0, successes: 0 },
      stealsOfHome: { attempts: 0, successes: 0 },
      extraBasesTaken: 0,
      extraBasesOpportunities: 0,
      extraBaseRate: 0,
      outsOnBases: 0,
      baseRunningErrors: 0,
      goodDecisions: 0,
      badDecisions: 0,
      decisionQualityRate: 100,
      avgTimeToSecond: 0,
      avgTimeToThird: 0,
      avgTimeToHome: 0,
      topSpeed: 0,
      recentSteals: [],
      recentDecisions: []
    };
  }

  private getBasePosition(base: 0 | 1 | 2 | 3 | 4): { x: number; y: number } {
    switch (base) {
      case 0:
      case 4:
        return this.BASE_POSITIONS.home;
      case 1:
        return this.BASE_POSITIONS.first;
      case 2:
        return this.BASE_POSITIONS.second;
      case 3:
        return this.BASE_POSITIONS.third;
    }
  }

  private calculateStealSuccessProbability(
    runner: RunnerAttributes,
    situation: BaseRunningSituation,
    fromBase: 1 | 2 | 3
  ): number {
    let probability = 50; // Base 50%

    // Runner ability
    probability += (runner.stealingAbility - 50) * 0.6;
    probability += (runner.speed - 50) * 0.4;

    // Pitcher time
    const pitcherTimeDiff = situation.pitcherToPlateTime - this.PITCHER_TO_PLATE_AVG;
    probability += pitcherTimeDiff * 20; // +/- 20% per 0.1s

    // Catcher pop time
    const catcherTimeDiff = situation.catcherPopTime - this.CATCHER_POP_TIME_AVG;
    probability += catcherTimeDiff * 15; // +/- 15% per 0.1s

    // Base-specific
    if (fromBase === 2) {
      probability += 10; // Easier to steal 3rd
    } else if (fromBase === 3) {
      probability -= 25; // Much harder to steal home
    }

    return Math.max(0, Math.min(100, probability));
  }

  private calculateJumpQuality(runner: RunnerAttributes): StealAttempt['jumpQuality'] {
    const jumpScore = (runner.stealingAbility + runner.baseballIQ + runner.readAbility) / 3;

    if (jumpScore >= 80) return 'excellent';
    if (jumpScore >= 65) return 'good';
    if (jumpScore >= 50) return 'average';
    return 'poor';
  }

  private calculateReactionTime(
    runner: RunnerAttributes,
    jumpQuality: StealAttempt['jumpQuality']
  ): number {
    let baseTime = 300; // ms

    switch (jumpQuality) {
      case 'excellent':
        baseTime = 200;
        break;
      case 'good':
        baseTime = 250;
        break;
      case 'average':
        baseTime = 300;
        break;
      case 'poor':
        baseTime = 400;
        break;
    }

    // IQ variance
    const iqVariance = (70 - runner.baseballIQ) * 0.5;
    baseTime += iqVariance;

    return baseTime;
  }

  private calculateRunnerTimeToBase(
    runner: RunnerAttributes,
    state: RunnerState,
    fromBase: 1 | 2 | 3,
    toBase: 2 | 3 | 4
  ): number {
    const distance = this.BASE_DISTANCE;
    const maxSpeed = (runner.speed / 100) * 30; // ft/s
    const acceleration = (runner.acceleration / 100) * 10; // ft/s^2

    // Time to accelerate to max speed
    const timeToMaxSpeed = maxSpeed / acceleration;
    const distanceWhileAccelerating = 0.5 * acceleration * timeToMaxSpeed * timeToMaxSpeed;

    let totalTime: number;

    if (distanceWhileAccelerating >= distance) {
      // Never reach max speed
      totalTime = Math.sqrt((2 * distance) / acceleration);
    } else {
      // Reach max speed, then maintain
      const remainingDistance = distance - distanceWhileAccelerating;
      const timeAtMaxSpeed = remainingDistance / maxSpeed;
      totalTime = timeToMaxSpeed + timeAtMaxSpeed;
    }

    // Stamina factor
    totalTime *= (2 - runner.stamina / 100);

    // Lead-off advantage
    if (state.leadOffDistance > 0) {
      const leadOffTimeSavings = state.leadOffDistance / maxSpeed;
      totalTime -= leadOffTimeSavings;
    }

    return totalTime;
  }

  private findNearestFielder(
    location: { x: number; y: number },
    fielders: Array<{ x: number; y: number; throwing: boolean }>
  ): { distance: number; throwing: boolean } {
    let minDistance = Infinity;
    let isThrowing = false;

    fielders.forEach(fielder => {
      const distance = Math.sqrt(
        Math.pow(fielder.x - location.x, 2) +
        Math.pow(fielder.y - location.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        isThrowing = fielder.throwing;
      }
    });

    return { distance: minDistance, throwing: isThrowing };
  }

  private applyCoachSignal(state: RunnerState, signal: CoachSignal): void {
    switch (signal.signal) {
      case 'go':
        state.isRunning = true;
        state.commitment = 'full';
        break;
      case 'stop':
      case 'hold':
        state.commitment = 'none';
        if (signal.urgency === 'critical') {
          state.isRunning = false;
        }
        break;
      case 'slide':
        if (signal.urgency === 'urgent') {
          state.isSlidingFeetFirst = true;
        }
        break;
      case 'stand_up':
        state.isSlidingFeetFirst = false;
        state.isSlidingHeadFirst = false;
        break;
      case 'round_base':
        if (state.commitment !== 'full') {
          state.commitment = 'medium';
        }
        break;
      case 'tag_up':
        state.isLeading = false;
        state.leadOffDistance = 0;
        break;
    }
  }

  private updateAnalyticsOnBaseReached(runnerId: string, state: RunnerState): void {
    const analytics = this.analytics.get(runnerId);
    if (!analytics) return;

    // Update extra base stats if applicable
    if (state.currentBase > state.currentBase) {
      analytics.extraBasesTaken++;
    }

    // Calculate decision quality from recent decisions
    if (analytics.recentDecisions.length > 0) {
      const goodDecisions = analytics.recentDecisions.filter(d => d.confidence > 70).length;
      const total = analytics.recentDecisions.length;
      analytics.decisionQualityRate = (goodDecisions / total) * 100;
    }
  }
}
