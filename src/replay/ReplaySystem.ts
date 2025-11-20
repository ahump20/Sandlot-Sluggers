import { Vector3, Camera, Scene } from '@babylonjs/core';

/**
 * Replay event types
 */
export enum ReplayEventType {
    PITCH = 'PITCH',
    SWING = 'SWING',
    HIT = 'HIT',
    CATCH = 'CATCH',
    THROW = 'THROW',
    SLIDE = 'SLIDE',
    TAG = 'TAG',
    HOME_RUN = 'HOME_RUN',
    STRIKEOUT = 'STRIKEOUT',
    DOUBLE_PLAY = 'DOUBLE_PLAY',
    DIVING_CATCH = 'DIVING_CATCH',
    GAME_ENDING_PLAY = 'GAME_ENDING_PLAY'
}

/**
 * Camera angle for replays
 */
export enum ReplayCameraAngle {
    BEHIND_PITCHER = 'BEHIND_PITCHER',
    BEHIND_BATTER = 'BEHIND_BATTER',
    FIRST_BASE_SIDE = 'FIRST_BASE_SIDE',
    THIRD_BASE_SIDE = 'THIRD_BASE_SIDE',
    HIGH_HOME = 'HIGH_HOME',          // High angle from behind home
    CENTER_FIELD = 'CENTER_FIELD',     // From center field
    OUTFIELD_TRACK = 'OUTFIELD_TRACK', // Following ball to outfield
    FOLLOW_BALL = 'FOLLOW_BALL',       // Dynamic ball tracking
    SLOW_MOTION = 'SLOW_MOTION',       // Slow-mo of contact
    MATRIX_BULLET_TIME = 'MATRIX_BULLET_TIME', // 360 rotation slow-mo
    GROUND_LEVEL = 'GROUND_LEVEL',     // Low angle
    OVERHEAD = 'OVERHEAD'              // Bird's eye view
}

/**
 * Recorded game state snapshot
 */
export interface GameStateSnapshot {
    timestamp: number;              // milliseconds

    // Ball state
    ballPosition: Vector3;
    ballVelocity: Vector3;
    ballSpin: number;

    // Player positions
    playerPositions: Map<string, Vector3>;
    playerRotations: Map<string, Vector3>;
    playerAnimations: Map<string, string>;

    // Game state
    score: { home: number; away: number };
    inning: number;
    outs: number;
    count: { balls: number; strikes: number };
    bases: boolean[];
}

/**
 * Replay event with metadata
 */
export interface ReplayEvent {
    eventId: string;
    eventType: ReplayEventType;
    startTime: number;              // milliseconds from game start
    duration: number;               // milliseconds
    importance: number;             // 1-10, for highlight reel

    // Event-specific data
    playerId?: string;
    playerName?: string;
    description: string;

    // Camera angles for this event
    recommendedAngles: ReplayCameraAngle[];

    // State snapshots during event
    snapshots: GameStateSnapshot[];

    // Key moments within event
    keyMoments: {
        timestamp: number;
        label: string;              // "Contact", "Catch", "Tag", etc.
    }[];
}

/**
 * Replay clip for highlight reel
 */
export interface ReplayClip {
    clipId: string;
    events: ReplayEvent[];
    startTime: number;
    endTime: number;
    title: string;
    cameraAngle: ReplayCameraAngle;
    playbackSpeed: number;          // 0.25 = 1/4 speed, 1.0 = normal, 2.0 = 2x speed
    transitionEffect?: 'fade' | 'cut' | 'wipe';
}

/**
 * Camera configuration for replay
 */
export interface CameraConfig {
    position: Vector3;
    target: Vector3;
    fov: number;
    transitionSpeed: number;
}

/**
 * Comprehensive replay system with multi-angle camera
 */
export class ReplaySystem {
    private scene: Scene;
    private isRecording: boolean = false;
    private isPlayingReplay: boolean = false;

    // Recording
    private recordingStartTime: number = 0;
    private snapshots: GameStateSnapshot[] = [];
    private snapshotInterval: number = 33; // 30 FPS recording
    private lastSnapshotTime: number = 0;

    // Events
    private recordedEvents: ReplayEvent[] = new Map();
    private currentEventId: number = 0;

    // Playback
    private currentPlaybackTime: number = 0;
    private playbackSpeed: number = 1.0;
    private playbackCamera: Camera | null = null;
    private currentCameraAngle: ReplayCameraAngle = ReplayCameraAngle.BEHIND_PITCHER;

    // Highlight reels
    private highlightClips: ReplayClip[] = [];
    private autoGenerateHighlights: boolean = true;

    // Camera positions for each angle
    private cameraConfigs: Map<ReplayCameraAngle, (target: Vector3) => CameraConfig> = new Map();

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeCameraConfigs();
    }

    /**
     * Initialize camera configurations for each angle
     */
    private initializeCameraConfigs(): void {
        // Behind pitcher view
        this.cameraConfigs.set(ReplayCameraAngle.BEHIND_PITCHER, (target: Vector3) => ({
            position: new Vector3(0, 2, 22),
            target: target,
            fov: 0.8,
            transitionSpeed: 2.0
        }));

        // Behind batter view
        this.cameraConfigs.set(ReplayCameraAngle.BEHIND_BATTER, (target: Vector3) => ({
            position: new Vector3(0, 2.5, -3),
            target: new Vector3(0, 1, 18),
            fov: 0.7,
            transitionSpeed: 2.0
        }));

        // First base side view
        this.cameraConfigs.set(ReplayCameraAngle.FIRST_BASE_SIDE, (target: Vector3) => ({
            position: new Vector3(15, 3, 10),
            target: target,
            fov: 0.9,
            transitionSpeed: 1.5
        }));

        // Third base side view
        this.cameraConfigs.set(ReplayCameraAngle.THIRD_BASE_SIDE, (target: Vector3) => ({
            position: new Vector3(-15, 3, 10),
            target: target,
            fov: 0.9,
            transitionSpeed: 1.5
        }));

        // High home view
        this.cameraConfigs.set(ReplayCameraAngle.HIGH_HOME, (target: Vector3) => ({
            position: new Vector3(0, 15, -5),
            target: target,
            fov: 1.0,
            transitionSpeed: 1.0
        }));

        // Center field view
        this.cameraConfigs.set(ReplayCameraAngle.CENTER_FIELD, (target: Vector3) => ({
            position: new Vector3(0, 3, 80),
            target: new Vector3(0, 1, 0),
            fov: 0.8,
            transitionSpeed: 1.5
        }));

        // Ground level view
        this.cameraConfigs.set(ReplayCameraAngle.GROUND_LEVEL, (target: Vector3) => ({
            position: new Vector3(target.x - 5, 0.3, target.z),
            target: target,
            fov: 1.2,
            transitionSpeed: 3.0
        }));

        // Overhead view
        this.cameraConfigs.set(ReplayCameraAngle.OVERHEAD, (target: Vector3) => ({
            position: new Vector3(0, 40, 0),
            target: target,
            fov: 1.4,
            transitionSpeed: 1.0
        }));
    }

    /**
     * Start recording game for replay
     */
    public startRecording(): void {
        this.isRecording = true;
        this.recordingStartTime = performance.now();
        this.snapshots = [];
        this.recordedEvents.clear();
        this.lastSnapshotTime = this.recordingStartTime;

        console.log('Replay recording started');
    }

    /**
     * Stop recording
     */
    public stopRecording(): void {
        this.isRecording = false;
        console.log(`Replay recording stopped. Captured ${this.snapshots.length} snapshots and ${this.recordedEvents.size} events`);

        // Generate highlights automatically
        if (this.autoGenerateHighlights) {
            this.generateHighlightReel();
        }
    }

    /**
     * Record game state snapshot
     */
    public recordSnapshot(
        ballPosition: Vector3,
        ballVelocity: Vector3,
        ballSpin: number,
        playerPositions: Map<string, Vector3>,
        playerRotations: Map<string, Vector3>,
        playerAnimations: Map<string, string>,
        gameState: {
            score: { home: number; away: number };
            inning: number;
            outs: number;
            count: { balls: number; strikes: number };
            bases: boolean[];
        }
    ): void {
        if (!this.isRecording) return;

        const currentTime = performance.now();

        // Check if enough time has passed for next snapshot
        if (currentTime - this.lastSnapshotTime < this.snapshotInterval) {
            return;
        }

        const snapshot: GameStateSnapshot = {
            timestamp: currentTime - this.recordingStartTime,
            ballPosition: ballPosition.clone(),
            ballVelocity: ballVelocity.clone(),
            ballSpin,
            playerPositions: new Map(playerPositions),
            playerRotations: new Map(playerRotations),
            playerAnimations: new Map(playerAnimations),
            score: { ...gameState.score },
            inning: gameState.inning,
            outs: gameState.outs,
            count: { ...gameState.count },
            bases: [...gameState.bases]
        };

        this.snapshots.push(snapshot);
        this.lastSnapshotTime = currentTime;
    }

    /**
     * Record replay event
     */
    public recordEvent(
        eventType: ReplayEventType,
        duration: number,
        importance: number,
        playerId?: string,
        playerName?: string,
        description?: string
    ): string {
        if (!this.isRecording) return '';

        const eventId = `event_${this.currentEventId++}`;
        const startTime = performance.now() - this.recordingStartTime;

        // Determine recommended camera angles based on event type
        const recommendedAngles = this.getRecommendedAngles(eventType);

        const event: ReplayEvent = {
            eventId,
            eventType,
            startTime,
            duration,
            importance,
            playerId,
            playerName,
            description: description || this.getDefaultDescription(eventType, playerName),
            recommendedAngles,
            snapshots: [],
            keyMoments: []
        };

        // Capture snapshots for this event
        const endTime = startTime + duration;
        event.snapshots = this.snapshots.filter(
            s => s.timestamp >= startTime && s.timestamp <= endTime
        );

        this.recordedEvents.set(eventId, event);

        return eventId;
    }

    /**
     * Get recommended camera angles for event type
     */
    private getRecommendedAngles(eventType: ReplayEventType): ReplayCameraAngle[] {
        switch (eventType) {
            case ReplayEventType.PITCH:
                return [
                    ReplayCameraAngle.BEHIND_BATTER,
                    ReplayCameraAngle.BEHIND_PITCHER,
                    ReplayCameraAngle.FIRST_BASE_SIDE
                ];

            case ReplayEventType.HIT:
            case ReplayEventType.HOME_RUN:
                return [
                    ReplayCameraAngle.BEHIND_PITCHER,
                    ReplayCameraAngle.SLOW_MOTION,
                    ReplayCameraAngle.FOLLOW_BALL,
                    ReplayCameraAngle.CENTER_FIELD
                ];

            case ReplayEventType.DIVING_CATCH:
                return [
                    ReplayCameraAngle.FOLLOW_BALL,
                    ReplayCameraAngle.GROUND_LEVEL,
                    ReplayCameraAngle.SLOW_MOTION,
                    ReplayCameraAngle.HIGH_HOME
                ];

            case ReplayEventType.DOUBLE_PLAY:
                return [
                    ReplayCameraAngle.HIGH_HOME,
                    ReplayCameraAngle.FIRST_BASE_SIDE,
                    ReplayCameraAngle.OVERHEAD
                ];

            case ReplayEventType.STRIKEOUT:
                return [
                    ReplayCameraAngle.BEHIND_BATTER,
                    ReplayCameraAngle.FIRST_BASE_SIDE,
                    ReplayCameraAngle.SLOW_MOTION
                ];

            case ReplayEventType.SLIDE:
            case ReplayEventType.TAG:
                return [
                    ReplayCameraAngle.GROUND_LEVEL,
                    ReplayCameraAngle.HIGH_HOME,
                    ReplayCameraAngle.SLOW_MOTION
                ];

            case ReplayEventType.THROW:
                return [
                    ReplayCameraAngle.FOLLOW_BALL,
                    ReplayCameraAngle.HIGH_HOME
                ];

            default:
                return [
                    ReplayCameraAngle.BEHIND_PITCHER,
                    ReplayCameraAngle.HIGH_HOME
                ];
        }
    }

    /**
     * Get default event description
     */
    private getDefaultDescription(eventType: ReplayEventType, playerName?: string): string {
        const name = playerName || 'Player';

        switch (eventType) {
            case ReplayEventType.HOME_RUN:
                return `${name} hits a HOME RUN!`;
            case ReplayEventType.STRIKEOUT:
                return `${name} strikes out!`;
            case ReplayEventType.DIVING_CATCH:
                return `${name} makes a DIVING CATCH!`;
            case ReplayEventType.DOUBLE_PLAY:
                return `Double play!`;
            case ReplayEventType.HIT:
                return `${name} gets a hit!`;
            default:
                return `${eventType} by ${name}`;
        }
    }

    /**
     * Play replay of specific event
     */
    public playReplay(eventId: string, cameraAngle?: ReplayCameraAngle, playbackSpeed: number = 0.5): void {
        const event = this.recordedEvents.get(eventId);
        if (!event) {
            console.error(`Replay event ${eventId} not found`);
            return;
        }

        this.isPlayingReplay = true;
        this.playbackSpeed = playbackSpeed;
        this.currentPlaybackTime = 0;

        // Use provided camera angle or first recommended angle
        this.currentCameraAngle = cameraAngle || event.recommendedAngles[0];

        // Start playback
        this.playbackLoop(event);
    }

    /**
     * Playback loop
     */
    private playbackLoop(event: ReplayEvent): void {
        if (!this.isPlayingReplay) return;

        const deltaTime = 16 * this.playbackSpeed; // ~60 FPS
        this.currentPlaybackTime += deltaTime;

        // Find current snapshot
        const snapshot = this.getSnapshotAtTime(event, this.currentPlaybackTime);

        if (snapshot) {
            this.applySnapshot(snapshot);
        }

        // Check if replay finished
        if (this.currentPlaybackTime >= event.duration) {
            this.stopReplay();
            return;
        }

        // Continue playback
        setTimeout(() => this.playbackLoop(event), 16);
    }

    /**
     * Get snapshot at specific time
     */
    private getSnapshotAtTime(event: ReplayEvent, time: number): GameStateSnapshot | null {
        // Find closest snapshot
        let closest: GameStateSnapshot | null = null;
        let minDiff = Infinity;

        for (const snapshot of event.snapshots) {
            const diff = Math.abs((snapshot.timestamp - event.startTime) - time);
            if (diff < minDiff) {
                minDiff = diff;
                closest = snapshot;
            }
        }

        return closest;
    }

    /**
     * Apply snapshot to scene
     */
    private applySnapshot(snapshot: GameStateSnapshot): void {
        // Update ball position
        // In real implementation, would update actual game objects

        // Update player positions
        for (const [playerId, position] of snapshot.playerPositions.entries()) {
            // Update player mesh position
        }

        // Update camera based on current angle
        this.updateReplayCamera(snapshot.ballPosition);
    }

    /**
     * Update replay camera
     */
    private updateReplayCamera(target: Vector3): void {
        if (!this.playbackCamera) return;

        const configFunc = this.cameraConfigs.get(this.currentCameraAngle);
        if (!configFunc) return;

        const config = configFunc(target);

        // Smoothly transition camera
        // In real implementation, would use camera animations
    }

    /**
     * Stop replay playback
     */
    public stopReplay(): void {
        this.isPlayingReplay = false;
        this.currentPlaybackTime = 0;
        console.log('Replay playback stopped');
    }

    /**
     * Change camera angle during replay
     */
    public changeCameraAngle(angle: ReplayCameraAngle): void {
        this.currentCameraAngle = angle;
    }

    /**
     * Change playback speed
     */
    public setPlaybackSpeed(speed: number): void {
        this.playbackSpeed = Math.max(0.1, Math.min(2.0, speed));
    }

    /**
     * Generate highlight reel automatically
     */
    private generateHighlightReel(): void {
        this.highlightClips = [];

        // Get important events (importance >= 7)
        const importantEvents = Array.from(this.recordedEvents.values())
            .filter(e => e.importance >= 7)
            .sort((a, b) => b.importance - a.importance);

        // Create clips for top events
        for (let i = 0; i < Math.min(10, importantEvents.length); i++) {
            const event = importantEvents[i];

            const clip: ReplayClip = {
                clipId: `clip_${i}`,
                events: [event],
                startTime: event.startTime - 1000, // Start 1 second before
                endTime: event.startTime + event.duration + 1000, // End 1 second after
                title: event.description,
                cameraAngle: event.recommendedAngles[0],
                playbackSpeed: event.eventType === ReplayEventType.HOME_RUN ? 0.5 : 0.75,
                transitionEffect: 'fade'
            };

            this.highlightClips.push(clip);
        }

        console.log(`Generated ${this.highlightClips.length} highlight clips`);
    }

    /**
     * Play highlight reel
     */
    public playHighlightReel(): void {
        if (this.highlightClips.length === 0) {
            console.log('No highlights available');
            return;
        }

        let currentClipIndex = 0;

        const playNextClip = () => {
            if (currentClipIndex >= this.highlightClips.length) {
                console.log('Highlight reel finished');
                return;
            }

            const clip = this.highlightClips[currentClipIndex];
            console.log(`Playing highlight: ${clip.title}`);

            // Play clip
            if (clip.events.length > 0) {
                this.playReplay(clip.events[0].eventId, clip.cameraAngle, clip.playbackSpeed);
            }

            currentClipIndex++;

            // Schedule next clip
            setTimeout(playNextClip, (clip.endTime - clip.startTime) / clip.playbackSpeed + 2000);
        };

        playNextClip();
    }

    /**
     * Get all recorded events
     */
    public getRecordedEvents(): ReplayEvent[] {
        return Array.from(this.recordedEvents.values());
    }

    /**
     * Get highlight clips
     */
    public getHighlightClips(): ReplayClip[] {
        return this.highlightClips;
    }

    /**
     * Export replay data
     */
    public exportReplayData(): object {
        return {
            snapshots: this.snapshots,
            events: Array.from(this.recordedEvents.values()),
            highlights: this.highlightClips,
            recordingStartTime: this.recordingStartTime
        };
    }

    /**
     * Import replay data
     */
    public importReplayData(data: any): void {
        if (data.snapshots) this.snapshots = data.snapshots;
        if (data.events) {
            this.recordedEvents = new Map(data.events.map((e: ReplayEvent) => [e.eventId, e]));
        }
        if (data.highlights) this.highlightClips = data.highlights;
        if (data.recordingStartTime) this.recordingStartTime = data.recordingStartTime;
    }

    /**
     * Clear recorded data
     */
    public clearRecordings(): void {
        this.snapshots = [];
        this.recordedEvents.clear();
        this.highlightClips = [];
    }

    /**
     * Check if currently recording
     */
    public isCurrentlyRecording(): boolean {
        return this.isRecording;
    }

    /**
     * Check if currently playing replay
     */
    public isCurrentlyPlayingReplay(): boolean {
        return this.isPlayingReplay;
    }

    /**
     * Dispose replay system
     */
    public dispose(): void {
        this.stopReplay();
        this.stopRecording();
        this.clearRecordings();
    }
}
