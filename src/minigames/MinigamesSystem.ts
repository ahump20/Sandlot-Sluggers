/**
 * MinigamesSystem.ts
 * Multiple mini-game modes including Home Run Derby, Skills Challenge, and more
 */

import { PhysicsEngine, Ball, Vector2 } from '../PhysicsEngine';
import { Renderer, Player } from '../Renderer';

export type MinigameType =
  | 'home_run_derby'
  | 'skills_challenge'
  | 'target_practice'
  | 'speed_run'
  | 'accuracy_challenge'
  | 'perfect_game_challenge'
  | 'clutch_hitting'
  | 'fielding_challenge';

export interface MinigameConfig {
  type: MinigameType;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number; // seconds
  targetScore: number;
  rewards: MinigameReward[];
}

export interface MinigameReward {
  type: 'xp' | 'currency' | 'unlock' | 'title';
  id: string;
  amount?: number;
  name: string;
}

export interface MinigameResult {
  score: number;
  accuracy: number;
  timeElapsed: number;
  isHighScore: boolean;
  stars: 1 | 2 | 3; // Rating
  rewards: MinigameReward[];
  statistics: MinigameStatistics;
}

export interface MinigameStatistics {
  homeRuns?: number;
  hits?: number;
  misses?: number;
  perfectHits?: number;
  averageExitVelocity?: number;
  longestHomeRun?: number;
  strikeouts?: number;
  perfectPitches?: number;
  targetHits?: number;
  comboMultiplier?: number;
}

export interface HomeRunDerbySettings {
  pitchCount: number;
  bonusTime: number; // Extra time for consecutive home runs
  multiplierEnabled: boolean;
  windEnabled: boolean;
  targetZones: boolean; // Bonus points for hitting specific zones
}

export interface SkillsChallengeSettings {
  challenges: SkillChallenge[];
  passingScore: number;
  timePerChallenge: number;
}

export interface SkillChallenge {
  id: string;
  name: string;
  type: 'hitting' | 'pitching' | 'fielding' | 'baserunning';
  objective: string;
  target: number;
  currentProgress: number;
  completed: boolean;
}

export interface TargetPracticeSettings {
  targets: Target[];
  accuracyThreshold: number;
  timeLimit: number;
  pointsPerTarget: number;
  bonusPointsForStreak: number;
}

export interface Target {
  id: string;
  position: Vector2;
  radius: number;
  points: number;
  isHit: boolean;
  hitTime?: number;
}

export class MinigamesSystem {
  private currentMinigame: MinigameType | null = null;
  private physics: PhysicsEngine;
  private renderer: Renderer;
  private gameState: MinigameGameState;
  private highScores: Map<MinigameType, number> = new Map();

  // Derby specific
  private derbySettings: HomeRunDerbySettings = {
    pitchCount: 10,
    bonusTime: 30,
    multiplierEnabled: true,
    windEnabled: true,
    targetZones: true
  };

  private derbyState: {
    homeRuns: number;
    consecutiveHomeRuns: number;
    multiplier: number;
    timeRemaining: number;
    pitchesRemaining: number;
    totalDistance: number;
  } = {
    homeRuns: 0,
    consecutiveHomeRuns: 0,
    multiplier: 1,
    timeRemaining: 60,
    pitchesRemaining: 10,
    totalDistance: 0
  };

  // Skills challenge specific
  private skillsChallengeState: {
    currentChallenge: number;
    completedChallenges: number;
    totalScore: number;
    challenges: SkillChallenge[];
  } = {
    currentChallenge: 0,
    completedChallenges: 0,
    totalScore: 0,
    challenges: []
  };

  // Target practice specific
  private targetPracticeState: {
    targets: Target[];
    targetsHit: number;
    accuracy: number;
    streak: number;
    bestStreak: number;
    score: number;
  } = {
    targets: [],
    targetsHit: 0,
    accuracy: 0,
    streak: 0,
    bestStreak: 0,
    score: 0
  };

  constructor(physics: PhysicsEngine, renderer: Renderer) {
    this.physics = physics;
    this.renderer = renderer;
    this.gameState = this.initializeGameState();
    this.loadHighScores();
  }

  /**
   * Initialize minigame game state
   */
  private initializeGameState(): MinigameGameState {
    return {
      isActive: false,
      isPaused: false,
      startTime: 0,
      elapsedTime: 0,
      score: 0,
      lives: 3,
      currentLevel: 1,
      statistics: {}
    };
  }

  /**
   * Start a minigame
   */
  public startMinigame(type: MinigameType, difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    this.currentMinigame = type;
    this.gameState = this.initializeGameState();
    this.gameState.isActive = true;
    this.gameState.startTime = Date.now();

    switch (type) {
      case 'home_run_derby':
        this.startHomeRunDerby(difficulty);
        break;
      case 'skills_challenge':
        this.startSkillsChallenge(difficulty);
        break;
      case 'target_practice':
        this.startTargetPractice(difficulty);
        break;
      case 'speed_run':
        this.startSpeedRun(difficulty);
        break;
      case 'accuracy_challenge':
        this.startAccuracyChallenge(difficulty);
        break;
      case 'perfect_game_challenge':
        this.startPerfectGameChallenge(difficulty);
        break;
      case 'clutch_hitting':
        this.startClutchHitting(difficulty);
        break;
      case 'fielding_challenge':
        this.startFieldingChallenge(difficulty);
        break;
    }

    console.log(`🎮 Started ${type} minigame on ${difficulty} difficulty`);
  }

  /**
   * HOME RUN DERBY
   */
  private startHomeRunDerby(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    // Set difficulty parameters
    const difficultySettings = {
      easy: { pitches: 15, time: 90, targetZoneBonus: 1.5 },
      medium: { pitches: 12, time: 75, targetZoneBonus: 2.0 },
      hard: { pitches: 10, time: 60, targetZoneBonus: 2.5 },
      expert: { pitches: 8, time: 45, targetZoneBonus: 3.0 }
    };

    const settings = difficultySettings[difficulty];
    this.derbySettings.pitchCount = settings.pitches;

    this.derbyState = {
      homeRuns: 0,
      consecutiveHomeRuns: 0,
      multiplier: 1,
      timeRemaining: settings.time,
      pitchesRemaining: settings.pitches,
      totalDistance: 0
    };

    this.gameState.statistics.homeRuns = 0;
    this.gameState.statistics.longestHomeRun = 0;
    this.gameState.statistics.averageExitVelocity = 0;
  }

  /**
   * Update home run derby
   */
  public updateHomeRunDerby(deltaTime: number, ball: Ball | null): void {
    if (!this.gameState.isActive || this.gameState.isPaused) return;

    // Update time
    this.derbyState.timeRemaining -= deltaTime;

    if (this.derbyState.timeRemaining <= 0 || this.derbyState.pitchesRemaining <= 0) {
      this.endMinigame();
      return;
    }

    // Check for home run
    if (ball && !ball.active) {
      const landingDistance = this.calculateLandingDistance(ball.position);

      if (this.isHomeRun(landingDistance)) {
        this.registerHomeRun(landingDistance);
      } else {
        // Reset multiplier on non-home run
        this.derbyState.consecutiveHomeRuns = 0;
        this.derbyState.multiplier = 1;
      }

      this.derbyState.pitchesRemaining--;
    }
  }

  /**
   * Register a home run in derby
   */
  private registerHomeRun(distance: number): void {
    this.derbyState.homeRuns++;
    this.derbyState.consecutiveHomeRuns++;
    this.derbyState.totalDistance += distance;

    // Update multiplier
    if (this.derbySettings.multiplierEnabled) {
      this.derbyState.multiplier = Math.min(
        5,
        1 + Math.floor(this.derbyState.consecutiveHomeRuns / 3)
      );
    }

    // Bonus time for consecutive home runs
    if (this.derbyState.consecutiveHomeRuns >= 3) {
      this.derbyState.timeRemaining += this.derbySettings.bonusTime;
      console.log(`⏰ +${this.derbySettings.bonusTime}s bonus time!`);
    }

    // Calculate points
    const basePoints = 100;
    const distanceBonus = Math.floor(distance / 10);
    const multiplierBonus = basePoints * (this.derbyState.multiplier - 1);
    const points = (basePoints + distanceBonus) * this.derbyState.multiplier;

    this.gameState.score += points;

    // Update statistics
    if (!this.gameState.statistics.longestHomeRun || distance > this.gameState.statistics.longestHomeRun) {
      this.gameState.statistics.longestHomeRun = distance;
    }

    console.log(`💥 HOME RUN! ${distance.toFixed(0)}ft (+${points} points, ${this.derbyState.multiplier}x multiplier)`);
  }

  /**
   * Check if hit is a home run
   */
  private isHomeRun(distance: number): boolean {
    return distance >= 300; // Simplified: 300+ ft is a home run
  }

  /**
   * Calculate landing distance
   */
  private calculateLandingDistance(position: Vector2): number {
    // Simplified distance calculation
    const homeplate = this.renderer.getHomePlatePosition();
    const dx = position.x - homeplate.x;
    const dy = position.y - homeplate.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * SKILLS CHALLENGE
   */
  private startSkillsChallenge(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    const challenges = this.generateSkillsChallenges(difficulty);

    this.skillsChallengeState = {
      currentChallenge: 0,
      completedChallenges: 0,
      totalScore: 0,
      challenges
    };

    this.gameState.statistics.perfectHits = 0;
    this.gameState.statistics.hits = 0;
    this.gameState.statistics.misses = 0;
  }

  /**
   * Generate skills challenges based on difficulty
   */
  private generateSkillsChallenges(difficulty: string): SkillChallenge[] {
    const baseChallenges: SkillChallenge[] = [
      {
        id: 'hit_5_singles',
        name: 'Contact Master',
        type: 'hitting',
        objective: 'Hit 5 singles',
        target: 5,
        currentProgress: 0,
        completed: false
      },
      {
        id: 'strike_out_3',
        name: 'Strikeout Artist',
        type: 'pitching',
        objective: 'Strike out 3 batters',
        target: 3,
        currentProgress: 0,
        completed: false
      },
      {
        id: 'catch_5_fly_balls',
        name: 'Fly Ball Specialist',
        type: 'fielding',
        objective: 'Catch 5 fly balls',
        target: 5,
        currentProgress: 0,
        completed: false
      },
      {
        id: 'steal_3_bases',
        name: 'Speed Demon',
        type: 'baserunning',
        objective: 'Steal 3 bases',
        target: 3,
        currentProgress: 0,
        completed: false
      },
      {
        id: 'hit_targets',
        name: 'Accuracy Test',
        type: 'pitching',
        objective: 'Hit 7 out of 10 targets',
        target: 7,
        currentProgress: 0,
        completed: false
      },
      {
        id: 'perfect_timing',
        name: 'Perfect Timing',
        type: 'hitting',
        objective: 'Get 5 perfect swings',
        target: 5,
        currentProgress: 0,
        completed: false
      }
    ];

    // Adjust difficulty
    const multiplier = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.3 : difficulty === 'expert' ? 1.6 : 1.0;

    return baseChallenges.map(challenge => ({
      ...challenge,
      target: Math.ceil(challenge.target * multiplier)
    }));
  }

  /**
   * Update skills challenge
   */
  public updateSkillsChallenge(eventType: string, data: any): void {
    if (!this.gameState.isActive || this.gameState.isPaused) return;

    const currentChallenge = this.skillsChallengeState.challenges[this.skillsChallengeState.currentChallenge];

    if (!currentChallenge || currentChallenge.completed) return;

    // Check if event matches challenge type
    let progressMade = false;

    switch (currentChallenge.id) {
      case 'hit_5_singles':
        if (eventType === 'single') {
          currentChallenge.currentProgress++;
          progressMade = true;
        }
        break;
      case 'strike_out_3':
        if (eventType === 'strikeout_pitched') {
          currentChallenge.currentProgress++;
          progressMade = true;
        }
        break;
      case 'catch_5_fly_balls':
        if (eventType === 'fly_ball_caught') {
          currentChallenge.currentProgress++;
          progressMade = true;
        }
        break;
      case 'steal_3_bases':
        if (eventType === 'stolen_base') {
          currentChallenge.currentProgress++;
          progressMade = true;
        }
        break;
      case 'hit_targets':
        if (eventType === 'target_hit') {
          currentChallenge.currentProgress++;
          progressMade = true;
        }
        break;
      case 'perfect_timing':
        if (eventType === 'perfect_swing') {
          currentChallenge.currentProgress++;
          progressMade = true;
        }
        break;
    }

    if (progressMade) {
      console.log(`📈 ${currentChallenge.name}: ${currentChallenge.currentProgress}/${currentChallenge.target}`);

      // Check if challenge completed
      if (currentChallenge.currentProgress >= currentChallenge.target) {
        currentChallenge.completed = true;
        this.skillsChallengeState.completedChallenges++;
        this.gameState.score += 1000;

        console.log(`✅ Challenge Completed: ${currentChallenge.name}`);

        // Move to next challenge
        this.skillsChallengeState.currentChallenge++;

        // Check if all challenges completed
        if (this.skillsChallengeState.currentChallenge >= this.skillsChallengeState.challenges.length) {
          this.endMinigame();
        }
      }
    }
  }

  /**
   * TARGET PRACTICE
   */
  private startTargetPractice(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    const targetCounts = {
      easy: 8,
      medium: 12,
      hard: 16,
      expert: 20
    };

    const targetCount = targetCounts[difficulty];
    const targets: Target[] = [];

    // Generate targets in outfield
    for (let i = 0; i < targetCount; i++) {
      const angle = (i / targetCount) * Math.PI;
      const distance = 200 + Math.random() * 200;
      const x = 400 + Math.cos(angle) * distance;
      const y = 300 + Math.sin(angle) * distance;

      targets.push({
        id: `target_${i}`,
        position: { x, y },
        radius: difficulty === 'expert' ? 20 : difficulty === 'hard' ? 30 : difficulty === 'medium' ? 40 : 50,
        points: 100 * (difficulty === 'expert' ? 2 : difficulty === 'hard' ? 1.5 : 1),
        isHit: false
      });
    }

    this.targetPracticeState = {
      targets,
      targetsHit: 0,
      accuracy: 0,
      streak: 0,
      bestStreak: 0,
      score: 0
    };

    this.gameState.statistics.targetHits = 0;
    this.gameState.statistics.misses = 0;
  }

  /**
   * Update target practice
   */
  public updateTargetPractice(ball: Ball | null): void {
    if (!this.gameState.isActive || this.gameState.isPaused) return;
    if (!ball || ball.active) return;

    // Check if ball hit any target
    let hitTarget: Target | null = null;

    for (const target of this.targetPracticeState.targets) {
      if (!target.isHit) {
        const distance = this.physics.distance(ball.position, target.position);

        if (distance <= target.radius) {
          hitTarget = target;
          break;
        }
      }
    }

    if (hitTarget) {
      // Target hit!
      hitTarget.isHit = true;
      hitTarget.hitTime = Date.now();
      this.targetPracticeState.targetsHit++;
      this.targetPracticeState.streak++;

      // Update best streak
      if (this.targetPracticeState.streak > this.targetPracticeState.bestStreak) {
        this.targetPracticeState.bestStreak = this.targetPracticeState.streak;
      }

      // Calculate points with streak bonus
      const streakMultiplier = 1 + (this.targetPracticeState.streak - 1) * 0.5;
      const points = Math.floor(hitTarget.points * streakMultiplier);
      this.targetPracticeState.score += points;
      this.gameState.score += points;

      this.gameState.statistics.targetHits!++;

      console.log(`🎯 Target Hit! +${points} points (${this.targetPracticeState.streak}x streak)`);

      // Check if all targets hit
      if (this.targetPracticeState.targetsHit >= this.targetPracticeState.targets.length) {
        this.endMinigame();
      }
    } else {
      // Miss
      this.targetPracticeState.streak = 0;
      this.gameState.statistics.misses!++;
      console.log('❌ Miss! Streak reset.');
    }

    // Update accuracy
    const totalAttempts = this.targetPracticeState.targetsHit + (this.gameState.statistics.misses || 0);
    this.targetPracticeState.accuracy = (this.targetPracticeState.targetsHit / totalAttempts) * 100;
  }

  /**
   * SPEED RUN
   */
  private startSpeedRun(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    const timeLimits = {
      easy: 180,
      medium: 120,
      hard: 90,
      expert: 60
    };

    this.gameState.statistics.homeRuns = 0;
    this.gameState.statistics.hits = 0;
    // Timer starts automatically
  }

  /**
   * ACCURACY CHALLENGE
   */
  private startAccuracyChallenge(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    const requiredAccuracy = {
      easy: 60,
      medium: 70,
      hard: 80,
      expert: 90
    };

    this.gameState.statistics.hits = 0;
    this.gameState.statistics.misses = 0;
    this.gameState.statistics.perfectHits = 0;
  }

  /**
   * PERFECT GAME CHALLENGE
   */
  private startPerfectGameChallenge(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    const inningCounts = {
      easy: 3,
      medium: 5,
      hard: 7,
      expert: 9
    };

    this.gameState.statistics.perfectPitches = 0;
    this.gameState.statistics.strikeouts = 0;
  }

  /**
   * CLUTCH HITTING
   */
  private startClutchHitting(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    // Simulate high-pressure situations
    this.gameState.lives = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 4 : difficulty === 'hard' ? 3 : 2;
    this.gameState.statistics.hits = 0;
    this.gameState.statistics.misses = 0;
  }

  /**
   * FIELDING CHALLENGE
   */
  private startFieldingChallenge(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    const catchCounts = {
      easy: 10,
      medium: 15,
      hard: 20,
      expert: 25
    };

    this.gameState.statistics.catches = 0;
    this.gameState.statistics.misses = 0;
  }

  /**
   * End the current minigame
   */
  private endMinigame(): void {
    if (!this.currentMinigame) return;

    this.gameState.isActive = false;
    this.gameState.elapsedTime = (Date.now() - this.gameState.startTime) / 1000;

    // Calculate result
    const result = this.calculateResult();

    // Check for high score
    const currentHighScore = this.highScores.get(this.currentMinigame) || 0;
    if (result.score > currentHighScore) {
      this.highScores.set(this.currentMinigame, result.score);
      result.isHighScore = true;
      this.saveHighScores();
    }

    console.log(`🏁 Minigame Complete!`);
    console.log(`Score: ${result.score}`);
    console.log(`Stars: ${'⭐'.repeat(result.stars)}`);
    console.log(`Time: ${result.timeElapsed.toFixed(1)}s`);

    // Award rewards
    result.rewards.forEach(reward => {
      console.log(`🎁 Reward: ${reward.name}`);
    });

    this.currentMinigame = null;
  }

  /**
   * Calculate minigame result
   */
  private calculateResult(): MinigameResult {
    const score = this.gameState.score;
    const timeElapsed = this.gameState.elapsedTime;

    // Calculate stars (1-3) based on performance
    let stars: 1 | 2 | 3 = 1;
    if (score >= 5000) stars = 3;
    else if (score >= 3000) stars = 2;

    // Calculate accuracy
    let accuracy = 100;
    if (this.gameState.statistics.hits && this.gameState.statistics.misses !== undefined) {
      const total = this.gameState.statistics.hits + this.gameState.statistics.misses;
      accuracy = (this.gameState.statistics.hits / total) * 100;
    }

    // Determine rewards based on stars
    const rewards: MinigameReward[] = [];
    rewards.push({ type: 'xp', id: 'xp', amount: score * stars, name: 'Experience Points' });

    if (stars >= 2) {
      rewards.push({ type: 'currency', id: 'coins', amount: 500 * stars, name: 'Coins' });
    }

    if (stars === 3) {
      rewards.push({ type: 'unlock', id: 'special_item', name: 'Special Item Unlocked' });
    }

    return {
      score,
      accuracy,
      timeElapsed,
      isHighScore: false,
      stars,
      rewards,
      statistics: { ...this.gameState.statistics }
    };
  }

  /**
   * Pause/Resume minigame
   */
  public pauseMinigame(): void {
    this.gameState.isPaused = true;
  }

  public resumeMinigame(): void {
    this.gameState.isPaused = false;
  }

  /**
   * Load high scores from storage
   */
  private loadHighScores(): void {
    const stored = localStorage.getItem('minigame_highscores');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.highScores = new Map(Object.entries(data));
      } catch (e) {
        console.error('Failed to load high scores:', e);
      }
    }
  }

  /**
   * Save high scores to storage
   */
  private saveHighScores(): void {
    const data = Object.fromEntries(this.highScores);
    localStorage.setItem('minigame_highscores', JSON.stringify(data));
  }

  /**
   * Get leaderboard for a minigame
   */
  public getLeaderboard(type: MinigameType): LeaderboardEntry[] {
    // Simplified - would fetch from server
    return [
      { rank: 1, playerName: 'ProPlayer1', score: 10000, time: 45.2 },
      { rank: 2, playerName: 'Slugger99', score: 8500, time: 52.1 },
      { rank: 3, playerName: 'Champion', score: 7200, time: 58.9 }
    ];
  }

  /**
   * Public getters
   */
  public getCurrentMinigame(): MinigameType | null {
    return this.currentMinigame;
  }

  public getGameState(): MinigameGameState {
    return { ...this.gameState };
  }

  public getDerbyState() {
    return { ...this.derbyState };
  }

  public getSkillsChallengeState() {
    return { ...this.skillsChallengeState };
  }

  public getTargetPracticeState() {
    return { ...this.targetPracticeState };
  }

  public getHighScore(type: MinigameType): number {
    return this.highScores.get(type) || 0;
  }

  public isActive(): boolean {
    return this.gameState.isActive;
  }

  public isPaused(): boolean {
    return this.gameState.isPaused;
  }
}

/**
 * Supporting interfaces
 */
interface MinigameGameState {
  isActive: boolean;
  isPaused: boolean;
  startTime: number;
  elapsedTime: number;
  score: number;
  lives: number;
  currentLevel: number;
  statistics: MinigameStatistics;
}

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  time: number;
}
