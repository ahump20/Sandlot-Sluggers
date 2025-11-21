import { Observable } from '@babylonjs/core';

/**
 * Training drill type
 */
export enum DrillType {
    BATTING = 'batting',
    PITCHING = 'pitching',
    FIELDING = 'fielding',
    BASE_RUNNING = 'base_running',
    STRENGTH = 'strength',
    SPEED = 'speed',
    REACTION = 'reaction',
    ENDURANCE = 'endurance'
}

/**
 * Drill difficulty
 */
export enum DrillDifficulty {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert',
    MASTER = 'master'
}

/**
 * Training drill
 */
export interface TrainingDrill {
    id: string;
    name: string;
    description: string;
    type: DrillType;
    difficulty: DrillDifficulty;
    duration: number;
    objectives: DrillObjective[];
    rewards: {
        experience: number;
        skillPoints?: number;
        attributeBoosts?: Map<string, number>;
        coins?: number;
    };
    requirements?: {
        level?: number;
        attributes?: Map<string, number>;
        completedDrills?: string[];
    };
    unlocked: boolean;
    bestScore?: number;
    completionCount: number;
    leaderboard?: DrillLeaderboardEntry[];
}

/**
 * Drill objective
 */
export interface DrillObjective {
    id: string;
    description: string;
    targetValue: number;
    currentValue?: number;
    metric: string;
    required: boolean;
}

/**
 * Drill leaderboard entry
 */
export interface DrillLeaderboardEntry {
    rank: number;
    playerId: string;
    playerName: string;
    score: number;
    timestamp: number;
}

/**
 * Training session
 */
export interface TrainingSession {
    id: string;
    drillId: string;
    playerId: string;
    startTime: number;
    endTime?: number;
    score: number;
    objectives: Map<string, number>;
    completed: boolean;
    performance: {
        accuracy?: number;
        speed?: number;
        power?: number;
        consistency?: number;
    };
}

/**
 * Skill practice mode
 */
export interface PracticeMode {
    id: string;
    name: string;
    description: string;
    type: DrillType;
    settings: {
        difficulty?: number;
        pitchSpeed?: number;
        pitchVariety?: boolean;
        fieldingScenarios?: string[];
        unlimited?: boolean;
        timeLimit?: number;
    };
}

/**
 * Batting cage settings
 */
export interface BattingCageSettings {
    pitchSpeed: number;
    pitchTypes: string[];
    pitchLocation: 'random' | 'strike_zone' | 'specific';
    pitchCount: number;
    timed: boolean;
    timeLimit?: number;
    showStrikeZone: boolean;
    showTrajectory: boolean;
    difficulty: number;
}

/**
 * Fielding practice settings
 */
export interface FieldingPracticeSettings {
    scenarios: string[];
    ballSpeed: number;
    ballHeight: number;
    randomize: boolean;
    repetitions: number;
    positions: string[];
    throwingTargets: boolean;
}

/**
 * Pitching practice settings
 */
export interface PitchingPracticeSettings {
    pitchTypes: string[];
    targetZones: boolean;
    accuracyMode: boolean;
    velocityMode: boolean;
    pitchCount: number;
    staminaDrain: boolean;
}

/**
 * Training program
 */
export interface TrainingProgram {
    id: string;
    name: string;
    description: string;
    duration: number;
    drills: string[];
    schedule: Map<number, string[]>;
    rewards: {
        experience: number;
        permanentBoosts: Map<string, number>;
        achievements?: string[];
    };
    currentDay: number;
    completed: boolean;
    startDate?: number;
}

/**
 * Coach tip
 */
export interface CoachTip {
    id: string;
    category: DrillType;
    title: string;
    description: string;
    videoUrl?: string;
    unlockedAt?: number;
}

/**
 * Training milestone
 */
export interface TrainingMilestone {
    id: string;
    name: string;
    description: string;
    requirement: {
        drillsCompleted?: number;
        totalScore?: number;
        perfectScores?: number;
        category?: DrillType;
    };
    reward: {
        title?: string;
        badge?: string;
        unlock?: string;
    };
    achieved: boolean;
    progress: number;
}

/**
 * Mini game
 */
export interface MiniGame {
    id: string;
    name: string;
    description: string;
    type: 'home_run_derby' | 'accuracy_challenge' | 'speed_run' | 'survival';
    settings: any;
    highScore: number;
    playCount: number;
}

/**
 * Training System
 * Comprehensive practice, drills, and skill development
 */
export class TrainingSystem {
    // Available drills
    private drills: Map<string, TrainingDrill> = new Map();

    // Active training session
    private activeSession?: TrainingSession;

    // Training programs
    private programs: Map<string, TrainingProgram> = new Map();
    private activeProgram?: TrainingProgram;

    // Player training stats
    private playerStats: {
        totalDrillsCompleted: number;
        totalTrainingTime: number;
        favoriteCategory: DrillType;
        averageScore: number;
        perfectScores: number;
        categoryStats: Map<DrillType, {
            completed: number;
            averageScore: number;
            bestScore: number;
            timeSpent: number;
        }>;
    } = {
        totalDrillsCompleted: 0,
        totalTrainingTime: 0,
        favoriteCategory: DrillType.BATTING,
        averageScore: 0,
        perfectScores: 0,
        categoryStats: new Map()
    };

    // Coach tips
    private coachTips: Map<string, CoachTip> = new Map();
    private unlockedTips: Set<string> = new Set();

    // Milestones
    private milestones: Map<string, TrainingMilestone> = new Map();

    // Mini games
    private miniGames: Map<string, MiniGame> = new Map();

    // Observables
    private onDrillCompletedObservable: Observable<TrainingSession> = new Observable();
    private onMilestoneAchievedObservable: Observable<TrainingMilestone> = new Observable();
    private onProgramCompletedObservable: Observable<TrainingProgram> = new Observable();
    private onTipUnlockedObservable: Observable<CoachTip> = new Observable();

    // Settings
    private enabled: boolean = true;

    constructor() {
        this.initializeDrills();
        this.initializePrograms();
        this.initializeCoachTips();
        this.initializeMilestones();
        this.initializeMiniGames();
        this.initializeCategoryStats();
    }

    /**
     * Initialize category stats
     */
    private initializeCategoryStats(): void {
        for (const type of Object.values(DrillType)) {
            this.playerStats.categoryStats.set(type as DrillType, {
                completed: 0,
                averageScore: 0,
                bestScore: 0,
                timeSpent: 0
            });
        }
    }

    /**
     * Initialize training drills
     */
    private initializeDrills(): void {
        // Batting drills
        this.registerDrill({
            id: 'batting_basic_timing',
            name: 'Basic Timing',
            description: 'Learn the fundamentals of batting timing',
            type: DrillType.BATTING,
            difficulty: DrillDifficulty.BEGINNER,
            duration: 300000, // 5 minutes
            objectives: [
                {
                    id: 'obj_hits',
                    description: 'Get 10 hits',
                    targetValue: 10,
                    metric: 'hits',
                    required: true
                },
                {
                    id: 'obj_perfect',
                    description: 'Get 3 perfect hits',
                    targetValue: 3,
                    metric: 'perfect_hits',
                    required: false
                }
            ],
            rewards: {
                experience: 100,
                attributeBoosts: new Map([['contact', 2]]),
                coins: 50
            },
            unlocked: true,
            completionCount: 0
        });

        this.registerDrill({
            id: 'batting_power_hitting',
            name: 'Power Hitting',
            description: 'Focus on hitting home runs',
            type: DrillType.BATTING,
            difficulty: DrillDifficulty.INTERMEDIATE,
            duration: 600000, // 10 minutes
            objectives: [
                {
                    id: 'obj_homers',
                    description: 'Hit 5 home runs',
                    targetValue: 5,
                    metric: 'home_runs',
                    required: true
                },
                {
                    id: 'obj_distance',
                    description: 'Hit a ball 400+ feet',
                    targetValue: 1,
                    metric: 'long_ball',
                    required: false
                }
            ],
            rewards: {
                experience: 250,
                attributeBoosts: new Map([['power', 3]]),
                coins: 150
            },
            requirements: {
                level: 5,
                completedDrills: ['batting_basic_timing']
            },
            unlocked: false,
            completionCount: 0
        });

        this.registerDrill({
            id: 'batting_contact_hitting',
            name: 'Contact Hitting',
            description: 'Master the art of making contact',
            type: DrillType.BATTING,
            difficulty: DrillDifficulty.ADVANCED,
            duration: 600000,
            objectives: [
                {
                    id: 'obj_contact',
                    description: 'Make contact 25 times in a row',
                    targetValue: 25,
                    metric: 'contact_streak',
                    required: true
                },
                {
                    id: 'obj_accuracy',
                    description: 'Maintain 80% contact rate',
                    targetValue: 80,
                    metric: 'contact_percentage',
                    required: true
                }
            ],
            rewards: {
                experience: 500,
                attributeBoosts: new Map([['contact', 5], ['vision', 3]]),
                coins: 300
            },
            requirements: {
                level: 10,
                attributes: new Map([['contact', 30]])
            },
            unlocked: false,
            completionCount: 0
        });

        // Pitching drills
        this.registerDrill({
            id: 'pitching_accuracy',
            name: 'Pitching Accuracy',
            description: 'Hit the strike zone consistently',
            type: DrillType.PITCHING,
            difficulty: DrillDifficulty.BEGINNER,
            duration: 300000,
            objectives: [
                {
                    id: 'obj_strikes',
                    description: 'Throw 15 strikes',
                    targetValue: 15,
                    metric: 'strikes',
                    required: true
                },
                {
                    id: 'obj_accuracy',
                    description: 'Hit target zones 10 times',
                    targetValue: 10,
                    metric: 'target_hits',
                    required: false
                }
            ],
            rewards: {
                experience: 100,
                attributeBoosts: new Map([['control', 2]]),
                coins: 50
            },
            unlocked: true,
            completionCount: 0
        });

        this.registerDrill({
            id: 'pitching_velocity',
            name: 'Velocity Training',
            description: 'Increase your fastball speed',
            type: DrillType.PITCHING,
            difficulty: DrillDifficulty.INTERMEDIATE,
            duration: 600000,
            objectives: [
                {
                    id: 'obj_fastballs',
                    description: 'Throw 20 fastballs over 90 MPH',
                    targetValue: 20,
                    metric: 'fast_pitches',
                    required: true
                }
            ],
            rewards: {
                experience: 250,
                attributeBoosts: new Map([['velocity', 3]]),
                coins: 150
            },
            requirements: {
                level: 5
            },
            unlocked: false,
            completionCount: 0
        });

        // Fielding drills
        this.registerDrill({
            id: 'fielding_ground_balls',
            name: 'Ground Ball Practice',
            description: 'Field ground balls cleanly',
            type: DrillType.FIELDING,
            difficulty: DrillDifficulty.BEGINNER,
            duration: 300000,
            objectives: [
                {
                    id: 'obj_fields',
                    description: 'Field 15 ground balls',
                    targetValue: 15,
                    metric: 'ground_balls_fielded',
                    required: true
                },
                {
                    id: 'obj_clean',
                    description: 'No errors',
                    targetValue: 0,
                    metric: 'errors',
                    required: false
                }
            ],
            rewards: {
                experience: 100,
                attributeBoosts: new Map([['fielding', 2]]),
                coins: 50
            },
            unlocked: true,
            completionCount: 0
        });

        this.registerDrill({
            id: 'fielding_fly_balls',
            name: 'Fly Ball Practice',
            description: 'Track and catch fly balls',
            type: DrillType.FIELDING,
            difficulty: DrillDifficulty.INTERMEDIATE,
            duration: 600000,
            objectives: [
                {
                    id: 'obj_catches',
                    description: 'Catch 20 fly balls',
                    targetValue: 20,
                    metric: 'fly_balls_caught',
                    required: true
                },
                {
                    id: 'obj_diving',
                    description: 'Make 3 diving catches',
                    targetValue: 3,
                    metric: 'diving_catches',
                    required: false
                }
            ],
            rewards: {
                experience: 250,
                attributeBoosts: new Map([['fielding', 3], ['reaction', 2]]),
                coins: 150
            },
            requirements: {
                level: 5
            },
            unlocked: false,
            completionCount: 0
        });

        // Base running drills
        this.registerDrill({
            id: 'baserunning_speed',
            name: 'Speed Training',
            description: 'Improve your running speed',
            type: DrillType.BASE_RUNNING,
            difficulty: DrillDifficulty.BEGINNER,
            duration: 300000,
            objectives: [
                {
                    id: 'obj_sprints',
                    description: 'Complete 10 base-to-base sprints',
                    targetValue: 10,
                    metric: 'sprints',
                    required: true
                },
                {
                    id: 'obj_time',
                    description: 'Beat your best time',
                    targetValue: 1,
                    metric: 'record_time',
                    required: false
                }
            ],
            rewards: {
                experience: 100,
                attributeBoosts: new Map([['speed', 2]]),
                coins: 50
            },
            unlocked: true,
            completionCount: 0
        });

        this.registerDrill({
            id: 'baserunning_stealing',
            name: 'Base Stealing',
            description: 'Perfect your steal technique',
            type: DrillType.BASE_RUNNING,
            difficulty: DrillDifficulty.ADVANCED,
            duration: 600000,
            objectives: [
                {
                    id: 'obj_steals',
                    description: 'Successfully steal 10 bases',
                    targetValue: 10,
                    metric: 'successful_steals',
                    required: true
                },
                {
                    id: 'obj_caught',
                    description: 'Get caught less than 2 times',
                    targetValue: 2,
                    metric: 'caught_stealing',
                    required: false
                }
            ],
            rewards: {
                experience: 500,
                attributeBoosts: new Map([['speed', 4], ['stealing', 5]]),
                coins: 300
            },
            requirements: {
                level: 10,
                attributes: new Map([['speed', 40]])
            },
            unlocked: false,
            completionCount: 0
        });

        // Strength drills
        this.registerDrill({
            id: 'strength_weight_training',
            name: 'Weight Training',
            description: 'Build muscle and power',
            type: DrillType.STRENGTH,
            difficulty: DrillDifficulty.INTERMEDIATE,
            duration: 900000, // 15 minutes
            objectives: [
                {
                    id: 'obj_reps',
                    description: 'Complete all exercises',
                    targetValue: 100,
                    metric: 'total_reps',
                    required: true
                }
            ],
            rewards: {
                experience: 300,
                attributeBoosts: new Map([['power', 4], ['durability', 2]]),
                coins: 200
            },
            requirements: {
                level: 8
            },
            unlocked: false,
            completionCount: 0
        });

        // Reaction drills
        this.registerDrill({
            id: 'reaction_reflex_training',
            name: 'Reflex Training',
            description: 'Improve your reaction time',
            type: DrillType.REACTION,
            difficulty: DrillDifficulty.ADVANCED,
            duration: 600000,
            objectives: [
                {
                    id: 'obj_reactions',
                    description: 'React to 50 stimuli',
                    targetValue: 50,
                    metric: 'reactions',
                    required: true
                },
                {
                    id: 'obj_speed',
                    description: 'Average reaction under 200ms',
                    targetValue: 200,
                    metric: 'reaction_time',
                    required: false
                }
            ],
            rewards: {
                experience: 400,
                attributeBoosts: new Map([['reaction', 5]]),
                coins: 250
            },
            requirements: {
                level: 12
            },
            unlocked: false,
            completionCount: 0
        });
    }

    /**
     * Initialize training programs
     */
    private initializePrograms(): void {
        this.registerProgram({
            id: 'rookie_program',
            name: 'Rookie Training Program',
            description: 'A 7-day program for beginners',
            duration: 7,
            drills: [
                'batting_basic_timing',
                'pitching_accuracy',
                'fielding_ground_balls',
                'baserunning_speed'
            ],
            schedule: new Map([
                [1, ['batting_basic_timing']],
                [2, ['pitching_accuracy']],
                [3, ['fielding_ground_balls']],
                [4, ['baserunning_speed']],
                [5, ['batting_basic_timing', 'pitching_accuracy']],
                [6, ['fielding_ground_balls', 'baserunning_speed']],
                [7, ['batting_basic_timing', 'pitching_accuracy', 'fielding_ground_balls']]
            ]),
            rewards: {
                experience: 1000,
                permanentBoosts: new Map([
                    ['contact', 5],
                    ['power', 3],
                    ['fielding', 5],
                    ['speed', 3]
                ]),
                achievements: ['rookie_graduate']
            },
            currentDay: 0,
            completed: false
        });

        this.registerProgram({
            id: 'power_hitting_program',
            name: 'Power Hitting Specialist',
            description: 'Become a home run threat',
            duration: 14,
            drills: [
                'batting_power_hitting',
                'strength_weight_training'
            ],
            schedule: new Map([
                [1, ['batting_power_hitting']],
                [2, ['strength_weight_training']],
                [3, ['batting_power_hitting']],
                [4, ['strength_weight_training']],
                // Continue pattern
            ]),
            rewards: {
                experience: 3000,
                permanentBoosts: new Map([
                    ['power', 15],
                    ['contact', 5]
                ]),
                achievements: ['power_hitter']
            },
            currentDay: 0,
            completed: false
        });
    }

    /**
     * Initialize coach tips
     */
    private initializeCoachTips(): void {
        this.registerCoachTip({
            id: 'tip_batting_stance',
            category: DrillType.BATTING,
            title: 'Proper Batting Stance',
            description: 'Keep your feet shoulder-width apart, knees slightly bent, and weight on the balls of your feet. This gives you a solid foundation and allows for quick reactions.'
        });

        this.registerCoachTip({
            id: 'tip_pitch_grip',
            category: DrillType.PITCHING,
            title: 'Fastball Grip',
            description: 'For a four-seam fastball, place your index and middle fingers across the seams at their widest point. This creates backspin for maximum velocity.'
        });

        this.registerCoachTip({
            id: 'tip_fielding_ready',
            category: DrillType.FIELDING,
            title: 'Ready Position',
            description: 'Stay on the balls of your feet, knees bent, glove out front. Be ready to move in any direction at the crack of the bat.'
        });

        this.registerCoachTip({
            id: 'tip_stealing_lead',
            category: DrillType.BASE_RUNNING,
            title: 'Taking a Lead',
            description: 'Take two shuffle steps off the base, keeping your weight forward. Watch the pitcher\'s movements to time your steal perfectly.'
        });
    }

    /**
     * Initialize milestones
     */
    private initializeMilestones(): void {
        this.registerMilestone({
            id: 'milestone_first_drill',
            name: 'First Steps',
            description: 'Complete your first training drill',
            requirement: {
                drillsCompleted: 1
            },
            reward: {
                badge: 'trainee'
            },
            achieved: false,
            progress: 0
        });

        this.registerMilestone({
            id: 'milestone_dedicated_trainer',
            name: 'Dedicated Trainer',
            description: 'Complete 50 training drills',
            requirement: {
                drillsCompleted: 50
            },
            reward: {
                title: 'Dedicated Trainer',
                badge: 'dedicated_badge'
            },
            achieved: false,
            progress: 0
        });

        this.registerMilestone({
            id: 'milestone_perfect_10',
            name: 'Perfect Practice',
            description: 'Achieve 10 perfect scores',
            requirement: {
                perfectScores: 10
            },
            reward: {
                badge: 'perfectionist',
                unlock: 'expert_drills'
            },
            achieved: false,
            progress: 0
        });
    }

    /**
     * Initialize mini games
     */
    private initializeMiniGames(): void {
        this.registerMiniGame({
            id: 'home_run_derby',
            name: 'Home Run Derby',
            description: 'Hit as many home runs as you can in 3 minutes',
            type: 'home_run_derby',
            settings: {
                timeLimit: 180,
                pitchSpeed: 85,
                outs: 10
            },
            highScore: 0,
            playCount: 0
        });

        this.registerMiniGame({
            id: 'accuracy_challenge',
            name: 'Accuracy Challenge',
            description: 'Hit targets with your pitches',
            type: 'accuracy_challenge',
            settings: {
                targets: 20,
                timeLimit: 120,
                targetSize: 'small'
            },
            highScore: 0,
            playCount: 0
        });
    }

    /**
     * Register drill
     */
    private registerDrill(drill: TrainingDrill): void {
        this.drills.set(drill.id, drill);
    }

    /**
     * Register program
     */
    private registerProgram(program: TrainingProgram): void {
        this.programs.set(program.id, program);
    }

    /**
     * Register coach tip
     */
    private registerCoachTip(tip: CoachTip): void {
        this.coachTips.set(tip.id, tip);
    }

    /**
     * Register milestone
     */
    private registerMilestone(milestone: TrainingMilestone): void {
        this.milestones.set(milestone.id, milestone);
    }

    /**
     * Register mini game
     */
    private registerMiniGame(game: MiniGame): void {
        this.miniGames.set(game.id, game);
    }

    /**
     * Start training drill
     */
    public startDrill(drillId: string, playerId: string): TrainingSession | null {
        const drill = this.drills.get(drillId);
        if (!drill || !drill.unlocked) return null;

        const session: TrainingSession = {
            id: this.generateId('session'),
            drillId,
            playerId,
            startTime: Date.now(),
            score: 0,
            objectives: new Map(),
            completed: false,
            performance: {}
        };

        this.activeSession = session;
        return session;
    }

    /**
     * Update drill progress
     */
    public updateDrillProgress(metric: string, value: number): void {
        if (!this.activeSession) return;

        const drill = this.drills.get(this.activeSession.drillId);
        if (!drill) return;

        // Update objective progress
        for (const objective of drill.objectives) {
            if (objective.metric === metric) {
                if (!this.activeSession.objectives.has(objective.id)) {
                    this.activeSession.objectives.set(objective.id, 0);
                }

                const current = this.activeSession.objectives.get(objective.id)!;
                this.activeSession.objectives.set(objective.id, current + value);
            }
        }

        // Calculate score
        this.activeSession.score = this.calculateDrillScore(drill, this.activeSession);
    }

    /**
     * Calculate drill score
     */
    private calculateDrillScore(drill: TrainingDrill, session: TrainingSession): number {
        let score = 0;
        let totalWeight = 0;

        for (const objective of drill.objectives) {
            const current = session.objectives.get(objective.id) || 0;
            const progress = Math.min(current / objective.targetValue, 1);
            const weight = objective.required ? 2 : 1;

            score += progress * 100 * weight;
            totalWeight += weight;
        }

        return Math.floor(score / totalWeight);
    }

    /**
     * Complete drill
     */
    public completeDrill(): TrainingSession | null {
        if (!this.activeSession) return null;

        const drill = this.drills.get(this.activeSession.drillId);
        if (!drill) return null;

        this.activeSession.endTime = Date.now();
        this.activeSession.completed = true;

        // Check if all required objectives met
        const requiredMet = drill.objectives
            .filter(obj => obj.required)
            .every(obj => {
                const current = this.activeSession!.objectives.get(obj.id) || 0;
                return current >= obj.targetValue;
            });

        if (requiredMet) {
            // Award rewards
            this.awardDrillRewards(drill);

            // Update stats
            this.updatePlayerStats(drill, this.activeSession);

            // Update drill stats
            drill.completionCount++;
            if (!drill.bestScore || this.activeSession.score > drill.bestScore) {
                drill.bestScore = this.activeSession.score;
            }

            // Check milestones
            this.checkMilestones();

            // Unlock tips
            this.checkTipUnlocks(drill);

            // Notify observers
            this.onDrillCompletedObservable.notifyObservers(this.activeSession);
        }

        const completedSession = this.activeSession;
        this.activeSession = undefined;

        return completedSession;
    }

    /**
     * Award drill rewards
     */
    private awardDrillRewards(drill: TrainingDrill): void {
        // Would apply rewards to player profile
        console.log(`Awarded ${drill.rewards.experience} XP`);

        if (drill.rewards.attributeBoosts) {
            for (const [attr, boost] of drill.rewards.attributeBoosts) {
                console.log(`+${boost} ${attr}`);
            }
        }
    }

    /**
     * Update player stats
     */
    private updatePlayerStats(drill: TrainingDrill, session: TrainingSession): void {
        this.playerStats.totalDrillsCompleted++;
        const duration = (session.endTime! - session.startTime) / 1000;
        this.playerStats.totalTrainingTime += duration;

        // Update category stats
        const categoryStats = this.playerStats.categoryStats.get(drill.type)!;
        categoryStats.completed++;
        categoryStats.timeSpent += duration;

        const newAvg = (categoryStats.averageScore * (categoryStats.completed - 1) + session.score) / categoryStats.completed;
        categoryStats.averageScore = newAvg;

        if (session.score > categoryStats.bestScore) {
            categoryStats.bestScore = session.score;
        }

        // Check perfect score
        if (session.score === 100) {
            this.playerStats.perfectScores++;
        }

        // Update favorite category
        let maxCompleted = 0;
        for (const [type, stats] of this.playerStats.categoryStats) {
            if (stats.completed > maxCompleted) {
                maxCompleted = stats.completed;
                this.playerStats.favoriteCategory = type;
            }
        }
    }

    /**
     * Check milestones
     */
    private checkMilestones(): void {
        for (const milestone of this.milestones.values()) {
            if (milestone.achieved) continue;

            let progress = 0;

            if (milestone.requirement.drillsCompleted) {
                progress = this.playerStats.totalDrillsCompleted / milestone.requirement.drillsCompleted;
            } else if (milestone.requirement.perfectScores) {
                progress = this.playerStats.perfectScores / milestone.requirement.perfectScores;
            }

            milestone.progress = Math.min(progress, 1);

            if (milestone.progress >= 1 && !milestone.achieved) {
                milestone.achieved = true;
                this.onMilestoneAchievedObservable.notifyObservers(milestone);
            }
        }
    }

    /**
     * Check tip unlocks
     */
    private checkTipUnlocks(drill: TrainingDrill): void {
        for (const tip of this.coachTips.values()) {
            if (this.unlockedTips.has(tip.id)) continue;

            if (tip.category === drill.type && drill.completionCount >= 3) {
                tip.unlockedAt = Date.now();
                this.unlockedTips.add(tip.id);
                this.onTipUnlockedObservable.notifyObservers(tip);
            }
        }
    }

    /**
     * Start training program
     */
    public startProgram(programId: string): boolean {
        const program = this.programs.get(programId);
        if (!program || this.activeProgram) return false;

        program.currentDay = 1;
        program.startDate = Date.now();
        this.activeProgram = program;

        return true;
    }

    /**
     * Advance program day
     */
    public advanceProgramDay(): void {
        if (!this.activeProgram) return;

        this.activeProgram.currentDay++;

        if (this.activeProgram.currentDay > this.activeProgram.duration) {
            this.completeProgram();
        }
    }

    /**
     * Complete program
     */
    private completeProgram(): void {
        if (!this.activeProgram) return;

        this.activeProgram.completed = true;

        // Award program rewards
        console.log(`Program completed! Awarded ${this.activeProgram.rewards.experience} XP`);

        if (this.activeProgram.rewards.permanentBoosts) {
            for (const [attr, boost] of this.activeProgram.rewards.permanentBoosts) {
                console.log(`Permanent +${boost} ${attr}`);
            }
        }

        this.onProgramCompletedObservable.notifyObservers(this.activeProgram);

        this.activeProgram = undefined;
    }

    /**
     * Get available drills
     */
    public getAvailableDrills(category?: DrillType): TrainingDrill[] {
        let drills = Array.from(this.drills.values()).filter(d => d.unlocked);

        if (category) {
            drills = drills.filter(d => d.type === category);
        }

        return drills.sort((a, b) => {
            const diffOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3, master: 4 };
            return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        });
    }

    /**
     * Get drill
     */
    public getDrill(drillId: string): TrainingDrill | undefined {
        return this.drills.get(drillId);
    }

    /**
     * Get active session
     */
    public getActiveSession(): TrainingSession | undefined {
        return this.activeSession;
    }

    /**
     * Get player stats
     */
    public getPlayerStats(): typeof this.playerStats {
        return { ...this.playerStats };
    }

    /**
     * Get unlocked coach tips
     */
    public getUnlockedTips(category?: DrillType): CoachTip[] {
        let tips = Array.from(this.coachTips.values())
            .filter(t => this.unlockedTips.has(t.id));

        if (category) {
            tips = tips.filter(t => t.category === category);
        }

        return tips;
    }

    /**
     * Get milestones
     */
    public getMilestones(): TrainingMilestone[] {
        return Array.from(this.milestones.values());
    }

    /**
     * Get mini games
     */
    public getMiniGames(): MiniGame[] {
        return Array.from(this.miniGames.values());
    }

    /**
     * Update mini game score
     */
    public updateMiniGameScore(gameId: string, score: number): void {
        const game = this.miniGames.get(gameId);
        if (!game) return;

        game.playCount++;

        if (score > game.highScore) {
            game.highScore = score;
        }
    }

    /**
     * Subscribe to drill completed
     */
    public onDrillCompleted(callback: (session: TrainingSession) => void): void {
        this.onDrillCompletedObservable.add(callback);
    }

    /**
     * Subscribe to milestone achieved
     */
    public onMilestoneAchieved(callback: (milestone: TrainingMilestone) => void): void {
        this.onMilestoneAchievedObservable.add(callback);
    }

    /**
     * Subscribe to program completed
     */
    public onProgramCompleted(callback: (program: TrainingProgram) => void): void {
        this.onProgramCompletedObservable.add(callback);
    }

    /**
     * Subscribe to tip unlocked
     */
    public onTipUnlocked(callback: (tip: CoachTip) => void): void {
        this.onTipUnlockedObservable.add(callback);
    }

    /**
     * Generate ID
     */
    private generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Export data
     */
    public exportData(): string {
        const data = {
            playerStats: {
                ...this.playerStats,
                categoryStats: Array.from(this.playerStats.categoryStats.entries())
            },
            drills: Array.from(this.drills.entries()).map(([id, drill]) => ({
                id,
                unlocked: drill.unlocked,
                bestScore: drill.bestScore,
                completionCount: drill.completionCount
            })),
            unlockedTips: Array.from(this.unlockedTips),
            milestones: Array.from(this.milestones.entries()),
            miniGames: Array.from(this.miniGames.entries())
        };

        return JSON.stringify(data);
    }

    /**
     * Import data
     */
    public importData(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this.playerStats = {
                ...parsed.playerStats,
                categoryStats: new Map(parsed.playerStats.categoryStats)
            };

            // Restore drill progress
            for (const drillData of parsed.drills) {
                const drill = this.drills.get(drillData.id);
                if (drill) {
                    drill.unlocked = drillData.unlocked;
                    drill.bestScore = drillData.bestScore;
                    drill.completionCount = drillData.completionCount;
                }
            }

            this.unlockedTips = new Set(parsed.unlockedTips);
            this.milestones = new Map(parsed.milestones);
            this.miniGames = new Map(parsed.miniGames);
        } catch (error) {
            console.error('Failed to import training data:', error);
        }
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.drills.clear();
        this.programs.clear();
        this.coachTips.clear();
        this.milestones.clear();
        this.miniGames.clear();

        this.onDrillCompletedObservable.clear();
        this.onMilestoneAchievedObservable.clear();
        this.onProgramCompletedObservable.clear();
        this.onTipUnlockedObservable.clear();
    }
}
