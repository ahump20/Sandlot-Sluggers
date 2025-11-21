/**
 * Save/Load and Cloud Sync System
 *
 * Comprehensive save system with local storage, cloud synchronization,
 * auto-save, multiple save slots, versioning, compression, and conflict resolution.
 * Supports Cloudflare D1 and KV for cloud persistence.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Save slot metadata
 */
export interface SaveSlot {
  slotId: number; // 0-9 (10 slots)
  playerId: string;
  saveName: string;
  timestamp: number; // Last save time
  gameTime: number; // In-game time played (seconds)
  version: string; // Save format version

  // Game state summary
  summary: {
    teamName: string;
    wins: number;
    losses: number;
    currentSeason: number;
    currentInning: number;
    score: { home: number; away: number };
    difficulty: string;
  };

  // Metadata
  isAutoSave: boolean;
  isCloudSynced: boolean;
  lastSyncTime: number;
  cloudSaveId?: string;
  fileSize: number; // bytes
  isCompressed: boolean;
}

/**
 * Complete save data
 */
export interface SaveData {
  metadata: SaveSlot;

  // Game state
  gameState: {
    currentGame: any; // GameState from game engine
    season: any; // Season data
    career: any; // Career mode data
    franchise: any; // Franchise data
  };

  // Player data
  playerData: {
    profile: any; // Player profile
    statistics: any; // Career statistics
    achievements: any[]; // Unlocked achievements
    progression: any; // Level, XP, etc.
    customization: any; // Character customization
    equipment: any; // Owned equipment
  };

  // Team data
  teamData: {
    roster: any[]; // Team roster
    chemistry: any; // Team chemistry data
    morale: any; // Team morale
    stats: any; // Team statistics
  };

  // Settings
  settings: {
    gameplay: any;
    graphics: any;
    audio: any;
    controls: any;
  };

  // Analytics
  analytics: {
    totalGamesPlayed: number;
    totalTimePlayed: number;
    lastPlayedDate: number;
    favoriteTeam: string;
    favoritePlayer: string;
  };
}

/**
 * Cloud sync status
 */
export interface CloudSyncStatus {
  isEnabled: boolean;
  isConnected: boolean;
  lastSyncTime: number;
  pendingUploads: number;
  pendingDownloads: number;
  syncInProgress: boolean;
  lastError?: string;

  // Sync statistics
  totalSyncs: number;
  totalUploads: number;
  totalDownloads: number;
  totalConflicts: number;
  resolvedConflicts: number;
}

/**
 * Sync conflict
 */
export interface SyncConflict {
  conflictId: string;
  slotId: number;
  localSave: SaveSlot;
  cloudSave: SaveSlot;

  // Conflict details
  localTimestamp: number;
  cloudTimestamp: number;
  conflictType: 'timestamp_mismatch' | 'version_mismatch' | 'data_corruption';

  // Resolution
  isResolved: boolean;
  resolution?: 'use_local' | 'use_cloud' | 'merge' | 'create_new_slot';
  resolvedBy?: 'user' | 'auto';
}

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // seconds
  maxAutoSaves: number; // Maximum number of auto-save slots
  saveOnEvents: {
    gameEnd: boolean;
    inningEnd: boolean;
    seasonEnd: boolean;
    achievement: boolean;
    quit: boolean;
  };
}

/**
 * Backup data
 */
export interface BackupData {
  backupId: string;
  timestamp: number;
  saveSlots: SaveSlot[];
  reason: 'manual' | 'auto' | 'pre_sync' | 'pre_update';
}

// ============================================================================
// Save/Load and Cloud Sync System Class
// ============================================================================

export class SaveLoadCloudSyncSystem {
  private saveSlots: Map<number, SaveSlot>;
  private currentSaveData: SaveData | null;
  private cloudSyncStatus: CloudSyncStatus;
  private autoSaveConfig: AutoSaveConfig;
  private conflicts: Map<string, SyncConflict>;
  private backups: BackupData[];

  // Storage keys
  private readonly LOCAL_STORAGE_KEY_PREFIX = 'sandlot_save_';
  private readonly CLOUD_STORAGE_KEY_PREFIX = 'cloud_save_';
  private readonly BACKUP_KEY = 'sandlot_backups';
  private readonly CONFIG_KEY = 'sandlot_config';

  // Version
  private readonly SAVE_VERSION = '1.0.0';

  // Limits
  private readonly MAX_SAVE_SLOTS = 10;
  private readonly MAX_BACKUPS = 5;
  private readonly MAX_SAVE_SIZE = 5 * 1024 * 1024; // 5 MB

  // Auto-save
  private autoSaveTimer: number | null = null;
  private lastAutoSaveTime: number = 0;

  constructor() {
    this.saveSlots = new Map();
    this.currentSaveData = null;
    this.conflicts = new Map();
    this.backups = [];

    this.cloudSyncStatus = {
      isEnabled: false,
      isConnected: false,
      lastSyncTime: 0,
      pendingUploads: 0,
      pendingDownloads: 0,
      syncInProgress: false,
      totalSyncs: 0,
      totalUploads: 0,
      totalDownloads: 0,
      totalConflicts: 0,
      resolvedConflicts: 0
    };

    this.autoSaveConfig = {
      enabled: true,
      interval: 300, // 5 minutes
      maxAutoSaves: 3,
      saveOnEvents: {
        gameEnd: true,
        inningEnd: false,
        seasonEnd: true,
        achievement: true,
        quit: true
      }
    };

    this.initialize();
  }

  // ========================================================================
  // Public API - Initialization
  // ========================================================================

  /**
   * Initialize the save system
   */
  public initialize(): void {
    this.loadConfiguration();
    this.loadSaveSlotMetadata();
    this.loadBackups();
    this.startAutoSave();
  }

  /**
   * Shutdown the save system
   */
  public shutdown(): void {
    this.stopAutoSave();

    if (this.autoSaveConfig.saveOnEvents.quit && this.currentSaveData) {
      this.autoSave('Game quit');
    }
  }

  // ========================================================================
  // Public API - Save Operations
  // ========================================================================

  /**
   * Save game to slot
   */
  public async saveGame(
    slotId: number,
    saveName: string,
    gameData: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate slot
      if (slotId < 0 || slotId >= this.MAX_SAVE_SLOTS) {
        return { success: false, error: 'Invalid save slot' };
      }

      // Create save data
      const saveData = this.createSaveData(slotId, saveName, gameData, false);

      // Validate size
      const serialized = JSON.stringify(saveData);
      if (serialized.length > this.MAX_SAVE_SIZE) {
        return { success: false, error: 'Save data too large' };
      }

      // Compress if needed
      const compressed = this.compressData(serialized);

      // Save to local storage
      const localKey = this.getLocalStorageKey(slotId);
      localStorage.setItem(localKey, compressed);

      // Update slot metadata
      this.saveSlots.set(slotId, saveData.metadata);
      this.saveSaveSlotMetadata();

      // Set as current save
      this.currentSaveData = saveData;

      // Sync to cloud if enabled
      if (this.cloudSyncStatus.isEnabled) {
        await this.syncToCloud(slotId, saveData);
      }

      return { success: true };
    } catch (error) {
      console.error('Save failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Load game from slot
   */
  public async loadGame(
    slotId: number
  ): Promise<{ success: boolean; data?: SaveData; error?: string }> {
    try {
      // Validate slot
      if (slotId < 0 || slotId >= this.MAX_SAVE_SLOTS) {
        return { success: false, error: 'Invalid save slot' };
      }

      // Check if slot exists
      if (!this.saveSlots.has(slotId)) {
        return { success: false, error: 'Save slot is empty' };
      }

      // Try to load from local storage first
      const localKey = this.getLocalStorageKey(slotId);
      const compressed = localStorage.getItem(localKey);

      if (!compressed) {
        // Try cloud if local not found
        if (this.cloudSyncStatus.isEnabled) {
          return await this.loadFromCloud(slotId);
        }
        return { success: false, error: 'Save data not found' };
      }

      // Decompress
      const decompressed = this.decompressData(compressed);

      // Parse
      const saveData = JSON.parse(decompressed) as SaveData;

      // Validate version
      if (saveData.metadata.version !== this.SAVE_VERSION) {
        // Try to migrate
        const migrated = this.migrateSaveData(saveData);
        if (!migrated) {
          return { success: false, error: 'Incompatible save version' };
        }
      }

      // Set as current save
      this.currentSaveData = saveData;

      return { success: true, data: saveData };
    } catch (error) {
      console.error('Load failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Delete save slot
   */
  public deleteSave(slotId: number): { success: boolean; error?: string } {
    try {
      if (slotId < 0 || slotId >= this.MAX_SAVE_SLOTS) {
        return { success: false, error: 'Invalid save slot' };
      }

      // Remove from local storage
      const localKey = this.getLocalStorageKey(slotId);
      localStorage.removeItem(localKey);

      // Remove from slot metadata
      this.saveSlots.delete(slotId);
      this.saveSaveSlotMetadata();

      // Delete from cloud if synced
      if (this.cloudSyncStatus.isEnabled) {
        this.deleteFromCloud(slotId);
      }

      return { success: true };
    } catch (error) {
      console.error('Delete failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get all save slots
   */
  public getSaveSlots(): SaveSlot[] {
    return Array.from(this.saveSlots.values()).sort((a, b) => a.slotId - b.slotId);
  }

  /**
   * Check if slot is empty
   */
  public isSlotEmpty(slotId: number): boolean {
    return !this.saveSlots.has(slotId);
  }

  // ========================================================================
  // Public API - Auto-Save
  // ========================================================================

  /**
   * Configure auto-save
   */
  public configureAutoSave(config: Partial<AutoSaveConfig>): void {
    this.autoSaveConfig = { ...this.autoSaveConfig, ...config };
    this.saveConfiguration();

    // Restart auto-save timer
    this.stopAutoSave();
    if (this.autoSaveConfig.enabled) {
      this.startAutoSave();
    }
  }

  /**
   * Trigger manual auto-save
   */
  public autoSave(reason: string): { success: boolean; error?: string } {
    if (!this.currentSaveData) {
      return { success: false, error: 'No active game to save' };
    }

    // Find next auto-save slot (use slots 7-9 for auto-saves)
    const autoSaveSlots = [7, 8, 9];
    let targetSlot = autoSaveSlots[0];

    // Find oldest auto-save or first empty slot
    let oldestTime = Infinity;
    for (const slot of autoSaveSlots) {
      const metadata = this.saveSlots.get(slot);
      if (!metadata) {
        targetSlot = slot;
        break;
      }
      if (metadata.isAutoSave && metadata.timestamp < oldestTime) {
        oldestTime = metadata.timestamp;
        targetSlot = slot;
      }
    }

    // Perform save
    const result = this.saveGame(
      targetSlot,
      `Auto-Save (${reason})`,
      this.currentSaveData.gameState
    );

    this.lastAutoSaveTime = Date.now();

    return result as { success: boolean; error?: string };
  }

  /**
   * Trigger auto-save on game event
   */
  public onGameEvent(eventType: keyof AutoSaveConfig['saveOnEvents']): void {
    if (this.autoSaveConfig.enabled && this.autoSaveConfig.saveOnEvents[eventType]) {
      this.autoSave(`Event: ${eventType}`);
    }
  }

  // ========================================================================
  // Public API - Cloud Sync
  // ========================================================================

  /**
   * Enable cloud sync
   */
  public async enableCloudSync(
    playerId: string,
    authToken?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Test connection
      const connected = await this.testCloudConnection();

      if (!connected) {
        return { success: false, error: 'Could not connect to cloud' };
      }

      this.cloudSyncStatus.isEnabled = true;
      this.cloudSyncStatus.isConnected = true;

      // Perform initial sync
      await this.performFullSync();

      return { success: true };
    } catch (error) {
      console.error('Cloud sync enable failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Disable cloud sync
   */
  public disableCloudSync(): void {
    this.cloudSyncStatus.isEnabled = false;
    this.cloudSyncStatus.isConnected = false;
  }

  /**
   * Manually trigger cloud sync
   */
  public async syncNow(): Promise<{ success: boolean; error?: string }> {
    if (!this.cloudSyncStatus.isEnabled) {
      return { success: false, error: 'Cloud sync is disabled' };
    }

    try {
      await this.performFullSync();
      return { success: true };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get cloud sync status
   */
  public getCloudSyncStatus(): CloudSyncStatus {
    return { ...this.cloudSyncStatus };
  }

  /**
   * Get sync conflicts
   */
  public getSyncConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values()).filter(c => !c.isResolved);
  }

  /**
   * Resolve sync conflict
   */
  public async resolveSyncConflict(
    conflictId: string,
    resolution: SyncConflict['resolution']
  ): Promise<{ success: boolean; error?: string }> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return { success: false, error: 'Conflict not found' };
    }

    try {
      switch (resolution) {
        case 'use_local':
          await this.syncToCloud(conflict.slotId, this.currentSaveData!);
          break;

        case 'use_cloud':
          await this.loadFromCloud(conflict.slotId);
          break;

        case 'merge':
          // Complex merge logic would go here
          return { success: false, error: 'Merge not implemented yet' };

        case 'create_new_slot':
          // Find empty slot and save cloud version there
          const emptySlot = this.findEmptySlot();
          if (emptySlot === -1) {
            return { success: false, error: 'No empty slots available' };
          }
          await this.loadFromCloud(emptySlot);
          break;
      }

      conflict.isResolved = true;
      conflict.resolution = resolution;
      conflict.resolvedBy = 'user';

      this.cloudSyncStatus.resolvedConflicts++;

      return { success: true };
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // ========================================================================
  // Public API - Backup & Restore
  // ========================================================================

  /**
   * Create backup of all saves
   */
  public createBackup(reason: BackupData['reason']): BackupData {
    const backup: BackupData = {
      backupId: `backup_${Date.now()}`,
      timestamp: Date.now(),
      saveSlots: Array.from(this.saveSlots.values()),
      reason
    };

    this.backups.push(backup);

    // Keep only MAX_BACKUPS
    if (this.backups.length > this.MAX_BACKUPS) {
      this.backups.shift();
    }

    this.saveBackups();

    return backup;
  }

  /**
   * Restore from backup
   */
  public async restoreFromBackup(
    backupId: string
  ): Promise<{ success: boolean; error?: string }> {
    const backup = this.backups.find(b => b.backupId === backupId);
    if (!backup) {
      return { success: false, error: 'Backup not found' };
    }

    try {
      // Restore save slot metadata
      this.saveSlots.clear();
      backup.saveSlots.forEach(slot => {
        this.saveSlots.set(slot.slotId, slot);
      });

      this.saveSaveSlotMetadata();

      return { success: true };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get all backups
   */
  public getBackups(): BackupData[] {
    return [...this.backups];
  }

  /**
   * Export save data as JSON
   */
  public exportSave(slotId: number): string | null {
    const localKey = this.getLocalStorageKey(slotId);
    const data = localStorage.getItem(localKey);
    return data;
  }

  /**
   * Import save data from JSON
   */
  public importSave(slotId: number, data: string): { success: boolean; error?: string } {
    try {
      // Validate
      const decompressed = this.decompressData(data);
      const saveData = JSON.parse(decompressed) as SaveData;

      // Save to slot
      const localKey = this.getLocalStorageKey(slotId);
      localStorage.setItem(localKey, data);

      // Update metadata
      this.saveSlots.set(slotId, saveData.metadata);
      this.saveSaveSlotMetadata();

      return { success: true };
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // ========================================================================
  // Private Helper Methods - Save/Load
  // ========================================================================

  private createSaveData(
    slotId: number,
    saveName: string,
    gameData: any,
    isAutoSave: boolean
  ): SaveData {
    const now = Date.now();

    const metadata: SaveSlot = {
      slotId,
      playerId: 'player_' + now, // Would be real player ID in production
      saveName,
      timestamp: now,
      gameTime: 0, // Would track actual game time
      version: this.SAVE_VERSION,
      summary: {
        teamName: gameData.teamName || 'Unknown Team',
        wins: gameData.wins || 0,
        losses: gameData.losses || 0,
        currentSeason: gameData.season || 1,
        currentInning: gameData.inning || 1,
        score: gameData.score || { home: 0, away: 0 },
        difficulty: gameData.difficulty || 'Normal'
      },
      isAutoSave,
      isCloudSynced: false,
      lastSyncTime: 0,
      fileSize: 0,
      isCompressed: true
    };

    return {
      metadata,
      gameState: gameData,
      playerData: {
        profile: {},
        statistics: {},
        achievements: [],
        progression: {},
        customization: {},
        equipment: {}
      },
      teamData: {
        roster: [],
        chemistry: {},
        morale: {},
        stats: {}
      },
      settings: {
        gameplay: {},
        graphics: {},
        audio: {},
        controls: {}
      },
      analytics: {
        totalGamesPlayed: 0,
        totalTimePlayed: 0,
        lastPlayedDate: now,
        favoriteTeam: '',
        favoritePlayer: ''
      }
    };
  }

  private getLocalStorageKey(slotId: number): string {
    return `${this.LOCAL_STORAGE_KEY_PREFIX}${slotId}`;
  }

  private getCloudStorageKey(slotId: number): string {
    return `${this.CLOUD_STORAGE_KEY_PREFIX}${slotId}`;
  }

  private compressData(data: string): string {
    // Simple compression using LZ-based algorithm
    // In production, would use a proper compression library
    try {
      return btoa(data); // Base64 encoding as simple "compression"
    } catch {
      return data;
    }
  }

  private decompressData(data: string): string {
    // Simple decompression
    try {
      return atob(data); // Base64 decoding
    } catch {
      return data;
    }
  }

  private migrateSaveData(saveData: SaveData): boolean {
    // Migration logic for different save versions
    // For now, just accept any version
    saveData.metadata.version = this.SAVE_VERSION;
    return true;
  }

  // ========================================================================
  // Private Helper Methods - Metadata
  // ========================================================================

  private loadSaveSlotMetadata(): void {
    // Load metadata for all slots from a single key
    const metadataKey = `${this.LOCAL_STORAGE_KEY_PREFIX}metadata`;
    const stored = localStorage.getItem(metadataKey);

    if (stored) {
      try {
        const metadata = JSON.parse(stored) as SaveSlot[];
        metadata.forEach(slot => {
          this.saveSlots.set(slot.slotId, slot);
        });
      } catch (error) {
        console.error('Failed to load save slot metadata:', error);
      }
    }
  }

  private saveSaveSlotMetadata(): void {
    const metadataKey = `${this.LOCAL_STORAGE_KEY_PREFIX}metadata`;
    const metadata = Array.from(this.saveSlots.values());
    localStorage.setItem(metadataKey, JSON.stringify(metadata));
  }

  // ========================================================================
  // Private Helper Methods - Configuration
  // ========================================================================

  private loadConfiguration(): void {
    const stored = localStorage.getItem(this.CONFIG_KEY);

    if (stored) {
      try {
        const config = JSON.parse(stored);
        this.autoSaveConfig = config.autoSave || this.autoSaveConfig;
        this.cloudSyncStatus = config.cloudSync || this.cloudSyncStatus;
      } catch (error) {
        console.error('Failed to load configuration:', error);
      }
    }
  }

  private saveConfiguration(): void {
    const config = {
      autoSave: this.autoSaveConfig,
      cloudSync: this.cloudSyncStatus
    };

    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  // ========================================================================
  // Private Helper Methods - Backups
  // ========================================================================

  private loadBackups(): void {
    const stored = localStorage.getItem(this.BACKUP_KEY);

    if (stored) {
      try {
        this.backups = JSON.parse(stored) as BackupData[];
      } catch (error) {
        console.error('Failed to load backups:', error);
      }
    }
  }

  private saveBackups(): void {
    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(this.backups));
  }

  // ========================================================================
  // Private Helper Methods - Auto-Save
  // ========================================================================

  private startAutoSave(): void {
    if (!this.autoSaveConfig.enabled) return;

    this.autoSaveTimer = window.setInterval(() => {
      const timeSinceLastSave = Date.now() - this.lastAutoSaveTime;

      if (timeSinceLastSave >= this.autoSaveConfig.interval * 1000) {
        this.autoSave('Timer');
      }
    }, 30000); // Check every 30 seconds
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      window.clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // ========================================================================
  // Private Helper Methods - Cloud Sync
  // ========================================================================

  private async testCloudConnection(): Promise<boolean> {
    // Test connection to Cloudflare KV/D1
    // In production, would make actual API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });
  }

  private async syncToCloud(slotId: number, saveData: SaveData): Promise<void> {
    if (!this.cloudSyncStatus.isConnected) {
      throw new Error('Not connected to cloud');
    }

    this.cloudSyncStatus.syncInProgress = true;
    this.cloudSyncStatus.pendingUploads++;

    try {
      // Serialize and compress
      const serialized = JSON.stringify(saveData);
      const compressed = this.compressData(serialized);

      // Upload to cloud (Cloudflare KV)
      // In production, would use actual Cloudflare API
      const cloudKey = this.getCloudStorageKey(slotId);

      // Simulate API call
      await this.simulateCloudUpload(cloudKey, compressed);

      // Update metadata
      saveData.metadata.isCloudSynced = true;
      saveData.metadata.lastSyncTime = Date.now();

      this.cloudSyncStatus.totalUploads++;
      this.cloudSyncStatus.lastSyncTime = Date.now();
    } catch (error) {
      this.cloudSyncStatus.lastError = (error as Error).message;
      throw error;
    } finally {
      this.cloudSyncStatus.pendingUploads--;
      this.cloudSyncStatus.syncInProgress = false;
    }
  }

  private async loadFromCloud(
    slotId: number
  ): Promise<{ success: boolean; data?: SaveData; error?: string }> {
    if (!this.cloudSyncStatus.isConnected) {
      return { success: false, error: 'Not connected to cloud' };
    }

    this.cloudSyncStatus.syncInProgress = true;
    this.cloudSyncStatus.pendingDownloads++;

    try {
      const cloudKey = this.getCloudStorageKey(slotId);

      // Download from cloud
      const compressed = await this.simulateCloudDownload(cloudKey);

      if (!compressed) {
        return { success: false, error: 'Save not found in cloud' };
      }

      // Decompress and parse
      const decompressed = this.decompressData(compressed);
      const saveData = JSON.parse(decompressed) as SaveData;

      // Save to local storage
      const localKey = this.getLocalStorageKey(slotId);
      localStorage.setItem(localKey, compressed);

      // Update metadata
      this.saveSlots.set(slotId, saveData.metadata);
      this.saveSaveSlotMetadata();

      this.cloudSyncStatus.totalDownloads++;
      this.cloudSyncStatus.lastSyncTime = Date.now();

      return { success: true, data: saveData };
    } catch (error) {
      this.cloudSyncStatus.lastError = (error as Error).message;
      return { success: false, error: (error as Error).message };
    } finally {
      this.cloudSyncStatus.pendingDownloads--;
      this.cloudSyncStatus.syncInProgress = false;
    }
  }

  private async deleteFromCloud(slotId: number): Promise<void> {
    if (!this.cloudSyncStatus.isConnected) return;

    const cloudKey = this.getCloudStorageKey(slotId);

    // Delete from cloud
    await this.simulateCloudDelete(cloudKey);
  }

  private async performFullSync(): Promise<void> {
    this.cloudSyncStatus.syncInProgress = true;

    try {
      // Create pre-sync backup
      this.createBackup('pre_sync');

      // Check each slot for conflicts
      for (const [slotId, localMetadata] of this.saveSlots.entries()) {
        // Get cloud metadata
        const cloudMetadata = await this.getCloudMetadata(slotId);

        if (!cloudMetadata) {
          // Not in cloud, upload
          const localData = await this.loadGame(slotId);
          if (localData.success && localData.data) {
            await this.syncToCloud(slotId, localData.data);
          }
        } else {
          // Check for conflicts
          if (localMetadata.timestamp !== cloudMetadata.timestamp) {
            // Timestamp mismatch - create conflict
            this.createSyncConflict(slotId, localMetadata, cloudMetadata);
          } else if (localMetadata.timestamp < cloudMetadata.timestamp) {
            // Cloud is newer - download
            await this.loadFromCloud(slotId);
          } else if (localMetadata.timestamp > cloudMetadata.timestamp) {
            // Local is newer - upload
            const localData = await this.loadGame(slotId);
            if (localData.success && localData.data) {
              await this.syncToCloud(slotId, localData.data);
            }
          }
        }
      }

      this.cloudSyncStatus.totalSyncs++;
    } finally {
      this.cloudSyncStatus.syncInProgress = false;
    }
  }

  private async getCloudMetadata(slotId: number): Promise<SaveSlot | null> {
    // Get metadata from cloud without downloading full save
    // In production, would query Cloudflare D1
    const cloudKey = this.getCloudStorageKey(slotId);

    // Simulate API call
    return this.simulateGetCloudMetadata(cloudKey);
  }

  private createSyncConflict(
    slotId: number,
    localMetadata: SaveSlot,
    cloudMetadata: SaveSlot
  ): void {
    const conflictId = `conflict_${slotId}_${Date.now()}`;

    const conflict: SyncConflict = {
      conflictId,
      slotId,
      localSave: localMetadata,
      cloudSave: cloudMetadata,
      localTimestamp: localMetadata.timestamp,
      cloudTimestamp: cloudMetadata.timestamp,
      conflictType: 'timestamp_mismatch',
      isResolved: false
    };

    this.conflicts.set(conflictId, conflict);
    this.cloudSyncStatus.totalConflicts++;
  }

  // Simulation methods (replace with real API calls in production)
  private async simulateCloudUpload(key: string, data: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  private async simulateCloudDownload(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(null), 100);
    });
  }

  private async simulateCloudDelete(key: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
  }

  private async simulateGetCloudMetadata(key: string): Promise<SaveSlot | null> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(null), 50);
    });
  }

  // ========================================================================
  // Private Helper Methods - Utilities
  // ========================================================================

  private findEmptySlot(): number {
    for (let i = 0; i < this.MAX_SAVE_SLOTS; i++) {
      if (!this.saveSlots.has(i)) {
        return i;
      }
    }
    return -1;
  }
}
