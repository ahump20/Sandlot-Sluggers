import { Observable } from '@babylonjs/core';

/**
 * Supported languages
 */
export enum Language {
    ENGLISH = 'en',
    SPANISH = 'es',
    FRENCH = 'fr',
    GERMAN = 'de',
    ITALIAN = 'it',
    PORTUGUESE = 'pt',
    JAPANESE = 'ja',
    KOREAN = 'ko',
    CHINESE_SIMPLIFIED = 'zh-CN',
    CHINESE_TRADITIONAL = 'zh-TW',
    RUSSIAN = 'ru',
    DUTCH = 'nl',
    POLISH = 'pl',
    TURKISH = 'tr',
    ARABIC = 'ar',
    HINDI = 'hi'
}

/**
 * Text direction
 */
export enum TextDirection {
    LTR = 'ltr', // Left to right
    RTL = 'rtl'  // Right to left
}

/**
 * Language metadata
 */
export interface LanguageMetadata {
    code: Language;
    name: string;
    nativeName: string;
    direction: TextDirection;
    region?: string;
    pluralRules?: PluralRule[];
}

/**
 * Plural rule
 */
export interface PluralRule {
    count: number;
    form: PluralForm;
}

/**
 * Plural forms
 */
export enum PluralForm {
    ZERO = 'zero',
    ONE = 'one',
    TWO = 'two',
    FEW = 'few',
    MANY = 'many',
    OTHER = 'other'
}

/**
 * Translation key with namespace
 */
export interface TranslationKey {
    namespace: string;
    key: string;
}

/**
 * Translation data structure
 */
export interface TranslationData {
    [namespace: string]: {
        [key: string]: string | TranslationPlural | TranslationContext;
    };
}

/**
 * Plural translations
 */
export interface TranslationPlural {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
}

/**
 * Context-based translations
 */
export interface TranslationContext {
    [context: string]: string;
}

/**
 * Interpolation parameters
 */
export interface InterpolationParams {
    [key: string]: string | number | boolean;
}

/**
 * Translation options
 */
export interface TranslationOptions {
    count?: number;
    context?: string;
    defaultValue?: string;
    params?: InterpolationParams;
}

/**
 * Language pack
 */
export interface LanguagePack {
    language: Language;
    metadata: LanguageMetadata;
    translations: TranslationData;
    version: string;
    authors?: string[];
}

/**
 * Localization System
 * Comprehensive internationalization and localization support
 */
export class LocalizationSystem {
    // Current language
    private currentLanguage: Language = Language.ENGLISH;

    // Loaded language packs
    private languagePacks: Map<Language, LanguagePack> = new Map();

    // Fallback language
    private fallbackLanguage: Language = Language.ENGLISH;

    // Language metadata
    private languageMetadata: Map<Language, LanguageMetadata> = new Map();

    // Missing translation tracking
    private missingTranslations: Map<string, Set<string>> = new Map();

    // Observable for language changes
    private onLanguageChangedObservable: Observable<Language> = new Observable();

    // Translation cache for performance
    private translationCache: Map<string, string> = new Map();

    // Lazy loading enabled
    private lazyLoadingEnabled: boolean = true;

    // Remote translation server
    private translationServerUrl?: string;

    constructor() {
        this.initializeLanguageMetadata();
        this.loadDefaultTranslations();
        this.detectBrowserLanguage();
    }

    /**
     * Initialize language metadata
     */
    private initializeLanguageMetadata(): void {
        this.languageMetadata.set(Language.ENGLISH, {
            code: Language.ENGLISH,
            name: 'English',
            nativeName: 'English',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.SPANISH, {
            code: Language.SPANISH,
            name: 'Spanish',
            nativeName: 'Español',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.FRENCH, {
            code: Language.FRENCH,
            name: 'French',
            nativeName: 'Français',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.GERMAN, {
            code: Language.GERMAN,
            name: 'German',
            nativeName: 'Deutsch',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.ITALIAN, {
            code: Language.ITALIAN,
            name: 'Italian',
            nativeName: 'Italiano',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.PORTUGUESE, {
            code: Language.PORTUGUESE,
            name: 'Portuguese',
            nativeName: 'Português',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.JAPANESE, {
            code: Language.JAPANESE,
            name: 'Japanese',
            nativeName: '日本語',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.KOREAN, {
            code: Language.KOREAN,
            name: 'Korean',
            nativeName: '한국어',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.CHINESE_SIMPLIFIED, {
            code: Language.CHINESE_SIMPLIFIED,
            name: 'Chinese (Simplified)',
            nativeName: '简体中文',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.CHINESE_TRADITIONAL, {
            code: Language.CHINESE_TRADITIONAL,
            name: 'Chinese (Traditional)',
            nativeName: '繁體中文',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.RUSSIAN, {
            code: Language.RUSSIAN,
            name: 'Russian',
            nativeName: 'Русский',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.ARABIC, {
            code: Language.ARABIC,
            name: 'Arabic',
            nativeName: 'العربية',
            direction: TextDirection.RTL
        });

        this.languageMetadata.set(Language.HINDI, {
            code: Language.HINDI,
            name: 'Hindi',
            nativeName: 'हिन्दी',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.DUTCH, {
            code: Language.DUTCH,
            name: 'Dutch',
            nativeName: 'Nederlands',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.POLISH, {
            code: Language.POLISH,
            name: 'Polish',
            nativeName: 'Polski',
            direction: TextDirection.LTR
        });

        this.languageMetadata.set(Language.TURKISH, {
            code: Language.TURKISH,
            name: 'Turkish',
            nativeName: 'Türkçe',
            direction: TextDirection.LTR
        });
    }

    /**
     * Load default English translations
     */
    private loadDefaultTranslations(): void {
        const englishPack: LanguagePack = {
            language: Language.ENGLISH,
            metadata: this.languageMetadata.get(Language.ENGLISH)!,
            version: '1.0.0',
            translations: {
                // Common
                common: {
                    ok: 'OK',
                    cancel: 'Cancel',
                    yes: 'Yes',
                    no: 'No',
                    confirm: 'Confirm',
                    save: 'Save',
                    load: 'Load',
                    delete: 'Delete',
                    edit: 'Edit',
                    back: 'Back',
                    next: 'Next',
                    previous: 'Previous',
                    continue: 'Continue',
                    start: 'Start',
                    pause: 'Pause',
                    resume: 'Resume',
                    quit: 'Quit',
                    exit: 'Exit',
                    settings: 'Settings',
                    help: 'Help',
                    close: 'Close',
                    apply: 'Apply',
                    reset: 'Reset',
                    default: 'Default',
                    custom: 'Custom',
                    loading: 'Loading...',
                    saving: 'Saving...',
                    error: 'Error',
                    warning: 'Warning',
                    success: 'Success',
                    info: 'Info'
                },

                // Main Menu
                menu: {
                    title: 'Sandlot Sluggers',
                    play: 'Play',
                    career: 'Career Mode',
                    quickPlay: 'Quick Play',
                    tournament: 'Tournament',
                    multiplayer: 'Multiplayer',
                    tutorial: 'Tutorial',
                    customization: 'Customization',
                    statistics: 'Statistics',
                    achievements: 'Achievements',
                    options: 'Options',
                    credits: 'Credits',
                    exitGame: 'Exit Game'
                },

                // Gameplay
                gameplay: {
                    inning: 'Inning',
                    inning_plural: {
                        one: '{{count}} Inning',
                        other: '{{count}} Innings'
                    },
                    out: 'Out',
                    outs_plural: {
                        one: '{{count}} Out',
                        other: '{{count}} Outs'
                    },
                    strike: 'Strike',
                    strikes_plural: {
                        one: '{{count}} Strike',
                        other: '{{count}} Strikes'
                    },
                    ball: 'Ball',
                    balls_plural: {
                        one: '{{count}} Ball',
                        other: '{{count}} Balls'
                    },
                    homeRun: 'Home Run!',
                    double: 'Double!',
                    triple: 'Triple!',
                    single: 'Single!',
                    strikeout: 'Strikeout!',
                    walk: 'Walk',
                    hitByPitch: 'Hit By Pitch',
                    sacrifice: 'Sacrifice',
                    error_field: 'Error!',
                    stolenBase: 'Stolen Base!',
                    caughtStealing: 'Caught Stealing!',
                    doublePlay: 'Double Play!',
                    triplePlay: 'Triple Play!',
                    grandSlam: 'Grand Slam!',
                    perfecto: 'Perfect Game!',
                    noHitter: 'No Hitter!',
                    gameOver: 'Game Over',
                    youWin: 'You Win!',
                    youLose: 'You Lose'
                },

                // Positions
                positions: {
                    pitcher: 'Pitcher',
                    catcher: 'Catcher',
                    firstBase: 'First Base',
                    secondBase: 'Second Base',
                    thirdBase: 'Third Base',
                    shortstop: 'Shortstop',
                    leftField: 'Left Field',
                    centerField: 'Center Field',
                    rightField: 'Right Field',
                    designatedHitter: 'Designated Hitter'
                },

                // Statistics
                stats: {
                    battingAverage: 'Batting Average',
                    homeRuns: 'Home Runs',
                    runsBattedIn: 'RBIs',
                    onBasePercentage: 'On-Base %',
                    sluggingPercentage: 'Slugging %',
                    earnedRunAverage: 'ERA',
                    wins: 'Wins',
                    losses: 'Losses',
                    saves: 'Saves',
                    strikeouts: 'Strikeouts',
                    walks: 'Walks',
                    whip: 'WHIP',
                    innings: 'Innings Pitched',
                    gamesPlayed: 'Games Played',
                    atBats: 'At Bats',
                    hits: 'Hits',
                    doubles: 'Doubles',
                    triples: 'Triples',
                    runs: 'Runs',
                    stolenBases: 'Stolen Bases'
                },

                // Actions
                actions: {
                    swing: 'Swing',
                    bunt: 'Bunt',
                    powerSwing: 'Power Swing',
                    contactSwing: 'Contact Swing',
                    checkSwing: 'Check Swing',
                    takePitch: 'Take',
                    pitch: 'Pitch',
                    fastball: 'Fastball',
                    curveball: 'Curveball',
                    slider: 'Slider',
                    changeup: 'Changeup',
                    knuckleball: 'Knuckleball',
                    catch: 'Catch',
                    throw: 'Throw',
                    dive: 'Dive',
                    slide: 'Slide',
                    steal: 'Steal',
                    advance: 'Advance',
                    retreat: 'Retreat',
                    substitute: 'Substitute'
                },

                // Tutorial
                tutorial: {
                    welcome: 'Welcome to Sandlot Sluggers!',
                    batting_title: 'Batting',
                    batting_desc: 'Press Space or click to swing when the ball is in the strike zone',
                    pitching_title: 'Pitching',
                    pitching_desc: 'Select your pitch type and aim, then press Space to throw',
                    fielding_title: 'Fielding',
                    fielding_desc: 'Move to the ball and press Space to catch, then throw to a base',
                    baseRunning_title: 'Base Running',
                    baseRunning_desc: 'Click on bases to advance your runners',
                    timing_title: 'Timing',
                    timing_desc: 'Perfect timing results in better contact and more power',
                    complete: 'Tutorial Complete!',
                    skip: 'Skip Tutorial',
                    nextStep: 'Next Step',
                    practice: 'Practice Mode'
                },

                // Career Mode
                career: {
                    title: 'Career Mode',
                    newCareer: 'New Career',
                    loadCareer: 'Load Career',
                    createPlayer: 'Create Player',
                    selectTeam: 'Select Team',
                    schedule: 'Schedule',
                    standings: 'Standings',
                    playoffs: 'Playoffs',
                    worldSeries: 'World Series',
                    offSeason: 'Off-Season',
                    draft: 'Draft',
                    trades: 'Trades',
                    freeAgents: 'Free Agents',
                    training: 'Training',
                    progression: 'Progression',
                    awards: 'Awards',
                    hallOfFame: 'Hall of Fame',
                    retire: 'Retire'
                },

                // Team Management
                team: {
                    roster: 'Roster',
                    lineUp: 'Line-Up',
                    rotation: 'Rotation',
                    bullpen: 'Bullpen',
                    bench: 'Bench',
                    injuries: 'Injuries',
                    fatigue: 'Fatigue',
                    morale: 'Morale',
                    chemistry: 'Chemistry',
                    salaries: 'Salaries',
                    budget: 'Budget',
                    scout: 'Scout',
                    sign: 'Sign',
                    release: 'Release',
                    trade: 'Trade',
                    promote: 'Promote',
                    demote: 'Demote'
                },

                // Customization
                customization: {
                    character: 'Character',
                    appearance: 'Appearance',
                    equipment: 'Equipment',
                    uniform: 'Uniform',
                    team: 'Team',
                    stadium: 'Stadium',
                    logo: 'Logo',
                    colors: 'Colors',
                    name: 'Name',
                    number: 'Number',
                    position: 'Position',
                    archetype: 'Archetype',
                    attributes: 'Attributes',
                    height: 'Height',
                    weight: 'Weight',
                    age: 'Age',
                    handedness: 'Handedness',
                    battingStance: 'Batting Stance',
                    pitchingWind: 'Pitching Windup'
                },

                // Settings
                settings: {
                    graphics: 'Graphics',
                    audio: 'Audio',
                    controls: 'Controls',
                    gameplay: 'Gameplay',
                    interface: 'Interface',
                    language: 'Language',
                    difficulty: 'Difficulty',
                    volume: 'Volume',
                    masterVolume: 'Master Volume',
                    musicVolume: 'Music Volume',
                    sfxVolume: 'SFX Volume',
                    quality: 'Quality',
                    resolution: 'Resolution',
                    fullscreen: 'Fullscreen',
                    vsync: 'VSync',
                    antiAliasing: 'Anti-Aliasing',
                    shadows: 'Shadows',
                    effects: 'Effects',
                    keyBindings: 'Key Bindings',
                    sensitivity: 'Sensitivity',
                    invertY: 'Invert Y-Axis',
                    subtitles: 'Subtitles',
                    commentary: 'Commentary',
                    crowdNoise: 'Crowd Noise',
                    autoSave: 'Auto-Save',
                    showTips: 'Show Tips'
                },

                // Multiplayer
                multiplayer: {
                    online: 'Online',
                    local: 'Local',
                    quickMatch: 'Quick Match',
                    ranked: 'Ranked',
                    casual: 'Casual',
                    privateMatch: 'Private Match',
                    createLobby: 'Create Lobby',
                    joinLobby: 'Join Lobby',
                    searching: 'Searching for match...',
                    connecting: 'Connecting...',
                    connected: 'Connected',
                    disconnected: 'Disconnected',
                    hostMigration: 'Host migrating...',
                    lag: 'High latency',
                    ping: 'Ping: {{ms}}ms',
                    rank: 'Rank',
                    leaderboard: 'Leaderboard',
                    profile: 'Profile',
                    friends: 'Friends',
                    invite: 'Invite',
                    chat: 'Chat'
                },

                // Achievements
                achievements: {
                    unlocked: 'Achievement Unlocked!',
                    locked: 'Locked',
                    progress: 'Progress',
                    reward: 'Reward',
                    rarity: 'Rarity',
                    common: 'Common',
                    uncommon: 'Uncommon',
                    rare: 'Rare',
                    epic: 'Epic',
                    legendary: 'Legendary',
                    points: 'Points',
                    completionRate: 'Completion Rate'
                },

                // Notifications
                notifications: {
                    gameSaved: 'Game saved successfully',
                    gameLoaded: 'Game loaded successfully',
                    settingsApplied: 'Settings applied',
                    playerCreated: 'Player created',
                    tradeCompleted: 'Trade completed',
                    achievementUnlocked: 'Achievement unlocked!',
                    levelUp: 'Level up!',
                    newUnlock: 'New unlock available',
                    connectionLost: 'Connection lost',
                    reconnecting: 'Reconnecting...',
                    updateAvailable: 'Update available',
                    insufficientFunds: 'Insufficient funds',
                    itemPurchased: 'Item purchased',
                    equipmentUpgraded: 'Equipment upgraded'
                },

                // Errors
                errors: {
                    genericError: 'An error occurred',
                    loadFailed: 'Failed to load',
                    saveFailed: 'Failed to save',
                    connectionFailed: 'Connection failed',
                    serverUnavailable: 'Server unavailable',
                    invalidInput: 'Invalid input',
                    fileCorrupted: 'File corrupted',
                    incompatibleVersion: 'Incompatible version',
                    permissionDenied: 'Permission denied',
                    timeout: 'Request timed out',
                    notFound: 'Not found',
                    alreadyExists: 'Already exists',
                    limitReached: 'Limit reached'
                },

                // Time
                time: {
                    second: 'second',
                    seconds: 'seconds',
                    minute: 'minute',
                    minutes: 'minutes',
                    hour: 'hour',
                    hours: 'hours',
                    day: 'day',
                    days: 'days',
                    week: 'week',
                    weeks: 'weeks',
                    month: 'month',
                    months: 'months',
                    year: 'year',
                    years: 'years',
                    ago: '{{time}} ago',
                    remaining: '{{time}} remaining'
                },

                // Weather
                weather: {
                    sunny: 'Sunny',
                    cloudy: 'Cloudy',
                    overcast: 'Overcast',
                    rainy: 'Rainy',
                    stormy: 'Stormy',
                    snowy: 'Snowy',
                    foggy: 'Foggy',
                    windy: 'Windy',
                    clear: 'Clear',
                    partlyCloudy: 'Partly Cloudy',
                    lightRain: 'Light Rain',
                    heavyRain: 'Heavy Rain'
                },

                // Game Modes
                modes: {
                    exhibition: 'Exhibition',
                    season: 'Season',
                    playoffs: 'Playoffs',
                    homeRunDerby: 'Home Run Derby',
                    practice: 'Practice',
                    challenge: 'Challenge',
                    scenario: 'Scenario',
                    classic: 'Classic',
                    arcade: 'Arcade',
                    simulation: 'Simulation'
                }
            }
        };

        this.languagePacks.set(Language.ENGLISH, englishPack);
    }

    /**
     * Detect browser language
     */
    private detectBrowserLanguage(): void {
        const browserLang = navigator.language || (navigator as any).userLanguage;
        const langCode = browserLang.split('-')[0];

        // Try to match browser language
        for (const lang of Object.values(Language)) {
            if (lang.startsWith(langCode)) {
                this.currentLanguage = lang as Language;
                break;
            }
        }
    }

    /**
     * Load language pack
     */
    public async loadLanguagePack(language: Language, packData?: LanguagePack): Promise<void> {
        if (packData) {
            this.languagePacks.set(language, packData);
        } else if (this.translationServerUrl) {
            // Load from server
            try {
                const response = await fetch(`${this.translationServerUrl}/${language}.json`);
                const pack: LanguagePack = await response.json();
                this.languagePacks.set(language, pack);
            } catch (error) {
                console.error(`Failed to load language pack for ${language}:`, error);
            }
        }
    }

    /**
     * Set current language
     */
    public setLanguage(language: Language): void {
        if (!this.languagePacks.has(language)) {
            console.warn(`Language pack not loaded for ${language}, using fallback`);
            return;
        }

        this.currentLanguage = language;
        this.translationCache.clear();
        this.onLanguageChangedObservable.notifyObservers(language);

        // Update HTML lang attribute
        document.documentElement.lang = language;

        // Update text direction
        const metadata = this.languageMetadata.get(language);
        if (metadata) {
            document.documentElement.dir = metadata.direction;
        }
    }

    /**
     * Get current language
     */
    public getCurrentLanguage(): Language {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     */
    public getAvailableLanguages(): Language[] {
        return Array.from(this.languagePacks.keys());
    }

    /**
     * Get language metadata
     */
    public getLanguageMetadata(language: Language): LanguageMetadata | undefined {
        return this.languageMetadata.get(language);
    }

    /**
     * Translate text
     */
    public t(key: string, options?: TranslationOptions): string {
        // Check cache
        const cacheKey = this.getCacheKey(key, options);
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey)!;
        }

        // Parse key
        const { namespace, translationKey } = this.parseKey(key);

        // Get translation
        let translation = this.getTranslation(namespace, translationKey, options);

        // Fallback if not found
        if (!translation) {
            translation = this.getFallbackTranslation(namespace, translationKey, options);
        }

        // Still not found - track missing and use default or key
        if (!translation) {
            this.trackMissingTranslation(namespace, translationKey);
            translation = options?.defaultValue || key;
        }

        // Apply interpolation
        if (options?.params) {
            translation = this.interpolate(translation, options.params);
        }

        // Cache result
        this.translationCache.set(cacheKey, translation);

        return translation;
    }

    /**
     * Parse translation key
     */
    private parseKey(key: string): { namespace: string; translationKey: string } {
        const parts = key.split(':');
        if (parts.length === 2) {
            return { namespace: parts[0], translationKey: parts[1] };
        }
        return { namespace: 'common', translationKey: key };
    }

    /**
     * Get translation from current language pack
     */
    private getTranslation(namespace: string, key: string, options?: TranslationOptions): string | null {
        const pack = this.languagePacks.get(this.currentLanguage);
        if (!pack || !pack.translations[namespace]) {
            return null;
        }

        const value = pack.translations[namespace][key];

        if (typeof value === 'string') {
            return value;
        }

        // Handle plural
        if (options?.count !== undefined && this.isPlural(value)) {
            return this.getPlural(value as TranslationPlural, options.count);
        }

        // Handle context
        if (options?.context && this.isContext(value)) {
            const contextValue = (value as TranslationContext)[options.context];
            return contextValue || null;
        }

        return null;
    }

    /**
     * Get fallback translation
     */
    private getFallbackTranslation(namespace: string, key: string, options?: TranslationOptions): string | null {
        if (this.currentLanguage === this.fallbackLanguage) {
            return null;
        }

        const pack = this.languagePacks.get(this.fallbackLanguage);
        if (!pack || !pack.translations[namespace]) {
            return null;
        }

        const value = pack.translations[namespace][key];

        if (typeof value === 'string') {
            return value;
        }

        if (options?.count !== undefined && this.isPlural(value)) {
            return this.getPlural(value as TranslationPlural, options.count);
        }

        if (options?.context && this.isContext(value)) {
            return (value as TranslationContext)[options.context] || null;
        }

        return null;
    }

    /**
     * Check if value is plural
     */
    private isPlural(value: any): boolean {
        return value && typeof value === 'object' && ('one' in value || 'other' in value);
    }

    /**
     * Check if value is context
     */
    private isContext(value: any): boolean {
        return value && typeof value === 'object' && !this.isPlural(value);
    }

    /**
     * Get plural form
     */
    private getPlural(plural: TranslationPlural, count: number): string {
        if (count === 0 && plural.zero) {
            return plural.zero;
        }
        if (count === 1 && plural.one) {
            return plural.one;
        }
        if (count === 2 && plural.two) {
            return plural.two;
        }
        if (plural.few && this.isFew(count)) {
            return plural.few;
        }
        if (plural.many && this.isMany(count)) {
            return plural.many;
        }
        return plural.other;
    }

    /**
     * Check if count is "few" (language-specific)
     */
    private isFew(count: number): boolean {
        // Simplified - would need proper plural rules per language
        return count >= 3 && count <= 10;
    }

    /**
     * Check if count is "many" (language-specific)
     */
    private isMany(count: number): boolean {
        // Simplified - would need proper plural rules per language
        return count > 10;
    }

    /**
     * Interpolate parameters into string
     */
    private interpolate(text: string, params: InterpolationParams): string {
        let result = text;

        for (const [key, value] of Object.entries(params)) {
            const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            result = result.replace(pattern, String(value));
        }

        return result;
    }

    /**
     * Get cache key
     */
    private getCacheKey(key: string, options?: TranslationOptions): string {
        let cacheKey = `${this.currentLanguage}:${key}`;

        if (options?.count !== undefined) {
            cacheKey += `:count:${options.count}`;
        }

        if (options?.context) {
            cacheKey += `:context:${options.context}`;
        }

        return cacheKey;
    }

    /**
     * Track missing translation
     */
    private trackMissingTranslation(namespace: string, key: string): void {
        const fullKey = `${namespace}:${key}`;

        if (!this.missingTranslations.has(this.currentLanguage)) {
            this.missingTranslations.set(this.currentLanguage, new Set());
        }

        const missing = this.missingTranslations.get(this.currentLanguage)!;
        if (!missing.has(fullKey)) {
            missing.add(fullKey);
            console.warn(`Missing translation: ${fullKey} for language ${this.currentLanguage}`);
        }
    }

    /**
     * Get missing translations report
     */
    public getMissingTranslations(language?: Language): string[] {
        const lang = language || this.currentLanguage;
        const missing = this.missingTranslations.get(lang);
        return missing ? Array.from(missing) : [];
    }

    /**
     * Format number with locale
     */
    public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
        return new Intl.NumberFormat(this.currentLanguage, options).format(value);
    }

    /**
     * Format currency
     */
    public formatCurrency(value: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat(this.currentLanguage, {
            style: 'currency',
            currency
        }).format(value);
    }

    /**
     * Format date
     */
    public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
        return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    }

    /**
     * Format relative time
     */
    public formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
        const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
        return rtf.format(value, unit);
    }

    /**
     * Subscribe to language changes
     */
    public onLanguageChanged(callback: (language: Language) => void): void {
        this.onLanguageChangedObservable.add(callback);
    }

    /**
     * Export translations for current language
     */
    public exportTranslations(): LanguagePack | null {
        return this.languagePacks.get(this.currentLanguage) || null;
    }

    /**
     * Import translations
     */
    public importTranslations(pack: LanguagePack): void {
        this.languagePacks.set(pack.language, pack);
        this.translationCache.clear();
    }

    /**
     * Set translation server URL
     */
    public setTranslationServer(url: string): void {
        this.translationServerUrl = url;
    }

    /**
     * Clear translation cache
     */
    public clearCache(): void {
        this.translationCache.clear();
    }

    /**
     * Get translation coverage
     */
    public getTranslationCoverage(language: Language): number {
        const pack = this.languagePacks.get(language);
        const basePack = this.languagePacks.get(this.fallbackLanguage);

        if (!pack || !basePack) {
            return 0;
        }

        let totalKeys = 0;
        let translatedKeys = 0;

        for (const namespace in basePack.translations) {
            const baseNamespace = basePack.translations[namespace];
            const translatedNamespace = pack.translations[namespace] || {};

            for (const key in baseNamespace) {
                totalKeys++;
                if (translatedNamespace[key]) {
                    translatedKeys++;
                }
            }
        }

        return totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0;
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.translationCache.clear();
        this.missingTranslations.clear();
        this.onLanguageChangedObservable.clear();
    }
}

/**
 * Global localization instance
 */
export const localization = new LocalizationSystem();

/**
 * Translation shorthand function
 */
export function t(key: string, options?: TranslationOptions): string {
    return localization.t(key, options);
}
