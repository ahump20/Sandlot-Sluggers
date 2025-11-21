/**
 * Comprehensive Tutorial and Training System
 * Provides step-by-step guidance for new players and advanced training modes
 */

export enum TutorialStep {
    WELCOME = 'WELCOME',
    BATTING_BASICS = 'BATTING_BASICS',
    TIMING_PRACTICE = 'TIMING_PRACTICE',
    PITCH_RECOGNITION = 'PITCH_RECOGNITION',
    POWER_VS_CONTACT = 'POWER_VS_CONTACT',
    PITCHING_BASICS = 'PITCHING_BASICS',
    PITCH_SELECTION = 'PITCH_SELECTION',
    PITCH_LOCATION = 'PITCH_LOCATION',
    FIELDING_BASICS = 'FIELDING_BASICS',
    CATCHING = 'CATCHING',
    THROWING = 'THROWING',
    BASE_RUNNING = 'BASE_RUNNING',
    GAME_STRATEGY = 'GAME_STRATEGY',
    ADVANCED_BATTING = 'ADVANCED_BATTING',
    ADVANCED_PITCHING = 'ADVANCED_PITCHING',
    ADVANCED_FIELDING = 'ADVANCED_FIELDING',
    COMPLETION = 'COMPLETION'
}

export enum TutorialMode {
    FULL_TUTORIAL = 'FULL_TUTORIAL',
    BATTING_ONLY = 'BATTING_ONLY',
    PITCHING_ONLY = 'PITCHING_ONLY',
    FIELDING_ONLY = 'FIELDING_ONLY',
    QUICK_START = 'QUICK_START',
    ADVANCED_TRAINING = 'ADVANCED_TRAINING'
}

export interface TutorialInstruction {
    stepId: TutorialStep;
    title: string;
    description: string;
    detailedInstructions: string[];
    objectives: TutorialObjective[];
    hints: string[];
    demoAvailable: boolean;
    skipAllowed: boolean;
    requiredToComplete: boolean;
    estimatedDuration: number; // seconds
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TutorialObjective {
    id: string;
    description: string;
    type: 'action' | 'achievement' | 'practice';
    target: number;
    current: number;
    completed: boolean;
    reward?: {
        experience: number;
        coins: number;
    };
}

export interface TutorialProgress {
    currentStep: TutorialStep;
    completedSteps: Set<TutorialStep>;
    skippedSteps: Set<TutorialStep>;
    totalStepsCompleted: number;
    totalTimeSpent: number; // seconds
    objectivesCompleted: number;
    hintsUsed: number;
    demosWatched: number;
    completionPercentage: number;
}

export interface TrainingDrill {
    drillId: string;
    name: string;
    category: 'batting' | 'pitching' | 'fielding' | 'baserunning';
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    duration: number; // seconds
    objectives: TutorialObjective[];
    scoringSystem: {
        pointsPerSuccess: number;
        bonusForPerfect: number;
        timeBonus: boolean;
        comboMultiplier: boolean;
    };
    leaderboard: boolean;
}

export interface DrillResult {
    drillId: string;
    score: number;
    successRate: number;
    perfectCount: number;
    timeCompleted: number;
    rank?: number;
    personalBest: boolean;
    newUnlock?: string;
}

export interface HintSystem {
    hintsAvailable: Map<string, Hint>;
    hintsShown: Set<string>;
    hintCooldown: number; // seconds
    lastHintTime: number;
    autoHintEnabled: boolean;
    hintThreshold: number; // Show hint after X failures
}

export interface Hint {
    hintId: string;
    context: string;
    message: string;
    priority: number;
    visual: boolean;
    audioClip?: string;
    repeatAfter?: number; // seconds
}

export interface TutorialUIElement {
    elementId: string;
    type: 'arrow' | 'highlight' | 'popup' | 'overlay' | 'animation';
    position: { x: number; y: number };
    target?: string; // Element to point at
    content: string;
    duration?: number;
    dismissible: boolean;
}

/**
 * Comprehensive Tutorial System
 */
export class TutorialSystem {
    private currentMode: TutorialMode = TutorialMode.FULL_TUTORIAL;
    private tutorialProgress: TutorialProgress;
    private tutorialSteps: Map<TutorialStep, TutorialInstruction> = new Map();

    // Training drills
    private availableDrills: Map<string, TrainingDrill> = new Map();
    private drillResults: Map<string, DrillResult[]> = new Map();
    private activeDrill: TrainingDrill | null = null;

    // Hint system
    private hintSystem: HintSystem;

    // Tutorial state
    private isTutorialActive: boolean = false;
    private isPaused: boolean = false;
    private currentObjectives: TutorialObjective[] = [];
    private failureCount: number = 0;

    // UI elements
    private activeUIElements: TutorialUIElement[] = [];

    // Performance tracking
    private performanceMetrics: {
        battingAccuracy: number;
        pitchingAccuracy: number;
        fieldingSuccess: number;
        reactionTime: number;
    };

    constructor() {
        // Initialize tutorial progress
        this.tutorialProgress = {
            currentStep: TutorialStep.WELCOME,
            completedSteps: new Set(),
            skippedSteps: new Set(),
            totalStepsCompleted: 0,
            totalTimeSpent: 0,
            objectivesCompleted: 0,
            hintsUsed: 0,
            demosWatched: 0,
            completionPercentage: 0
        };

        // Initialize hint system
        this.hintSystem = {
            hintsAvailable: new Map(),
            hintsShown: new Set(),
            hintCooldown: 10,
            lastHintTime: 0,
            autoHintEnabled: true,
            hintThreshold: 3
        };

        // Initialize performance metrics
        this.performanceMetrics = {
            battingAccuracy: 0,
            pitchingAccuracy: 0,
            fieldingSuccess: 0,
            reactionTime: 0
        };

        // Initialize all tutorial steps
        this.initializeTutorialSteps();

        // Initialize training drills
        this.initializeTrainingDrills();

        // Initialize hints
        this.initializeHints();
    }

    /**
     * Initialize all tutorial steps with detailed instructions
     */
    private initializeTutorialSteps(): void {
        // Welcome step
        this.tutorialSteps.set(TutorialStep.WELCOME, {
            stepId: TutorialStep.WELCOME,
            title: 'Welcome to Sandlot Sluggers!',
            description: 'Learn the basics of baseball and become a champion',
            detailedInstructions: [
                'Welcome to Sandlot Sluggers, the ultimate backyard baseball game!',
                'In this tutorial, you\'ll learn everything you need to become a star player.',
                'We\'ll cover batting, pitching, fielding, and base running.',
                'Complete objectives to earn rewards and unlock new content.',
                'You can skip steps if you\'re already familiar with the basics.',
                'Let\'s play ball!'
            ],
            objectives: [
                {
                    id: 'welcome_complete',
                    description: 'Continue to batting basics',
                    type: 'action',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 10, coins: 50 }
                }
            ],
            hints: [
                'Take your time to learn each skill',
                'Don\'t worry about making mistakes - that\'s how you learn!',
                'You can always replay tutorial steps from the menu'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: false,
            estimatedDuration: 30,
            difficulty: 'beginner'
        });

        // Batting basics
        this.tutorialSteps.set(TutorialStep.BATTING_BASICS, {
            stepId: TutorialStep.BATTING_BASICS,
            title: 'Batting Basics',
            description: 'Learn how to hit the ball',
            detailedInstructions: [
                'Batting is all about timing!',
                'Watch the pitcher wind up and release the ball.',
                'When the ball enters the strike zone, click or tap to swing.',
                'The goal is to make contact with the ball in the sweet spot.',
                'Perfect timing = perfect contact = big hits!',
                'Early or late swings result in weak contact or misses.',
                'Pay attention to the ball speed - faster pitches require quicker reactions.',
                'The strike zone is the area between your knees and chest, over home plate.',
                'Swinging at balls outside the strike zone makes it harder to get good contact.'
            ],
            objectives: [
                {
                    id: 'swing_practice',
                    description: 'Take 5 practice swings',
                    type: 'practice',
                    target: 5,
                    current: 0,
                    completed: false
                },
                {
                    id: 'make_contact',
                    description: 'Make contact with 3 pitches',
                    type: 'achievement',
                    target: 3,
                    current: 0,
                    completed: false,
                    reward: { experience: 25, coins: 100 }
                },
                {
                    id: 'get_hit',
                    description: 'Get your first hit',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 50, coins: 200 }
                }
            ],
            hints: [
                'Watch the ball leave the pitcher\'s hand',
                'Don\'t swing too early - wait for the ball to get closer',
                'Listen for the audio cues to help with timing',
                'The ball appears to slow down when it\'s in your hitting zone'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: true,
            estimatedDuration: 120,
            difficulty: 'beginner'
        });

        // Timing practice
        this.tutorialSteps.set(TutorialStep.TIMING_PRACTICE, {
            stepId: TutorialStep.TIMING_PRACTICE,
            title: 'Perfecting Your Timing',
            description: 'Master the art of perfect contact',
            detailedInstructions: [
                'Now let\'s work on timing precision.',
                'Perfect timing occurs when you swing exactly as the ball reaches the plate.',
                'There\'s a small timing window (about 50 milliseconds) for perfect contact.',
                'Solid contact has a slightly larger window.',
                'The timing indicator will show you how close you were.',
                'Green = Perfect, Yellow = Solid, Orange = Decent, Red = Weak',
                'Practice makes perfect - the more you practice, the better your timing becomes.',
                'Different pitch speeds require different timing adjustments.',
                'Fast pitches require earlier swings, slow pitches require patience.'
            ],
            objectives: [
                {
                    id: 'solid_contacts',
                    description: 'Get 5 solid or better contacts',
                    type: 'achievement',
                    target: 5,
                    current: 0,
                    completed: false,
                    reward: { experience: 40, coins: 150 }
                },
                {
                    id: 'perfect_contacts',
                    description: 'Get 2 perfect contacts',
                    type: 'achievement',
                    target: 2,
                    current: 0,
                    completed: false,
                    reward: { experience: 75, coins: 300 }
                }
            ],
            hints: [
                'Focus on the ball, not the pitcher',
                'Try to maintain a consistent rhythm',
                'If you\'re consistently early or late, adjust your timing',
                'Use practice mode to work on specific pitch speeds'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: true,
            estimatedDuration: 180,
            difficulty: 'beginner'
        });

        // Pitch recognition
        this.tutorialSteps.set(TutorialStep.PITCH_RECOGNITION, {
            stepId: TutorialStep.PITCH_RECOGNITION,
            title: 'Reading Pitches',
            description: 'Learn to identify different pitch types',
            detailedInstructions: [
                'Baseball has many different pitch types, each with unique movement.',
                'Fastballs: Fast and straight - easiest to hit but challenging timing',
                'Curveballs: Big downward break - wait for it to drop',
                'Sliders: Late horizontal break - very deceptive',
                'Changeups: Looks like fastball but slower - tests your patience',
                'Watch the pitcher\'s release point and the ball\'s initial trajectory.',
                'Spin on the ball gives clues about pitch type.',
                'Good hitters learn to recognize pitches early and adjust.',
                'Don\'t be afraid to take a pitch - not every pitch is hittable!',
                'Balls outside the strike zone are called "balls" - 4 balls = walk'
            ],
            objectives: [
                {
                    id: 'identify_fastball',
                    description: 'Correctly identify 3 fastballs',
                    type: 'achievement',
                    target: 3,
                    current: 0,
                    completed: false
                },
                {
                    id: 'identify_curveball',
                    description: 'Correctly identify 3 curveballs',
                    type: 'achievement',
                    target: 3,
                    current: 0,
                    completed: false
                },
                {
                    id: 'take_ball',
                    description: 'Let a ball outside strike zone pass (don\'t swing)',
                    type: 'achievement',
                    target: 2,
                    current: 0,
                    completed: false,
                    reward: { experience: 60, coins: 250 }
                }
            ],
            hints: [
                'Fastballs come in straight and fast',
                'Curveballs have visible topspin and drop',
                'Changeups look like fastballs but arrive later',
                'It\'s better to take a close pitch than chase a bad one'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: true,
            estimatedDuration: 240,
            difficulty: 'intermediate'
        });

        // Power vs Contact
        this.tutorialSteps.set(TutorialStep.POWER_VS_CONTACT, {
            stepId: TutorialStep.POWER_VS_CONTACT,
            title: 'Power vs Contact Swings',
            description: 'Learn different swing types',
            detailedInstructions: [
                'There are two main swing approaches: Power and Contact.',
                'POWER SWING: Hold down power button while swinging',
                '  - Higher exit velocity and launch angle',
                '  - Can hit home runs more easily',
                '  - Smaller timing window (harder to make contact)',
                '  - Higher risk, higher reward',
                'CONTACT SWING: Normal swing',
                '  - Larger timing window',
                '  - More consistent contact',
                '  - Lower power but better average',
                '  - Better for two-strike counts',
                'Choose your swing type based on the situation:',
                '  - Ahead in count (1-0, 2-0, 3-1): Good time for power',
                '  - Behind in count (0-2, 1-2): Focus on contact',
                '  - Runners in scoring position: Balance power and contact',
                'Mix up your approach to keep pitchers guessing!'
            ],
            objectives: [
                {
                    id: 'power_swings',
                    description: 'Take 5 power swings',
                    type: 'practice',
                    target: 5,
                    current: 0,
                    completed: false
                },
                {
                    id: 'contact_swings',
                    description: 'Take 5 contact swings',
                    type: 'practice',
                    target: 5,
                    current: 0,
                    completed: false
                },
                {
                    id: 'hit_homer',
                    description: 'Hit a home run with power swing',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 100, coins: 500 }
                }
            ],
            hints: [
                'Power swings work best on pitches in your sweet spot',
                'Use contact swings when behind in the count',
                'Don\'t always swing for the fences - singles win games too',
                'Practice both to become a complete hitter'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: false,
            estimatedDuration: 180,
            difficulty: 'intermediate'
        });

        // Pitching basics
        this.tutorialSteps.set(TutorialStep.PITCHING_BASICS, {
            stepId: TutorialStep.PITCHING_BASICS,
            title: 'Pitching Fundamentals',
            description: 'Learn how to pitch effectively',
            detailedInstructions: [
                'Good pitching is about control and deception.',
                'TO PITCH: Select pitch type, aim at target, throw!',
                'Your goal is to get batters out through strikeouts or weak contact.',
                'STRIKES: Pitches in the strike zone or swung at',
                'BALLS: Pitches outside strike zone (not swung at)',
                '3 strikes = strikeout (out)',
                '4 balls = walk (batter goes to first base)',
                'Vary your pitch locations - don\'t be predictable!',
                'Work the corners of the strike zone for tougher decisions.',
                'Sometimes it\'s okay to throw a ball to set up the next pitch.',
                'Watch the batter\'s timing and adjust your strategy.'
            ],
            objectives: [
                {
                    id: 'throw_strikes',
                    description: 'Throw 5 strikes',
                    type: 'practice',
                    target: 5,
                    current: 0,
                    completed: false
                },
                {
                    id: 'get_strikeout',
                    description: 'Get your first strikeout',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 50, coins: 200 }
                },
                {
                    id: 'no_walks',
                    description: 'Complete at-bat without walking batter',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 30, coins: 100 }
                }
            ],
            hints: [
                'Aim for the corners of the strike zone',
                'Mix up high and low pitches',
                'Don\'t throw too many balls - keep it near the zone',
                'Watch the count - adjust strategy based on balls and strikes'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: true,
            estimatedDuration: 150,
            difficulty: 'beginner'
        });

        // Pitch selection
        this.tutorialSteps.set(TutorialStep.PITCH_SELECTION, {
            stepId: TutorialStep.PITCH_SELECTION,
            title: 'Strategic Pitch Selection',
            description: 'Learn which pitches to throw in different situations',
            detailedInstructions: [
                'Different situations call for different pitches.',
                'COUNT MATTERS:',
                '  - Ahead in count (0-2, 1-2): Throw breaking balls or waste pitches',
                '  - Behind in count (2-0, 3-1): Challenge with fastball in zone',
                '  - Even count (1-1, 2-2): Mix it up, be unpredictable',
                'BATTER TENDENCIES:',
                '  - Power hitters: Keep ball low and away',
                '  - Contact hitters: Challenge inside with fastballs',
                '  - Patient hitters: Attack strike zone early',
                '  - Aggressive hitters: Tempt with pitches just outside zone',
                'PITCH SEQUENCING:',
                '  - Fastball → Changeup: Speed difference is effective',
                '  - High fastball → Low curve: Location change works well',
                '  - Outside slider → Inside fastball: Keeps batter off balance',
                'Never throw same pitch type and location twice in row!',
                'Study what pitches get each batter out and remember it.'
            ],
            objectives: [
                {
                    id: 'use_different_pitches',
                    description: 'Throw 3 different pitch types in one at-bat',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false
                },
                {
                    id: 'strikeout_breaking',
                    description: 'Get strikeout with breaking ball',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 75, coins: 300 }
                },
                {
                    id: 'perfect_sequence',
                    description: 'Get 3 strikeouts in a row',
                    type: 'achievement',
                    target: 3,
                    current: 0,
                    completed: false,
                    reward: { experience: 150, coins: 600 }
                }
            ],
            hints: [
                'Fastballs set up off-speed pitches',
                'Breaking balls are most effective with 2 strikes',
                'Don\'t be afraid to throw a ball to set up the next pitch',
                'Keep batters guessing - unpredictability is key'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: false,
            estimatedDuration: 200,
            difficulty: 'intermediate'
        });

        // Pitch location
        this.tutorialSteps.set(TutorialStep.PITCH_LOCATION, {
            stepId: TutorialStep.PITCH_LOCATION,
            title: 'Pinpoint Control',
            description: 'Master pitch location',
            detailedInstructions: [
                'Location is more important than pitch type!',
                'THE STRIKE ZONE has 9 main areas:',
                '  HIGH: Inside, Middle, Outside',
                '  MIDDLE: Inside, Middle (heart), Outside',
                '  LOW: Inside, Middle, Outside',
                'PITCHING PHILOSOPHY:',
                '  - Corners are best: Low-outside and high-inside corners are hardest to hit',
                '  - Middle-middle is danger zone: Easy home run territory',
                '  - Just outside zone: Can induce swings at bad pitches',
                '  - Low strikes: Hard to lift, results in ground balls',
                '  - High strikes: Can get pop-ups but risky',
                'ADVANCED CONCEPTS:',
                '  - Backdoor slider: Starts outside, breaks to corner',
                '  - Front door curve: Starts inside, breaks to corner',
                '  - Elevated fastball: High heat can overpower hitters',
                '  - Buried breaking ball: Low pitch that drops more',
                'Practice hitting your spots consistently!'
            ],
            objectives: [
                {
                    id: 'corner_pitches',
                    description: 'Hit corner of strike zone 5 times',
                    type: 'achievement',
                    target: 5,
                    current: 0,
                    completed: false,
                    reward: { experience: 60, coins: 250 }
                },
                {
                    id: 'no_middle',
                    description: 'Complete inning without throwing pitch middle-middle',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 80, coins: 350 }
                },
                {
                    id: 'perfect_location',
                    description: 'Hit exact target location 3 times',
                    type: 'achievement',
                    target: 3,
                    current: 0,
                    completed: false,
                    reward: { experience: 100, coins: 500 }
                }
            ],
            hints: [
                'Take your time aiming - accuracy over speed',
                'Account for pitch movement when aiming',
                'Low and away is the safest location',
                'Avoid the heart of the plate'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: false,
            estimatedDuration: 180,
            difficulty: 'advanced'
        });

        // Continue with more tutorial steps...
        // Fielding basics
        this.tutorialSteps.set(TutorialStep.FIELDING_BASICS, {
            stepId: TutorialStep.FIELDING_BASICS,
            title: 'Fielding Fundamentals',
            description: 'Learn to catch and throw',
            detailedInstructions: [
                'Defense wins championships!',
                'CATCHING:',
                '  - Position yourself under the ball',
                '  - Watch the ball all the way into your glove',
                '  - Use two hands when possible for security',
                '  - Dive if necessary for balls just out of reach',
                'THROWING:',
                '  - Get rid of the ball quickly',
                '  - Aim for the base where play is being made',
                '  - Throw accuracy is more important than arm strength',
                '  - Lead the receiver if they\'re moving',
                'POSITIONING:',
                '  - Anticipate where ball will be hit',
                '  - Take good angles to cut off balls',
                '  - Back up other fielders',
                '  - Know the game situation and number of outs'
            ],
            objectives: [
                {
                    id: 'catch_flies',
                    description: 'Catch 5 fly balls',
                    type: 'achievement',
                    target: 5,
                    current: 0,
                    completed: false
                },
                {
                    id: 'catch_grounders',
                    description: 'Field 5 ground balls cleanly',
                    type: 'achievement',
                    target: 5,
                    current: 0,
                    completed: false
                },
                {
                    id: 'make_play',
                    description: 'Make successful throw to get out',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 50, coins: 200 }
                }
            ],
            hints: [
                'Get behind the ball when fielding',
                'Charge ground balls to reduce throw distance',
                'For fly balls, take a step back first',
                'Always know where you\'ll throw before catching'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: true,
            estimatedDuration: 180,
            difficulty: 'beginner'
        });

        // Add more detailed steps for base running, strategy, advanced techniques...
        this.addAdvancedTutorialSteps();
    }

    /**
     * Add advanced tutorial steps
     */
    private addAdvancedTutorialSteps(): void {
        // Advanced batting
        this.tutorialSteps.set(TutorialStep.ADVANCED_BATTING, {
            stepId: TutorialStep.ADVANCED_BATTING,
            title: 'Advanced Hitting Techniques',
            description: 'Master advanced batting strategies',
            detailedInstructions: [
                'SITUATIONAL HITTING:',
                '  - Runner on third, less than 2 outs: Hit fly ball to score run',
                '  - Runner on second: Hit to right side to advance runner',
                '  - Hit and run play: Make contact to protect runner',
                'APPROACH BY COUNT:',
                '  - 3-0 count: Take unless pitch is perfect',
                '  - 3-2 count: Protect plate, must swing at close pitches',
                '  - First pitch: Be aggressive if pitcher struggles with strikes',
                'READING THE DEFENSE:',
                '  - Shift on: Hit opposite way',
                '  - Drawn in infield: Try to hit over them',
                '  - No one covering base: Bunt that direction',
                'HOT AND COLD ZONES:',
                '  - Every player has strengths and weaknesses',
                '  - Learn your hot zones and look for pitches there',
                '  - Avoid swinging at pitches in your cold zones',
                'ADJUSTMENTS:',
                '  - If you\'re late: Start swing earlier',
                '  - If you\'re early: Wait longer',
                '  - Getting jammed: Step back in box',
                '  - Reaching: Move up in box'
            ],
            objectives: [
                {
                    id: 'situational_hit',
                    description: 'Get hit with runner in scoring position',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false
                },
                {
                    id: 'opposite_field',
                    description: 'Hit ball to opposite field',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false
                },
                {
                    id: 'work_count',
                    description: 'See at least 6 pitches in one at-bat',
                    type: 'achievement',
                    target: 1,
                    current: 0,
                    completed: false,
                    reward: { experience: 100, coins: 400 }
                }
            ],
            hints: [
                'Think about what the pitcher wants to do',
                'Adjust your approach based on game situation',
                'Sometimes a walk is as good as a hit',
                'Study pitcher patterns and exploit them'
            ],
            demoAvailable: true,
            skipAllowed: true,
            requiredToComplete: false,
            estimatedDuration: 300,
            difficulty: 'advanced'
        });

        // More advanced steps would go here...
    }

    /**
     * Initialize training drills
     */
    private initializeTrainingDrills(): void {
        // Batting drills
        this.availableDrills.set('timing_trainer', {
            drillId: 'timing_trainer',
            name: 'Timing Trainer',
            category: 'batting',
            description: 'Practice perfect timing on various pitch speeds',
            difficulty: 'medium',
            duration: 120,
            objectives: [
                {
                    id: 'perfect_10',
                    description: 'Get 10 perfect contacts',
                    type: 'achievement',
                    target: 10,
                    current: 0,
                    completed: false
                }
            ],
            scoringSystem: {
                pointsPerSuccess: 100,
                bonusForPerfect: 50,
                timeBonus: true,
                comboMultiplier: true
            },
            leaderboard: true
        });

        this.availableDrills.set('power_showcase', {
            drillId: 'power_showcase',
            name: 'Power Showcase',
            category: 'batting',
            description: 'Hit as many home runs as possible',
            difficulty: 'hard',
            duration: 180,
            objectives: [
                {
                    id: 'hit_homers',
                    description: 'Hit home runs',
                    type: 'achievement',
                    target: 10,
                    current: 0,
                    completed: false
                }
            ],
            scoringSystem: {
                pointsPerSuccess: 200,
                bonusForPerfect: 100,
                timeBonus: false,
                comboMultiplier: false
            },
            leaderboard: true
        });

        // Pitching drills
        this.availableDrills.set('control_master', {
            drillId: 'control_master',
            name: 'Control Master',
            category: 'pitching',
            description: 'Hit targets with pinpoint accuracy',
            difficulty: 'hard',
            duration: 120,
            objectives: [
                {
                    id: 'hit_targets',
                    description: 'Hit marked targets',
                    type: 'achievement',
                    target: 20,
                    current: 0,
                    completed: false
                }
            ],
            scoringSystem: {
                pointsPerSuccess: 150,
                bonusForPerfect: 75,
                timeBonus: true,
                comboMultiplier: true
            },
            leaderboard: true
        });

        // Fielding drills
        this.availableDrills.set('reaction_time', {
            drillId: 'reaction_time',
            name: 'Lightning Reflexes',
            category: 'fielding',
            description: 'Catch balls hit at random locations',
            difficulty: 'expert',
            duration: 90,
            objectives: [
                {
                    id: 'catch_all',
                    description: 'Catch consecutive balls without dropping',
                    type: 'achievement',
                    target: 15,
                    current: 0,
                    completed: false
                }
            ],
            scoringSystem: {
                pointsPerSuccess: 100,
                bonusForPerfect: 100,
                timeBonus: true,
                comboMultiplier: true
            },
            leaderboard: true
        });

        // Add many more drills...
    }

    /**
     * Initialize contextual hints
     */
    private initializeHints(): void {
        // Batting hints
        this.hintSystem.hintsAvailable.set('late_timing', {
            hintId: 'late_timing',
            context: 'batting_timing',
            message: 'You\'re swinging late! Try starting your swing earlier when you see the pitch release.',
            priority: 8,
            visual: true
        });

        this.hintSystem.hintsAvailable.set('early_timing', {
            hintId: 'early_timing',
            context: 'batting_timing',
            message: 'You\'re swinging too early! Wait a bit longer for the ball to reach the plate.',
            priority: 8,
            visual: true
        });

        this.hintSystem.hintsAvailable.set('chase_pitches', {
            hintId: 'chase_pitches',
            context: 'batting_discipline',
            message: 'You\'re chasing pitches outside the zone! Be more patient and wait for strikes.',
            priority: 7,
            visual: true
        });

        // Pitching hints
        this.hintSystem.hintsAvailable.set('too_predictable', {
            hintId: 'too_predictable',
            context: 'pitching_strategy',
            message: 'Mix up your pitches! You\'re throwing the same pitch too often.',
            priority: 6,
            visual: false
        });

        this.hintSystem.hintsAvailable.set('missing_spots', {
            hintId: 'missing_spots',
            context: 'pitching_control',
            message: 'Focus on your aim! Try to hit the corners of the strike zone more consistently.',
            priority: 7,
            visual: true
        });

        // Fielding hints
        this.hintSystem.hintsAvailable.set('late_reaction', {
            hintId: 'late_reaction',
            context: 'fielding_reaction',
            message: 'React faster! Start moving as soon as the ball is hit.',
            priority: 8,
            visual: false
        });

        this.hintSystem.hintsAvailable.set('bad_route', {
            hintId: 'bad_route',
            context: 'fielding_positioning',
            message: 'Take better angles! Try to get in front of the ball.',
            priority: 6,
            visual: true
        });
    }

    /**
     * Start tutorial
     */
    public startTutorial(mode: TutorialMode = TutorialMode.FULL_TUTORIAL): void {
        this.currentMode = mode;
        this.isTutorialActive = true;
        this.isPaused = false;

        // Set starting step based on mode
        switch (mode) {
            case TutorialMode.BATTING_ONLY:
                this.tutorialProgress.currentStep = TutorialStep.BATTING_BASICS;
                break;
            case TutorialMode.PITCHING_ONLY:
                this.tutorialProgress.currentStep = TutorialStep.PITCHING_BASICS;
                break;
            case TutorialMode.FIELDING_ONLY:
                this.tutorialProgress.currentStep = TutorialStep.FIELDING_BASICS;
                break;
            case TutorialMode.QUICK_START:
                this.tutorialProgress.currentStep = TutorialStep.BATTING_BASICS;
                break;
            default:
                this.tutorialProgress.currentStep = TutorialStep.WELCOME;
        }

        this.loadStep(this.tutorialProgress.currentStep);
        console.log(`Tutorial started: ${mode}`);
    }

    /**
     * Load specific tutorial step
     */
    private loadStep(step: TutorialStep): void {
        const instruction = this.tutorialSteps.get(step);
        if (!instruction) return;

        this.currentObjectives = [...instruction.objectives];
        this.failureCount = 0;

        // Show tutorial UI for this step
        this.displayTutorialUI(instruction);

        console.log(`Loaded tutorial step: ${instruction.title}`);
    }

    /**
     * Display tutorial UI elements
     */
    private displayTutorialUI(instruction: TutorialInstruction): void {
        this.activeUIElements = [];

        // Create title popup
        this.activeUIElements.push({
            elementId: 'title',
            type: 'popup',
            position: { x: 50, y: 10 },
            content: instruction.title,
            duration: 3000,
            dismissible: false
        });

        // Create instruction overlay
        this.activeUIElements.push({
            elementId: 'instructions',
            type: 'overlay',
            position: { x: 10, y: 30 },
            content: instruction.description,
            dismissible: true
        });

        // Add objective indicators
        instruction.objectives.forEach((obj, index) => {
            this.activeUIElements.push({
                elementId: `objective_${index}`,
                type: 'popup',
                position: { x: 10, y: 50 + (index * 10) },
                content: `${obj.description} (${obj.current}/${obj.target})`,
                dismissible: false
            });
        });
    }

    /**
     * Update objective progress
     */
    public updateObjective(objectiveId: string, progress: number = 1): boolean {
        const objective = this.currentObjectives.find(o => o.id === objectiveId);
        if (!objective || objective.completed) return false;

        objective.current += progress;

        if (objective.current >= objective.target) {
            objective.completed = true;
            this.tutorialProgress.objectivesCompleted++;

            // Award rewards
            if (objective.reward) {
                console.log(`Objective completed! +${objective.reward.experience} XP, +${objective.reward.coins} coins`);
            }

            // Check if all objectives complete
            if (this.currentObjectives.every(o => o.completed)) {
                this.completeCurrentStep();
            }

            return true;
        }

        return false;
    }

    /**
     * Complete current tutorial step
     */
    private completeCurrentStep(): void {
        this.tutorialProgress.completedSteps.add(this.tutorialProgress.currentStep);
        this.tutorialProgress.totalStepsCompleted++;

        // Calculate completion percentage
        const totalSteps = this.tutorialSteps.size;
        this.tutorialProgress.completionPercentage =
            (this.tutorialProgress.completedSteps.size / totalSteps) * 100;

        // Move to next step
        const nextStep = this.getNextStep();

        if (nextStep) {
            this.tutorialProgress.currentStep = nextStep;
            this.loadStep(nextStep);
        } else {
            this.completeTutorial();
        }
    }

    /**
     * Get next tutorial step
     */
    private getNextStep(): TutorialStep | null {
        const allSteps = Object.values(TutorialStep);
        const currentIndex = allSteps.indexOf(this.tutorialProgress.currentStep);

        if (currentIndex < allSteps.length - 1) {
            return allSteps[currentIndex + 1];
        }

        return null;
    }

    /**
     * Skip current step
     */
    public skipCurrentStep(): void {
        const instruction = this.tutorialSteps.get(this.tutorialProgress.currentStep);

        if (!instruction || !instruction.skipAllowed) {
            console.log('This step cannot be skipped');
            return;
        }

        this.tutorialProgress.skippedSteps.add(this.tutorialProgress.currentStep);
        const nextStep = this.getNextStep();

        if (nextStep) {
            this.tutorialProgress.currentStep = nextStep;
            this.loadStep(nextStep);
        } else {
            this.completeTutorial();
        }
    }

    /**
     * Complete entire tutorial
     */
    private completeTutorial(): void {
        this.isTutorialActive = false;
        console.log('Tutorial completed!');
        console.log(`Completion: ${this.tutorialProgress.completionPercentage.toFixed(1)}%`);
        console.log(`Time spent: ${Math.floor(this.tutorialProgress.totalTimeSpent / 60)} minutes`);
    }

    /**
     * Show hint
     */
    public showHint(hintId: string): void {
        const hint = this.hintSystem.hintsAvailable.get(hintId);
        if (!hint) return;

        if (this.hintSystem.hintsShown.has(hintId)) {
            // Check if we should repeat
            if (!hint.repeatAfter) return;
        }

        // Check cooldown
        const currentTime = Date.now() / 1000;
        if (currentTime - this.hintSystem.lastHintTime < this.hintSystem.hintCooldown) {
            return;
        }

        // Show hint
        console.log(`HINT: ${hint.message}`);

        this.hintSystem.hintsShown.add(hintId);
        this.hintSystem.lastHintTime = currentTime;
        this.tutorialProgress.hintsUsed++;

        // Display visual hint if needed
        if (hint.visual) {
            this.displayVisualHint(hint);
        }
    }

    /**
     * Display visual hint
     */
    private displayVisualHint(hint: Hint): void {
        this.activeUIElements.push({
            elementId: `hint_${hint.hintId}`,
            type: 'popup',
            position: { x: 50, y: 80 },
            content: hint.message,
            duration: 5000,
            dismissible: true
        });
    }

    /**
     * Record failure and maybe show hint
     */
    public recordFailure(context: string): void {
        this.failureCount++;

        if (this.hintSystem.autoHintEnabled &&
            this.failureCount >= this.hintSystem.hintThreshold) {
            // Find relevant hint for context
            for (const [hintId, hint] of this.hintSystem.hintsAvailable.entries()) {
                if (hint.context === context) {
                    this.showHint(hintId);
                    this.failureCount = 0;
                    break;
                }
            }
        }
    }

    /**
     * Start training drill
     */
    public startDrill(drillId: string): TrainingDrill | null {
        const drill = this.availableDrills.get(drillId);
        if (!drill) return null;

        this.activeDrill = drill;
        console.log(`Starting drill: ${drill.name}`);

        return drill;
    }

    /**
     * Complete drill and record results
     */
    public completeDrill(drillId: string, score: number, successRate: number, perfectCount: number): DrillResult {
        const drill = this.availableDrills.get(drillId);
        if (!drill) {
            throw new Error(`Drill ${drillId} not found`);
        }

        // Get existing results
        const previousResults = this.drillResults.get(drillId) || [];

        // Check for personal best
        const personalBest = previousResults.length === 0 ||
            score > Math.max(...previousResults.map(r => r.score));

        const result: DrillResult = {
            drillId,
            score,
            successRate,
            perfectCount,
            timeCompleted: Date.now(),
            personalBest
        };

        // Store result
        previousResults.push(result);
        this.drillResults.set(drillId, previousResults);

        // Calculate rank if leaderboard enabled
        if (drill.leaderboard) {
            // Would fetch from server in real implementation
            result.rank = 1;
        }

        this.activeDrill = null;

        return result;
    }

    /**
     * Get tutorial progress
     */
    public getProgress(): TutorialProgress {
        return { ...this.tutorialProgress };
    }

    /**
     * Get available drills
     */
    public getAvailableDrills(category?: string): TrainingDrill[] {
        const drills = Array.from(this.availableDrills.values());

        if (category) {
            return drills.filter(d => d.category === category);
        }

        return drills;
    }

    /**
     * Get drill results
     */
    public getDrillResults(drillId: string): DrillResult[] {
        return this.drillResults.get(drillId) || [];
    }

    /**
     * Pause tutorial
     */
    public pauseTutorial(): void {
        this.isPaused = true;
    }

    /**
     * Resume tutorial
     */
    public resumeTutorial(): void {
        this.isPaused = false;
    }

    /**
     * Is tutorial active
     */
    public isTutorialRunning(): boolean {
        return this.isTutorialActive && !this.isPaused;
    }

    /**
     * Exit tutorial
     */
    public exitTutorial(): void {
        this.isTutorialActive = false;
        this.activeDrill = null;
        this.activeUIElements = [];
    }

    /**
     * Reset tutorial progress
     */
    public resetProgress(): void {
        this.tutorialProgress = {
            currentStep: TutorialStep.WELCOME,
            completedSteps: new Set(),
            skippedSteps: new Set(),
            totalStepsCompleted: 0,
            totalTimeSpent: 0,
            objectivesCompleted: 0,
            hintsUsed: 0,
            demosWatched: 0,
            completionPercentage: 0
        };

        this.hintSystem.hintsShown.clear();
        this.failureCount = 0;
    }

    /**
     * Dispose tutorial system
     */
    public dispose(): void {
        this.exitTutorial();
        this.tutorialSteps.clear();
        this.availableDrills.clear();
        this.drillResults.clear();
        this.hintSystem.hintsAvailable.clear();
    }
}
