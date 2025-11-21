/**
 * Comprehensive Commentary and Announcer System for Sandlot Sluggers
 * Provides dynamic play-by-play commentary and color analysis
 *
 * Features:
 * - Multiple announcer voices and personalities
 * - Context-aware play-by-play commentary
 * - Color commentary and analysis
 * - Historical statistics integration
 * - Dynamic dialogue selection based on game state
 * - Emotional responses to game events
 * - Player-specific commentary and nicknames
 * - Team rivalry recognition
 * - Situational awareness (close game, blowout, etc.)
 * - Streak and milestone recognition
 * - Weather commentary
 * - Pre-game and post-game analysis
 * - Between-innings entertainment
 * - Crowd chants integration
 * - Multiple language support
 */

import { Observable } from '@babylonjs/core/Misc/observable';

export enum CommentaryType {
    PLAY_BY_PLAY = 'play_by_play',
    COLOR_COMMENTARY = 'color_commentary',
    ANALYSIS = 'analysis',
    ANECDOTE = 'anecdote',
    STATISTIC = 'statistic',
    PREDICTION = 'prediction',
    REACTION = 'reaction'
}

export enum GameEvent {
    PITCH = 'pitch',
    STRIKE = 'strike',
    BALL = 'ball',
    FOUL = 'foul',
    HIT = 'hit',
    SINGLE = 'single',
    DOUBLE = 'double',
    TRIPLE = 'triple',
    HOME_RUN = 'home_run',
    GRAND_SLAM = 'grand_slam',
    STRIKEOUT = 'strikeout',
    WALK = 'walk',
    HIT_BY_PITCH = 'hit_by_pitch',
    OUT = 'out',
    DOUBLE_PLAY = 'double_play',
    TRIPLE_PLAY = 'triple_play',
    STOLEN_BASE = 'stolen_base',
    CAUGHT_STEALING = 'caught_stealing',
    ERROR = 'error',
    GREAT_CATCH = 'great_catch',
    DIVING_CATCH = 'diving_catch',
    INNING_START = 'inning_start',
    INNING_END = 'inning_end',
    GAME_START = 'game_start',
    GAME_END = 'game_end',
    PITCHING_CHANGE = 'pitching_change',
    SUBSTITUTION = 'substitution',
    INJURY = 'injury',
    EJECTION = 'ejection',
    MANAGER_VISIT = 'manager_visit',
    REVIEW = 'review',
    RAIN_DELAY = 'rain_delay'
}

export enum CommentatorPersonality {
    ENTHUSIASTIC = 'enthusiastic',
    ANALYTICAL = 'analytical',
    VETERAN = 'veteran',
    HUMOROUS = 'humorous',
    TECHNICAL = 'technical',
    STORYTELLER = 'storyteller',
    HOMER = 'homer', // Biased toward home team
    PROFESSIONAL = 'professional'
}

export enum EmotionalTone {
    EXCITED = 'excited',
    CALM = 'calm',
    TENSE = 'tense',
    DISAPPOINTED = 'disappointed',
    SURPRISED = 'surprised',
    HUMOROUS = 'humorous',
    SERIOUS = 'serious',
    NOSTALGIC = 'nostalgic'
}

export interface Commentator {
    id: string;
    name: string;
    role: 'play_by_play' | 'color_analyst' | 'sideline_reporter';
    personality: CommentatorPersonality;
    voiceId: string;
    catchphrases: string[];
    favoriteTopics: string[];
    speakingRate: number; // 0.5 - 2.0
    pitch: number; // 0.5 - 2.0
    volume: number; // 0.0 - 1.0
}

export interface CommentaryLine {
    id: string;
    text: string;
    type: CommentaryType;
    event: GameEvent;
    conditions: CommentaryConditions;
    priority: number;
    cooldown: number; // milliseconds before can be used again
    lastUsed: number;
    variations: string[];
    tags: string[];
}

export interface CommentaryConditions {
    minInning?: number;
    maxInning?: number;
    scoreMarginMin?: number;
    scoreMarginMax?: number;
    outs?: number[];
    strikes?: number[];
    balls?: number[];
    runnersOn?: ('first' | 'second' | 'third')[];
    playerStreak?: number;
    playerStats?: {
        statName: string;
        minValue?: number;
        maxValue?: number;
    };
    teamStats?: {
        statName: string;
        minValue?: number;
        maxValue?: number;
    };
    weather?: string[];
    timeOfDay?: ('day' | 'night')[];
    isRivalry?: boolean;
    isPlayoffs?: boolean;
    isCloseGame?: boolean;
}

export interface CommentaryContext {
    currentInning: number;
    inningHalf: 'top' | 'bottom';
    outs: number;
    strikes: number;
    balls: number;
    homeScore: number;
    awayScore: number;
    runnersOn: {
        first: boolean;
        second: boolean;
        third: boolean;
    };
    currentBatter: string;
    currentPitcher: string;
    lastEvent: GameEvent | null;
    recentEvents: GameEvent[];
    gameStartTime: Date;
    weather: string;
    timeOfDay: 'day' | 'night';
    isPlayoffs: boolean;
    isRivalry: boolean;
    homeTeam: string;
    awayTeam: string;
}

export interface CommentaryQueue {
    lines: QueuedCommentary[];
    isPaused: boolean;
    currentlyPlaying: QueuedCommentary | null;
}

export interface QueuedCommentary {
    line: CommentaryLine;
    commentator: Commentator;
    priority: number;
    timestamp: number;
    duration: number;
}

export interface AnecdoteData {
    id: string;
    topic: string;
    text: string;
    player?: string;
    team?: string;
    relatedEvent?: GameEvent;
    tags: string[];
}

export interface StatisticalComment {
    id: string;
    stat: string;
    value: number;
    comparison?: {
        type: 'league_average' | 'career_average' | 'historical' | 'opponent';
        value: number;
    };
    context: string;
    commentary: string[];
}

export class CommentarySystem {
    private commentators: Map<string, Commentator>;
    private commentaryLibrary: Map<GameEvent, CommentaryLine[]>;
    private anecdotes: Map<string, AnecdoteData>;
    private statisticalComments: Map<string, StatisticalComment[]>;
    private commentaryQueue: CommentaryQueue;
    private context: CommentaryContext | null;

    // Active commentators for the game
    private playByPlayCommentator: Commentator | null;
    private colorCommentator: Commentator | null;
    private sidelineReporter: Commentator | null;

    // Commentary settings
    private enabled: boolean;
    private volume: number;
    private frequency: number; // 0.0 - 1.0, how often to comment
    private allowRepetition: boolean;
    private maxQueueSize: number;
    private timeBetweenComments: number; // milliseconds

    // State tracking
    private lastCommentTime: number;
    private usedLines: Set<string>;
    private playerNicknames: Map<string, string[]>;
    private playerAnecdotes: Map<string, string[]>;

    // Observables for events
    public onCommentaryTriggered: Observable<QueuedCommentary>;
    public onCommentaryStarted: Observable<QueuedCommentary>;
    public onCommentaryEnded: Observable<string>;
    public onAnecdoteTold: Observable<AnecdoteData>;

    constructor() {
        this.commentators = new Map();
        this.commentaryLibrary = new Map();
        this.anecdotes = new Map();
        this.statisticalComments = new Map();
        this.commentaryQueue = {
            lines: [],
            isPaused: false,
            currentlyPlaying: null
        };
        this.context = null;

        this.playByPlayCommentator = null;
        this.colorCommentator = null;
        this.sidelineReporter = null;

        this.enabled = true;
        this.volume = 1.0;
        this.frequency = 0.8;
        this.allowRepetition = false;
        this.maxQueueSize = 10;
        this.timeBetweenComments = 2000;

        this.lastCommentTime = 0;
        this.usedLines = new Set();
        this.playerNicknames = new Map();
        this.playerAnecdotes = new Map();

        this.onCommentaryTriggered = new Observable();
        this.onCommentaryStarted = new Observable();
        this.onCommentaryEnded = new Observable();
        this.onAnecdoteTold = new Observable();

        this.initializeCommentators();
        this.initializeCommentaryLibrary();
        this.initializeAnecdotes();
    }

    private initializeCommentators(): void {
        // Play-by-play commentator 1
        this.addCommentator({
            id: 'pbp_mike',
            name: 'Mike Roberts',
            role: 'play_by_play',
            personality: CommentatorPersonality.ENTHUSIASTIC,
            voiceId: 'voice_male_1',
            catchphrases: [
                'And that\'s a base hit!',
                'He got all of that one!',
                'What a play!',
                'Going, going, gone!',
                'Strike three, you\'re out!'
            ],
            favoriteTopics: ['home_runs', 'great_plays', 'strikeouts'],
            speakingRate: 1.2,
            pitch: 1.0,
            volume: 1.0
        });

        // Color commentator 1
        this.addCommentator({
            id: 'color_joe',
            name: 'Joe Martinez',
            role: 'color_analyst',
            personality: CommentatorPersonality.ANALYTICAL,
            voiceId: 'voice_male_2',
            catchphrases: [
                'Let me tell you...',
                'From my experience...',
                'The key here is...',
                'That\'s textbook baseball right there'
            ],
            favoriteTopics: ['strategy', 'statistics', 'player_development'],
            speakingRate: 1.0,
            pitch: 0.9,
            volume: 0.9
        });

        // Play-by-play commentator 2
        this.addCommentator({
            id: 'pbp_sarah',
            name: 'Sarah Chen',
            role: 'play_by_play',
            personality: CommentatorPersonality.PROFESSIONAL,
            voiceId: 'voice_female_1',
            catchphrases: [
                'And there it goes!',
                'What a moment!',
                'Absolutely incredible!',
                'That\'s how you do it!'
            ],
            favoriteTopics: ['clutch_plays', 'comebacks', 'records'],
            speakingRate: 1.1,
            pitch: 1.2,
            volume: 1.0
        });

        // Color commentator 2
        this.addCommentator({
            id: 'color_tommy',
            name: 'Tommy Williams',
            role: 'color_analyst',
            personality: CommentatorPersonality.VETERAN,
            voiceId: 'voice_male_3',
            catchphrases: [
                'Back in my day...',
                'I\'ve seen this before...',
                'Let me tell you a story...',
                'The old-timers knew...'
            ],
            favoriteTopics: ['history', 'fundamentals', 'tradition'],
            speakingRate: 0.9,
            pitch: 0.8,
            volume: 0.95
        });

        // Sideline reporter
        this.addCommentator({
            id: 'sideline_alex',
            name: 'Alex Johnson',
            role: 'sideline_reporter',
            personality: CommentatorPersonality.PROFESSIONAL,
            voiceId: 'voice_female_2',
            catchphrases: [
                'I\'m here with...',
                'According to the coaching staff...',
                'The word from the dugout...',
                'We\'ve just learned...'
            ],
            favoriteTopics: ['injuries', 'substitutions', 'manager_strategy'],
            speakingRate: 1.0,
            pitch: 1.1,
            volume: 0.9
        });
    }

    private initializeCommentaryLibrary(): void {
        // Home run commentary
        this.addCommentaryLines(GameEvent.HOME_RUN, [
            {
                id: 'hr_01',
                text: 'That ball is CRUSHED! Deep to {direction}, and it is GONE!',
                type: CommentaryType.PLAY_BY_PLAY,
                event: GameEvent.HOME_RUN,
                conditions: {},
                priority: 10,
                cooldown: 0,
                lastUsed: 0,
                variations: [
                    'And that ball is absolutely DEMOLISHED! Way back, way back... and it\'s OUTTA HERE!',
                    'GOODBYE BASEBALL! That one is launched into the stratosphere!',
                    'He got every bit of that one! Watch it go, GONE!'
                ],
                tags: ['excited', 'high_energy']
            },
            {
                id: 'hr_02',
                text: '{player} has been hot lately, and he continues his tear with another home run!',
                type: CommentaryType.COLOR_COMMENTARY,
                event: GameEvent.HOME_RUN,
                conditions: { playerStreak: 3 },
                priority: 8,
                cooldown: 10000,
                lastUsed: 0,
                variations: [
                    '{player} is seeing the ball like a beach ball right now. That\'s his {streak}th home run in {games} games!',
                    'Talk about being in the zone! {player} is on fire with another long ball!'
                ],
                tags: ['analysis', 'streak']
            },
            {
                id: 'hr_03',
                text: 'GRAND SLAM! {player} clears the bases with one mighty swing!',
                type: CommentaryType.PLAY_BY_PLAY,
                event: GameEvent.GRAND_SLAM,
                conditions: { runnersOn: ['first', 'second', 'third'] },
                priority: 10,
                cooldown: 0,
                lastUsed: 0,
                variations: [
                    'BASES LOADED BLAST! A grand slam for {player}!',
                    'With the bases juiced, {player} delivers the BIG blow! GRAND SLAM!'
                ],
                tags: ['excited', 'clutch']
            }
        ]);

        // Strikeout commentary
        this.addCommentaryLines(GameEvent.STRIKEOUT, [
            {
                id: 'so_01',
                text: 'Strike three called! {batter} is sent back to the dugout looking!',
                type: CommentaryType.PLAY_BY_PLAY,
                event: GameEvent.STRIKEOUT,
                conditions: {},
                priority: 7,
                cooldown: 5000,
                lastUsed: 0,
                variations: [
                    'Caught looking! That\'s strike three!',
                    'Called strike three! {batter} didn\'t like that call!',
                    '{pitcher} paints the corner, strike three!'
                ],
                tags: ['strikeout']
            },
            {
                id: 'so_02',
                text: '{pitcher} is absolutely dealing tonight. That\'s {count} strikeouts!',
                type: CommentaryType.COLOR_COMMENTARY,
                event: GameEvent.STRIKEOUT,
                conditions: { playerStats: { statName: 'strikeouts', minValue: 5 } },
                priority: 8,
                cooldown: 30000,
                lastUsed: 0,
                variations: [
                    'Dominant performance from {pitcher} on the mound. {count} punch-outs and counting!',
                    '{pitcher} is in complete control. Another strikeout makes it {count}!'
                ],
                tags: ['analysis', 'dominant']
            }
        ]);

        // Great catch commentary
        this.addCommentaryLines(GameEvent.GREAT_CATCH, [
            {
                id: 'catch_01',
                text: 'WOW! What a catch by {fielder}! He just robbed a hit!',
                type: CommentaryType.PLAY_BY_PLAY,
                event: GameEvent.GREAT_CATCH,
                conditions: {},
                priority: 9,
                cooldown: 0,
                lastUsed: 0,
                variations: [
                    'SPECTACULAR! {fielder} makes an incredible play!',
                    'You have GOT to be kidding me! What a catch by {fielder}!',
                    'Oh my goodness! {fielder} with the play of the game!'
                ],
                tags: ['excited', 'defense']
            }
        ]);

        // Double play commentary
        this.addCommentaryLines(GameEvent.DOUBLE_PLAY, [
            {
                id: 'dp_01',
                text: 'Double play! They turn two to get out of the inning!',
                type: CommentaryType.PLAY_BY_PLAY,
                event: GameEvent.DOUBLE_PLAY,
                conditions: {},
                priority: 8,
                cooldown: 0,
                lastUsed: 0,
                variations: [
                    '6-4-3 double play! Just what the doctor ordered!',
                    'Around the horn! Beautiful double play!',
                    'Two for the price of one! Double play ball!'
                ],
                tags: ['defense', 'momentum']
            }
        ]);

        // Inning start commentary
        this.addCommentaryLines(GameEvent.INNING_START, [
            {
                id: 'inning_start_01',
                text: 'We\'re underway in the {inning} inning. {team} leading {score1} to {score2}.',
                type: CommentaryType.PLAY_BY_PLAY,
                event: GameEvent.INNING_START,
                conditions: {},
                priority: 6,
                cooldown: 0,
                lastUsed: 0,
                variations: [
                    'Top of the {inning}, here we go. {team} on top {score1} to {score2}.',
                    '{inning} inning action. {score1} to {score2}, {team} in front.'
                ],
                tags: ['transition']
            },
            {
                id: 'inning_start_02',
                text: 'Crucial inning coming up. This could decide the game.',
                type: CommentaryType.COLOR_COMMENTARY,
                event: GameEvent.INNING_START,
                conditions: { minInning: 7, isCloseGame: true },
                priority: 7,
                cooldown: 0,
                lastUsed: 0,
                variations: [
                    'This is where games are won and lost. Let\'s see who steps up.',
                    'Championship moments happen in innings like these.'
                ],
                tags: ['tension', 'analysis']
            }
        ]);

        // Game start commentary
        this.addCommentaryLines(GameEvent.GAME_START, [
            {
                id: 'game_start_01',
                text: 'Welcome to {stadium}! I\'m {commentator1}, alongside {commentator2}, and we\'ve got a great matchup today between the {team1} and the {team2}!',
                type: CommentaryType.PLAY_BY_PLAY,
                event: GameEvent.GAME_START,
                conditions: {},
                priority: 10,
                cooldown: 0,
                lastUsed: 0,
                variations: [
                    'Hello everyone and welcome! We\'re at {stadium} for an exciting game between {team1} and {team2}!',
                    'Good {timeofday} from {stadium}! The {team1} host the {team2} today!'
                ],
                tags: ['introduction']
            },
            {
                id: 'game_start_02',
                text: 'Beautiful day for baseball here at {stadium}. {weather} and {temperature} degrees.',
                type: CommentaryType.COLOR_COMMENTARY,
                event: GameEvent.GAME_START,
                conditions: {},
                priority: 7,
                cooldown: 0,
                lastUsed: 0,
                variations: [
                    'Perfect conditions today. {weather} skies, {temperature} degrees.',
                    'Can\'t ask for better weather. {weather} and {temperature}.'
                ],
                tags: ['weather', 'atmosphere']
            }
        ]);

        // Add more events and commentary...
    }

    private initializeAnecdotes(): void {
        this.addAnecdote({
            id: 'anecdote_001',
            topic: 'rookie_debut',
            text: 'You know, I remember {player}\'s first game in the majors. Everyone wondered if he could handle the pressure, but he stepped up to the plate and drove in the winning run.',
            player: '{player}',
            tags: ['history', 'debut', 'pressure']
        });

        this.addAnecdote({
            id: 'anecdote_002',
            topic: 'comeback',
            text: 'This reminds me of that incredible comeback back in 2019. Down by 7 runs in the 9th inning, they rallied to win it. Never count your team out!',
            relatedEvent: GameEvent.HIT,
            tags: ['history', 'comeback', 'inspiration']
        });

        this.addAnecdote({
            id: 'anecdote_003',
            topic: 'rivalry',
            text: 'These two teams have a storied rivalry going back decades. Some of the greatest games in baseball history have been between these clubs.',
            tags: ['rivalry', 'history', 'tradition']
        });

        // Add more anecdotes...
    }

    private addCommentator(commentator: Commentator): void {
        this.commentators.set(commentator.id, commentator);
    }

    private addCommentaryLines(event: GameEvent, lines: CommentaryLine[]): void {
        if (!this.commentaryLibrary.has(event)) {
            this.commentaryLibrary.set(event, []);
        }
        const eventLines = this.commentaryLibrary.get(event)!;
        eventLines.push(...lines);
    }

    private addAnecdote(anecdote: AnecdoteData): void {
        this.anecdotes.set(anecdote.id, anecdote);
    }

    public setCommentators(playByPlay: string, color: string, sideline?: string): void {
        this.playByPlayCommentator = this.commentators.get(playByPlay) || null;
        this.colorCommentator = this.commentators.get(color) || null;
        this.sidelineReporter = sideline ? this.commentators.get(sideline) || null : null;
    }

    public updateContext(context: Partial<CommentaryContext>): void {
        if (!this.context) {
            this.context = this.createDefaultContext();
        }
        Object.assign(this.context, context);
    }

    private createDefaultContext(): CommentaryContext {
        return {
            currentInning: 1,
            inningHalf: 'top',
            outs: 0,
            strikes: 0,
            balls: 0,
            homeScore: 0,
            awayScore: 0,
            runnersOn: { first: false, second: false, third: false },
            currentBatter: '',
            currentPitcher: '',
            lastEvent: null,
            recentEvents: [],
            gameStartTime: new Date(),
            weather: 'clear',
            timeOfDay: 'day',
            isPlayoffs: false,
            isRivalry: false,
            homeTeam: '',
            awayTeam: ''
        };
    }

    public triggerCommentary(event: GameEvent, data?: any): void {
        if (!this.enabled || !this.context) return;

        // Check if enough time has passed since last comment
        const now = Date.now();
        if (now - this.lastCommentTime < this.timeBetweenComments) {
            return;
        }

        // Random frequency check
        if (Math.random() > this.frequency) {
            return;
        }

        // Find suitable commentary lines
        const lines = this.findSuitableCommentary(event);
        if (lines.length === 0) return;

        // Select best line based on priority and conditions
        const selectedLine = this.selectBestLine(lines);
        if (!selectedLine) return;

        // Determine which commentator should say it
        const commentator = this.selectCommentator(selectedLine.type);
        if (!commentator) return;

        // Process the commentary text with data
        const processedText = this.processCommentaryText(selectedLine.text, data);

        // Create queued commentary
        const queuedCommentary: QueuedCommentary = {
            line: selectedLine,
            commentator,
            priority: selectedLine.priority,
            timestamp: now,
            duration: this.estimateDuration(processedText, commentator.speakingRate)
        };

        // Add to queue
        this.addToQueue(queuedCommentary);
        this.onCommentaryTriggered.notifyObservers(queuedCommentary);

        // Mark line as used
        selectedLine.lastUsed = now;
        if (!this.allowRepetition) {
            this.usedLines.add(selectedLine.id);
        }

        this.lastCommentTime = now;
    }

    private findSuitableCommentary(event: GameEvent): CommentaryLine[] {
        const lines = this.commentaryLibrary.get(event) || [];
        return lines.filter(line => this.checkConditions(line.conditions));
    }

    private checkConditions(conditions: CommentaryConditions): boolean {
        if (!this.context) return false;

        if (conditions.minInning && this.context.currentInning < conditions.minInning) return false;
        if (conditions.maxInning && this.context.currentInning > conditions.maxInning) return false;

        if (conditions.outs && !conditions.outs.includes(this.context.outs)) return false;
        if (conditions.strikes && !conditions.strikes.includes(this.context.strikes)) return false;
        if (conditions.balls && !conditions.balls.includes(this.context.balls)) return false;

        const scoreMargin = Math.abs(this.context.homeScore - this.context.awayScore);
        if (conditions.scoreMarginMin !== undefined && scoreMargin < conditions.scoreMarginMin) return false;
        if (conditions.scoreMarginMax !== undefined && scoreMargin > conditions.scoreMarginMax) return false;

        if (conditions.isCloseGame && scoreMargin > 3) return false;
        if (conditions.isPlayoffs && !this.context.isPlayoffs) return false;
        if (conditions.isRivalry && !this.context.isRivalry) return false;

        return true;
    }

    private selectBestLine(lines: CommentaryLine[]): CommentaryLine | null {
        // Filter out recently used lines if repetition is not allowed
        let availableLines = lines;
        if (!this.allowRepetition) {
            availableLines = lines.filter(line => !this.usedLines.has(line.id));
        }

        // Filter by cooldown
        const now = Date.now();
        availableLines = availableLines.filter(line =>
            now - line.lastUsed >= line.cooldown
        );

        if (availableLines.length === 0) return null;

        // Sort by priority (higher is better)
        availableLines.sort((a, b) => b.priority - a.priority);

        // Select from top priorities with some randomness
        const topPriority = availableLines[0].priority;
        const topLines = availableLines.filter(line => line.priority === topPriority);

        // Pick random variation if available
        const selectedLine = topLines[Math.floor(Math.random() * topLines.length)];
        if (selectedLine.variations.length > 0) {
            const variation = selectedLine.variations[Math.floor(Math.random() * selectedLine.variations.length)];
            return { ...selectedLine, text: variation };
        }

        return selectedLine;
    }

    private selectCommentator(type: CommentaryType): Commentator | null {
        switch (type) {
            case CommentaryType.PLAY_BY_PLAY:
                return this.playByPlayCommentator;
            case CommentaryType.COLOR_COMMENTARY:
            case CommentaryType.ANALYSIS:
            case CommentaryType.ANECDOTE:
                return this.colorCommentator;
            default:
                return this.playByPlayCommentator;
        }
    }

    private processCommentaryText(text: string, data?: any): string {
        let processed = text;

        if (data) {
            for (const [key, value] of Object.entries(data)) {
                processed = processed.replace(new RegExp(`{${key}}`, 'g'), String(value));
            }
        }

        // Replace context variables
        if (this.context) {
            processed = processed.replace(/{inning}/g, String(this.context.currentInning));
            processed = processed.replace(/{homeScore}/g, String(this.context.homeScore));
            processed = processed.replace(/{awayScore}/g, String(this.context.awayScore));
            processed = processed.replace(/{homeTeam}/g, this.context.homeTeam);
            processed = processed.replace(/{awayTeam}/g, this.context.awayTeam);
        }

        return processed;
    }

    private estimateDuration(text: string, speakingRate: number): number {
        // Rough estimate: average speaking rate is 150 words per minute
        const words = text.split(' ').length;
        const baseWPM = 150;
        const adjustedWPM = baseWPM * speakingRate;
        return (words / adjustedWPM) * 60 * 1000; // Convert to milliseconds
    }

    private addToQueue(commentary: QueuedCommentary): void {
        if (this.commentaryQueue.lines.length >= this.maxQueueSize) {
            // Remove lowest priority item
            this.commentaryQueue.lines.sort((a, b) => b.priority - a.priority);
            this.commentaryQueue.lines.pop();
        }

        this.commentaryQueue.lines.push(commentary);
        this.commentaryQueue.lines.sort((a, b) => b.priority - a.priority);
    }

    public update(deltaTime: number): void {
        if (!this.enabled || this.commentaryQueue.isPaused) return;

        // If something is currently playing, check if it's done
        if (this.commentaryQueue.currentlyPlaying) {
            const elapsed = Date.now() - this.commentaryQueue.currentlyPlaying.timestamp;
            if (elapsed >= this.commentaryQueue.currentlyPlaying.duration) {
                this.onCommentaryEnded.notifyObservers(this.commentaryQueue.currentlyPlaying.line.id);
                this.commentaryQueue.currentlyPlaying = null;
            }
        }

        // If nothing is playing and queue has items, play next
        if (!this.commentaryQueue.currentlyPlaying && this.commentaryQueue.lines.length > 0) {
            const next = this.commentaryQueue.lines.shift()!;
            this.commentaryQueue.currentlyPlaying = next;
            this.onCommentaryStarted.notifyObservers(next);
        }
    }

    public pauseCommentary(): void {
        this.commentaryQueue.isPaused = true;
    }

    public resumeCommentary(): void {
        this.commentaryQueue.isPaused = false;
    }

    public clearQueue(): void {
        this.commentaryQueue.lines = [];
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.clearQueue();
            this.commentaryQueue.currentlyPlaying = null;
        }
    }

    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    public setFrequency(frequency: number): void {
        this.frequency = Math.max(0, Math.min(1, frequency));
    }

    public addPlayerNickname(playerId: string, nickname: string): void {
        if (!this.playerNicknames.has(playerId)) {
            this.playerNicknames.set(playerId, []);
        }
        this.playerNicknames.get(playerId)!.push(nickname);
    }

    public getRandomAnecdote(topic?: string): AnecdoteData | null {
        let anecdotes = Array.from(this.anecdotes.values());

        if (topic) {
            anecdotes = anecdotes.filter(a => a.topic === topic || a.tags.includes(topic));
        }

        if (anecdotes.length === 0) return null;
        return anecdotes[Math.floor(Math.random() * anecdotes.length)];
    }

    public dispose(): void {
        this.commentators.clear();
        this.commentaryLibrary.clear();
        this.anecdotes.clear();
        this.statisticalComments.clear();
        this.clearQueue();
        this.usedLines.clear();
        this.playerNicknames.clear();
        this.playerAnecdotes.clear();
    }
}
