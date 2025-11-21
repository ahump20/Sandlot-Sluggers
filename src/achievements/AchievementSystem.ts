import { Observable } from '@babylonjs/core';

/**
 * Achievement category
 */
export enum AchievementCategory {
    BATTING = 'batting',
    PITCHING = 'pitching',
    FIELDING = 'fielding',
    BASE_RUNNING = 'base_running',
    CAREER = 'career',
    SPECIAL = 'special',
    COLLECTION = 'collection',
    MILESTONE = 'milestone',
    CHALLENGE = 'challenge',
    SECRET = 'secret'
}

/**
 * Achievement rarity
 */
export enum AchievementRarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

/**
 * Achievement condition type
 */
export enum ConditionType {
    SINGLE_VALUE = 'single_value',
    CUMULATIVE = 'cumulative',
    STREAK = 'streak',
    CONCURRENT = 'concurrent',
    TIME_BASED = 'time_based',
    SPECIAL = 'special'
}

/**
 * Achievement condition
 */
export interface AchievementCondition {
    id: string;
    type: ConditionType;
    stat: string;
    targetValue: number;
    currentValue?: number;
    comparison?: 'equal' | 'greater' | 'less' | 'greater_equal' | 'less_equal';
}

/**
 * Achievement reward
 */
export interface AchievementReward {
    coins?: number;
    gems?: number;
    experience?: number;
    items?: string[];
    title?: string;
    badge?: string;
}

/**
 * Achievement definition
 */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: AchievementCategory;
    rarity: AchievementRarity;
    icon: string;
    conditions: AchievementCondition[];
    reward: AchievementReward;
    points: number;
    hidden?: boolean;
    secret?: boolean;
    unlockDate?: number;
    progress?: number;
}

/**
 * Achievement progress
 */
export interface AchievementProgress {
    achievementId: string;
    progress: number;
    unlocked: boolean;
    unlockDate?: number;
    notified?: boolean;
}

/**
 * Player achievement stats
 */
export interface PlayerAchievementStats {
    totalAchievements: number;
    unlockedAchievements: number;
    totalPoints: number;
    earnedPoints: number;
    completionRate: number;
    categoryCounts: Map<AchievementCategory, { total: number; unlocked: number }>;
    rarityCounts: Map<AchievementRarity, { total: number; unlocked: number }>;
}

/**
 * Achievement notification
 */
export interface AchievementNotification {
    achievement: Achievement;
    timestamp: number;
    shown: boolean;
}

/**
 * Achievement System
 * Comprehensive achievement tracking and unlocking
 */
export class AchievementSystem {
    // Achievement definitions
    private achievements: Map<string, Achievement> = new Map();

    // Player progress
    private playerProgress: Map<string, AchievementProgress> = new Map();

    // Stat tracking
    private playerStats: Map<string, number> = new Map();

    // Pending notifications
    private pendingNotifications: AchievementNotification[] = [];

    // Observables
    private onAchievementUnlockedObservable: Observable<Achievement> = new Observable();
    private onProgressUpdatedObservable: Observable<{ achievementId: string; progress: number }> = new Observable();

    // Settings
    private enabled: boolean = true;
    private showNotifications: boolean = true;

    constructor() {
        this.initializeAchievements();
    }

    /**
     * Initialize achievement definitions
     */
    private initializeAchievements(): void {
        // Batting achievements
        this.registerAchievement({
            id: 'first_hit',
            name: 'First Contact',
            description: 'Get your first hit',
            category: AchievementCategory.BATTING,
            rarity: AchievementRarity.COMMON,
            icon: 'achievement_first_hit.png',
            conditions: [{
                id: 'hits',
                type: ConditionType.CUMULATIVE,
                stat: 'career_hits',
                targetValue: 1
            }],
            reward: {
                coins: 100,
                experience: 50
            },
            points: 10
        });

        this.registerAchievement({
            id: 'century_club',
            name: 'Century Club',
            description: 'Accumulate 100 career hits',
            category: AchievementCategory.BATTING,
            rarity: AchievementRarity.UNCOMMON,
            icon: 'achievement_100_hits.png',
            conditions: [{
                id: 'hits',
                type: ConditionType.CUMULATIVE,
                stat: 'career_hits',
                targetValue: 100
            }],
            reward: {
                coins: 1000,
                experience: 500,
                badge: 'Century Hitter'
            },
            points: 50
        });

        this.registerAchievement({
            id: 'first_homer',
            name: 'Going Yard',
            description: 'Hit your first home run',
            category: AchievementCategory.BATTING,
            rarity: AchievementRarity.COMMON,
            icon: 'achievement_first_homer.png',
            conditions: [{
                id: 'home_runs',
                type: ConditionType.CUMULATIVE,
                stat: 'career_home_runs',
                targetValue: 1
            }],
            reward: {
                coins: 250,
                experience: 100
            },
            points: 15
        });

        this.registerAchievement({
            id: 'slugger',
            name: 'Slugger',
            description: 'Hit 20 home runs in a single season',
            category: AchievementCategory.BATTING,
            rarity: AchievementRarity.RARE,
            icon: 'achievement_slugger.png',
            conditions: [{
                id: 'season_homers',
                type: ConditionType.SINGLE_VALUE,
                stat: 'season_home_runs',
                targetValue: 20,
                comparison: 'greater_equal'
            }],
            reward: {
                coins: 2000,
                experience: 1000,
                items: ['power_bat'],
                badge: 'Slugger'
            },
            points: 75
        });

        this.registerAchievement({
            id: 'grand_slam',
            name: 'Grand Slam',
            description: 'Hit a grand slam home run',
            category: AchievementCategory.BATTING,
            rarity: AchievementRarity.EPIC,
            icon: 'achievement_grand_slam.png',
            conditions: [{
                id: 'grand_slams',
                type: ConditionType.CUMULATIVE,
                stat: 'career_grand_slams',
                targetValue: 1
            }],
            reward: {
                coins: 5000,
                gems: 10,
                experience: 2000,
                badge: 'Grand Slam Hero'
            },
            points: 100
        });

        this.registerAchievement({
            id: 'four_hundred',
            name: '.400 Club',
            description: 'Achieve a .400 batting average in a season',
            category: AchievementCategory.BATTING,
            rarity: AchievementRarity.LEGENDARY,
            icon: 'achievement_400_club.png',
            conditions: [{
                id: 'batting_average',
                type: ConditionType.SINGLE_VALUE,
                stat: 'season_batting_average',
                targetValue: 0.400,
                comparison: 'greater_equal'
            }],
            reward: {
                coins: 10000,
                gems: 50,
                experience: 5000,
                title: 'Elite Hitter',
                badge: '.400 Club Member'
            },
            points: 200
        });

        // Pitching achievements
        this.registerAchievement({
            id: 'first_strikeout',
            name: 'First K',
            description: 'Record your first strikeout',
            category: AchievementCategory.PITCHING,
            rarity: AchievementRarity.COMMON,
            icon: 'achievement_first_k.png',
            conditions: [{
                id: 'strikeouts',
                type: ConditionType.CUMULATIVE,
                stat: 'career_strikeouts',
                targetValue: 1
            }],
            reward: {
                coins: 100,
                experience: 50
            },
            points: 10
        });

        this.registerAchievement({
            id: 'ace',
            name: 'Ace',
            description: 'Win 20 games in a single season',
            category: AchievementCategory.PITCHING,
            rarity: AchievementRarity.RARE,
            icon: 'achievement_ace.png',
            conditions: [{
                id: 'wins',
                type: ConditionType.SINGLE_VALUE,
                stat: 'season_wins',
                targetValue: 20,
                comparison: 'greater_equal'
            }],
            reward: {
                coins: 3000,
                experience: 1500,
                items: ['legendary_baseball'],
                badge: 'Ace Pitcher'
            },
            points: 100
        });

        this.registerAchievement({
            id: 'no_hitter',
            name: 'No-Hitter',
            description: 'Pitch a no-hitter',
            category: AchievementCategory.PITCHING,
            rarity: AchievementRarity.EPIC,
            icon: 'achievement_no_hitter.png',
            conditions: [{
                id: 'no_hitters',
                type: ConditionType.CUMULATIVE,
                stat: 'career_no_hitters',
                targetValue: 1
            }],
            reward: {
                coins: 5000,
                gems: 15,
                experience: 2500,
                badge: 'No-Hit Pitcher'
            },
            points: 150
        });

        this.registerAchievement({
            id: 'perfect_game',
            name: 'Perfection',
            description: 'Pitch a perfect game',
            category: AchievementCategory.PITCHING,
            rarity: AchievementRarity.LEGENDARY,
            icon: 'achievement_perfect_game.png',
            conditions: [{
                id: 'perfect_games',
                type: ConditionType.CUMULATIVE,
                stat: 'career_perfect_games',
                targetValue: 1
            }],
            reward: {
                coins: 15000,
                gems: 100,
                experience: 10000,
                title: 'Perfect Pitcher',
                badge: 'Perfection Achieved'
            },
            points: 500
        });

        // Fielding achievements
        this.registerAchievement({
            id: 'first_catch',
            name: 'Nice Catch',
            description: 'Make your first catch',
            category: AchievementCategory.FIELDING,
            rarity: AchievementRarity.COMMON,
            icon: 'achievement_first_catch.png',
            conditions: [{
                id: 'catches',
                type: ConditionType.CUMULATIVE,
                stat: 'career_catches',
                targetValue: 1
            }],
            reward: {
                coins: 100,
                experience: 50
            },
            points: 10
        });

        this.registerAchievement({
            id: 'gold_glove',
            name: 'Gold Glove',
            description: 'Complete a season with a 1.000 fielding percentage',
            category: AchievementCategory.FIELDING,
            rarity: AchievementRarity.EPIC,
            icon: 'achievement_gold_glove.png',
            conditions: [{
                id: 'fielding_pct',
                type: ConditionType.SINGLE_VALUE,
                stat: 'season_fielding_percentage',
                targetValue: 1.0,
                comparison: 'equal'
            }],
            reward: {
                coins: 5000,
                gems: 20,
                experience: 2500,
                items: ['gold_glove'],
                badge: 'Gold Glove Winner'
            },
            points: 150
        });

        this.registerAchievement({
            id: 'diving_catch',
            name: 'Web Gem',
            description: 'Make a diving catch',
            category: AchievementCategory.FIELDING,
            rarity: AchievementRarity.UNCOMMON,
            icon: 'achievement_diving_catch.png',
            conditions: [{
                id: 'diving_catches',
                type: ConditionType.CUMULATIVE,
                stat: 'career_diving_catches',
                targetValue: 1
            }],
            reward: {
                coins: 500,
                experience: 250
            },
            points: 25
        });

        this.registerAchievement({
            id: 'double_play',
            name: 'Turn Two',
            description: 'Turn your first double play',
            category: AchievementCategory.FIELDING,
            rarity: AchievementRarity.COMMON,
            icon: 'achievement_double_play.png',
            conditions: [{
                id: 'double_plays',
                type: ConditionType.CUMULATIVE,
                stat: 'career_double_plays',
                targetValue: 1
            }],
            reward: {
                coins: 200,
                experience: 100
            },
            points: 15
        });

        // Base running achievements
        this.registerAchievement({
            id: 'first_steal',
            name: 'Speed Demon',
            description: 'Steal your first base',
            category: AchievementCategory.BASE_RUNNING,
            rarity: AchievementRarity.COMMON,
            icon: 'achievement_first_steal.png',
            conditions: [{
                id: 'stolen_bases',
                type: ConditionType.CUMULATIVE,
                stat: 'career_stolen_bases',
                targetValue: 1
            }],
            reward: {
                coins: 100,
                experience: 50
            },
            points: 10
        });

        this.registerAchievement({
            id: 'base_burglar',
            name: 'Base Burglar',
            description: 'Steal 30 bases in a single season',
            category: AchievementCategory.BASE_RUNNING,
            rarity: AchievementRarity.RARE,
            icon: 'achievement_base_burglar.png',
            conditions: [{
                id: 'season_steals',
                type: ConditionType.SINGLE_VALUE,
                stat: 'season_stolen_bases',
                targetValue: 30,
                comparison: 'greater_equal'
            }],
            reward: {
                coins: 2500,
                experience: 1250,
                items: ['speed_cleats'],
                badge: 'Base Burglar'
            },
            points: 75
        });

        // Career achievements
        this.registerAchievement({
            id: 'first_game',
            name: 'Rookie',
            description: 'Complete your first game',
            category: AchievementCategory.CAREER,
            rarity: AchievementRarity.COMMON,
            icon: 'achievement_first_game.png',
            conditions: [{
                id: 'games_played',
                type: ConditionType.CUMULATIVE,
                stat: 'career_games_played',
                targetValue: 1
            }],
            reward: {
                coins: 500,
                experience: 100
            },
            points: 10
        });

        this.registerAchievement({
            id: 'veteran',
            name: 'Veteran',
            description: 'Play 500 career games',
            category: AchievementCategory.CAREER,
            rarity: AchievementRarity.EPIC,
            icon: 'achievement_veteran.png',
            conditions: [{
                id: 'games',
                type: ConditionType.CUMULATIVE,
                stat: 'career_games_played',
                targetValue: 500
            }],
            reward: {
                coins: 5000,
                gems: 25,
                experience: 3000,
                title: 'Veteran Player'
            },
            points: 150
        });

        this.registerAchievement({
            id: 'hall_of_fame',
            name: 'Hall of Fame',
            description: 'Get inducted into the Hall of Fame',
            category: AchievementCategory.CAREER,
            rarity: AchievementRarity.LEGENDARY,
            icon: 'achievement_hall_of_fame.png',
            conditions: [
                {
                    id: 'games',
                    type: ConditionType.CUMULATIVE,
                    stat: 'career_games_played',
                    targetValue: 1000
                },
                {
                    id: 'batting_avg',
                    type: ConditionType.CUMULATIVE,
                    stat: 'career_batting_average',
                    targetValue: 0.300,
                    comparison: 'greater_equal'
                }
            ],
            reward: {
                coins: 50000,
                gems: 500,
                experience: 25000,
                title: 'Hall of Famer',
                badge: 'Hall of Fame Inductee'
            },
            points: 1000
        });

        // Special achievements
        this.registerAchievement({
            id: 'walk_off',
            name: 'Walk-Off Hero',
            description: 'Hit a walk-off home run',
            category: AchievementCategory.SPECIAL,
            rarity: AchievementRarity.EPIC,
            icon: 'achievement_walk_off.png',
            conditions: [{
                id: 'walk_off_homers',
                type: ConditionType.CUMULATIVE,
                stat: 'career_walk_off_homers',
                targetValue: 1
            }],
            reward: {
                coins: 7500,
                gems: 30,
                experience: 3500,
                badge: 'Walk-Off Hero'
            },
            points: 200
        });

        this.registerAchievement({
            id: 'cycle',
            name: 'For the Cycle',
            description: 'Hit for the cycle in a single game',
            category: AchievementCategory.SPECIAL,
            rarity: AchievementRarity.LEGENDARY,
            icon: 'achievement_cycle.png',
            conditions: [{
                id: 'cycles',
                type: ConditionType.CUMULATIVE,
                stat: 'career_cycles',
                targetValue: 1
            }],
            reward: {
                coins: 10000,
                gems: 75,
                experience: 5000,
                badge: 'Cycle Hitter'
            },
            points: 300
        });

        // Challenge achievements
        this.registerAchievement({
            id: 'five_hit_game',
            name: 'Five-Hit Wonder',
            description: 'Get 5 hits in a single game',
            category: AchievementCategory.CHALLENGE,
            rarity: AchievementRarity.RARE,
            icon: 'achievement_five_hits.png',
            conditions: [{
                id: 'five_hit_games',
                type: ConditionType.CUMULATIVE,
                stat: 'career_five_hit_games',
                targetValue: 1
            }],
            reward: {
                coins: 2000,
                experience: 1000
            },
            points: 50
        });

        this.registerAchievement({
            id: 'immaculate_inning',
            name: 'Immaculate Inning',
            description: 'Strike out 3 batters on 9 pitches',
            category: AchievementCategory.CHALLENGE,
            rarity: AchievementRarity.LEGENDARY,
            icon: 'achievement_immaculate.png',
            conditions: [{
                id: 'immaculate_innings',
                type: ConditionType.CUMULATIVE,
                stat: 'career_immaculate_innings',
                targetValue: 1
            }],
            reward: {
                coins: 10000,
                gems: 50,
                experience: 5000,
                badge: 'Immaculate'
            },
            points: 250
        });

        // Secret achievements
        this.registerAchievement({
            id: 'easter_egg',
            name: '???',
            description: 'Find the hidden surprise',
            category: AchievementCategory.SECRET,
            rarity: AchievementRarity.LEGENDARY,
            icon: 'achievement_secret.png',
            conditions: [{
                id: 'easter_eggs_found',
                type: ConditionType.CUMULATIVE,
                stat: 'easter_eggs_found',
                targetValue: 1
            }],
            reward: {
                coins: 25000,
                gems: 250,
                experience: 10000
            },
            points: 500,
            hidden: true,
            secret: true
        });
    }

    /**
     * Register achievement
     */
    public registerAchievement(achievement: Achievement): void {
        this.achievements.set(achievement.id, achievement);

        // Initialize progress
        if (!this.playerProgress.has(achievement.id)) {
            this.playerProgress.set(achievement.id, {
                achievementId: achievement.id,
                progress: 0,
                unlocked: false
            });
        }
    }

    /**
     * Update stat
     */
    public updateStat(stat: string, value: number, operation: 'set' | 'add' | 'increment' = 'set'): void {
        if (!this.enabled) return;

        const currentValue = this.playerStats.get(stat) || 0;

        switch (operation) {
            case 'set':
                this.playerStats.set(stat, value);
                break;
            case 'add':
                this.playerStats.set(stat, currentValue + value);
                break;
            case 'increment':
                this.playerStats.set(stat, currentValue + 1);
                break;
        }

        // Check affected achievements
        this.checkAchievements(stat);
    }

    /**
     * Check achievements for updated stat
     */
    private checkAchievements(stat: string): void {
        for (const achievement of this.achievements.values()) {
            if (this.playerProgress.get(achievement.id)?.unlocked) {
                continue;
            }

            const affectedConditions = achievement.conditions.filter(c => c.stat === stat);

            if (affectedConditions.length > 0) {
                this.evaluateAchievement(achievement);
            }
        }
    }

    /**
     * Evaluate achievement conditions
     */
    private evaluateAchievement(achievement: Achievement): void {
        let allConditionsMet = true;
        let totalProgress = 0;

        for (const condition of achievement.conditions) {
            const currentValue = this.playerStats.get(condition.stat) || 0;
            const conditionMet = this.evaluateCondition(condition, currentValue);

            if (!conditionMet) {
                allConditionsMet = false;
            }

            // Calculate progress
            const progress = Math.min(currentValue / condition.targetValue, 1);
            totalProgress += progress;
        }

        // Average progress across all conditions
        const overallProgress = totalProgress / achievement.conditions.length;

        // Update progress
        const progress = this.playerProgress.get(achievement.id)!;
        progress.progress = overallProgress;

        this.onProgressUpdatedObservable.notifyObservers({
            achievementId: achievement.id,
            progress: overallProgress
        });

        // Check if unlocked
        if (allConditionsMet && !progress.unlocked) {
            this.unlockAchievement(achievement.id);
        }
    }

    /**
     * Evaluate single condition
     */
    private evaluateCondition(condition: AchievementCondition, currentValue: number): boolean {
        const target = condition.targetValue;
        const comparison = condition.comparison || 'greater_equal';

        switch (comparison) {
            case 'equal':
                return currentValue === target;
            case 'greater':
                return currentValue > target;
            case 'less':
                return currentValue < target;
            case 'greater_equal':
                return currentValue >= target;
            case 'less_equal':
                return currentValue <= target;
            default:
                return currentValue >= target;
        }
    }

    /**
     * Unlock achievement
     */
    public unlockAchievement(achievementId: string): void {
        const achievement = this.achievements.get(achievementId);
        if (!achievement) return;

        const progress = this.playerProgress.get(achievementId);
        if (!progress || progress.unlocked) return;

        // Mark as unlocked
        progress.unlocked = true;
        progress.unlockDate = Date.now();
        progress.progress = 1;

        // Store unlock date on achievement
        achievement.unlockDate = progress.unlockDate;

        // Apply rewards
        this.applyRewards(achievement.reward);

        // Create notification
        if (this.showNotifications) {
            this.pendingNotifications.push({
                achievement,
                timestamp: Date.now(),
                shown: false
            });
        }

        // Notify observers
        this.onAchievementUnlockedObservable.notifyObservers(achievement);

        console.log(`Achievement unlocked: ${achievement.name}`);
    }

    /**
     * Apply achievement rewards
     */
    private applyRewards(reward: AchievementReward): void {
        // Rewards would be applied to player inventory/currency
        // This is a simplified implementation
        if (reward.coins) {
            this.updateStat('player_coins', reward.coins, 'add');
        }
        if (reward.gems) {
            this.updateStat('player_gems', reward.gems, 'add');
        }
        if (reward.experience) {
            this.updateStat('player_experience', reward.experience, 'add');
        }
    }

    /**
     * Get achievement
     */
    public getAchievement(achievementId: string): Achievement | undefined {
        return this.achievements.get(achievementId);
    }

    /**
     * Get all achievements
     */
    public getAllAchievements(includeSecret: boolean = false): Achievement[] {
        const achievements = Array.from(this.achievements.values());

        if (!includeSecret) {
            return achievements.filter(a => !a.secret);
        }

        return achievements;
    }

    /**
     * Get achievements by category
     */
    public getAchievementsByCategory(category: AchievementCategory): Achievement[] {
        return Array.from(this.achievements.values()).filter(a => a.category === category);
    }

    /**
     * Get unlocked achievements
     */
    public getUnlockedAchievements(): Achievement[] {
        return Array.from(this.achievements.values()).filter(a => {
            const progress = this.playerProgress.get(a.id);
            return progress?.unlocked;
        });
    }

    /**
     * Get achievement progress
     */
    public getProgress(achievementId: string): AchievementProgress | undefined {
        return this.playerProgress.get(achievementId);
    }

    /**
     * Get player stats
     */
    public getPlayerStats(): PlayerAchievementStats {
        const totalAchievements = this.achievements.size;
        const unlockedAchievements = Array.from(this.playerProgress.values())
            .filter(p => p.unlocked).length;

        let totalPoints = 0;
        let earnedPoints = 0;

        const categoryCounts = new Map<AchievementCategory, { total: number; unlocked: number }>();
        const rarityCounts = new Map<AchievementRarity, { total: number; unlocked: number }>();

        for (const achievement of this.achievements.values()) {
            totalPoints += achievement.points;

            const progress = this.playerProgress.get(achievement.id);
            if (progress?.unlocked) {
                earnedPoints += achievement.points;
            }

            // Category counts
            const catCount = categoryCounts.get(achievement.category) || { total: 0, unlocked: 0 };
            catCount.total++;
            if (progress?.unlocked) {
                catCount.unlocked++;
            }
            categoryCounts.set(achievement.category, catCount);

            // Rarity counts
            const rarCount = rarityCounts.get(achievement.rarity) || { total: 0, unlocked: 0 };
            rarCount.total++;
            if (progress?.unlocked) {
                rarCount.unlocked++;
            }
            rarityCounts.set(achievement.rarity, rarCount);
        }

        return {
            totalAchievements,
            unlockedAchievements,
            totalPoints,
            earnedPoints,
            completionRate: (unlockedAchievements / totalAchievements) * 100,
            categoryCounts,
            rarityCounts
        };
    }

    /**
     * Get pending notifications
     */
    public getPendingNotifications(): AchievementNotification[] {
        return this.pendingNotifications.filter(n => !n.shown);
    }

    /**
     * Mark notification as shown
     */
    public markNotificationShown(achievementId: string): void {
        const notification = this.pendingNotifications.find(n => n.achievement.id === achievementId);
        if (notification) {
            notification.shown = true;
        }
    }

    /**
     * Clear shown notifications
     */
    public clearShownNotifications(): void {
        this.pendingNotifications = this.pendingNotifications.filter(n => !n.shown);
    }

    /**
     * Subscribe to achievement unlocks
     */
    public onAchievementUnlocked(callback: (achievement: Achievement) => void): void {
        this.onAchievementUnlockedObservable.add(callback);
    }

    /**
     * Subscribe to progress updates
     */
    public onProgressUpdated(callback: (data: { achievementId: string; progress: number }) => void): void {
        this.onProgressUpdatedObservable.add(callback);
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Enable/disable notifications
     */
    public setShowNotifications(enabled: boolean): void {
        this.showNotifications = enabled;
    }

    /**
     * Reset progress (for testing)
     */
    public resetProgress(): void {
        for (const [id] of this.achievements) {
            this.playerProgress.set(id, {
                achievementId: id,
                progress: 0,
                unlocked: false
            });
        }

        this.playerStats.clear();
        this.pendingNotifications = [];
    }

    /**
     * Export progress data
     */
    public exportProgress(): string {
        const data = {
            progress: Array.from(this.playerProgress.entries()),
            stats: Array.from(this.playerStats.entries()),
            timestamp: Date.now()
        };

        return JSON.stringify(data);
    }

    /**
     * Import progress data
     */
    public importProgress(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this.playerProgress.clear();
            for (const [id, progress] of parsed.progress) {
                this.playerProgress.set(id, progress);
            }

            this.playerStats.clear();
            for (const [stat, value] of parsed.stats) {
                this.playerStats.set(stat, value);
            }
        } catch (error) {
            console.error('Failed to import progress:', error);
        }
    }
}
