import { Observable } from '@babylonjs/core';

/**
 * Save data version for compatibility
 */
export const SAVE_VERSION = '1.0.0';

/**
 * Save slot
 */
export interface SaveSlot {
    id: string;
    name: string;
    timestamp: number;
    playtime: number;
    gameMode: string;
    level: number;
    progress: number;
    thumbnail?: string;
    autoSave: boolean;
    cloudSync: boolean;
}

/**
 * Save data structure
 */
export interface SaveData {
    version: string;
    slotId: string;
    metadata: SaveSlotMetadata;
    player: PlayerSaveData;
    career: CareerSaveData;
    settings: SettingsSaveData;
    statistics: StatisticsSaveData;
    unlockables: UnlockablesSaveData;
    achievements: AchievementsSaveData;
    customization: CustomizationSaveData;
    timestamp: number;
    checksum: string;
}

/**
 * Save slot metadata
 */
export interface SaveSlotMetadata {
    slotId: string;
    slotName: string;
    createdDate: number;
    lastModified: number;
    playtime: number;
    gameVersion: string;
    platform: string;
    autoSave: boolean;
}

/**
 * Player save data
 */
export interface PlayerSaveData {
    characterId: string;
    firstName: string;
    lastName: string;
    nickname?: string;
    position: string;
    level: number;
    experience: number;
    skillPoints: number;
    attributes: Record<string, number>;
    unlockedPerks: string[];
    equipmentLoadout: Record<string, any>;
    appearance: Record<string, any>;
}

/**
 * Career mode save data
 */
export interface CareerSaveData {
    currentSeason: number;
    currentTeam: string;
    gamesPlayed: number;
    currentStandings: TeamStanding[];
    schedule: GameSchedule[];
    completedGames: CompletedGame[];
    salaryHistory: SalaryRecord[];
    contractDetails: ContractDetails;
    injuries: InjuryRecord[];
}

/**
 * Team standing
 */
export interface TeamStanding {
    teamId: string;
    wins: number;
    losses: number;
    winPercentage: number;
    gamesBack: number;
    streak: string;
}

/**
 * Game schedule
 */
export interface GameSchedule {
    gameId: string;
    date: number;
    homeTeam: string;
    awayTeam: string;
    completed: boolean;
    result?: GameResult;
}

/**
 * Game result
 */
export interface GameResult {
    homeScore: number;
    awayScore: number;
    winner: string;
    playerStats: Record<string, any>;
}

/**
 * Completed game
 */
export interface CompletedGame {
    gameId: string;
    date: number;
    opponent: string;
    result: 'win' | 'loss';
    score: string;
    playerPerformance: Record<string, any>;
    highlights: string[];
}

/**
 * Salary record
 */
export interface SalaryRecord {
    season: number;
    amount: number;
    bonuses: number;
}

/**
 * Contract details
 */
export interface ContractDetails {
    teamId: string;
    yearsRemaining: number;
    annualSalary: number;
    bonuses: Record<string, number>;
    noTradeClause: boolean;
}

/**
 * Injury record
 */
export interface InjuryRecord {
    date: number;
    type: string;
    severity: string;
    gamesLost: number;
    recovered: boolean;
}

/**
 * Settings save data
 */
export interface SettingsSaveData {
    graphics: Record<string, any>;
    audio: Record<string, any>;
    gameplay: Record<string, any>;
    controls: Record<string, any>;
    interface: Record<string, any>;
    accessibility: Record<string, any>;
}

/**
 * Statistics save data
 */
export interface StatisticsSaveData {
    career: CareerStatistics;
    season: SeasonStatistics;
    records: PersonalRecords;
    milestones: Milestone[];
}

/**
 * Career statistics
 */
export interface CareerStatistics {
    batting: BattingStats;
    pitching: PitchingStats;
    fielding: FieldingStats;
    games: number;
    seasons: number;
}

/**
 * Batting stats
 */
export interface BattingStats {
    atBats: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    rbi: number;
    runs: number;
    walks: number;
    strikeouts: number;
    stolenBases: number;
    average: number;
    obp: number;
    slg: number;
    ops: number;
}

/**
 * Pitching stats
 */
export interface PitchingStats {
    wins: number;
    losses: number;
    saves: number;
    gamesStarted: number;
    inningsPitched: number;
    strikeouts: number;
    walks: number;
    earnedRuns: number;
    era: number;
    whip: number;
}

/**
 * Fielding stats
 */
export interface FieldingStats {
    putOuts: number;
    assists: number;
    errors: number;
    fieldingPercentage: number;
    doublePlays: number;
}

/**
 * Season statistics
 */
export interface SeasonStatistics {
    year: number;
    batting: BattingStats;
    pitching: PitchingStats;
    fielding: FieldingStats;
}

/**
 * Personal records
 */
export interface PersonalRecords {
    mostHitsInGame: number;
    mostHomeRunsInGame: number;
    mostRBIInGame: number;
    mostStrikeoutsInGame: number;
    longestHittingStreak: number;
    perfectGames: number;
    noHitters: number;
}

/**
 * Milestone
 */
export interface Milestone {
    id: string;
    name: string;
    description: string;
    dateAchieved: number;
    value: number;
}

/**
 * Unlockables save data
 */
export interface UnlockablesSaveData {
    stadiums: string[];
    teams: string[];
    equipment: string[];
    cosmetics: string[];
    cheats: string[];
    currency: CurrencyData;
}

/**
 * Currency data
 */
export interface CurrencyData {
    coins: number;
    gems: number;
    tickets: number;
}

/**
 * Achievements save data
 */
export interface AchievementsSaveData {
    unlocked: string[];
    progress: Map<string, number>;
    totalPoints: number;
    completionPercentage: number;
}

/**
 * Customization save data
 */
export interface CustomizationSaveData {
    characters: string[];
    stadiums: string[];
    teams: string[];
}

/**
 * Cloud save sync status
 */
export interface CloudSyncStatus {
    enabled: boolean;
    lastSync: number;
    syncInProgress: boolean;
    conflictDetected: boolean;
    localNewer: boolean;
    cloudNewer: boolean;
}

/**
 * Save/Load System
 * Comprehensive save system with cloud sync, auto-save, and data integrity
 */
export class SaveLoadSystem {
    private static readonly STORAGE_KEY = 'sandlot_sluggers_save';
    private static readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
    private static readonly MAX_SAVE_SLOTS = 10;
    private static readonly MAX_AUTO_SAVES = 3;

    // Save slots
    private slots: Map<string, SaveSlot> = new Map();
    private currentSlot: string | null = null;
    private currentSaveData: SaveData | null = null;

    // Auto-save
    private autoSaveEnabled: boolean = true;
    private autoSaveTimer: any = null;
    private lastAutoSave: number = 0;

    // Cloud sync
    private cloudSyncEnabled: boolean = false;
    private cloudSyncStatus: CloudSyncStatus = {
        enabled: false,
        lastSync: 0,
        syncInProgress: false,
        conflictDetected: false,
        localNewer: false,
        cloudNewer: false
    };

    // Observables
    private onSaveObservable: Observable<SaveData> = new Observable();
    private onLoadObservable: Observable<SaveData> = new Observable();
    private onAutoSaveObservable: Observable<SaveData> = new Observable();
    private onCloudSyncObservable: Observable<CloudSyncStatus> = new Observable();
    private onErrorObservable: Observable<Error> = new Observable();

    // Compression
    private compressionEnabled: boolean = true;

    // Encryption (for sensitive data)
    private encryptionEnabled: boolean = false;
    private encryptionKey: string = '';

    constructor() {
        this.loadSlotIndex();
        this.startAutoSave();
    }

    /**
     * Load slot index from storage
     */
    private loadSlotIndex(): void {
        try {
            const indexKey = `${SaveLoadSystem.STORAGE_KEY}_index`;
            const indexData = localStorage.getItem(indexKey);

            if (indexData) {
                const slots = JSON.parse(indexData);
                this.slots = new Map(slots);
            }
        } catch (error) {
            console.error('Failed to load slot index:', error);
            this.onErrorObservable.notifyObservers(error as Error);
        }
    }

    /**
     * Save slot index to storage
     */
    private saveSlotIndex(): void {
        try {
            const indexKey = `${SaveLoadSystem.STORAGE_KEY}_index`;
            const slots = Array.from(this.slots.entries());
            localStorage.setItem(indexKey, JSON.stringify(slots));
        } catch (error) {
            console.error('Failed to save slot index:', error);
            this.onErrorObservable.notifyObservers(error as Error);
        }
    }

    /**
     * Create new save slot
     */
    public createSlot(name: string): string {
        if (this.slots.size >= SaveLoadSystem.MAX_SAVE_SLOTS) {
            throw new Error('Maximum save slots reached');
        }

        const id = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const slot: SaveSlot = {
            id,
            name,
            timestamp: Date.now(),
            playtime: 0,
            gameMode: 'career',
            level: 1,
            progress: 0,
            autoSave: false,
            cloudSync: this.cloudSyncEnabled
        };

        this.slots.set(id, slot);
        this.saveSlotIndex();

        return id;
    }

    /**
     * Delete save slot
     */
    public deleteSlot(slotId: string): boolean {
        if (!this.slots.has(slotId)) {
            return false;
        }

        // Delete from storage
        const storageKey = `${SaveLoadSystem.STORAGE_KEY}_${slotId}`;
        localStorage.removeItem(storageKey);

        // Remove from slots
        this.slots.delete(slotId);
        this.saveSlotIndex();

        // Clear current slot if deleted
        if (this.currentSlot === slotId) {
            this.currentSlot = null;
            this.currentSaveData = null;
        }

        return true;
    }

    /**
     * Get all save slots
     */
    public getSlots(): SaveSlot[] {
        return Array.from(this.slots.values()).sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Save game data
     */
    public async save(slotId: string, data: Partial<SaveData>, isAutoSave: boolean = false): Promise<boolean> {
        try {
            const slot = this.slots.get(slotId);
            if (!slot) {
                throw new Error(`Save slot not found: ${slotId}`);
            }

            // Build complete save data
            const saveData: SaveData = {
                version: SAVE_VERSION,
                slotId,
                metadata: {
                    slotId,
                    slotName: slot.name,
                    createdDate: slot.timestamp,
                    lastModified: Date.now(),
                    playtime: slot.playtime,
                    gameVersion: '1.0.0',
                    platform: this.getPlatform(),
                    autoSave: isAutoSave
                },
                player: data.player || ({} as PlayerSaveData),
                career: data.career || ({} as CareerSaveData),
                settings: data.settings || ({} as SettingsSaveData),
                statistics: data.statistics || ({} as StatisticsSaveData),
                unlockables: data.unlockables || ({} as UnlockablesSaveData),
                achievements: data.achievements || ({} as AchievementsSaveData),
                customization: data.customization || ({} as CustomizationSaveData),
                timestamp: Date.now(),
                checksum: ''
            };

            // Calculate checksum
            saveData.checksum = this.calculateChecksum(saveData);

            // Serialize data
            let serialized = JSON.stringify(saveData);

            // Compress if enabled
            if (this.compressionEnabled) {
                serialized = this.compress(serialized);
            }

            // Encrypt if enabled
            if (this.encryptionEnabled) {
                serialized = this.encrypt(serialized);
            }

            // Save to local storage
            const storageKey = `${SaveLoadSystem.STORAGE_KEY}_${slotId}`;
            localStorage.setItem(storageKey, serialized);

            // Update slot metadata
            slot.timestamp = Date.now();
            slot.autoSave = isAutoSave;
            this.saveSlotIndex();

            // Update current save data
            this.currentSlot = slotId;
            this.currentSaveData = saveData;

            // Notify observers
            if (isAutoSave) {
                this.onAutoSaveObservable.notifyObservers(saveData);
            } else {
                this.onSaveObservable.notifyObservers(saveData);
            }

            // Cloud sync if enabled
            if (slot.cloudSync && this.cloudSyncEnabled) {
                await this.syncToCloud(slotId, saveData);
            }

            return true;
        } catch (error) {
            console.error('Save failed:', error);
            this.onErrorObservable.notifyObservers(error as Error);
            return false;
        }
    }

    /**
     * Load game data
     */
    public async load(slotId: string): Promise<SaveData | null> {
        try {
            const slot = this.slots.get(slotId);
            if (!slot) {
                throw new Error(`Save slot not found: ${slotId}`);
            }

            // Check cloud sync
            if (slot.cloudSync && this.cloudSyncEnabled) {
                await this.checkCloudSync(slotId);
            }

            // Load from local storage
            const storageKey = `${SaveLoadSystem.STORAGE_KEY}_${slotId}`;
            let serialized = localStorage.getItem(storageKey);

            if (!serialized) {
                throw new Error('Save data not found');
            }

            // Decrypt if enabled
            if (this.encryptionEnabled) {
                serialized = this.decrypt(serialized);
            }

            // Decompress if enabled
            if (this.compressionEnabled) {
                serialized = this.decompress(serialized);
            }

            // Parse data
            const saveData: SaveData = JSON.parse(serialized);

            // Verify checksum
            const calculatedChecksum = this.calculateChecksum(saveData);
            if (calculatedChecksum !== saveData.checksum) {
                throw new Error('Save data corrupted (checksum mismatch)');
            }

            // Version compatibility check
            if (!this.isCompatibleVersion(saveData.version)) {
                console.warn(`Save version ${saveData.version} may not be fully compatible`);
                // Optionally migrate data
                this.migrateSaveData(saveData);
            }

            // Update current save data
            this.currentSlot = slotId;
            this.currentSaveData = saveData;

            // Notify observers
            this.onLoadObservable.notifyObservers(saveData);

            return saveData;
        } catch (error) {
            console.error('Load failed:', error);
            this.onErrorObservable.notifyObservers(error as Error);
            return null;
        }
    }

    /**
     * Quick save (to current slot)
     */
    public async quickSave(data: Partial<SaveData>): Promise<boolean> {
        if (!this.currentSlot) {
            throw new Error('No save slot selected');
        }

        return this.save(this.currentSlot, data, false);
    }

    /**
     * Auto save
     */
    private async performAutoSave(): Promise<void> {
        if (!this.autoSaveEnabled || !this.currentSlot || !this.currentSaveData) {
            return;
        }

        // Create auto-save slot if needed
        const autoSaveSlot = this.getOrCreateAutoSaveSlot();

        await this.save(autoSaveSlot, this.currentSaveData, true);
        this.lastAutoSave = Date.now();
    }

    /**
     * Get or create auto-save slot
     */
    private getOrCreateAutoSaveSlot(): string {
        const autoSaves = Array.from(this.slots.values())
            .filter(s => s.autoSave)
            .sort((a, b) => b.timestamp - a.timestamp);

        // Remove old auto-saves if exceeding max
        while (autoSaves.length >= SaveLoadSystem.MAX_AUTO_SAVES) {
            const oldest = autoSaves.pop();
            if (oldest) {
                this.deleteSlot(oldest.id);
            }
        }

        // Create new auto-save slot
        return this.createSlot(`Auto Save ${Date.now()}`);
    }

    /**
     * Start auto-save timer
     */
    private startAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(() => {
            this.performAutoSave();
        }, SaveLoadSystem.AUTO_SAVE_INTERVAL);
    }

    /**
     * Stop auto-save timer
     */
    private stopAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Enable/disable auto-save
     */
    public setAutoSave(enabled: boolean): void {
        this.autoSaveEnabled = enabled;

        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
    }

    /**
     * Calculate checksum for data integrity
     */
    private calculateChecksum(data: SaveData): string {
        // Simple checksum using JSON string length and content hash
        const str = JSON.stringify(data);
        let hash = 0;

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash.toString(36);
    }

    /**
     * Check version compatibility
     */
    private isCompatibleVersion(version: string): boolean {
        const [major, minor, patch] = version.split('.').map(Number);
        const [currentMajor] = SAVE_VERSION.split('.').map(Number);

        // Major version must match
        return major === currentMajor;
    }

    /**
     * Migrate save data to current version
     */
    private migrateSaveData(data: SaveData): void {
        // Migration logic for different versions
        // This would handle converting old save formats to new ones
    }

    /**
     * Compress data
     */
    private compress(data: string): string {
        // Simple compression (in real implementation, use LZ-string or similar)
        return btoa(data);
    }

    /**
     * Decompress data
     */
    private decompress(data: string): string {
        return atob(data);
    }

    /**
     * Encrypt data
     */
    private encrypt(data: string): string {
        // Simple XOR encryption (in real implementation, use Web Crypto API)
        if (!this.encryptionKey) return data;

        let encrypted = '';
        for (let i = 0; i < data.length; i++) {
            const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            const dataChar = data.charCodeAt(i);
            encrypted += String.fromCharCode(dataChar ^ keyChar);
        }

        return btoa(encrypted);
    }

    /**
     * Decrypt data
     */
    private decrypt(data: string): string {
        if (!this.encryptionKey) return data;

        const decoded = atob(data);
        let decrypted = '';

        for (let i = 0; i < decoded.length; i++) {
            const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            const dataChar = decoded.charCodeAt(i);
            decrypted += String.fromCharCode(dataChar ^ keyChar);
        }

        return decrypted;
    }

    /**
     * Sync to cloud
     */
    private async syncToCloud(slotId: string, data: SaveData): Promise<boolean> {
        if (!this.cloudSyncEnabled) return false;

        this.cloudSyncStatus.syncInProgress = true;
        this.onCloudSyncObservable.notifyObservers(this.cloudSyncStatus);

        try {
            // Cloud sync implementation would go here
            // This would upload to a cloud service (e.g., Firebase, AWS, etc.)

            this.cloudSyncStatus.lastSync = Date.now();
            this.cloudSyncStatus.syncInProgress = false;
            this.onCloudSyncObservable.notifyObservers(this.cloudSyncStatus);

            return true;
        } catch (error) {
            console.error('Cloud sync failed:', error);
            this.cloudSyncStatus.syncInProgress = false;
            this.onErrorObservable.notifyObservers(error as Error);
            return false;
        }
    }

    /**
     * Check cloud sync
     */
    private async checkCloudSync(slotId: string): Promise<void> {
        if (!this.cloudSyncEnabled) return;

        try {
            // Check if cloud has newer version
            // Compare timestamps and handle conflicts

            this.onCloudSyncObservable.notifyObservers(this.cloudSyncStatus);
        } catch (error) {
            console.error('Cloud sync check failed:', error);
            this.onErrorObservable.notifyObservers(error as Error);
        }
    }

    /**
     * Export save data to file
     */
    public exportSave(slotId: string): void {
        const storageKey = `${SaveLoadSystem.STORAGE_KEY}_${slotId}`;
        const data = localStorage.getItem(storageKey);

        if (!data) {
            throw new Error('Save data not found');
        }

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sandlot_save_${slotId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Import save data from file
     */
    public async importSave(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result as string;

                    // Parse and validate
                    const saveData: SaveData = JSON.parse(data);

                    // Create new slot
                    const slotId = this.createSlot(`Imported ${new Date().toLocaleDateString()}`);

                    // Save data
                    const storageKey = `${SaveLoadSystem.STORAGE_KEY}_${slotId}`;
                    localStorage.setItem(storageKey, data);

                    resolve(slotId);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    /**
     * Get platform identifier
     */
    private getPlatform(): string {
        return navigator.userAgent;
    }

    /**
     * Get storage usage
     */
    public getStorageUsage(): { used: number; total: number; percentage: number } {
        let used = 0;

        for (const slot of this.slots.values()) {
            const storageKey = `${SaveLoadSystem.STORAGE_KEY}_${slot.id}`;
            const data = localStorage.getItem(storageKey);
            if (data) {
                used += data.length * 2; // UTF-16 encoding
            }
        }

        // Estimate total available (varies by browser, typically 5-10MB)
        const total = 5 * 1024 * 1024; // 5MB estimate

        return {
            used,
            total,
            percentage: (used / total) * 100
        };
    }

    /**
     * Subscribe to save events
     */
    public onSave(callback: (data: SaveData) => void): void {
        this.onSaveObservable.add(callback);
    }

    /**
     * Subscribe to load events
     */
    public onLoad(callback: (data: SaveData) => void): void {
        this.onLoadObservable.add(callback);
    }

    /**
     * Subscribe to auto-save events
     */
    public onAutoSave(callback: (data: SaveData) => void): void {
        this.onAutoSaveObservable.add(callback);
    }

    /**
     * Subscribe to error events
     */
    public onError(callback: (error: Error) => void): void {
        this.onErrorObservable.add(callback);
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.stopAutoSave();

        this.onSaveObservable.clear();
        this.onLoadObservable.clear();
        this.onAutoSaveObservable.clear();
        this.onCloudSyncObservable.clear();
        this.onErrorObservable.clear();
    }
}
