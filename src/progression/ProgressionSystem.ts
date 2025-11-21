import { Observable } from '@babylonjs/core';

/**
 * Experience source
 */
export enum ExperienceSource {
    GAME_WIN = 'game_win',
    GAME_LOSS = 'game_loss',
    HOME_RUN = 'home_run',
    HIT = 'hit',
    STRIKEOUT = 'strikeout',
    STOLEN_BASE = 'stolen_base',
    QUEST_COMPLETE = 'quest_complete',
    ACHIEVEMENT = 'achievement',
    CHALLENGE = 'challenge',
    TRAINING = 'training',
    DAILY_BONUS = 'daily_bonus'
}

/**
 * Skill tree node type
 */
export enum SkillNodeType {
    ATTRIBUTE = 'attribute',
    PASSIVE = 'passive',
    ACTIVE = 'active',
    UNLOCK = 'unlock'
}

/**
 * Skill tree
 */
export enum SkillTree {
    BATTING = 'batting',
    PITCHING = 'pitching',
    FIELDING = 'fielding',
    BASERUNNING = 'baserunning',
    GENERAL = 'general'
}

/**
 * Skill node
 */
export interface SkillNode {
    id: string;
    tree: SkillTree;
    type: SkillNodeType;
    name: string;
    description: string;
    icon: string;
    maxLevel: number;
    currentLevel: number;
    requirements?: Array<{
        nodeId: string;
        minLevel: number;
    }>;
    levelRequirement?: number;
    cost: number;
    effects: Array<{
        stat: string;
        value: number;
        perLevel?: boolean;
    }>;
    unlocked: boolean;
}

/**
 * Level info
 */
export interface LevelInfo {
    level: number;
    currentXP: number;
    requiredXP: number;
    progress: number;
    totalXP: number;
}

/**
 * Prestige info
 */
export interface PrestigeInfo {
    level: number;
    bonusMultiplier: number;
    rewardMultiplier: number;
    unlocks: string[];
}

/**
 * Battle pass tier
 */
export interface BattlePassTier {
    tier: number;
    freeRewards: Array<{
        type: 'coins' | 'gems' | 'item' | 'cosmetic';
        id?: string;
        quantity: number;
    }>;
    premiumRewards: Array<{
        type: 'coins' | 'gems' | 'item' | 'cosmetic' | 'exclusive';
        id?: string;
        quantity: number;
    }>;
    xpRequired: number;
}

/**
 * Battle pass season
 */
export interface BattlePassSeason {
    id: string;
    name: string;
    startDate: number;
    endDate: number;
    active: boolean;
    tiers: BattlePassTier[];
    currentTier: number;
    currentXP: number;
    premium: boolean;
}

/**
 * Mastery system
 */
export interface MasteryData {
    category: string;
    level: number;
    xp: number;
    xpToNext: number;
    bonuses: Map<string, number>;
}

/**
 * Daily streak
 */
export interface DailyStreak {
    currentStreak: number;
    longestStreak: number;
    lastPlayDate: number;
    bonusMultiplier: number;
}

/**
 * Progression System
 * Comprehensive leveling, skills, and progression management
 */
export class ProgressionSystem {
    // Player level
    private level: number = 1;
    private experience: number = 0;
    private totalExperience: number = 0;
    private maxLevel: number = 100;

    // XP curve
    private xpCurve: number[] = [];
    private baseXP: number = 100;
    private xpMultiplier: number = 1.15;

    // Skill points
    private skillPoints: number = 0;
    private skillPointsPerLevel: number = 3;

    // Skill trees
    private skillNodes: Map<string, SkillNode> = new Map();
    private unlockedNodes: Set<string> = new Set();

    // Prestige
    private prestigeLevel: number = 0;
    private prestigeRequiredLevel: number = 100;

    // Battle pass
    private battlePassSeason?: BattlePassSeason;

    // Mastery
    private masteryData: Map<string, MasteryData> = new Map();

    // Streaks
    private dailyStreak: DailyStreak = {
        currentStreak: 0,
        longestStreak: 0,
        lastPlayDate: 0,
        bonusMultiplier: 1.0
    };

    // Observables
    private onLevelUpObservable: Observable<LevelInfo> = new Observable();
    private onExperienceGainedObservable: Observable<{ source: ExperienceSource; amount: number; total: number }> = new Observable();
    private onSkillUnlockedObservable: Observable<SkillNode> = new Observable();
    private onPrestigeObservable: Observable<PrestigeInfo> = new Observable();
    private onBattlePassTierObservable: Observable<number> = new Observable();

    // Settings
    private enabled: boolean = true;
    private xpGainMultiplier: number = 1.0;

    constructor() {
        this.generateXPCurve();
        this.initializeSkillTrees();
        this.initializeMastery();
        this.checkDailyStreak();
    }

    /**
     * Generate XP curve for all levels
     */
    private generateXPCurve(): void {
        this.xpCurve = [0]; // Level 0

        for (let level = 1; level <= this.maxLevel; level++) {
            const xpRequired = Math.floor(this.baseXP * Math.pow(this.xpMultiplier, level - 1));
            this.xpCurve.push(xpRequired);
        }
    }

    /**
     * Initialize skill trees
     */
    private initializeSkillTrees(): void {
        // Batting skill tree
        this.registerSkillNode({
            id: 'batting_power_1',
            tree: SkillTree.BATTING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Power Training I',
            description: '+5 Power per level',
            icon: 'skill_power.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'power', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        this.registerSkillNode({
            id: 'batting_power_2',
            tree: SkillTree.BATTING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Power Training II',
            description: '+10 Power per level',
            icon: 'skill_power.png',
            maxLevel: 5,
            currentLevel: 0,
            requirements: [
                { nodeId: 'batting_power_1', minLevel: 5 }
            ],
            levelRequirement: 10,
            cost: 2,
            effects: [
                { stat: 'power', value: 10, perLevel: true }
            ],
            unlocked: false
        });

        this.registerSkillNode({
            id: 'batting_contact_1',
            tree: SkillTree.BATTING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Contact Training I',
            description: '+5 Contact per level',
            icon: 'skill_contact.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'contact', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        this.registerSkillNode({
            id: 'batting_crit_chance',
            tree: SkillTree.BATTING,
            type: SkillNodeType.PASSIVE,
            name: 'Critical Hit',
            description: '+2% chance for perfect hit per level',
            icon: 'skill_crit.png',
            maxLevel: 5,
            currentLevel: 0,
            requirements: [
                { nodeId: 'batting_power_1', minLevel: 3 },
                { nodeId: 'batting_contact_1', minLevel: 3 }
            ],
            levelRequirement: 15,
            cost: 3,
            effects: [
                { stat: 'crit_chance', value: 2, perLevel: true }
            ],
            unlocked: false
        });

        // Pitching skill tree
        this.registerSkillNode({
            id: 'pitching_velocity_1',
            tree: SkillTree.PITCHING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Velocity Training I',
            description: '+5 Velocity per level',
            icon: 'skill_velocity.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'velocity', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        this.registerSkillNode({
            id: 'pitching_control_1',
            tree: SkillTree.PITCHING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Control Training I',
            description: '+5 Control per level',
            icon: 'skill_control.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'control', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        this.registerSkillNode({
            id: 'pitching_stamina_1',
            tree: SkillTree.PITCHING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Stamina Training I',
            description: '+10 Stamina per level',
            icon: 'skill_stamina.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'stamina', value: 10, perLevel: true }
            ],
            unlocked: true
        });

        // Fielding skill tree
        this.registerSkillNode({
            id: 'fielding_range_1',
            tree: SkillTree.FIELDING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Range Training I',
            description: '+5 Range per level',
            icon: 'skill_range.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'fielding_range', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        this.registerSkillNode({
            id: 'fielding_reaction_1',
            tree: SkillTree.FIELDING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Reaction Training I',
            description: '+5 Reaction per level',
            icon: 'skill_reaction.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'reaction', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        // Baserunning skill tree
        this.registerSkillNode({
            id: 'baserunning_speed_1',
            tree: SkillTree.BASERUNNING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Speed Training I',
            description: '+5 Speed per level',
            icon: 'skill_speed.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'speed', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        this.registerSkillNode({
            id: 'baserunning_stealing_1',
            tree: SkillTree.BASERUNNING,
            type: SkillNodeType.ATTRIBUTE,
            name: 'Stealing Training I',
            description: '+5% Steal success per level',
            icon: 'skill_steal.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 1,
            effects: [
                { stat: 'steal_success', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        // General skill tree
        this.registerSkillNode({
            id: 'general_xp_boost',
            tree: SkillTree.GENERAL,
            type: SkillNodeType.PASSIVE,
            name: 'Fast Learner',
            description: '+5% XP gain per level',
            icon: 'skill_xp.png',
            maxLevel: 10,
            currentLevel: 0,
            cost: 2,
            effects: [
                { stat: 'xp_multiplier', value: 5, perLevel: true }
            ],
            unlocked: true
        });

        this.registerSkillNode({
            id: 'general_coin_boost',
            tree: SkillTree.GENERAL,
            type: SkillNodeType.PASSIVE,
            name: 'Money Maker',
            description: '+10% Coin rewards per level',
            icon: 'skill_coin.png',
            maxLevel: 5,
            currentLevel: 0,
            cost: 2,
            effects: [
                { stat: 'coin_multiplier', value: 10, perLevel: true }
            ],
            unlocked: true
        });
    }

    /**
     * Initialize mastery categories
     */
    private initializeMastery(): void {
        const categories = ['batting', 'pitching', 'fielding', 'baserunning'];

        for (const category of categories) {
            this.masteryData.set(category, {
                category,
                level: 1,
                xp: 0,
                xpToNext: 1000,
                bonuses: new Map()
            });
        }
    }

    /**
     * Register skill node
     */
    public registerSkillNode(node: SkillNode): void {
        this.skillNodes.set(node.id, node);
    }

    /**
     * Gain experience
     */
    public gainExperience(amount: number, source: ExperienceSource): void {
        if (!this.enabled) return;

        // Apply multipliers
        let finalAmount = amount * this.xpGainMultiplier;

        // Apply daily streak bonus
        finalAmount *= this.dailyStreak.bonusMultiplier;

        // Apply prestige bonus
        if (this.prestigeLevel > 0) {
            finalAmount *= (1 + this.prestigeLevel * 0.1);
        }

        finalAmount = Math.floor(finalAmount);

        // Add experience
        this.experience += finalAmount;
        this.totalExperience += finalAmount;

        // Check for level up
        while (this.level < this.maxLevel && this.experience >= this.xpCurve[this.level]) {
            this.levelUp();
        }

        // Notify observers
        this.onExperienceGainedObservable.notifyObservers({
            source,
            amount: finalAmount,
            total: this.experience
        });

        // Update battle pass if active
        if (this.battlePassSeason && this.battlePassSeason.active) {
            this.addBattlePassXP(finalAmount);
        }
    }

    /**
     * Level up
     */
    private levelUp(): void {
        const xpRequired = this.xpCurve[this.level];
        this.experience -= xpRequired;
        this.level++;

        // Award skill points
        this.skillPoints += this.skillPointsPerLevel;

        // Unlock level-gated skills
        this.checkSkillUnlocks();

        // Notify observers
        this.onLevelUpObservable.notifyObservers(this.getLevelInfo());

        console.log(`Level up! Now level ${this.level}`);
    }

    /**
     * Check and unlock level-gated skills
     */
    private checkSkillUnlocks(): void {
        for (const node of this.skillNodes.values()) {
            if (!node.unlocked && node.levelRequirement && this.level >= node.levelRequirement) {
                if (this.checkNodeRequirements(node)) {
                    node.unlocked = true;
                }
            }
        }
    }

    /**
     * Check node requirements
     */
    private checkNodeRequirements(node: SkillNode): boolean {
        if (!node.requirements) return true;

        for (const req of node.requirements) {
            const reqNode = this.skillNodes.get(req.nodeId);
            if (!reqNode || reqNode.currentLevel < req.minLevel) {
                return false;
            }
        }

        return true;
    }

    /**
     * Unlock skill node
     */
    public unlockSkillNode(nodeId: string): boolean {
        const node = this.skillNodes.get(nodeId);
        if (!node || !node.unlocked) return false;

        // Check if can level up
        if (node.currentLevel >= node.maxLevel) {
            console.warn('Skill already at max level');
            return false;
        }

        // Check skill points
        if (this.skillPoints < node.cost) {
            console.warn('Not enough skill points');
            return false;
        }

        // Check requirements
        if (!this.checkNodeRequirements(node)) {
            console.warn('Requirements not met');
            return false;
        }

        // Unlock node
        node.currentLevel++;
        this.skillPoints -= node.cost;
        this.unlockedNodes.add(nodeId);

        // Check if this unlock enables other nodes
        this.checkSkillUnlocks();

        // Notify observers
        this.onSkillUnlockedObservable.notifyObservers(node);

        return true;
    }

    /**
     * Reset skill tree
     */
    public resetSkillTree(tree?: SkillTree): void {
        let nodesToReset = Array.from(this.skillNodes.values());

        if (tree) {
            nodesToReset = nodesToReset.filter(node => node.tree === tree);
        }

        let pointsRefunded = 0;

        for (const node of nodesToReset) {
            pointsRefunded += node.currentLevel * node.cost;
            node.currentLevel = 0;
        }

        this.skillPoints += pointsRefunded;

        console.log(`Refunded ${pointsRefunded} skill points`);
    }

    /**
     * Prestige
     */
    public prestige(): PrestigeInfo | null {
        if (this.level < this.prestigeRequiredLevel) {
            console.warn('Level too low to prestige');
            return null;
        }

        this.prestigeLevel++;

        // Reset progress
        this.level = 1;
        this.experience = 0;
        this.skillPoints = 0;

        // Reset skill trees
        this.resetSkillTree();

        // Calculate prestige bonuses
        const prestigeInfo: PrestigeInfo = {
            level: this.prestigeLevel,
            bonusMultiplier: 1 + this.prestigeLevel * 0.1,
            rewardMultiplier: 1 + this.prestigeLevel * 0.05,
            unlocks: this.getPrestigeUnlocks()
        };

        this.onPrestigeObservable.notifyObservers(prestigeInfo);

        return prestigeInfo;
    }

    /**
     * Get prestige unlocks
     */
    private getPrestigeUnlocks(): string[] {
        const unlocks: string[] = [];

        switch (this.prestigeLevel) {
            case 1:
                unlocks.push('prestige_badge_1', 'exclusive_cosmetic_1');
                break;
            case 2:
                unlocks.push('prestige_badge_2', 'exclusive_cosmetic_2');
                break;
            case 5:
                unlocks.push('prestige_badge_5', 'legendary_title');
                break;
            case 10:
                unlocks.push('prestige_badge_10', 'mythic_item');
                break;
        }

        return unlocks;
    }

    /**
     * Initialize battle pass season
     */
    public initializeBattlePassSeason(seasonId: string, name: string, duration: number, tierCount: number = 100): void {
        const tiers: BattlePassTier[] = [];

        for (let i = 1; i <= tierCount; i++) {
            const tier: BattlePassTier = {
                tier: i,
                freeRewards: [
                    { type: 'coins', quantity: 100 * i }
                ],
                premiumRewards: [
                    { type: 'coins', quantity: 200 * i },
                    { type: 'gems', quantity: i }
                ],
                xpRequired: 1000 * i
            };

            // Add special rewards at milestones
            if (i % 10 === 0) {
                tier.freeRewards.push({ type: 'gems', quantity: 5 });
                tier.premiumRewards.push({ type: 'exclusive', id: `exclusive_${i}`, quantity: 1 });
            }

            tiers.push(tier);
        }

        this.battlePassSeason = {
            id: seasonId,
            name,
            startDate: Date.now(),
            endDate: Date.now() + duration,
            active: true,
            tiers,
            currentTier: 0,
            currentXP: 0,
            premium: false
        };
    }

    /**
     * Add battle pass XP
     */
    private addBattlePassXP(amount: number): void {
        if (!this.battlePassSeason) return;

        this.battlePassSeason.currentXP += amount;

        // Check for tier ups
        while (
            this.battlePassSeason.currentTier < this.battlePassSeason.tiers.length &&
            this.battlePassSeason.currentXP >= this.battlePassSeason.tiers[this.battlePassSeason.currentTier].xpRequired
        ) {
            this.battlePassSeason.currentXP -= this.battlePassSeason.tiers[this.battlePassSeason.currentTier].xpRequired;
            this.battlePassSeason.currentTier++;

            this.onBattlePassTierObservable.notifyObservers(this.battlePassSeason.currentTier);

            console.log(`Battle Pass tier up! Now tier ${this.battlePassSeason.currentTier}`);
        }
    }

    /**
     * Unlock premium battle pass
     */
    public unlockPremiumBattlePass(): boolean {
        if (!this.battlePassSeason) return false;

        this.battlePassSeason.premium = true;
        return true;
    }

    /**
     * Add mastery XP
     */
    public addMasteryXP(category: string, amount: number): void {
        const mastery = this.masteryData.get(category);
        if (!mastery) return;

        mastery.xp += amount;

        // Check for level up
        while (mastery.xp >= mastery.xpToNext) {
            mastery.xp -= mastery.xpToNext;
            mastery.level++;
            mastery.xpToNext = Math.floor(1000 * Math.pow(1.1, mastery.level - 1));

            // Update bonuses
            this.updateMasteryBonuses(mastery);

            console.log(`${category} mastery level up! Now level ${mastery.level}`);
        }
    }

    /**
     * Update mastery bonuses
     */
    private updateMasteryBonuses(mastery: MasteryData): void {
        switch (mastery.category) {
            case 'batting':
                mastery.bonuses.set('power', mastery.level * 2);
                mastery.bonuses.set('contact', mastery.level * 2);
                break;
            case 'pitching':
                mastery.bonuses.set('velocity', mastery.level * 2);
                mastery.bonuses.set('control', mastery.level * 2);
                break;
            case 'fielding':
                mastery.bonuses.set('fielding_range', mastery.level * 2);
                mastery.bonuses.set('reaction', mastery.level * 2);
                break;
            case 'baserunning':
                mastery.bonuses.set('speed', mastery.level * 2);
                mastery.bonuses.set('stealing', mastery.level);
                break;
        }
    }

    /**
     * Check daily streak
     */
    private checkDailyStreak(): void {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const timeSinceLastPlay = now - this.dailyStreak.lastPlayDate;

        if (timeSinceLastPlay < oneDayMs) {
            // Same day, no change
            return;
        } else if (timeSinceLastPlay < oneDayMs * 2) {
            // Next day, continue streak
            this.dailyStreak.currentStreak++;
            this.dailyStreak.lastPlayDate = now;

            if (this.dailyStreak.currentStreak > this.dailyStreak.longestStreak) {
                this.dailyStreak.longestStreak = this.dailyStreak.currentStreak;
            }

            // Update bonus multiplier (max 2.0x at 100 day streak)
            this.dailyStreak.bonusMultiplier = Math.min(1 + this.dailyStreak.currentStreak * 0.01, 2.0);
        } else {
            // Streak broken
            this.dailyStreak.currentStreak = 1;
            this.dailyStreak.lastPlayDate = now;
            this.dailyStreak.bonusMultiplier = 1.0;
        }
    }

    /**
     * Get level info
     */
    public getLevelInfo(): LevelInfo {
        const requiredXP = this.level < this.maxLevel ? this.xpCurve[this.level] : 0;
        const progress = requiredXP > 0 ? (this.experience / requiredXP) : 1;

        return {
            level: this.level,
            currentXP: this.experience,
            requiredXP,
            progress,
            totalXP: this.totalExperience
        };
    }

    /**
     * Get skill node
     */
    public getSkillNode(nodeId: string): SkillNode | undefined {
        return this.skillNodes.get(nodeId);
    }

    /**
     * Get skill tree nodes
     */
    public getSkillTreeNodes(tree: SkillTree): SkillNode[] {
        return Array.from(this.skillNodes.values())
            .filter(node => node.tree === tree);
    }

    /**
     * Get available skill points
     */
    public getSkillPoints(): number {
        return this.skillPoints;
    }

    /**
     * Calculate total stats from skills
     */
    public calculateSkillStats(): Map<string, number> {
        const stats = new Map<string, number>();

        for (const node of this.skillNodes.values()) {
            if (node.currentLevel === 0) continue;

            for (const effect of node.effects) {
                const current = stats.get(effect.stat) || 0;
                const value = effect.perLevel ? effect.value * node.currentLevel : effect.value;
                stats.set(effect.stat, current + value);
            }
        }

        // Add mastery bonuses
        for (const mastery of this.masteryData.values()) {
            for (const [stat, bonus] of mastery.bonuses) {
                const current = stats.get(stat) || 0;
                stats.set(stat, current + bonus);
            }
        }

        return stats;
    }

    /**
     * Get battle pass season
     */
    public getBattlePassSeason(): BattlePassSeason | undefined {
        return this.battlePassSeason;
    }

    /**
     * Get mastery data
     */
    public getMasteryData(category: string): MasteryData | undefined {
        return this.masteryData.get(category);
    }

    /**
     * Get daily streak
     */
    public getDailyStreak(): DailyStreak {
        return { ...this.dailyStreak };
    }

    /**
     * Get prestige level
     */
    public getPrestigeLevel(): number {
        return this.prestigeLevel;
    }

    /**
     * Subscribe to level up
     */
    public onLevelUp(callback: (info: LevelInfo) => void): void {
        this.onLevelUpObservable.add(callback);
    }

    /**
     * Subscribe to experience gained
     */
    public onExperienceGained(callback: (data: { source: ExperienceSource; amount: number; total: number }) => void): void {
        this.onExperienceGainedObservable.add(callback);
    }

    /**
     * Subscribe to skill unlocked
     */
    public onSkillUnlocked(callback: (node: SkillNode) => void): void {
        this.onSkillUnlockedObservable.add(callback);
    }

    /**
     * Subscribe to prestige
     */
    public onPrestige(callback: (info: PrestigeInfo) => void): void {
        this.onPrestigeObservable.add(callback);
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Set XP multiplier
     */
    public setXPMultiplier(multiplier: number): void {
        this.xpGainMultiplier = Math.max(0.1, multiplier);
    }

    /**
     * Export progression data
     */
    public exportData(): string {
        const data = {
            level: this.level,
            experience: this.experience,
            totalExperience: this.totalExperience,
            skillPoints: this.skillPoints,
            skillNodes: Array.from(this.skillNodes.entries()).map(([id, node]) => ({
                id,
                currentLevel: node.currentLevel
            })),
            prestigeLevel: this.prestigeLevel,
            battlePassSeason: this.battlePassSeason,
            masteryData: Array.from(this.masteryData.entries()),
            dailyStreak: this.dailyStreak
        };

        return JSON.stringify(data);
    }

    /**
     * Import progression data
     */
    public importData(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this.level = parsed.level;
            this.experience = parsed.experience;
            this.totalExperience = parsed.totalExperience;
            this.skillPoints = parsed.skillPoints;
            this.prestigeLevel = parsed.prestigeLevel;
            this.battlePassSeason = parsed.battlePassSeason;
            this.dailyStreak = parsed.dailyStreak;

            // Restore skill node levels
            for (const nodeData of parsed.skillNodes) {
                const node = this.skillNodes.get(nodeData.id);
                if (node) {
                    node.currentLevel = nodeData.currentLevel;
                }
            }

            // Restore mastery data
            this.masteryData = new Map(parsed.masteryData);
        } catch (error) {
            console.error('Failed to import progression data:', error);
        }
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.skillNodes.clear();
        this.unlockedNodes.clear();
        this.masteryData.clear();

        this.onLevelUpObservable.clear();
        this.onExperienceGainedObservable.clear();
        this.onSkillUnlockedObservable.clear();
        this.onPrestigeObservable.clear();
        this.onBattlePassTierObservable.clear();
    }
}
