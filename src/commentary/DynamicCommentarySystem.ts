import { Observable } from '@babylonjs/core';

/**
 * Commentary types
 */
export enum CommentaryType {
    PLAY_BY_PLAY = 'play_by_play',
    COLOR_COMMENTARY = 'color_commentary',
    ANALYSIS = 'analysis',
    STORY = 'story',
    STATISTICS = 'statistics',
    INTERVIEW = 'interview',
    ADVERTISEMENT = 'advertisement'
}

/**
 * Commentary priority
 */
export enum CommentaryPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3,
    URGENT = 4
}

/**
 * Commentary mood/tone
 */
export enum CommentaryTone {
    EXCITED = 'excited',
    CALM = 'calm',
    ANALYTICAL = 'analytical',
    HUMOROUS = 'humorous',
    DRAMATIC = 'dramatic',
    SUSPENSEFUL = 'suspenseful',
    DISAPPOINTED = 'disappointed',
    ENTHUSIASTIC = 'enthusiastic'
}

/**
 * Game situation categories
 */
export enum GameSituation {
    FIRST_PITCH = 'first_pitch',
    BATTER_UP = 'batter_up',
    PITCH_THROWN = 'pitch_thrown',
    STRIKE = 'strike',
    BALL = 'ball',
    FOUL_BALL = 'foul_ball',
    HIT = 'hit',
    SINGLE = 'single',
    DOUBLE = 'double',
    TRIPLE = 'triple',
    HOME_RUN = 'home_run',
    GRAND_SLAM = 'grand_slam',
    OUT = 'out',
    STRIKEOUT = 'strikeout',
    WALK = 'walk',
    HIT_BY_PITCH = 'hit_by_pitch',
    STOLEN_BASE = 'stolen_base',
    CAUGHT_STEALING = 'caught_stealing',
    DOUBLE_PLAY = 'double_play',
    TRIPLE_PLAY = 'triple_play',
    ERROR = 'error',
    AMAZING_CATCH = 'amazing_catch',
    DIVING_CATCH = 'diving_catch',
    CLOSE_PLAY = 'close_play',
    INNING_END = 'inning_end',
    SIDE_RETIRED = 'side_retired',
    RALLY_START = 'rally_start',
    MOMENTUM_SHIFT = 'momentum_shift',
    PITCHING_CHANGE = 'pitching_change',
    INJURY = 'injury',
    CONTROVERSIAL_CALL = 'controversial_call',
    GAME_END = 'game_end'
}

/**
 * Commentary line template
 */
export interface CommentaryLine {
    id: string;
    situation: GameSituation;
    type: CommentaryType;
    priority: CommentaryPriority;
    template: string;
    variations: string[];
    conditions?: CommentaryCondition[];
    tone: CommentaryTone;
    duration: number;
    cooldown: number;
    lastUsed: number;
    usageCount: number;
}

/**
 * Commentary condition
 */
export interface CommentaryCondition {
    type: 'score_diff' | 'inning' | 'count' | 'outs' | 'runners' | 'player_stat' | 'situation';
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: any;
}

/**
 * Commentator persona
 */
export interface CommentatorPersona {
    id: string;
    name: string;
    role: 'play_by_play' | 'color' | 'analyst';
    voice: string;
    personality: {
        enthusiasm: number;      // 0-1
        humor: number;          // 0-1
        analytical: number;     // 0-1
        bias: number;          // -1 to 1 (home/away)
        verbosity: number;     // 0-1
    };
    catchphrases: string[];
    favoriteTopics: string[];
}

/**
 * Commentary context
 */
export interface CommentaryContext {
    inning: number;
    outs: number;
    balls: number;
    strikes: number;
    score: { home: number; away: number };
    runners: boolean[];        // [first, second, third]
    currentBatter: string;
    currentPitcher: string;
    lastPlay: string;
    momentum: number;          // -1 to 1
    situation: string;
}

/**
 * Commentary queue item
 */
export interface CommentaryQueueItem {
    line: CommentaryLine;
    text: string;
    priority: CommentaryPriority;
    timestamp: number;
    commentator: string;
}

/**
 * Dynamic Commentary System
 * Realistic play-by-play commentary with context awareness and natural dialogue
 */
export class DynamicCommentarySystem {
    // Commentary library
    private commentaryLines: Map<GameSituation, CommentaryLine[]> = new Map();
    private allLines: CommentaryLine[] = [];

    // Commentators
    private commentators: Map<string, CommentatorPersona> = new Map();
    private activeCommentator: string | null = null;
    private colorCommentator: string | null = null;

    // Queue
    private commentaryQueue: CommentaryQueueItem[] = [];
    private currentCommentary: CommentaryQueueItem | null = null;
    private isPlaying: boolean = false;

    // Context
    private context: CommentaryContext = {
        inning: 1,
        outs: 0,
        balls: 0,
        strikes: 0,
        score: { home: 0, away: 0 },
        runners: [false, false, false],
        currentBatter: '',
        currentPitcher: '',
        lastPlay: '',
        momentum: 0,
        situation: ''
    };

    // Settings
    private enabled: boolean = true;
    private volume: number = 0.8;
    private frequency: number = 0.7;      // How often to trigger commentary (0-1)
    private minInterval: number = 2.0;    // Minimum seconds between lines
    private maxQueueSize: number = 5;

    // Timing
    private lastCommentaryTime: number = 0;
    private time: number = 0;

    // Analytics
    private stats: {
        totalLines: number;
        linesByType: Map<CommentaryType, number>;
        linesBySituation: Map<GameSituation, number>;
        favoriteLines: Map<string, number>;
    } = {
        totalLines: 0,
        linesByType: new Map(),
        linesBySituation: new Map(),
        favoriteLines: new Map()
    };

    // Observables
    private onCommentaryPlayObservable: Observable<CommentaryQueueItem> = new Observable();
    private onCommentaryEndObservable: Observable<void> = new Observable();

    constructor() {
        this.initializeCommentators();
        this.initializeCommentaryLibrary();
    }

    /**
     * Initialize commentator personas
     */
    private initializeCommentators(): void {
        // Enthusiastic play-by-play announcer
        this.commentators.set('pbp_enthusiastic', {
            id: 'pbp_enthusiastic',
            name: 'Mike Mitchell',
            role: 'play_by_play',
            voice: 'male_energetic',
            personality: {
                enthusiasm: 0.9,
                humor: 0.4,
                analytical: 0.5,
                bias: 0.0,
                verbosity: 0.7
            },
            catchphrases: [
                'And it\'s OUTTA HERE!',
                'What a play!',
                'Unbelievable!',
                'You cannot be serious!',
                'Holy cow!'
            ],
            favoriteTopics: ['home runs', 'amazing plays', 'records']
        });

        // Analytical color commentator
        this.commentators.set('color_analytical', {
            id: 'color_analytical',
            name: 'Frank Thompson',
            role: 'color',
            voice: 'male_calm',
            personality: {
                enthusiasm: 0.5,
                humor: 0.3,
                analytical: 0.9,
                bias: 0.0,
                verbosity: 0.8
            },
            catchphrases: [
                'Let me break this down for you...',
                'From a technical standpoint...',
                'The numbers tell the story...',
                'If you look at the analytics...'
            ],
            favoriteTopics: ['statistics', 'strategy', 'technique']
        });

        // Humorous analyst
        this.commentators.set('analyst_humorous', {
            id: 'analyst_humorous',
            name: 'Joe \"Joker\" Johnson',
            role: 'analyst',
            voice: 'male_jovial',
            personality: {
                enthusiasm: 0.7,
                humor: 0.9,
                analytical: 0.6,
                bias: 0.1,
                verbosity: 0.6
            },
            catchphrases: [
                'You can\'t make this stuff up!',
                'Only in baseball!',
                'That\'s why we love this game!',
                'I\'ve seen it all now!'
            ],
            favoriteTopics: ['bloopers', 'quirky stats', 'player personalities']
        });

        this.activeCommentator = 'pbp_enthusiastic';
        this.colorCommentator = 'color_analytical';
    }

    /**
     * Initialize commentary library
     */
    private initializeCommentaryLibrary(): void {
        // Home run commentary
        this.addCommentaryLines(GameSituation.HOME_RUN, [
            {
                template: 'And that ball is CRUSHED! {batter} sends it deep... IT\'S GONE! Home run!',
                variations: [
                    'GOODBYE BASEBALL! {batter} absolutely demolished that one!',
                    'Touch \'em all! {batter} with a MONSTER home run!',
                    'HIGH FLY BALL... BACK, BACK, BACK... GONE! {batter} with a no-doubter!',
                    'That ball had a family! {batter} destroys it over the wall!',
                    'See ya later! {batter} parks one in the bleachers!'
                ],
                tone: CommentaryTone.EXCITED,
                type: CommentaryType.PLAY_BY_PLAY,
                priority: CommentaryPriority.CRITICAL,
                duration: 5
            },
            {
                template: 'What power from {batter}! That was a {distance} foot bomb!',
                variations: [
                    'The exit velocity on that one had to be over {velocity} mph!',
                    '{batter} knew it immediately - classic bat drop and admiration!',
                    'That ball is probably still climbing! Estimated {distance} feet!',
                    'Home run number {hr_count} for {batter} this season!'
                ],
                tone: CommentaryTone.ANALYTICAL,
                type: CommentaryType.COLOR_COMMENTARY,
                priority: CommentaryPriority.HIGH,
                duration: 4
            }
        ]);

        // Strikeout commentary
        this.addCommentaryLines(GameSituation.STRIKEOUT, [
            {
                template: 'Strike three called! {pitcher} pumps his fist as {batter} walks back to the dugout.',
                variations: [
                    '{pitcher} with the K! Caught him looking!',
                    'And {batter} goes down swinging! What a pitch by {pitcher}!',
                    'Strike three! {pitcher} blows it by him!',
                    'Called strike three! {batter} can\'t believe it!',
                    '{pitcher} freezes him! Strike three!'
                ],
                tone: CommentaryTone.EXCITED,
                type: CommentaryType.PLAY_BY_PLAY,
                priority: CommentaryPriority.HIGH,
                duration: 3
            },
            {
                template: 'That\'s strikeout number {k_count} for {pitcher} today. Really dominating stuff.',
                variations: [
                    '{pitcher} is in a groove now - painting the corners beautifully.',
                    'The {pitch_type} has been {pitcher}\'s out pitch all day.',
                    '{batter} looked overmatched there. {pitcher} is dealing!',
                    'That pitch had some serious {movement_type} movement on it.'
                ],
                tone: CommentaryTone.ANALYTICAL,
                type: CommentaryType.COLOR_COMMENTARY,
                priority: CommentaryPriority.NORMAL,
                duration: 3
            }
        ]);

        // Amazing catch commentary
        this.addCommentaryLines(GameSituation.AMAZING_CATCH, [
            {
                template: 'OH MY! {fielder} with an absolutely SPECTACULAR catch!',
                variations: [
                    'ROBBERY! {fielder} just stole a hit!',
                    'You have GOT to be KIDDING me! What a catch by {fielder}!',
                    'WOW! {fielder} just made the play of the year!',
                    'UNBELIEVABLE! {fielder} tracks it down!',
                    'How did {fielder} come up with that?! Incredible!'
                ],
                tone: CommentaryTone.EXCITED,
                type: CommentaryType.PLAY_BY_PLAY,
                priority: CommentaryPriority.CRITICAL,
                duration: 5
            },
            {
                template: 'That\'s the kind of play that makes highlight reels. {fielder} with gold glove defense.',
                variations: [
                    'The athleticism required for that catch is just remarkable.',
                    '{fielder} saved at least one run, maybe two with that grab.',
                    'You talk about range - that\'s it right there from {fielder}.',
                    'Defensive play of the game, no question about it.'
                ],
                tone: CommentaryTone.ENTHUSIASTIC,
                type: CommentaryType.COLOR_COMMENTARY,
                priority: CommentaryPriority.HIGH,
                duration: 4
            }
        ]);

        // Double play commentary
        this.addCommentaryLines(GameSituation.DOUBLE_PLAY, [
            {
                template: 'Ground ball, turned over to second, throw to first... DOUBLE PLAY!',
                variations: [
                    'Around the horn for two! What a double play!',
                    '6-4-3! Textbook double play!',
                    'Two for the price of one! Inning-ending double play!',
                    'The twin killing! That\'s huge for {pitcher}!',
                    'They turn two! Perfect execution!'
                ],
                tone: CommentaryTone.EXCITED,
                type: CommentaryType.PLAY_BY_PLAY,
                priority: CommentaryPriority.HIGH,
                duration: 4
            },
            {
                template: 'The pitcher\'s best friend right there. Huge momentum swing.',
                variations: [
                    'That\'s how you get out of a jam - the double play ball.',
                    'Perfect timing for the defense. Rally snuffed out.',
                    '{pitcher} gets the ground ball when he needs it most.',
                    'Slick middle infield work there. Beautiful pivot.'
                ],
                tone: CommentaryTone.ANALYTICAL,
                type: CommentaryType.COLOR_COMMENTARY,
                priority: CommentaryPriority.NORMAL,
                duration: 3
            }
        ]);

        // Close play commentary
        this.addCommentaryLines(GameSituation.CLOSE_PLAY, [
            {
                template: 'BANG-BANG PLAY! The umpire calls him {call}!',
                variations: [
                    'Photo finish! Ruled {call}!',
                    'That was SO close! Called {call}!',
                    'Tie goes to the... {call}! What a close play!',
                    'SAFE! No wait... {call}! Wow, that was tight!',
                    'Could go either way... and it\'s {call}!'
                ],
                tone: CommentaryTone.SUSPENSEFUL,
                type: CommentaryType.PLAY_BY_PLAY,
                priority: CommentaryPriority.HIGH,
                duration: 3
            },
            {
                template: 'They might want to take a look at that one. Very close call.',
                variations: [
                    'The {team} might challenge that. It was awfully close.',
                    'Frame-by-frame replay will tell the story on that one.',
                    'Could be worth a challenge. I\'d need to see it again.',
                    'The {team} manager is already out of the dugout disputing that call.'
                ],
                tone: CommentaryTone.ANALYTICAL,
                type: CommentaryType.COLOR_COMMENTARY,
                priority: CommentaryPriority.NORMAL,
                duration: 3
            }
        ]);

        // Momentum shift commentary
        this.addCommentaryLines(GameSituation.MOMENTUM_SHIFT, [
            {
                template: 'You can feel the momentum swinging to the {team} side now!',
                variations: [
                    'The energy in this stadium just completely changed!',
                    'What a turnaround! The {team} have come alive!',
                    'This game has flipped on its head!',
                    'The {team} are making their move!'
                ],
                tone: CommentaryTone.DRAMATIC,
                type: CommentaryType.PLAY_BY_PLAY,
                priority: CommentaryPriority.HIGH,
                duration: 3
            }
        ]);

        // Rally starter commentary
        this.addCommentaryLines(GameSituation.RALLY_START, [
            {
                template: 'The {team} are starting to string some hits together here...',
                variations: [
                    'Here comes the rally! The {team} dugout is getting loud!',
                    'Two runners on now... the {team} are threatening!',
                    'The {team} have something brewing here in the {inning} inning!',
                    'This could be the start of something big for the {team}!'
                ],
                tone: CommentaryTone.SUSPENSEFUL,
                type: CommentaryType.PLAY_BY_PLAY,
                priority: CommentaryPriority.NORMAL,
                duration: 3
            }
        ]);

        // Error commentary
        this.addCommentaryLines(GameSituation.ERROR, [
            {
                template: 'Oh no! {fielder} boots it! Error on the play!',
                variations: [
                    'That one gets through! Costly error by {fielder}!',
                    'You can\'t do that! {fielder} with the miscue!',
                    '{fielder} just couldn\'t handle it. Error charged.',
                    'Uh oh, that should have been caught. Error on {fielder}.'
                ],
                tone: CommentaryTone.DISAPPOINTED,
                type: CommentaryType.PLAY_BY_PLAY,
                priority: CommentaryPriority.NORMAL,
                duration: 3
            },
            {
                template: 'That\'s going to be an earned run for {pitcher} thanks to the error.',
                variations: [
                    'Tough break for the pitcher. Not his fault but he pays the price.',
                    '{fielder} will want that one back. Could be costly.',
                    'Mental errors like that can be contagious. Gotta shake it off.',
                    'The {team} can\'t afford to give extra outs in a tight game like this.'
                ],
                tone: CommentaryTone.ANALYTICAL,
                type: CommentaryType.COLOR_COMMENTARY,
                priority: CommentaryPriority.NORMAL,
                duration: 3
            }
        ]);
    }

    /**
     * Add commentary lines for a situation
     */
    private addCommentaryLines(situation: GameSituation, templates: Array<{
        template: string;
        variations: string[];
        tone: CommentaryTone;
        type: CommentaryType;
        priority: CommentaryPriority;
        duration: number;
    }>): void {
        const lines: CommentaryLine[] = [];

        for (const template of templates) {
            const id = `${situation}_${lines.length}`;

            const line: CommentaryLine = {
                id,
                situation,
                type: template.type,
                priority: template.priority,
                template: template.template,
                variations: template.variations,
                tone: template.tone,
                duration: template.duration,
                cooldown: 30,
                lastUsed: 0,
                usageCount: 0
            };

            lines.push(line);
            this.allLines.push(line);
        }

        if (!this.commentaryLines.has(situation)) {
            this.commentaryLines.set(situation, []);
        }

        this.commentaryLines.get(situation)!.push(...lines);
    }

    /**
     * Trigger commentary for game situation
     */
    public trigger(situation: GameSituation, data?: any): void {
        if (!this.enabled) return;

        // Check minimum interval
        if (this.time - this.lastCommentaryTime < this.minInterval) {
            return;
        }

        // Get appropriate lines for situation
        const lines = this.commentaryLines.get(situation);
        if (!lines || lines.length === 0) return;

        // Filter lines by conditions and cooldown
        const validLines = lines.filter(line => {
            // Check cooldown
            if (this.time - line.lastUsed < line.cooldown) {
                return false;
            }

            // Check conditions
            if (line.conditions) {
                return this.evaluateConditions(line.conditions, data);
            }

            return true;
        });

        if (validLines.length === 0) return;

        // Select line based on priority and randomness
        const selectedLine = this.selectLine(validLines);

        // Generate commentary text
        const text = this.generateCommentaryText(selectedLine, data);

        // Queue commentary
        this.queueCommentary(selectedLine, text);
    }

    /**
     * Select commentary line
     */
    private selectLine(lines: CommentaryLine[]): CommentaryLine {
        // Sort by priority
        const sorted = lines.sort((a, b) => b.priority - a.priority);

        // Weighted random selection favoring higher priority
        const weights = sorted.map((line, index) => Math.pow(2, sorted.length - index));
        const totalWeight = weights.reduce((a, b) => a + b, 0);

        let random = Math.random() * totalWeight;
        for (let i = 0; i < sorted.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return sorted[i];
            }
        }

        return sorted[0];
    }

    /**
     * Generate commentary text from template
     */
    private generateCommentaryText(line: CommentaryLine, data?: any): string {
        // Select variation or template
        const templates = [line.template, ...line.variations];
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Replace placeholders
        let text = template;

        if (data) {
            for (const [key, value] of Object.entries(data)) {
                text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
            }
        }

        // Replace context placeholders
        text = text.replace(/{inning}/g, this.getInningText());
        text = text.replace(/{team}/g, data?.team || 'home team');
        text = text.replace(/{call}/g, data?.call || 'out');

        return text;
    }

    /**
     * Get inning text
     */
    private getInningText(): string {
        const inning = this.context.inning;
        const suffix = ['st', 'nd', 'rd'][((inning + 90) % 100 - 10) % 10 - 1] || 'th';
        return `${inning}${suffix}`;
    }

    /**
     * Queue commentary
     */
    private queueCommentary(line: CommentaryLine, text: string): void {
        // Limit queue size
        if (this.commentaryQueue.length >= this.maxQueueSize) {
            return;
        }

        const commentator = line.type === CommentaryType.PLAY_BY_PLAY
            ? this.activeCommentator
            : this.colorCommentator;

        const item: CommentaryQueueItem = {
            line,
            text,
            priority: line.priority,
            timestamp: this.time,
            commentator: commentator || ''
        };

        this.commentaryQueue.push(item);
        this.commentaryQueue.sort((a, b) => b.priority - a.priority);

        // Update line usage
        line.lastUsed = this.time;
        line.usageCount++;

        // Try to play immediately if nothing is playing
        if (!this.isPlaying) {
            this.playNext();
        }
    }

    /**
     * Play next commentary in queue
     */
    private playNext(): void {
        if (this.commentaryQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.currentCommentary = this.commentaryQueue.shift()!;
        this.isPlaying = true;
        this.lastCommentaryTime = this.time;

        // Notify observers
        this.onCommentaryPlayObservable.notifyObservers(this.currentCommentary);

        // Update statistics
        this.updateStatistics(this.currentCommentary);

        // Schedule end
        setTimeout(() => {
            this.onCommentaryEndObservable.notifyObservers();
            this.playNext();
        }, this.currentCommentary.line.duration * 1000);
    }

    /**
     * Update statistics
     */
    private updateStatistics(item: CommentaryQueueItem): void {
        this.stats.totalLines++;

        const typeCount = this.stats.linesByType.get(item.line.type) || 0;
        this.stats.linesByType.set(item.line.type, typeCount + 1);

        const situationCount = this.stats.linesBySituation.get(item.line.situation) || 0;
        this.stats.linesBySituation.set(item.line.situation, situationCount + 1);

        const favoriteCount = this.stats.favoriteLines.get(item.line.id) || 0;
        this.stats.favoriteLines.set(item.line.id, favoriteCount + 1);
    }

    /**
     * Evaluate conditions
     */
    private evaluateConditions(conditions: CommentaryCondition[], data?: any): boolean {
        for (const condition of conditions) {
            let value: any;

            switch (condition.type) {
                case 'inning':
                    value = this.context.inning;
                    break;
                case 'outs':
                    value = this.context.outs;
                    break;
                case 'score_diff':
                    value = Math.abs(this.context.score.home - this.context.score.away);
                    break;
                // Add more condition types as needed
                default:
                    value = data?.[condition.type];
            }

            if (!this.compareValues(value, condition.operator, condition.value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Compare values with operator
     */
    private compareValues(a: any, operator: string, b: any): boolean {
        switch (operator) {
            case '==': return a == b;
            case '!=': return a != b;
            case '>': return a > b;
            case '<': return a < b;
            case '>=': return a >= b;
            case '<=': return a <= b;
            default: return false;
        }
    }

    /**
     * Update context
     */
    public updateContext(context: Partial<CommentaryContext>): void {
        this.context = { ...this.context, ...context };
    }

    /**
     * Set enabled
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;

        if (!enabled && this.isPlaying) {
            this.commentaryQueue = [];
            this.isPlaying = false;
        }
    }

    /**
     * Set volume
     */
    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Set frequency
     */
    public setFrequency(frequency: number): void {
        this.frequency = Math.max(0, Math.min(1, frequency));
    }

    /**
     * Get statistics
     */
    public getStatistics() {
        return { ...this.stats };
    }

    /**
     * Update system
     */
    public update(deltaTime: number): void {
        this.time += deltaTime;
    }

    /**
     * Subscribe to commentary play events
     */
    public onCommentaryPlay(callback: (item: CommentaryQueueItem) => void): void {
        this.onCommentaryPlayObservable.add(callback);
    }

    /**
     * Subscribe to commentary end events
     */
    public onCommentaryEnd(callback: () => void): void {
        this.onCommentaryEndObservable.add(callback);
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.commentaryQueue = [];
        this.isPlaying = false;

        this.onCommentaryPlayObservable.clear();
        this.onCommentaryEndObservable.clear();
    }
}
