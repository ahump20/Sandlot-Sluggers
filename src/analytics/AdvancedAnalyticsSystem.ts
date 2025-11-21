/**
 * Advanced Analytics and Statistics System for Sandlot Sluggers
 * Provides comprehensive stat tracking and analysis
 *
 * Features:
 * - Player statistics tracking (batting, pitching, fielding, baserunning)
 * - Team statistics and aggregation
 * - Season/career statistics
 * - Advanced metrics (WAR, OPS+, FIP, wRC+, etc.)
 * - Situational statistics (with RISP, vs LHP/RHP, day/night, etc.)
 * - Spray charts and heat maps
 * - Pitch tracking and analysis
 * - Performance trends and projections
 * - Comparative analysis
 * - Historical records tracking
 * - Real-time stat updates
 * - Data visualization support
 * - Export to various formats (JSON, CSV, XML)
 */

import { Observable } from '@babylonjs/core/Misc/observable';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';

export enum StatCategory {
    BATTING = 'batting',
    PITCHING = 'pitching',
    FIELDING = 'fielding',
    BASERUNNING = 'baserunning',
    TEAM = 'team'
}

export enum StatPeriod {
    GAME = 'game',
    SERIES = 'series',
    WEEK = 'week',
    MONTH = 'month',
    SEASON = 'season',
    CAREER = 'career',
    POSTSEASON = 'postseason',
    ALL_STAR = 'all_star'
}

export enum SituationType {
    OVERALL = 'overall',
    VS_LHP = 'vs_lhp',
    VS_RHP = 'vs_rhp',
    WITH_RISP = 'with_risp',
    BASES_EMPTY = 'bases_empty',
    RUNNERS_ON = 'runners_on',
    SCORING_POSITION = 'scoring_position',
    TWO_OUTS = 'two_outs',
    CLOSE_AND_LATE = 'close_and_late',
    HOME = 'home',
    AWAY = 'away',
    DAY_GAME = 'day_game',
    NIGHT_GAME = 'night_game',
    GRASS = 'grass',
    TURF = 'turf',
    INDOOR = 'indoor',
    OUTDOOR = 'outdoor'
}

export enum PitchType {
    FASTBALL_4SEAM = 'fastball_4seam',
    FASTBALL_2SEAM = 'fastball_2seam',
    SINKER = 'sinker',
    CUTTER = 'cutter',
    SLIDER = 'slider',
    CURVEBALL = 'curveball',
    CHANGEUP = 'changeup',
    SPLITTER = 'splitter',
    KNUCKLEBALL = 'knuckleball',
    SCREWBALL = 'screwball',
    FORKBALL = 'forkball',
    EEPHUS = 'eephus'
}

export enum BattedBallType {
    GROUND_BALL = 'ground_ball',
    LINE_DRIVE = 'line_drive',
    FLY_BALL = 'fly_ball',
    POP_UP = 'pop_up',
    BUNT = 'bunt'
}

export enum HitLocation {
    INFIELD_LEFT = 'infield_left',
    INFIELD_CENTER = 'infield_center',
    INFIELD_RIGHT = 'infield_right',
    OUTFIELD_LEFT = 'outfield_left',
    OUTFIELD_CENTER = 'outfield_center',
    OUTFIELD_RIGHT = 'outfield_right',
    FOUL_LEFT = 'foul_left',
    FOUL_RIGHT = 'foul_right'
}

export interface BattingStats {
    // Basic stats
    gamesPlayed: number;
    plateAppearances: number;
    atBats: number;
    runs: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    runsBattedIn: number;
    walks: number;
    intentionalWalks: number;
    strikeouts: number;
    hitByPitch: number;
    sacrificeFlies: number;
    sacrificeBunts: number;
    stolenBases: number;
    caughtStealing: number;
    groundedIntoDoublePlays: number;

    // Advanced stats (calculated)
    battingAverage: number;
    onBasePercentage: number;
    sluggingPercentage: number;
    onBasePlusSlugging: number;
    onBasePlusSluggingPlus: number; // OPS+
    weightedRunsCreated: number; // wRC
    weightedRunsCreatedPlus: number; // wRC+
    battingAverageOnBallsInPlay: number; // BABIP
    isolatedPower: number; // ISO
    secondaryAverage: number;
    walkToStrikeoutRatio: number;
    extraBaseHits: number;
    totalBases: number;
    winsAboveReplacement: number; // WAR

    // Contact quality
    hardHitPercentage: number;
    barrelPercentage: number;
    exitVelocityAverage: number;
    launchAngleAverage: number;
    sweetSpotPercentage: number;

    // Discipline
    zoneSwingPercentage: number;
    outsideSwingPercentage: number;
    swingPercentage: number;
    contactPercentage: number;
    zoneContactPercentage: number;
    chaseRate: number;
}

export interface PitchingStats {
    // Basic stats
    gamesPlayed: number;
    gamesStarted: number;
    completeGames: number;
    shutouts: number;
    wins: number;
    losses: number;
    saves: number;
    saveOpportunities: number;
    holds: number;
    inningsPitched: number;
    hitsAllowed: number;
    runsAllowed: number;
    earnedRuns: number;
    homeRunsAllowed: number;
    walksAllowed: number;
    intentionalWalksAllowed: number;
    strikeouts: number;
    hitBatsmen: number;
    balks: number;
    wildPitches: number;
    pickoffs: number;
    totalBattersFaced: number;
    pitchCount: number;
    strikes: number;

    // Advanced stats (calculated)
    earnedRunAverage: number; // ERA
    walksAndHitsPerInningPitched: number; // WHIP
    strikeoutsPerNine: number; // K/9
    walksPerNine: number; // BB/9
    homeRunsPerNine: number; // HR/9
    strikeoutToWalkRatio: number; // K/BB
    fieldingIndependentPitching: number; // FIP
    fieldingIndependentPitchingMinus: number; // FIP-
    expectedFieldingIndependentPitching: number; // xFIP
    skillInteractiveEarnedRunAverage: number; // SIERA
    leftOnBasePercentage: number; // LOB%
    battingAverageOnBallsInPlay: number; // BABIP
    winsAboveReplacement: number; // WAR

    // Pitch quality
    averageVelocity: number;
    maxVelocity: number;
    spinRate: number;
    verticalMovement: number;
    horizontalMovement: number;
    releaseExtension: number;
    strikePercentage: number;
    firstPitchStrikePercentage: number;
    swingAndMissPercentage: number;
    chaseRate: number;
    groundBallPercentage: number;
    flyBallPercentage: number;
    lineDrivePercentage: number;
}

export interface FieldingStats {
    // Basic stats
    gamesPlayed: number;
    gamesStarted: number;
    inningsPlayed: number;
    totalChances: number;
    putouts: number;
    assists: number;
    errors: number;
    doublePlays: number;
    triplePlays: number;
    passedBalls: number; // catchers only
    stolenBasesAllowed: number; // catchers only
    caughtStealingAllowed: number; // catchers only
    pickoffs: number; // catchers only

    // Advanced stats (calculated)
    fieldingPercentage: number;
    rangeFactorPerGame: number;
    rangeFactorPerNineInnings: number;
    defensiveRunsSaved: number; // DRS
    ultimateZoneRating: number; // UZR
    ultimateZoneRatingPerOneHundredFifty: number; // UZR/150
    caughtStealingPercentage: number; // catchers only
    popTimeAverage: number; // catchers only
    framingRunsAboveAverage: number; // catchers only
}

export interface BaserunningStats {
    // Basic stats
    stolenBases: number;
    caughtStealing: number;
    stolenBaseAttempts: number;
    pickoffs: number;
    advancesOnWildPitch: number;
    advancesOnPassedBall: number;
    advancesOnSacrifice: number;

    // Advanced stats (calculated)
    stolenBasePercentage: number;
    baserunningRunsAboveAverage: number; // BsR
    extraBasesOnHits: number;
    extraBasePercentage: number;
    firstToThirdOnSinglePercentage: number;
    firstToHomeOnDoublePercentage: number;
    secondToHomeOnSinglePercentage: number;
}

export interface TeamStats {
    // Record
    wins: number;
    losses: number;
    winPercentage: number;
    gamesBack: number;
    streak: string;
    lastTenRecord: string;
    homeRecord: string;
    awayRecord: string;
    divisionRecord: string;
    conferenceRecord: string;

    // Aggregate batting stats
    teamBatting: BattingStats;

    // Aggregate pitching stats
    teamPitching: PitchingStats;

    // Aggregate fielding stats
    teamFielding: FieldingStats;

    // Run differential
    runsScored: number;
    runsAllowed: number;
    runDifferential: number;
    pythagoreanWinPercentage: number;
}

export interface PitchData {
    pitchNumber: number;
    pitchType: PitchType;
    velocity: number;
    spinRate: number;
    releasePoint: Vector3;
    location: Vector2; // Strike zone coordinates
    movement: Vector2; // Horizontal and vertical movement
    result: PitchResult;
    count: { balls: number; strikes: number };
    timestamp: number;
}

export enum PitchResult {
    BALL = 'ball',
    CALLED_STRIKE = 'called_strike',
    SWINGING_STRIKE = 'swinging_strike',
    FOUL = 'foul',
    FOUL_BUNT = 'foul_bunt',
    HIT_BY_PITCH = 'hit_by_pitch',
    IN_PLAY = 'in_play'
}

export interface BattedBallData {
    exitVelocity: number;
    launchAngle: number;
    direction: number; // Horizontal angle in degrees
    location: HitLocation;
    ballType: BattedBallType;
    hangTime: number;
    distance: number;
    result: BattedBallResult;
    sprayChartPosition: Vector2;
}

export enum BattedBallResult {
    SINGLE = 'single',
    DOUBLE = 'double',
    TRIPLE = 'triple',
    HOME_RUN = 'home_run',
    OUT_GROUND = 'out_ground',
    OUT_FLY = 'out_fly',
    OUT_LINE = 'out_line',
    OUT_POP = 'out_pop',
    ERROR = 'error',
    FIELDERS_CHOICE = 'fielders_choice',
    DOUBLE_PLAY = 'double_play',
    TRIPLE_PLAY = 'triple_play'
}

export interface PlateAppearanceData {
    playerId: string;
    pitcherId: string;
    date: Date;
    inning: number;
    outs: number;
    runnersOn: { first: boolean; second: boolean; third: boolean };
    count: { balls: number; strikes: number };
    pitches: PitchData[];
    result: PlateAppearanceResult;
    battedBall?: BattedBallData;
    runsBattedIn: number;
    leverage: number; // Leverage index
}

export enum PlateAppearanceResult {
    SINGLE = 'single',
    DOUBLE = 'double',
    TRIPLE = 'triple',
    HOME_RUN = 'home_run',
    WALK = 'walk',
    INTENTIONAL_WALK = 'intentional_walk',
    HIT_BY_PITCH = 'hit_by_pitch',
    STRIKEOUT = 'strikeout',
    STRIKEOUT_SWINGING = 'strikeout_swinging',
    STRIKEOUT_LOOKING = 'strikeout_looking',
    GROUND_OUT = 'ground_out',
    FLY_OUT = 'fly_out',
    LINE_OUT = 'line_out',
    POP_OUT = 'pop_out',
    ERROR = 'error',
    FIELDERS_CHOICE = 'fielders_choice',
    DOUBLE_PLAY = 'double_play',
    TRIPLE_PLAY = 'triple_play',
    SACRIFICE_FLY = 'sacrifice_fly',
    SACRIFICE_BUNT = 'sacrifice_bunt'
}

export interface GameStats {
    gameId: string;
    date: Date;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    innings: number;
    playerStats: Map<string, {
        batting?: BattingStats;
        pitching?: PitchingStats;
        fielding?: FieldingStats;
    }>;
    plateAppearances: PlateAppearanceData[];
}

export interface SeasonStats {
    playerId: string;
    season: number;
    team: string;
    batting?: BattingStats;
    pitching?: PitchingStats;
    fielding?: Map<string, FieldingStats>; // By position
    baserunning?: BaserunningStats;
    situationalStats: Map<SituationType, Partial<BattingStats | PitchingStats>>;
}

export interface CareerStats {
    playerId: string;
    seasons: SeasonStats[];
    careerTotals: {
        batting?: BattingStats;
        pitching?: PitchingStats;
        fielding?: Map<string, FieldingStats>;
        baserunning?: BaserunningStats;
    };
    awards: Award[];
    milestones: Milestone[];
}

export interface Award {
    id: string;
    name: string;
    season: number;
    date: Date;
    description: string;
}

export interface Milestone {
    id: string;
    name: string;
    value: number;
    date: Date;
    game: string;
    description: string;
}

export interface SprayChart {
    playerId: string;
    period: StatPeriod;
    hits: Vector2[];
    outs: Vector2[];
    homeRuns: Vector2[];
    heatMapData: number[][]; // 2D grid for density
}

export interface PerformanceTrend {
    playerId: string;
    statName: string;
    dataPoints: { date: Date; value: number }[];
    trendLine: { slope: number; intercept: number };
    projection: { date: Date; value: number }[];
}

export interface Comparison {
    players: string[];
    stats: Map<string, number[]>;
    period: StatPeriod;
}

export class AdvancedAnalyticsSystem {
    private playerStats: Map<string, CareerStats>;
    private teamStats: Map<string, TeamStats>;
    private gameStats: Map<string, GameStats>;
    private seasonStats: Map<string, Map<number, SeasonStats>>; // playerId -> season -> stats
    private plateAppearances: PlateAppearanceData[];
    private sprayCharts: Map<string, SprayChart>;
    private performanceTrends: Map<string, PerformanceTrend[]>;

    // League averages for advanced stat calculations
    private leagueAverages: {
        battingAverage: number;
        onBasePercentage: number;
        sluggingPercentage: number;
        earnedRunAverage: number;
        fieldingIndependentPitching: number;
        fieldingIndependentPitchingConstant: number; // FIP constant
        weightedOnBaseAverage: number; // wOBA
        weightedRunsAboveAverage: number; // wRAA
    };

    // Weights for wOBA calculation
    private wobaWeights: {
        walk: number;
        hitByPitch: number;
        single: number;
        double: number;
        triple: number;
        homeRun: number;
    };

    // Observables for events
    public onStatsUpdated: Observable<{ playerId: string; category: StatCategory }>;
    public onMilestoneReached: Observable<Milestone>;
    public onRecordBroken: Observable<{ playerId: string; record: string; oldValue: number; newValue: number }>;
    public onTrendCalculated: Observable<PerformanceTrend>;

    constructor() {
        this.playerStats = new Map();
        this.teamStats = new Map();
        this.gameStats = new Map();
        this.seasonStats = new Map();
        this.plateAppearances = [];
        this.sprayCharts = new Map();
        this.performanceTrends = new Map();

        this.onStatsUpdated = new Observable();
        this.onMilestoneReached = new Observable();
        this.onRecordBroken = new Observable();
        this.onTrendCalculated = new Observable();

        // Initialize league averages (typical MLB values)
        this.leagueAverages = {
            battingAverage: 0.250,
            onBasePercentage: 0.320,
            sluggingPercentage: 0.420,
            earnedRunAverage: 4.00,
            fieldingIndependentPitching: 4.00,
            fieldingIndependentPitchingConstant: 3.10,
            weightedOnBaseAverage: 0.320,
            weightedRunsAboveAverage: 0
        };

        // Initialize wOBA weights (typical MLB values)
        this.wobaWeights = {
            walk: 0.69,
            hitByPitch: 0.72,
            single: 0.88,
            double: 1.24,
            triple: 1.56,
            homeRun: 1.95
        };
    }

    public recordPlateAppearance(data: PlateAppearanceData): void {
        this.plateAppearances.push(data);
        this.updateBattingStats(data.playerId, data);
        this.updatePitchingStats(data.pitcherId, data);
        this.checkForMilestones(data.playerId, data);
    }

    private updateBattingStats(playerId: string, pa: PlateAppearanceData): void {
        let careerStats = this.playerStats.get(playerId);
        if (!careerStats) {
            careerStats = this.createNewCareerStats(playerId);
            this.playerStats.set(playerId, careerStats);
        }

        const batting = careerStats.careerTotals.batting!;
        batting.plateAppearances++;

        // Update based on result
        switch (pa.result) {
            case PlateAppearanceResult.SINGLE:
                batting.atBats++;
                batting.hits++;
                break;
            case PlateAppearanceResult.DOUBLE:
                batting.atBats++;
                batting.hits++;
                batting.doubles++;
                break;
            case PlateAppearanceResult.TRIPLE:
                batting.atBats++;
                batting.hits++;
                batting.triples++;
                break;
            case PlateAppearanceResult.HOME_RUN:
                batting.atBats++;
                batting.hits++;
                batting.homeRuns++;
                break;
            case PlateAppearanceResult.WALK:
                batting.walks++;
                break;
            case PlateAppearanceResult.INTENTIONAL_WALK:
                batting.walks++;
                batting.intentionalWalks++;
                break;
            case PlateAppearanceResult.HIT_BY_PITCH:
                batting.hitByPitch++;
                break;
            case PlateAppearanceResult.STRIKEOUT:
            case PlateAppearanceResult.STRIKEOUT_SWINGING:
            case PlateAppearanceResult.STRIKEOUT_LOOKING:
                batting.atBats++;
                batting.strikeouts++;
                break;
            case PlateAppearanceResult.SACRIFICE_FLY:
                batting.sacrificeFlies++;
                break;
            case PlateAppearanceResult.SACRIFICE_BUNT:
                batting.sacrificeBunts++;
                break;
            case PlateAppearanceResult.DOUBLE_PLAY:
                batting.atBats++;
                batting.groundedIntoDoublePlays++;
                break;
            default:
                batting.atBats++;
                break;
        }

        batting.runsBattedIn += pa.runsBattedIn;

        // Calculate derived stats
        this.calculateBattingStats(batting);

        // Update spray chart if batted ball
        if (pa.battedBall) {
            this.updateSprayChart(playerId, pa.battedBall);
        }

        this.onStatsUpdated.notifyObservers({ playerId, category: StatCategory.BATTING });
    }

    private calculateBattingStats(stats: BattingStats): void {
        // Basic rate stats
        stats.battingAverage = stats.atBats > 0 ? stats.hits / stats.atBats : 0;

        const onBaseNumerator = stats.hits + stats.walks + stats.hitByPitch;
        const onBaseDenominator = stats.atBats + stats.walks + stats.hitByPitch + stats.sacrificeFlies;
        stats.onBasePercentage = onBaseDenominator > 0 ? onBaseNumerator / onBaseDenominator : 0;

        stats.totalBases = stats.hits + stats.doubles + (2 * stats.triples) + (3 * stats.homeRuns);
        stats.sluggingPercentage = stats.atBats > 0 ? stats.totalBases / stats.atBats : 0;

        stats.onBasePlusSlugging = stats.onBasePercentage + stats.sluggingPercentage;

        // OPS+ (normalized to league average = 100)
        const leagueOPS = this.leagueAverages.onBasePercentage + this.leagueAverages.sluggingPercentage;
        stats.onBasePlusSluggingPlus = leagueOPS > 0 ? (stats.onBasePlusSlugging / leagueOPS) * 100 : 0;

        // Isolated Power
        stats.isolatedPower = stats.sluggingPercentage - stats.battingAverage;

        // Extra base hits
        stats.extraBaseHits = stats.doubles + stats.triples + stats.homeRuns;

        // Walk to strikeout ratio
        stats.walkToStrikeoutRatio = stats.strikeouts > 0 ? stats.walks / stats.strikeouts : stats.walks;

        // Secondary average
        const secondaryNumerator = (stats.walks + stats.totalBases - stats.hits + stats.stolenBases);
        stats.secondaryAverage = stats.atBats > 0 ? secondaryNumerator / stats.atBats : 0;

        // BABIP (Batting Average on Balls In Play)
        const bip = stats.atBats - stats.strikeouts - stats.homeRuns;
        const hitsWithoutHomeRuns = stats.hits - stats.homeRuns;
        stats.battingAverageOnBallsInPlay = bip > 0 ? hitsWithoutHomeRuns / bip : 0;

        // wOBA (Weighted On-Base Average)
        const wobaWeightedHits =
            (this.wobaWeights.walk * (stats.walks - stats.intentionalWalks)) +
            (this.wobaWeights.hitByPitch * stats.hitByPitch) +
            (this.wobaWeights.single * (stats.hits - stats.doubles - stats.triples - stats.homeRuns)) +
            (this.wobaWeights.double * stats.doubles) +
            (this.wobaWeights.triple * stats.triples) +
            (this.wobaWeights.homeRun * stats.homeRuns);

        const wobaDenominator = stats.atBats + stats.walks - stats.intentionalWalks + stats.sacrificeFlies + stats.hitByPitch;
        const woba = wobaDenominator > 0 ? wobaWeightedHits / wobaDenominator : 0;

        // wRC (Weighted Runs Created)
        stats.weightedRunsCreated = ((woba - this.leagueAverages.weightedOnBaseAverage) / 1.15) * stats.plateAppearances;

        // wRC+ (normalized to league average = 100)
        const leagueWRC = this.leagueAverages.weightedRunsAboveAverage;
        stats.weightedRunsCreatedPlus = leagueWRC > 0 ? (stats.weightedRunsCreated / leagueWRC) * 100 : 100;

        // WAR calculation (simplified - real WAR is very complex)
        const battingRuns = stats.weightedRunsCreated;
        const baserunningRuns = (stats.stolenBases * 0.2) - (stats.caughtStealing * 0.4);
        const fieldingRuns = 0; // Would need fielding stats
        const positionalAdjustment = 0; // Depends on position
        const replacementLevel = stats.plateAppearances * 0.03; // Simplified
        stats.winsAboveReplacement = (battingRuns + baserunningRuns + fieldingRuns + positionalAdjustment - replacementLevel) / 10;
    }

    private updatePitchingStats(pitcherId: string, pa: PlateAppearanceData): void {
        let careerStats = this.playerStats.get(pitcherId);
        if (!careerStats) {
            careerStats = this.createNewCareerStats(pitcherId);
            this.playerStats.set(pitcherId, careerStats);
        }

        const pitching = careerStats.careerTotals.pitching!;
        pitching.totalBattersFaced++;
        pitching.pitchCount += pa.pitches.length;

        // Count strikes
        for (const pitch of pa.pitches) {
            if (pitch.result === PitchResult.CALLED_STRIKE ||
                pitch.result === PitchResult.SWINGING_STRIKE ||
                pitch.result === PitchResult.FOUL) {
                pitching.strikes++;
            }
        }

        // Update based on result
        switch (pa.result) {
            case PlateAppearanceResult.SINGLE:
            case PlateAppearanceResult.DOUBLE:
            case PlateAppearanceResult.TRIPLE:
            case PlateAppearanceResult.HOME_RUN:
                pitching.hitsAllowed++;
                if (pa.result === PlateAppearanceResult.HOME_RUN) {
                    pitching.homeRunsAllowed++;
                }
                break;
            case PlateAppearanceResult.WALK:
                pitching.walksAllowed++;
                break;
            case PlateAppearanceResult.INTENTIONAL_WALK:
                pitching.walksAllowed++;
                pitching.intentionalWalksAllowed++;
                break;
            case PlateAppearanceResult.HIT_BY_PITCH:
                pitching.hitBatsmen++;
                break;
            case PlateAppearanceResult.STRIKEOUT:
            case PlateAppearanceResult.STRIKEOUT_SWINGING:
            case PlateAppearanceResult.STRIKEOUT_LOOKING:
                pitching.strikeouts++;
                break;
        }

        // Calculate derived stats
        this.calculatePitchingStats(pitching);

        this.onStatsUpdated.notifyObservers({ playerId: pitcherId, category: StatCategory.PITCHING });
    }

    private calculatePitchingStats(stats: PitchingStats): void {
        // ERA (Earned Run Average)
        stats.earnedRunAverage = stats.inningsPitched > 0 ? (stats.earnedRuns * 9) / stats.inningsPitched : 0;

        // WHIP (Walks and Hits per Inning Pitched)
        stats.walksAndHitsPerInningPitched = stats.inningsPitched > 0 ?
            (stats.walksAllowed + stats.hitsAllowed) / stats.inningsPitched : 0;

        // K/9 (Strikeouts per 9 innings)
        stats.strikeoutsPerNine = stats.inningsPitched > 0 ? (stats.strikeouts * 9) / stats.inningsPitched : 0;

        // BB/9 (Walks per 9 innings)
        stats.walksPerNine = stats.inningsPitched > 0 ? (stats.walksAllowed * 9) / stats.inningsPitched : 0;

        // HR/9 (Home Runs per 9 innings)
        stats.homeRunsPerNine = stats.inningsPitched > 0 ? (stats.homeRunsAllowed * 9) / stats.inningsPitched : 0;

        // K/BB (Strikeout to Walk Ratio)
        stats.strikeoutToWalkRatio = stats.walksAllowed > 0 ? stats.strikeouts / stats.walksAllowed : stats.strikeouts;

        // FIP (Fielding Independent Pitching)
        const fipNumerator = (13 * stats.homeRunsAllowed) + (3 * stats.walksAllowed) - (2 * stats.strikeouts);
        stats.fieldingIndependentPitching = stats.inningsPitched > 0 ?
            (fipNumerator / stats.inningsPitched) + this.leagueAverages.fieldingIndependentPitchingConstant : 0;

        // FIP- (normalized to league average = 100, lower is better)
        stats.fieldingIndependentPitchingMinus = this.leagueAverages.fieldingIndependentPitching > 0 ?
            (stats.fieldingIndependentPitching / this.leagueAverages.fieldingIndependentPitching) * 100 : 100;

        // Strike percentage
        stats.strikePercentage = stats.pitchCount > 0 ? stats.strikes / stats.pitchCount : 0;

        // BABIP (Batting Average on Balls In Play)
        const bip = stats.totalBattersFaced - stats.strikeouts - stats.homeRunsAllowed - stats.walksAllowed;
        const hitsWithoutHomeRuns = stats.hitsAllowed - stats.homeRunsAllowed;
        stats.battingAverageOnBallsInPlay = bip > 0 ? hitsWithoutHomeRuns / bip : 0;

        // WAR calculation (simplified)
        const runsPreventedVsAverage = (this.leagueAverages.earnedRunAverage - stats.earnedRunAverage) * (stats.inningsPitched / 9);
        stats.winsAboveReplacement = runsPreventedVsAverage / 10;
    }

    private updateSprayChart(playerId: string, battedBall: BattedBallData): void {
        let sprayChart = this.sprayCharts.get(playerId);
        if (!sprayChart) {
            sprayChart = {
                playerId,
                period: StatPeriod.CAREER,
                hits: [],
                outs: [],
                homeRuns: [],
                heatMapData: Array(50).fill(0).map(() => Array(50).fill(0))
            };
            this.sprayCharts.set(playerId, sprayChart);
        }

        const position = battedBall.sprayChartPosition;

        switch (battedBall.result) {
            case BattedBallResult.SINGLE:
            case BattedBallResult.DOUBLE:
            case BattedBallResult.TRIPLE:
                sprayChart.hits.push(position);
                break;
            case BattedBallResult.HOME_RUN:
                sprayChart.homeRuns.push(position);
                break;
            default:
                sprayChart.outs.push(position);
                break;
        }

        // Update heat map
        const gridX = Math.floor((position.x + 1) * 25);
        const gridY = Math.floor((position.y + 1) * 25);
        if (gridX >= 0 && gridX < 50 && gridY >= 0 && gridY < 50) {
            sprayChart.heatMapData[gridY][gridX]++;
        }
    }

    private checkForMilestones(playerId: string, pa: PlateAppearanceData): void {
        const careerStats = this.playerStats.get(playerId);
        if (!careerStats || !careerStats.careerTotals.batting) return;

        const batting = careerStats.careerTotals.batting;
        const milestones = [
            { value: 100, stat: batting.homeRuns, name: '100 Career Home Runs' },
            { value: 200, stat: batting.homeRuns, name: '200 Career Home Runs' },
            { value: 300, stat: batting.homeRuns, name: '300 Career Home Runs' },
            { value: 400, stat: batting.homeRuns, name: '400 Career Home Runs' },
            { value: 500, stat: batting.homeRuns, name: '500 Career Home Runs' },
            { value: 600, stat: batting.homeRuns, name: '600 Career Home Runs' },
            { value: 700, stat: batting.homeRuns, name: '700 Career Home Runs' },
            { value: 1000, stat: batting.hits, name: '1000 Career Hits' },
            { value: 2000, stat: batting.hits, name: '2000 Career Hits' },
            { value: 3000, stat: batting.hits, name: '3000 Career Hits' },
            { value: 1000, stat: batting.runsBattedIn, name: '1000 Career RBI' },
            { value: 2000, stat: batting.runsBattedIn, name: '2000 Career RBI' },
            { value: 100, stat: batting.stolenBases, name: '100 Career Stolen Bases' },
            { value: 200, stat: batting.stolenBases, name: '200 Career Stolen Bases' },
            { value: 300, stat: batting.stolenBases, name: '300 Career Stolen Bases' },
            { value: 400, stat: batting.stolenBases, name: '400 Career Stolen Bases' }
        ];

        for (const milestone of milestones) {
            const previousValue = milestone.stat - 1;
            if (previousValue < milestone.value && milestone.stat >= milestone.value) {
                const milestoneData: Milestone = {
                    id: `${playerId}_${milestone.name}`,
                    name: milestone.name,
                    value: milestone.value,
                    date: new Date(),
                    game: '',
                    description: `${playerId} reached ${milestone.name}`
                };
                careerStats.milestones.push(milestoneData);
                this.onMilestoneReached.notifyObservers(milestoneData);
            }
        }
    }

    private createNewCareerStats(playerId: string): CareerStats {
        return {
            playerId,
            seasons: [],
            careerTotals: {
                batting: this.createEmptyBattingStats(),
                pitching: this.createEmptyPitchingStats(),
                fielding: new Map(),
                baserunning: this.createEmptyBaserunningStats()
            },
            awards: [],
            milestones: []
        };
    }

    private createEmptyBattingStats(): BattingStats {
        return {
            gamesPlayed: 0,
            plateAppearances: 0,
            atBats: 0,
            runs: 0,
            hits: 0,
            doubles: 0,
            triples: 0,
            homeRuns: 0,
            runsBattedIn: 0,
            walks: 0,
            intentionalWalks: 0,
            strikeouts: 0,
            hitByPitch: 0,
            sacrificeFlies: 0,
            sacrificeBunts: 0,
            stolenBases: 0,
            caughtStealing: 0,
            groundedIntoDoublePlays: 0,
            battingAverage: 0,
            onBasePercentage: 0,
            sluggingPercentage: 0,
            onBasePlusSlugging: 0,
            onBasePlusSluggingPlus: 0,
            weightedRunsCreated: 0,
            weightedRunsCreatedPlus: 0,
            battingAverageOnBallsInPlay: 0,
            isolatedPower: 0,
            secondaryAverage: 0,
            walkToStrikeoutRatio: 0,
            extraBaseHits: 0,
            totalBases: 0,
            winsAboveReplacement: 0,
            hardHitPercentage: 0,
            barrelPercentage: 0,
            exitVelocityAverage: 0,
            launchAngleAverage: 0,
            sweetSpotPercentage: 0,
            zoneSwingPercentage: 0,
            outsideSwingPercentage: 0,
            swingPercentage: 0,
            contactPercentage: 0,
            zoneContactPercentage: 0,
            chaseRate: 0
        };
    }

    private createEmptyPitchingStats(): PitchingStats {
        return {
            gamesPlayed: 0,
            gamesStarted: 0,
            completeGames: 0,
            shutouts: 0,
            wins: 0,
            losses: 0,
            saves: 0,
            saveOpportunities: 0,
            holds: 0,
            inningsPitched: 0,
            hitsAllowed: 0,
            runsAllowed: 0,
            earnedRuns: 0,
            homeRunsAllowed: 0,
            walksAllowed: 0,
            intentionalWalksAllowed: 0,
            strikeouts: 0,
            hitBatsmen: 0,
            balks: 0,
            wildPitches: 0,
            pickoffs: 0,
            totalBattersFaced: 0,
            pitchCount: 0,
            strikes: 0,
            earnedRunAverage: 0,
            walksAndHitsPerInningPitched: 0,
            strikeoutsPerNine: 0,
            walksPerNine: 0,
            homeRunsPerNine: 0,
            strikeoutToWalkRatio: 0,
            fieldingIndependentPitching: 0,
            fieldingIndependentPitchingMinus: 0,
            expectedFieldingIndependentPitching: 0,
            skillInteractiveEarnedRunAverage: 0,
            leftOnBasePercentage: 0,
            battingAverageOnBallsInPlay: 0,
            winsAboveReplacement: 0,
            averageVelocity: 0,
            maxVelocity: 0,
            spinRate: 0,
            verticalMovement: 0,
            horizontalMovement: 0,
            releaseExtension: 0,
            strikePercentage: 0,
            firstPitchStrikePercentage: 0,
            swingAndMissPercentage: 0,
            chaseRate: 0,
            groundBallPercentage: 0,
            flyBallPercentage: 0,
            lineDrivePercentage: 0
        };
    }

    private createEmptyBaserunningStats(): BaserunningStats {
        return {
            stolenBases: 0,
            caughtStealing: 0,
            stolenBaseAttempts: 0,
            pickoffs: 0,
            advancesOnWildPitch: 0,
            advancesOnPassedBall: 0,
            advancesOnSacrifice: 0,
            stolenBasePercentage: 0,
            baserunningRunsAboveAverage: 0,
            extraBasesOnHits: 0,
            extraBasePercentage: 0,
            firstToThirdOnSinglePercentage: 0,
            firstToHomeOnDoublePercentage: 0,
            secondToHomeOnSinglePercentage: 0
        };
    }

    public getPlayerStats(playerId: string, period: StatPeriod = StatPeriod.CAREER): CareerStats | SeasonStats | null {
        if (period === StatPeriod.CAREER) {
            return this.playerStats.get(playerId) || null;
        }
        // For other periods, would need additional logic
        return null;
    }

    public getTeamStats(teamId: string): TeamStats | null {
        return this.teamStats.get(teamId) || null;
    }

    public getSprayChart(playerId: string): SprayChart | null {
        return this.sprayCharts.get(playerId) || null;
    }

    public calculatePerformanceTrend(playerId: string, statName: string, window: number = 10): PerformanceTrend {
        // Calculate trend over last N games
        // This is a simplified implementation
        const trend: PerformanceTrend = {
            playerId,
            statName,
            dataPoints: [],
            trendLine: { slope: 0, intercept: 0 },
            projection: []
        };

        // Would calculate linear regression here
        return trend;
    }

    public comparePlayersStats(playerIds: string[], stats: string[], period: StatPeriod): Comparison {
        const comparison: Comparison = {
            players: playerIds,
            stats: new Map(),
            period
        };

        for (const stat of stats) {
            const values: number[] = [];
            for (const playerId of playerIds) {
                const playerStats = this.getPlayerStats(playerId, period);
                // Extract specific stat value
                values.push(0); // Placeholder
            }
            comparison.stats.set(stat, values);
        }

        return comparison;
    }

    public exportToJSON(): string {
        const data = {
            playerStats: Array.from(this.playerStats.entries()),
            teamStats: Array.from(this.teamStats.entries()),
            plateAppearances: this.plateAppearances,
            sprayCharts: Array.from(this.sprayCharts.entries())
        };
        return JSON.stringify(data, null, 2);
    }

    public exportToCSV(playerId: string): string {
        const stats = this.getPlayerStats(playerId);
        if (!stats) return '';
        
        // Check if it's CareerStats (has careerTotals property)
        if ('careerTotals' in stats && stats.careerTotals.batting) {
            const batting = stats.careerTotals.batting;
            const headers = Object.keys(batting).join(',');
            const values = Object.values(batting).join(',');
            return `${headers}\n${values}`;
        }
        
        return '';
    }

    public dispose(): void {
        this.playerStats.clear();
        this.teamStats.clear();
        this.gameStats.clear();
        this.seasonStats.clear();
        this.plateAppearances = [];
        this.sprayCharts.clear();
        this.performanceTrends.clear();
    }
}
