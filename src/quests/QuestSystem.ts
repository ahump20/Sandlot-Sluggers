import { Observable } from '@babylonjs/core';

/**
 * Quest types
 */
export enum QuestType {
    MAIN = 'main',
    SIDE = 'side',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    CHALLENGE = 'challenge',
    TUTORIAL = 'tutorial',
    EVENT = 'event',
    REPEATABLE = 'repeatable'
}

/**
 * Quest status
 */
export enum QuestStatus {
    LOCKED = 'locked',
    AVAILABLE = 'available',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    FAILED = 'failed',
    EXPIRED = 'expired'
}

/**
 * Objective type
 */
export enum ObjectiveType {
    COLLECT = 'collect',
    DEFEAT = 'defeat',
    REACH = 'reach',
    INTERACT = 'interact',
    WIN_GAMES = 'win_games',
    HIT_HOME_RUNS = 'hit_home_runs',
    STRIKE_OUT = 'strike_out',
    STEAL_BASES = 'steal_bases',
    PITCH_SHUTOUT = 'pitch_shutout',
    GET_HITS = 'get_hits',
    SCORE_RUNS = 'score_runs',
    CUSTOM = 'custom'
}

/**
 * Quest objective
 */
export interface QuestObjective {
    id: string;
    type: ObjectiveType;
    description: string;
    targetValue: number;
    currentValue: number;
    optional?: boolean;
    hidden?: boolean;
    metadata?: { [key: string]: any };
}

/**
 * Quest reward
 */
export interface QuestReward {
    coins?: number;
    gems?: number;
    experience?: number;
    items?: Array<{ id: string; quantity: number }>;
    unlocks?: string[];
    badge?: string;
    title?: string;
}

/**
 * Quest requirement
 */
export interface QuestRequirement {
    type: 'level' | 'quest' | 'stat' | 'achievement' | 'custom';
    value: any;
    description: string;
}

/**
 * Quest definition
 */
export interface Quest {
    id: string;
    type: QuestType;
    name: string;
    description: string;
    story?: string;
    objectives: QuestObjective[];
    rewards: QuestReward;
    requirements?: QuestRequirement[];
    status: QuestStatus;
    progress: number;
    startDate?: number;
    completeDate?: number;
    expiryDate?: number;
    timeLimit?: number;
    chainedQuests?: string[];
    icon?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
}

/**
 * Quest chain
 */
export interface QuestChain {
    id: string;
    name: string;
    description: string;
    quests: string[];
    currentQuestIndex: number;
    completed: boolean;
}

/**
 * Daily quest pool
 */
export interface DailyQuestPool {
    easy: Quest[];
    medium: Quest[];
    hard: Quest[];
}

/**
 * Quest notification
 */
export interface QuestNotification {
    quest: Quest;
    type: 'started' | 'completed' | 'failed' | 'expired' | 'objective_complete';
    message: string;
    timestamp: number;
    shown: boolean;
}

/**
 * Quest System
 * Comprehensive quest and mission management
 */
export class QuestSystem {
    // Quest definitions
    private quests: Map<string, Quest> = new Map();

    // Quest chains
    private questChains: Map<string, QuestChain> = new Map();

    // Player quests
    private activeQuests: Set<string> = new Set();
    private completedQuests: Set<string> = new Set();

    // Daily quest management
    private dailyQuestPool: DailyQuestPool = {
        easy: [],
        medium: [],
        hard: []
    };
    private currentDailyQuests: Quest[] = [];
    private lastDailyReset: number = 0;

    // Notifications
    private pendingNotifications: QuestNotification[] = [];

    // Observables
    private onQuestStartedObservable: Observable<Quest> = new Observable();
    private onQuestCompletedObservable: Observable<Quest> = new Observable();
    private onQuestFailedObservable: Observable<Quest> = new Observable();
    private onObjectiveCompletedObservable: Observable<{ quest: Quest; objective: QuestObjective }> = new Observable();

    // Settings
    private enabled: boolean = true;
    private maxActiveQuests: number = 10;
    private maxDailyQuests: number = 3;

    constructor() {
        this.initializeQuests();
        this.checkDailyReset();
    }

    /**
     * Initialize quest definitions
     */
    private initializeQuests(): void {
        // Tutorial quests
        this.registerQuest({
            id: 'tutorial_batting',
            type: QuestType.TUTORIAL,
            name: 'Learn to Bat',
            description: 'Complete the batting tutorial',
            objectives: [
                {
                    id: 'obj_1',
                    type: ObjectiveType.GET_HITS,
                    description: 'Get 3 hits in practice',
                    targetValue: 3,
                    currentValue: 0
                }
            ],
            rewards: {
                coins: 100,
                experience: 50
            },
            status: QuestStatus.AVAILABLE,
            progress: 0,
            difficulty: 'easy'
        });

        this.registerQuest({
            id: 'tutorial_pitching',
            type: QuestType.TUTORIAL,
            name: 'Learn to Pitch',
            description: 'Complete the pitching tutorial',
            objectives: [
                {
                    id: 'obj_1',
                    type: ObjectiveType.STRIKE_OUT,
                    description: 'Strike out 3 batters',
                    targetValue: 3,
                    currentValue: 0
                }
            ],
            rewards: {
                coins: 100,
                experience: 50
            },
            status: QuestStatus.AVAILABLE,
            progress: 0,
            difficulty: 'easy'
        });

        // Main story quests
        this.registerQuest({
            id: 'main_first_game',
            type: QuestType.MAIN,
            name: 'First Game',
            description: 'Win your first game',
            objectives: [
                {
                    id: 'obj_1',
                    type: ObjectiveType.WIN_GAMES,
                    description: 'Win 1 game',
                    targetValue: 1,
                    currentValue: 0
                }
            ],
            rewards: {
                coins: 500,
                experience: 200,
                unlocks: ['career_mode']
            },
            requirements: [
                {
                    type: 'quest',
                    value: ['tutorial_batting', 'tutorial_pitching'],
                    description: 'Complete batting and pitching tutorials'
                }
            ],
            status: QuestStatus.LOCKED,
            progress: 0,
            difficulty: 'easy'
        });

        this.registerQuest({
            id: 'main_rookie_season',
            type: QuestType.MAIN,
            name: 'Rookie Season',
            description: 'Complete your first season',
            objectives: [
                {
                    id: 'obj_1',
                    type: ObjectiveType.WIN_GAMES,
                    description: 'Win 20 games',
                    targetValue: 20,
                    currentValue: 0
                },
                {
                    id: 'obj_2',
                    type: ObjectiveType.GET_HITS,
                    description: 'Get 50 hits',
                    targetValue: 50,
                    currentValue: 0
                }
            ],
            rewards: {
                coins: 5000,
                gems: 10,
                experience: 2000,
                items: [
                    { id: 'rookie_trophy', quantity: 1 }
                ]
            },
            chainedQuests: ['main_sophomore_season'],
            status: QuestStatus.LOCKED,
            progress: 0,
            difficulty: 'medium'
        });

        // Side quests
        this.registerQuest({
            id: 'side_power_hitter',
            type: QuestType.SIDE,
            name: 'Power Hitter',
            description: 'Show your power',
            objectives: [
                {
                    id: 'obj_1',
                    type: ObjectiveType.HIT_HOME_RUNS,
                    description: 'Hit 10 home runs',
                    targetValue: 10,
                    currentValue: 0
                }
            ],
            rewards: {
                coins: 1000,
                experience: 500,
                items: [
                    { id: 'power_bat', quantity: 1 }
                ]
            },
            status: QuestStatus.AVAILABLE,
            progress: 0,
            difficulty: 'medium'
        });

        this.registerQuest({
            id: 'side_speed_demon',
            type: QuestType.SIDE,
            name: 'Speed Demon',
            description: 'Show your speed',
            objectives: [
                {
                    id: 'obj_1',
                    type: ObjectiveType.STEAL_BASES,
                    description: 'Steal 15 bases',
                    targetValue: 15,
                    currentValue: 0
                }
            ],
            rewards: {
                coins: 1000,
                experience: 500,
                items: [
                    { id: 'speed_cleats', quantity: 1 }
                ]
            },
            status: QuestStatus.AVAILABLE,
            progress: 0,
            difficulty: 'medium'
        });

        // Daily quest templates
        this.dailyQuestPool.easy = [
            {
                id: 'daily_easy_1',
                type: QuestType.DAILY,
                name: 'Daily Practice',
                description: 'Get some practice hits',
                objectives: [
                    {
                        id: 'obj_1',
                        type: ObjectiveType.GET_HITS,
                        description: 'Get 5 hits',
                        targetValue: 5,
                        currentValue: 0
                    }
                ],
                rewards: {
                    coins: 100,
                    experience: 50
                },
                status: QuestStatus.AVAILABLE,
                progress: 0,
                expiryDate: 0,
                difficulty: 'easy'
            },
            {
                id: 'daily_easy_2',
                type: QuestType.DAILY,
                name: 'Daily Wins',
                description: 'Win some games',
                objectives: [
                    {
                        id: 'obj_1',
                        type: ObjectiveType.WIN_GAMES,
                        description: 'Win 2 games',
                        targetValue: 2,
                        currentValue: 0
                    }
                ],
                rewards: {
                    coins: 150,
                    experience: 75
                },
                status: QuestStatus.AVAILABLE,
                progress: 0,
                expiryDate: 0,
                difficulty: 'easy'
            }
        ];

        this.dailyQuestPool.medium = [
            {
                id: 'daily_medium_1',
                type: QuestType.DAILY,
                name: 'Daily Power',
                description: 'Hit some home runs',
                objectives: [
                    {
                        id: 'obj_1',
                        type: ObjectiveType.HIT_HOME_RUNS,
                        description: 'Hit 3 home runs',
                        targetValue: 3,
                        currentValue: 0
                    }
                ],
                rewards: {
                    coins: 300,
                    experience: 150
                },
                status: QuestStatus.AVAILABLE,
                progress: 0,
                expiryDate: 0,
                difficulty: 'medium'
            },
            {
                id: 'daily_medium_2',
                type: QuestType.DAILY,
                name: 'Daily Strikeouts',
                description: 'Strike out batters',
                objectives: [
                    {
                        id: 'obj_1',
                        type: ObjectiveType.STRIKE_OUT,
                        description: 'Strike out 10 batters',
                        targetValue: 10,
                        currentValue: 0
                    }
                ],
                rewards: {
                    coins: 300,
                    experience: 150
                },
                status: QuestStatus.AVAILABLE,
                progress: 0,
                expiryDate: 0,
                difficulty: 'medium'
            }
        ];

        this.dailyQuestPool.hard = [
            {
                id: 'daily_hard_1',
                type: QuestType.DAILY,
                name: 'Daily Perfection',
                description: 'Pitch a shutout',
                objectives: [
                    {
                        id: 'obj_1',
                        type: ObjectiveType.PITCH_SHUTOUT,
                        description: 'Pitch a shutout game',
                        targetValue: 1,
                        currentValue: 0
                    }
                ],
                rewards: {
                    coins: 500,
                    gems: 5,
                    experience: 250
                },
                status: QuestStatus.AVAILABLE,
                progress: 0,
                expiryDate: 0,
                difficulty: 'hard'
            }
        ];

        // Weekly challenges
        this.registerQuest({
            id: 'weekly_challenge_1',
            type: QuestType.WEEKLY,
            name: 'Weekly Warrior',
            description: 'Complete weekly challenge',
            objectives: [
                {
                    id: 'obj_1',
                    type: ObjectiveType.WIN_GAMES,
                    description: 'Win 10 games this week',
                    targetValue: 10,
                    currentValue: 0
                },
                {
                    id: 'obj_2',
                    type: ObjectiveType.HIT_HOME_RUNS,
                    description: 'Hit 5 home runs this week',
                    targetValue: 5,
                    currentValue: 0
                }
            ],
            rewards: {
                coins: 2000,
                gems: 10,
                experience: 1000
            },
            status: QuestStatus.AVAILABLE,
            progress: 0,
            expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
            difficulty: 'hard'
        });
    }

    /**
     * Register quest
     */
    public registerQuest(quest: Quest): void {
        this.quests.set(quest.id, quest);
    }

    /**
     * Start quest
     */
    public startQuest(questId: string): boolean {
        if (!this.enabled) return false;

        const quest = this.quests.get(questId);
        if (!quest) return false;

        // Check if already active or completed
        if (this.activeQuests.has(questId) || this.completedQuests.has(questId)) {
            return false;
        }

        // Check active quest limit
        if (this.activeQuests.size >= this.maxActiveQuests) {
            console.warn('Maximum active quests reached');
            return false;
        }

        // Check requirements
        if (!this.checkRequirements(quest)) {
            console.warn('Quest requirements not met');
            return false;
        }

        // Start quest
        quest.status = QuestStatus.ACTIVE;
        quest.startDate = Date.now();
        this.activeQuests.add(questId);

        // Add notification
        this.addNotification({
            quest,
            type: 'started',
            message: `Quest started: ${quest.name}`,
            timestamp: Date.now(),
            shown: false
        });

        // Notify observers
        this.onQuestStartedObservable.notifyObservers(quest);

        console.log(`Quest started: ${quest.name}`);
        return true;
    }

    /**
     * Check quest requirements
     */
    private checkRequirements(quest: Quest): boolean {
        if (!quest.requirements) return true;

        for (const req of quest.requirements) {
            switch (req.type) {
                case 'quest':
                    // Check if required quests are completed
                    const requiredQuests = Array.isArray(req.value) ? req.value : [req.value];
                    if (!requiredQuests.every(qid => this.completedQuests.has(qid))) {
                        return false;
                    }
                    break;

                case 'level':
                    // Would check player level
                    break;

                case 'achievement':
                    // Would check achievement completion
                    break;
            }
        }

        return true;
    }

    /**
     * Update quest objective
     */
    public updateObjective(
        questId: string,
        objectiveId: string,
        value: number,
        operation: 'set' | 'add' | 'increment' = 'add'
    ): void {
        if (!this.enabled) return;

        const quest = this.quests.get(questId);
        if (!quest || !this.activeQuests.has(questId)) return;

        const objective = quest.objectives.find(obj => obj.id === objectiveId);
        if (!objective) return;

        const oldValue = objective.currentValue;

        switch (operation) {
            case 'set':
                objective.currentValue = value;
                break;
            case 'add':
                objective.currentValue += value;
                break;
            case 'increment':
                objective.currentValue++;
                break;
        }

        // Cap at target value
        objective.currentValue = Math.min(objective.currentValue, objective.targetValue);

        // Check if objective completed
        if (objective.currentValue >= objective.targetValue && oldValue < objective.targetValue) {
            this.completeObjective(quest, objective);
        }

        // Update quest progress
        this.updateQuestProgress(quest);

        // Check if quest completed
        if (this.isQuestComplete(quest)) {
            this.completeQuest(questId);
        }
    }

    /**
     * Complete objective
     */
    private completeObjective(quest: Quest, objective: QuestObjective): void {
        this.addNotification({
            quest,
            type: 'objective_complete',
            message: `Objective complete: ${objective.description}`,
            timestamp: Date.now(),
            shown: false
        });

        this.onObjectiveCompletedObservable.notifyObservers({ quest, objective });
    }

    /**
     * Update quest progress
     */
    private updateQuestProgress(quest: Quest): void {
        const requiredObjectives = quest.objectives.filter(obj => !obj.optional);
        const totalProgress = requiredObjectives.reduce((sum, obj) => {
            return sum + (obj.currentValue / obj.targetValue);
        }, 0);

        quest.progress = totalProgress / requiredObjectives.length;
    }

    /**
     * Check if quest is complete
     */
    private isQuestComplete(quest: Quest): boolean {
        return quest.objectives
            .filter(obj => !obj.optional)
            .every(obj => obj.currentValue >= obj.targetValue);
    }

    /**
     * Complete quest
     */
    public completeQuest(questId: string): void {
        const quest = this.quests.get(questId);
        if (!quest || !this.activeQuests.has(questId)) return;

        quest.status = QuestStatus.COMPLETED;
        quest.completeDate = Date.now();
        quest.progress = 1;

        this.activeQuests.delete(questId);
        this.completedQuests.add(questId);

        // Award rewards
        this.awardRewards(quest.rewards);

        // Add notification
        this.addNotification({
            quest,
            type: 'completed',
            message: `Quest completed: ${quest.name}`,
            timestamp: Date.now(),
            shown: false
        });

        // Unlock chained quests
        if (quest.chainedQuests) {
            for (const chainedId of quest.chainedQuests) {
                const chained = this.quests.get(chainedId);
                if (chained && chained.status === QuestStatus.LOCKED) {
                    chained.status = QuestStatus.AVAILABLE;
                }
            }
        }

        // Notify observers
        this.onQuestCompletedObservable.notifyObservers(quest);

        console.log(`Quest completed: ${quest.name}`);
    }

    /**
     * Fail quest
     */
    public failQuest(questId: string): void {
        const quest = this.quests.get(questId);
        if (!quest || !this.activeQuests.has(questId)) return;

        quest.status = QuestStatus.FAILED;
        this.activeQuests.delete(questId);

        this.addNotification({
            quest,
            type: 'failed',
            message: `Quest failed: ${quest.name}`,
            timestamp: Date.now(),
            shown: false
        });

        this.onQuestFailedObservable.notifyObservers(quest);
    }

    /**
     * Award rewards
     */
    private awardRewards(rewards: QuestReward): void {
        // Rewards would be applied to player inventory
        if (rewards.coins) {
            console.log(`Awarded ${rewards.coins} coins`);
        }
        if (rewards.gems) {
            console.log(`Awarded ${rewards.gems} gems`);
        }
        if (rewards.experience) {
            console.log(`Awarded ${rewards.experience} experience`);
        }
    }

    /**
     * Add notification
     */
    private addNotification(notification: QuestNotification): void {
        this.pendingNotifications.push(notification);

        // Trim to last 50 notifications
        if (this.pendingNotifications.length > 50) {
            this.pendingNotifications.shift();
        }
    }

    /**
     * Check for daily reset
     */
    private checkDailyReset(): void {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (now - this.lastDailyReset >= oneDayMs) {
            this.resetDailyQuests();
        }
    }

    /**
     * Reset daily quests
     */
    public resetDailyQuests(): void {
        // Clear expired daily quests
        for (const quest of this.currentDailyQuests) {
            if (this.activeQuests.has(quest.id)) {
                this.activeQuests.delete(quest.id);
            }
            this.quests.delete(quest.id);
        }

        this.currentDailyQuests = [];

        // Generate new daily quests
        const now = Date.now();
        const expiryDate = now + 24 * 60 * 60 * 1000;

        // Select random quests from each difficulty
        const easy = this.selectRandomQuest(this.dailyQuestPool.easy);
        const medium = this.selectRandomQuest(this.dailyQuestPool.medium);
        const hard = this.selectRandomQuest(this.dailyQuestPool.hard);

        for (const template of [easy, medium, hard]) {
            if (!template) continue;

            const quest = this.cloneQuest(template);
            quest.id = `daily_${now}_${Math.random().toString(36).substr(2, 9)}`;
            quest.expiryDate = expiryDate;
            quest.status = QuestStatus.AVAILABLE;

            this.registerQuest(quest);
            this.currentDailyQuests.push(quest);
        }

        this.lastDailyReset = now;
    }

    /**
     * Select random quest from array
     */
    private selectRandomQuest(quests: Quest[]): Quest | null {
        if (quests.length === 0) return null;
        return quests[Math.floor(Math.random() * quests.length)];
    }

    /**
     * Clone quest
     */
    private cloneQuest(quest: Quest): Quest {
        return JSON.parse(JSON.stringify(quest));
    }

    /**
     * Get quest
     */
    public getQuest(questId: string): Quest | undefined {
        return this.quests.get(questId);
    }

    /**
     * Get active quests
     */
    public getActiveQuests(): Quest[] {
        return Array.from(this.activeQuests)
            .map(id => this.quests.get(id))
            .filter(q => q !== undefined) as Quest[];
    }

    /**
     * Get available quests
     */
    public getAvailableQuests(): Quest[] {
        return Array.from(this.quests.values())
            .filter(q => q.status === QuestStatus.AVAILABLE);
    }

    /**
     * Get completed quests
     */
    public getCompletedQuests(): Quest[] {
        return Array.from(this.completedQuests)
            .map(id => this.quests.get(id))
            .filter(q => q !== undefined) as Quest[];
    }

    /**
     * Get quests by type
     */
    public getQuestsByType(type: QuestType): Quest[] {
        return Array.from(this.quests.values())
            .filter(q => q.type === type);
    }

    /**
     * Get daily quests
     */
    public getDailyQuests(): Quest[] {
        return this.currentDailyQuests;
    }

    /**
     * Get pending notifications
     */
    public getPendingNotifications(): QuestNotification[] {
        return this.pendingNotifications.filter(n => !n.shown);
    }

    /**
     * Mark notification as shown
     */
    public markNotificationShown(questId: string, type: QuestNotification['type']): void {
        const notification = this.pendingNotifications.find(
            n => n.quest.id === questId && n.type === type
        );
        if (notification) {
            notification.shown = true;
        }
    }

    /**
     * Update system (check expirations)
     */
    public update(deltaTime: number): void {
        if (!this.enabled) return;

        const now = Date.now();

        // Check for expired quests
        for (const questId of this.activeQuests) {
            const quest = this.quests.get(questId);
            if (!quest) continue;

            if (quest.expiryDate && now >= quest.expiryDate) {
                quest.status = QuestStatus.EXPIRED;
                this.activeQuests.delete(questId);

                this.addNotification({
                    quest,
                    type: 'expired',
                    message: `Quest expired: ${quest.name}`,
                    timestamp: now,
                    shown: false
                });
            }
        }

        // Check daily reset
        this.checkDailyReset();
    }

    /**
     * Subscribe to quest started
     */
    public onQuestStarted(callback: (quest: Quest) => void): void {
        this.onQuestStartedObservable.add(callback);
    }

    /**
     * Subscribe to quest completed
     */
    public onQuestCompleted(callback: (quest: Quest) => void): void {
        this.onQuestCompletedObservable.add(callback);
    }

    /**
     * Subscribe to quest failed
     */
    public onQuestFailed(callback: (quest: Quest) => void): void {
        this.onQuestFailedObservable.add(callback);
    }

    /**
     * Subscribe to objective completed
     */
    public onObjectiveCompleted(callback: (data: { quest: Quest; objective: QuestObjective }) => void): void {
        this.onObjectiveCompletedObservable.add(callback);
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Export quest data
     */
    public exportData(): string {
        const data = {
            activeQuests: Array.from(this.activeQuests),
            completedQuests: Array.from(this.completedQuests),
            quests: Array.from(this.quests.entries()).map(([id, quest]) => ({
                id,
                status: quest.status,
                progress: quest.progress,
                objectives: quest.objectives.map(obj => ({
                    id: obj.id,
                    currentValue: obj.currentValue
                })),
                startDate: quest.startDate,
                completeDate: quest.completeDate
            })),
            lastDailyReset: this.lastDailyReset
        };

        return JSON.stringify(data);
    }

    /**
     * Import quest data
     */
    public importData(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this.activeQuests = new Set(parsed.activeQuests);
            this.completedQuests = new Set(parsed.completedQuests);
            this.lastDailyReset = parsed.lastDailyReset;

            // Restore quest states
            for (const questData of parsed.quests) {
                const quest = this.quests.get(questData.id);
                if (!quest) continue;

                quest.status = questData.status;
                quest.progress = questData.progress;
                quest.startDate = questData.startDate;
                quest.completeDate = questData.completeDate;

                for (const objData of questData.objectives) {
                    const objective = quest.objectives.find(obj => obj.id === objData.id);
                    if (objective) {
                        objective.currentValue = objData.currentValue;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to import quest data:', error);
        }
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.quests.clear();
        this.activeQuests.clear();
        this.completedQuests.clear();

        this.onQuestStartedObservable.clear();
        this.onQuestCompletedObservable.clear();
        this.onQuestFailedObservable.clear();
        this.onObjectiveCompletedObservable.clear();
    }
}
