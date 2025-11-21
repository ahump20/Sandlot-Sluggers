/**
 * TutorialTrainingSystem.ts
 * Comprehensive tutorial and training mode with lessons, drills, and skill development
 */

import { Vector2, Ball } from '../PhysicsEngine';
import { Player } from '../Renderer';

export type TutorialType =
  | 'basic_controls'
  | 'batting_basics'
  | 'pitching_basics'
  | 'fielding_basics'
  | 'baserunning_basics'
  | 'advanced_batting'
  | 'advanced_pitching'
  | 'advanced_fielding'
  | 'game_strategy'
  | 'complete_game';

export type DrillType =
  | 'batting_practice'
  | 'pitch_location'
  | 'timing_practice'
  | 'power_hitting'
  | 'contact_hitting'
  | 'pitch_selection'
  | 'pitch_control'
  | 'fly_ball_catching'
  | 'ground_ball_fielding'
  | 'throwing_accuracy'
  | 'base_stealing'
  | 'sliding_practice'
  | 'cutoff_throws'
  | 'double_play_practice';

export interface TutorialLesson {
  id: string;
  type: TutorialType;
  name: string;
  description: string;
  objectives: TutorialObjective[];
  steps: TutorialStep[];
  rewards: TutorialReward[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // minutes
  prerequisites: string[]; // Lesson IDs required
  isCompleted: boolean;
  bestScore: number;
  attempts: number;
}

export interface TutorialObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  isMandatory: boolean;
  points: number;
}

export interface TutorialStep {
  id: string;
  instruction: string;
  helpText: string;
  visualAid?: string; // Image or animation ID
  action: TutorialAction;
  validationCriteria: ValidationCriteria;
  hints: string[];
  isCompleted: boolean;
}

export interface TutorialAction {
  type: 'wait' | 'press_button' | 'swing' | 'pitch' | 'field' | 'run';
  button?: string;
  parameters?: any;
}

export interface ValidationCriteria {
  type: 'button_press' | 'stat_check' | 'position_check' | 'timing_check' | 'accuracy_check';
  condition: (data: any) => boolean;
  successMessage: string;
  failureMessage: string;
}

export interface TutorialReward {
  type: 'xp' | 'currency' | 'unlock' | 'badge';
  amount?: number;
  id: string;
  name: string;
}

export interface Drill {
  id: string;
  type: DrillType;
  name: string;
  description: string;
  category: 'batting' | 'pitching' | 'fielding' | 'baserunning';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number; // seconds
  targets: DrillTarget[];
  scoring: DrillScoring;
  statistics: DrillStatistics;
  isUnlocked: boolean;
  highScore: number;
  completionCount: number;
}

export interface DrillTarget {
  id: string;
  description: string;
  target: number;
  bonus: number; // Bonus points for exceeding
  weight: number; // Importance 0-1
}

export interface DrillScoring {
  maxScore: number;
  passingScore: number;
  perfectScore: number;
  gradeThresholds: {
    F: number;
    D: number;
    C: number;
    B: number;
    A: number;
    S: number;
  };
}

export interface DrillStatistics {
  attempts: number;
  successes: number;
  failures: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  improvementRate: number;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  dailyDrills: Map<number, Drill[]>;
  objectives: ProgramObjective[];
  rewards: TutorialReward[];
  currentDay: number;
  isActive: boolean;
  startDate: Date;
  completionDate?: Date;
  progress: number; // 0-100
}

export interface ProgramObjective {
  id: string;
  description: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
}

export interface TrainingSession {
  id: string;
  drillId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  grade: 'F' | 'D' | 'C' | 'B' | 'A' | 'S';
  targetsMet: number;
  accuracy: number;
  performanceData: PerformanceData;
}

export interface PerformanceData {
  perfectActions: number;
  goodActions: number;
  okayActions: number;
  poorActions: number;
  avgReactionTime: number;
  consistency: number;
  improvements: string[];
  areasToImprove: string[];
}

export interface SkillDevelopment {
  skill: string;
  baseLevel: number;
  currentLevel: number;
  trainingBonus: number;
  practiceTime: number; // hours
  drillsCompleted: number;
  improvementRate: number;
  plateau: boolean;
}

export class TutorialTrainingSystem {
  private tutorials: Map<string, TutorialLesson> = new Map();
  private drills: Map<string, Drill> = new Map();
  private trainingPrograms: Map<string, TrainingProgram> = new Map();
  private trainingSessions: TrainingSession[] = [];
  private skillDevelopment: Map<string, SkillDevelopment> = new Map();

  private currentTutorial: TutorialLesson | null = null;
  private currentDrill: Drill | null = null;
  private currentStep: number = 0;
  private sessionStartTime: Date | null = null;

  constructor() {
    this.initializeTutorials();
    this.initializeDrills();
    this.initializeTrainingPrograms();
    this.loadProgress();

    console.log('📚 Tutorial & Training System initialized');
  }

  /**
   * Initialize all tutorials
   */
  private initializeTutorials(): void {
    // Basic Controls Tutorial
    this.tutorials.set('basic_controls', {
      id: 'basic_controls',
      type: 'basic_controls',
      name: 'Basic Controls',
      description: 'Learn the fundamental controls of the game',
      objectives: [
        {
          id: 'learn_movement',
          description: 'Learn to control the player',
          target: 1,
          current: 0,
          isCompleted: false,
          isMandatory: true,
          points: 100
        },
        {
          id: 'learn_swing',
          description: 'Learn to swing the bat',
          target: 1,
          current: 0,
          isCompleted: false,
          isMandatory: true,
          points: 100
        }
      ],
      steps: [
        {
          id: 'step_1',
          instruction: 'Welcome to Sandlot Sluggers!',
          helpText: 'This tutorial will teach you the basic controls',
          action: { type: 'wait' },
          validationCriteria: {
            type: 'button_press',
            condition: () => true,
            successMessage: 'Great! Let\'s continue.',
            failureMessage: ''
          },
          hints: ['Press any key to continue'],
          isCompleted: false
        },
        {
          id: 'step_2',
          instruction: 'Click the "Pitch" button to throw a pitch',
          helpText: 'The pitcher will throw the ball toward home plate',
          action: { type: 'press_button', button: 'pitch' },
          validationCriteria: {
            type: 'button_press',
            condition: (data) => data.button === 'pitch',
            successMessage: 'Perfect! The ball is coming!',
            failureMessage: 'Click the Pitch button'
          },
          hints: ['Look for the blue "Pitch" button at the bottom of the screen'],
          isCompleted: false
        },
        {
          id: 'step_3',
          instruction: 'Click the "Swing" button or click anywhere to swing',
          helpText: 'Timing is key! Swing when the ball reaches the batter',
          action: { type: 'swing' },
          validationCriteria: {
            type: 'timing_check',
            condition: (data) => data.contact === true,
            successMessage: 'Excellent swing! You made contact!',
            failureMessage: 'Try again - watch the ball closely'
          },
          hints: [
            'Watch the ball carefully',
            'Click when the ball is near the batter',
            'Don\'t swing too early or too late'
          ],
          isCompleted: false
        }
      ],
      rewards: [
        { type: 'xp', amount: 500, id: 'xp', name: 'Experience' },
        { type: 'badge', id: 'first_tutorial', name: 'Tutorial Complete' }
      ],
      difficulty: 'beginner',
      estimatedTime: 5,
      prerequisites: [],
      isCompleted: false,
      bestScore: 0,
      attempts: 0
    });

    // Batting Basics Tutorial
    this.tutorials.set('batting_basics', {
      id: 'batting_basics',
      type: 'batting_basics',
      name: 'Batting Fundamentals',
      description: 'Master the art of hitting',
      objectives: [
        {
          id: 'hit_5_balls',
          description: 'Make contact with 5 pitches',
          target: 5,
          current: 0,
          isCompleted: false,
          isMandatory: true,
          points: 200
        },
        {
          id: 'hit_fair',
          description: 'Hit 3 fair balls',
          target: 3,
          current: 0,
          isCompleted: false,
          isMandatory: true,
          points: 300
        },
        {
          id: 'hit_homerun',
          description: 'Hit a home run',
          target: 1,
          current: 0,
          isCompleted: false,
          isMandatory: false,
          points: 500
        }
      ],
      steps: [
        {
          id: 'stance',
          instruction: 'Get into batting stance',
          helpText: 'Position yourself in the batter\'s box',
          action: { type: 'wait' },
          validationCriteria: {
            type: 'position_check',
            condition: () => true,
            successMessage: 'Good stance!',
            failureMessage: ''
          },
          hints: ['Keep your eyes on the pitcher'],
          isCompleted: false
        },
        {
          id: 'watch_pitch',
          instruction: 'Watch the pitch carefully',
          helpText: 'Track the ball from the pitcher\'s hand',
          action: { type: 'wait' },
          validationCriteria: {
            type: 'stat_check',
            condition: () => true,
            successMessage: 'Good eye!',
            failureMessage: ''
          },
          hints: ['Focus on the ball', 'Don\'t swing at bad pitches'],
          isCompleted: false
        },
        {
          id: 'timing',
          instruction: 'Swing with good timing',
          helpText: 'Click when the ball is in the strike zone',
          action: { type: 'swing' },
          validationCriteria: {
            type: 'timing_check',
            condition: (data) => data.timing === 'perfect' || data.timing === 'good',
            successMessage: 'Perfect timing!',
            failureMessage: 'Work on your timing'
          },
          hints: [
            'Wait for the ball to reach the plate',
            'Don\'t swing too early',
            'Practice makes perfect'
          ],
          isCompleted: false
        }
      ],
      rewards: [
        { type: 'xp', amount: 1000, id: 'xp', name: 'Experience' },
        { type: 'unlock', id: 'batting_practice', name: 'Batting Practice Drill' }
      ],
      difficulty: 'beginner',
      estimatedTime: 10,
      prerequisites: ['basic_controls'],
      isCompleted: false,
      bestScore: 0,
      attempts: 0
    });

    // Pitching Basics
    this.tutorials.set('pitching_basics', {
      id: 'pitching_basics',
      type: 'pitching_basics',
      name: 'Pitching Fundamentals',
      description: 'Learn to throw strikes and control the ball',
      objectives: [
        {
          id: 'throw_strikes',
          description: 'Throw 5 strikes',
          target: 5,
          current: 0,
          isCompleted: false,
          isMandatory: true,
          points: 300
        },
        {
          id: 'strikeout',
          description: 'Strike out a batter',
          target: 1,
          current: 0,
          isCompleted: false,
          isMandatory: true,
          points: 500
        }
      ],
      steps: [
        {
          id: 'windup',
          instruction: 'Start your pitching windup',
          helpText: 'Get into position on the mound',
          action: { type: 'wait' },
          validationCriteria: {
            type: 'position_check',
            condition: () => true,
            successMessage: 'Ready to pitch!',
            failureMessage: ''
          },
          hints: ['Focus on the target'],
          isCompleted: false
        },
        {
          id: 'aim',
          instruction: 'Aim for the strike zone',
          helpText: 'Target the area over home plate',
          action: { type: 'pitch' },
          validationCriteria: {
            type: 'accuracy_check',
            condition: (data) => data.inStrikeZone === true,
            successMessage: 'Strike!',
            failureMessage: 'Ball - try aiming better'
          },
          hints: [
            'Aim for the center of the strike zone',
            'Practice your control',
            'Stay consistent with your release point'
          ],
          isCompleted: false
        }
      ],
      rewards: [
        { type: 'xp', amount: 1000, id: 'xp', name: 'Experience' },
        { type: 'unlock', id: 'pitch_control_drill', name: 'Pitch Control Drill' }
      ],
      difficulty: 'beginner',
      estimatedTime: 10,
      prerequisites: ['basic_controls'],
      isCompleted: false,
      bestScore: 0,
      attempts: 0
    });

    // Advanced Batting
    this.tutorials.set('advanced_batting', {
      id: 'advanced_batting',
      type: 'advanced_batting',
      name: 'Advanced Batting Techniques',
      description: 'Master advanced hitting strategies',
      objectives: [
        {
          id: 'identify_pitches',
          description: 'Identify 5 different pitch types',
          target: 5,
          current: 0,
          isCompleted: false,
          isMandatory: true,
          points: 400
        },
        {
          id: 'situational_hitting',
          description: 'Execute situational hits',
          target: 3,
          current: 0,
          isCompleted: false,
          isMandatory: true,
          points: 600
        },
        {
          id: 'opposite_field',
          description: 'Hit to opposite field',
          target: 2,
          current: 0,
          isCompleted: false,
          isMandatory: false,
          points: 500
        }
      ],
      steps: [
        {
          id: 'pitch_recognition',
          instruction: 'Learn to recognize different pitches',
          helpText: 'Fastballs, curveballs, sliders, and changeups all move differently',
          action: { type: 'wait' },
          validationCriteria: {
            type: 'stat_check',
            condition: () => true,
            successMessage: 'Good pitch recognition!',
            failureMessage: ''
          },
          hints: [
            'Fastballs are straight and fast',
            'Curveballs drop sharply',
            'Sliders break sideways',
            'Changeups look like fastballs but slower'
          ],
          isCompleted: false
        },
        {
          id: 'adjust_approach',
          instruction: 'Adjust your approach based on the count',
          helpText: 'Be more selective with 2 strikes, more aggressive ahead in count',
          action: { type: 'swing' },
          validationCriteria: {
            type: 'stat_check',
            condition: (data) => data.goodApproach === true,
            successMessage: 'Smart hitting!',
            failureMessage: 'Think about the situation'
          },
          hints: [
            'Don\'t chase bad pitches with 2 strikes',
            'Be aggressive on hitter\'s counts',
            'Look for your pitch'
          ],
          isCompleted: false
        }
      ],
      rewards: [
        { type: 'xp', amount: 2000, id: 'xp', name: 'Experience' },
        { type: 'unlock', id: 'advanced_drills', name: 'Advanced Batting Drills' },
        { type: 'badge', id: 'batting_master', name: 'Batting Master' }
      ],
      difficulty: 'advanced',
      estimatedTime: 20,
      prerequisites: ['batting_basics'],
      isCompleted: false,
      bestScore: 0,
      attempts: 0
    });
  }

  /**
   * Initialize all drills
   */
  private initializeDrills(): void {
    // Batting Practice
    this.drills.set('batting_practice', {
      id: 'batting_practice',
      type: 'batting_practice',
      name: 'Batting Practice',
      description: 'Hit as many balls as possible',
      category: 'batting',
      difficulty: 'easy',
      duration: 60,
      targets: [
        {
          id: 'contact_rate',
          description: 'Contact Rate',
          target: 80,
          bonus: 10,
          weight: 0.4
        },
        {
          id: 'fair_balls',
          description: 'Fair Balls Hit',
          target: 15,
          bonus: 5,
          weight: 0.3
        },
        {
          id: 'hard_hit_balls',
          description: 'Hard Hit Balls',
          target: 10,
          bonus: 5,
          weight: 0.3
        }
      ],
      scoring: {
        maxScore: 1000,
        passingScore: 600,
        perfectScore: 1000,
        gradeThresholds: {
          F: 0,
          D: 400,
          C: 600,
          B: 750,
          A: 900,
          S: 1000
        }
      },
      statistics: {
        attempts: 0,
        successes: 0,
        failures: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        improvementRate: 0
      },
      isUnlocked: false,
      highScore: 0,
      completionCount: 0
    });

    // Pitch Control
    this.drills.set('pitch_control', {
      id: 'pitch_control',
      type: 'pitch_control',
      name: 'Pitch Control',
      description: 'Hit targets with your pitches',
      category: 'pitching',
      difficulty: 'medium',
      duration: 60,
      targets: [
        {
          id: 'accuracy',
          description: 'Target Accuracy',
          target: 75,
          bonus: 10,
          weight: 0.5
        },
        {
          id: 'strikes',
          description: 'Strike Percentage',
          target: 70,
          bonus: 10,
          weight: 0.3
        },
        {
          id: 'consistency',
          description: 'Pitch Consistency',
          target: 80,
          bonus: 5,
          weight: 0.2
        }
      ],
      scoring: {
        maxScore: 1000,
        passingScore: 650,
        perfectScore: 1000,
        gradeThresholds: {
          F: 0,
          D: 450,
          C: 650,
          B: 800,
          A: 920,
          S: 1000
        }
      },
      statistics: {
        attempts: 0,
        successes: 0,
        failures: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        improvementRate: 0
      },
      isUnlocked: false,
      highScore: 0,
      completionCount: 0
    });

    // Fielding Practice
    this.drills.set('fielding_practice', {
      id: 'fielding_practice',
      type: 'fly_ball_catching',
      name: 'Fielding Practice',
      description: 'Catch fly balls and field ground balls',
      category: 'fielding',
      difficulty: 'medium',
      duration: 60,
      targets: [
        {
          id: 'catches',
          description: 'Successful Catches',
          target: 20,
          bonus: 5,
          weight: 0.5
        },
        {
          id: 'timing',
          description: 'Catch Timing',
          target: 85,
          bonus: 10,
          weight: 0.3
        },
        {
          id: 'positioning',
          description: 'Good Positioning',
          target: 80,
          bonus: 5,
          weight: 0.2
        }
      ],
      scoring: {
        maxScore: 1000,
        passingScore: 600,
        perfectScore: 1000,
        gradeThresholds: {
          F: 0,
          D: 400,
          C: 600,
          B: 750,
          A: 900,
          S: 1000
        }
      },
      statistics: {
        attempts: 0,
        successes: 0,
        failures: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        improvementRate: 0
      },
      isUnlocked: false,
      highScore: 0,
      completionCount: 0
    });

    // Base Stealing
    this.drills.set('base_stealing', {
      id: 'base_stealing',
      type: 'base_stealing',
      name: 'Base Stealing',
      description: 'Practice stealing bases',
      category: 'baserunning',
      difficulty: 'hard',
      duration: 45,
      targets: [
        {
          id: 'successful_steals',
          description: 'Successful Steals',
          target: 7,
          bonus: 3,
          weight: 0.6
        },
        {
          id: 'lead_distance',
          description: 'Optimal Lead Distance',
          target: 85,
          bonus: 10,
          weight: 0.2
        },
        {
          id: 'reaction_time',
          description: 'Quick Reaction',
          target: 90,
          bonus: 10,
          weight: 0.2
        }
      ],
      scoring: {
        maxScore: 1000,
        passingScore: 700,
        perfectScore: 1000,
        gradeThresholds: {
          F: 0,
          D: 500,
          C: 700,
          B: 825,
          A: 940,
          S: 1000
        }
      },
      statistics: {
        attempts: 0,
        successes: 0,
        failures: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        improvementRate: 0
      },
      isUnlocked: false,
      highScore: 0,
      completionCount: 0
    });
  }

  /**
   * Initialize training programs
   */
  private initializeTrainingPrograms(): void {
    // Rookie Development Program
    const rookieProgram: TrainingProgram = {
      id: 'rookie_program',
      name: 'Rookie Development',
      description: '7-day program for beginners',
      duration: 7,
      dailyDrills: new Map([
        [1, [this.drills.get('batting_practice')!]],
        [2, [this.drills.get('pitch_control')!]],
        [3, [this.drills.get('fielding_practice')!]],
        [4, [this.drills.get('batting_practice')!, this.drills.get('pitch_control')!]],
        [5, [this.drills.get('fielding_practice')!, this.drills.get('batting_practice')!]],
        [6, [this.drills.get('pitch_control')!, this.drills.get('fielding_practice')!]],
        [7, [this.drills.get('batting_practice')!, this.drills.get('pitch_control')!, this.drills.get('fielding_practice')!]]
      ]),
      objectives: [
        {
          id: 'complete_all_days',
          description: 'Complete all 7 days',
          metric: 'days_completed',
          targetValue: 7,
          currentValue: 0,
          isCompleted: false
        },
        {
          id: 'avg_score_600',
          description: 'Maintain average score of 600+',
          metric: 'average_score',
          targetValue: 600,
          currentValue: 0,
          isCompleted: false
        }
      ],
      rewards: [
        { type: 'xp', amount: 5000, id: 'xp', name: 'Experience' },
        { type: 'badge', id: 'rookie_graduate', name: 'Rookie Graduate' },
        { type: 'unlock', id: 'pro_program', name: 'Pro Development Program' }
      ],
      currentDay: 0,
      isActive: false,
      startDate: new Date(),
      progress: 0
    };

    this.trainingPrograms.set('rookie_program', rookieProgram);
  }

  /**
   * Start tutorial
   */
  public startTutorial(tutorialId: string): boolean {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) {
      console.error(`Tutorial ${tutorialId} not found`);
      return false;
    }

    // Check prerequisites
    if (!this.checkPrerequisites(tutorial)) {
      console.error('Prerequisites not met');
      return false;
    }

    this.currentTutorial = tutorial;
    this.currentStep = 0;
    tutorial.attempts++;

    console.log(`Started tutorial: ${tutorial.name}`);
    return true;
  }

  /**
   * Check tutorial prerequisites
   */
  private checkPrerequisites(tutorial: TutorialLesson): boolean {
    return tutorial.prerequisites.every(prereqId => {
      const prereq = this.tutorials.get(prereqId);
      return prereq && prereq.isCompleted;
    });
  }

  /**
   * Complete tutorial step
   */
  public completeTutorialStep(data: any): boolean {
    if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length) {
      return false;
    }

    const step = this.currentTutorial.steps[this.currentStep];

    // Validate step completion
    if (step.validationCriteria.condition(data)) {
      step.isCompleted = true;
      this.currentStep++;

      console.log(step.validationCriteria.successMessage);

      // Check if tutorial complete
      if (this.currentStep >= this.currentTutorial.steps.length) {
        this.completeTutorial();
      }

      return true;
    } else {
      console.log(step.validationCriteria.failureMessage);
      return false;
    }
  }

  /**
   * Complete tutorial
   */
  private completeTutorial(): void {
    if (!this.currentTutorial) return;

    this.currentTutorial.isCompleted = true;

    // Award rewards
    this.currentTutorial.rewards.forEach(reward => {
      console.log(`Reward: ${reward.name} +${reward.amount || 1}`);
    });

    // Update objectives
    const allObjectivesMet = this.currentTutorial.objectives.every(obj => obj.isCompleted);
    const score = this.calculateTutorialScore(this.currentTutorial);

    if (score > this.currentTutorial.bestScore) {
      this.currentTutorial.bestScore = score;
    }

    console.log(`✅ Tutorial Complete: ${this.currentTutorial.name}`);
    console.log(`Score: ${score}`);

    this.saveProgress();
    this.currentTutorial = null;
    this.currentStep = 0;
  }

  /**
   * Calculate tutorial score
   */
  private calculateTutorialScore(tutorial: TutorialLesson): number {
    let score = 0;

    tutorial.objectives.forEach(obj => {
      if (obj.isCompleted) {
        score += obj.points;
      } else {
        // Partial credit
        score += Math.floor((obj.current / obj.target) * obj.points);
      }
    });

    return score;
  }

  /**
   * Start drill
   */
  public startDrill(drillId: string): boolean {
    const drill = this.drills.get(drillId);
    if (!drill) {
      console.error(`Drill ${drillId} not found`);
      return false;
    }

    if (!drill.isUnlocked) {
      console.error('Drill not unlocked');
      return false;
    }

    this.currentDrill = drill;
    this.sessionStartTime = new Date();
    drill.statistics.attempts++;

    console.log(`Started drill: ${drill.name}`);
    return true;
  }

  /**
   * Complete drill
   */
  public completeDrill(performance: PerformanceData): void {
    if (!this.currentDrill || !this.sessionStartTime) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - this.sessionStartTime.getTime()) / 1000;

    // Calculate score
    const score = this.calculateDrillScore(this.currentDrill, performance);
    const grade = this.getGrade(this.currentDrill, score);

    // Create session
    const session: TrainingSession = {
      id: `session_${Date.now()}`,
      drillId: this.currentDrill.id,
      startTime: this.sessionStartTime,
      endTime,
      score,
      grade,
      targetsMet: this.countTargetsMet(this.currentDrill),
      accuracy: performance.perfectActions / (performance.perfectActions + performance.goodActions + performance.okayActions + performance.poorActions) * 100,
      performanceData: performance
    };

    this.trainingSessions.push(session);

    // Update drill statistics
    const drill = this.currentDrill;
    drill.completionCount++;
    drill.statistics.totalTimeSpent += duration;

    if (score >= drill.scoring.passingScore) {
      drill.statistics.successes++;
    } else {
      drill.statistics.failures++;
    }

    if (score > drill.statistics.bestScore) {
      drill.statistics.bestScore = score;
      drill.highScore = score;
    }

    const newAvg = ((drill.statistics.averageScore * (drill.completionCount - 1)) + score) / drill.completionCount;
    drill.statistics.averageScore = newAvg;

    console.log(`✅ Drill Complete: ${drill.name}`);
    console.log(`Score: ${score} | Grade: ${grade}`);
    console.log(`Accuracy: ${session.accuracy.toFixed(1)}%`);

    this.saveProgress();
    this.currentDrill = null;
    this.sessionStartTime = null;
  }

  /**
   * Calculate drill score
   */
  private calculateDrillScore(drill: Drill, performance: PerformanceData): number {
    let score = 0;

    drill.targets.forEach(target => {
      // Simplified scoring - would use actual metrics
      const targetScore = (drill.scoring.maxScore * target.weight);
      score += targetScore;
    });

    // Apply performance modifiers
    const consistencyBonus = performance.consistency * 0.1;
    score *= (1 + consistencyBonus);

    return Math.min(drill.scoring.maxScore, Math.floor(score));
  }

  /**
   * Get grade from score
   */
  private getGrade(drill: Drill, score: number): 'F' | 'D' | 'C' | 'B' | 'A' | 'S' {
    const thresholds = drill.scoring.gradeThresholds;

    if (score >= thresholds.S) return 'S';
    if (score >= thresholds.A) return 'A';
    if (score >= thresholds.B) return 'B';
    if (score >= thresholds.C) return 'C';
    if (score >= thresholds.D) return 'D';
    return 'F';
  }

  /**
   * Count targets met
   */
  private countTargetsMet(drill: Drill): number {
    // Simplified - would actually check target completion
    return drill.targets.length;
  }

  /**
   * Start training program
   */
  public startTrainingProgram(programId: string): boolean {
    const program = this.trainingPrograms.get(programId);
    if (!program) {
      console.error(`Program ${programId} not found`);
      return false;
    }

    program.isActive = true;
    program.currentDay = 1;
    program.startDate = new Date();
    program.progress = 0;

    console.log(`Started training program: ${program.name}`);
    return true;
  }

  /**
   * Complete program day
   */
  public completeProgramDay(programId: string): void {
    const program = this.trainingPrograms.get(programId);
    if (!program || !program.isActive) return;

    program.currentDay++;
    program.progress = (program.currentDay / program.duration) * 100;

    if (program.currentDay > program.duration) {
      this.completeProgram(program);
    }

    this.saveProgress();
  }

  /**
   * Complete training program
   */
  private completeProgram(program: TrainingProgram): void {
    program.isActive = false;
    program.completionDate = new Date();
    program.progress = 100;

    // Award rewards
    program.rewards.forEach(reward => {
      console.log(`Program Reward: ${reward.name}`);
    });

    console.log(`🎓 Training Program Complete: ${program.name}`);
  }

  /**
   * Get hint for current step
   */
  public getHint(): string | null {
    if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length) {
      return null;
    }

    const step = this.currentTutorial.steps[this.currentStep];
    return step.hints[Math.floor(Math.random() * step.hints.length)];
  }

  /**
   * Skip tutorial
   */
  public skipTutorial(): void {
    if (this.currentTutorial) {
      console.log(`Skipped tutorial: ${this.currentTutorial.name}`);
      this.currentTutorial = null;
      this.currentStep = 0;
    }
  }

  /**
   * Save progress
   */
  private saveProgress(): void {
    const data = {
      tutorials: Array.from(this.tutorials.values()),
      drills: Array.from(this.drills.values()),
      sessions: this.trainingSessions.slice(-50) // Keep last 50
    };

    localStorage.setItem('training_progress', JSON.stringify(data));
  }

  /**
   * Load progress
   */
  private loadProgress(): void {
    const saved = localStorage.getItem('training_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Restore progress
        console.log('Loaded training progress');
      } catch (e) {
        console.error('Failed to load training progress:', e);
      }
    }
  }

  /**
   * Public getters
   */
  public getTutorial(id: string): TutorialLesson | undefined {
    return this.tutorials.get(id);
  }

  public getAllTutorials(): TutorialLesson[] {
    return Array.from(this.tutorials.values());
  }

  public getAvailableTutorials(): TutorialLesson[] {
    return Array.from(this.tutorials.values()).filter(t => this.checkPrerequisites(t));
  }

  public getDrill(id: string): Drill | undefined {
    return this.drills.get(id);
  }

  public getAllDrills(): Drill[] {
    return Array.from(this.drills.values());
  }

  public getUnlockedDrills(): Drill[] {
    return Array.from(this.drills.values()).filter(d => d.isUnlocked);
  }

  public getCurrentTutorial(): TutorialLesson | null {
    return this.currentTutorial;
  }

  public getCurrentStep(): TutorialStep | null {
    if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length) {
      return null;
    }
    return this.currentTutorial.steps[this.currentStep];
  }

  public getCurrentDrill(): Drill | null {
    return this.currentDrill;
  }

  public getTrainingSessions(): TrainingSession[] {
    return [...this.trainingSessions];
  }

  public getTrainingProgram(id: string): TrainingProgram | undefined {
    return this.trainingPrograms.get(id);
  }

  public getAllTrainingPrograms(): TrainingProgram[] {
    return Array.from(this.trainingPrograms.values());
  }

  public getCompletionPercentage(): number {
    const total = this.tutorials.size;
    const completed = Array.from(this.tutorials.values()).filter(t => t.isCompleted).length;
    return (completed / total) * 100;
  }
}
