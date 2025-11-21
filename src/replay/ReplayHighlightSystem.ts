/**
 * Replay and Highlight System
 *
 * Comprehensive replay system with recording, playback, highlight detection,
 * multiple camera angles, slow motion, clip editing, and export functionality.
 * Automatically detects exciting moments and creates highlight reels.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Recorded game event
 */
export interface RecordedEvent {
  timestamp: number; // Game time in ms
  realTime: number; // Real wall clock time
  eventType:
    | 'pitch'
    | 'swing'
    | 'hit'
    | 'catch'
    | 'throw'
    | 'run'
    | 'slide'
    | 'score'
    | 'out'
    | 'strike'
    | 'ball'
    | 'home_run'
    | 'double_play'
    | 'triple_play'
    | 'stolen_base'
    | 'pickoff'
    | 'error'
    | 'injury';

  // Event data
  data: {
    playerId?: string;
    playerIds?: string[]; // For multi-player events
    position?: { x: number; y: number; z: number };
    velocity?: { x: number; y: number; z: number };
    ballPosition?: { x: number; y: number; z: number };
    ballVelocity?: { x: number; y: number; z: number };
    metadata?: Record<string, any>;
  };

  // Game state snapshot
  gameState: {
    inning: number;
    outs: number;
    balls: number;
    strikes: number;
    score: { home: number; away: number };
    runners: { first: boolean; second: boolean; third: boolean };
  };

  // Excitement metrics (for highlight detection)
  excitement: number; // 0-100
  importance: number; // 0-100
}

/**
 * Complete frame snapshot for replay
 */
export interface ReplayFrame {
  frameNumber: number;
  timestamp: number; // Game time

  // Scene state
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };

  // Player positions
  players: Map<string, {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    animationState: string;
    animationTime: number;
  }>;

  // Ball state
  ball?: {
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    spin: { x: number; y: number; z: number };
  };

  // UI state
  uiState: {
    scoreboard: { home: number; away: number };
    count: { balls: number; strikes: number; outs: number };
    displayText?: string;
  };
}

/**
 * Highlight clip
 */
export interface HighlightClip {
  id: string;
  name: string;
  description: string;
  startFrame: number;
  endFrame: number;
  duration: number; // seconds
  timestamp: number; // When it was created

  // Clip metadata
  eventType: RecordedEvent['eventType'];
  excitement: number; // 0-100
  importance: number; // 0-100
  tags: string[]; // e.g., "home_run", "diving_catch", "amazing"

  // Playback settings
  defaultSpeed: number; // 1.0 = normal, 0.5 = half speed, etc.
  cameraAngles: CameraAngle[];
  defaultCameraAngle: string;

  // Social
  views: number;
  likes: number;
  shared: boolean;
}

/**
 * Camera angle for replay
 */
export interface CameraAngle {
  id: string;
  name: string;
  description: string;

  // Camera configuration
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number; // Field of view in degrees

  // Tracking
  followBall: boolean;
  followPlayer: boolean;
  followPlayerId?: string;

  // Animation
  animated: boolean;
  animationPath?: Array<{
    time: number;
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  }>;
}

/**
 * Replay session state
 */
export interface ReplaySession {
  sessionId: string;
  isActive: boolean;
  isRecording: boolean;
  isPlaying: boolean;

  // Playback state
  currentFrame: number;
  totalFrames: number;
  playbackSpeed: number; // Multiplier (0.25, 0.5, 1.0, 2.0, etc.)
  isPaused: boolean;
  isLooping: boolean;

  // Recording state
  recordingStartTime: number;
  framesRecorded: number;
  eventsRecorded: number;
  memoryUsage: number; // bytes

  // Clip editing
  clipStartFrame: number | null;
  clipEndFrame: number | null;
  selectedClip: HighlightClip | null;
}

/**
 * Highlight detection config
 */
export interface HighlightDetectionConfig {
  enabled: boolean;
  autoDetect: boolean; // Auto-detect highlights during game

  // Thresholds
  minExcitement: number; // 0-100
  minImportance: number; // 0-100
  minDuration: number; // seconds
  maxDuration: number; // seconds

  // Event priorities
  eventPriorities: Map<RecordedEvent['eventType'], number>; // Higher = more likely to be highlighted

  // Detection rules
  detectHomeRuns: boolean;
  detectGreatCatches: boolean;
  detectDoublePlays: boolean;
  detectStolenBases: boolean;
  detectClutchHits: boolean;
  detectStrikeouts: boolean;
}

/**
 * Replay export settings
 */
export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '480p' | '720p' | '1080p' | '4k';
  fps: 30 | 60 | 120;

  // Encoding
  codec: 'h264' | 'h265' | 'vp9';
  bitrate: number; // kbps

  // Effects
  slowMotion: boolean;
  slowMotionSpeed: number; // 0.1 to 1.0
  transitions: boolean;
  music: boolean;
  commentary: boolean;

  // Overlays
  showScoreboard: boolean;
  showPlayerNames: boolean;
  showStats: boolean;
  watermark?: string;
}

// ============================================================================
// Replay and Highlight System Class
// ============================================================================

export class ReplayHighlightSystem {
  private session: ReplaySession;
  private frames: ReplayFrame[];
  private events: RecordedEvent[];
  private highlights: Map<string, HighlightClip>;
  private detectionConfig: HighlightDetectionConfig;
  private cameraAngles: Map<string, CameraAngle>;

  // Recording configuration
  private readonly TARGET_FPS = 60;
  private readonly MAX_FRAMES = 60 * 60 * 10; // 10 minutes at 60fps
  private readonly MAX_MEMORY_MB = 500; // 500 MB max

  // Frame recording interval
  private recordingInterval: number | null = null;
  private lastFrameTime: number = 0;

  constructor() {
    this.session = this.createInitialSession();
    this.frames = [];
    this.events = [];
    this.highlights = new Map();
    this.cameraAngles = new Map();

    this.detectionConfig = {
      enabled: true,
      autoDetect: true,
      minExcitement: 60,
      minImportance: 50,
      minDuration: 2,
      maxDuration: 30,
      eventPriorities: new Map([
        ['home_run', 100],
        ['triple_play', 100],
        ['double_play', 85],
        ['stolen_base', 70],
        ['hit', 60],
        ['catch', 65],
        ['strikeout', 55],
        ['score', 75]
      ]),
      detectHomeRuns: true,
      detectGreatCatches: true,
      detectDoublePlays: true,
      detectStolenBases: true,
      detectClutchHits: true,
      detectStrikeouts: true
    };

    this.initializeCameraAngles();
  }

  // ========================================================================
  // Public API - Recording
  // ========================================================================

  /**
   * Start recording
   */
  public startRecording(): void {
    if (this.session.isRecording) return;

    this.session.isRecording = true;
    this.session.recordingStartTime = Date.now();
    this.frames = [];
    this.events = [];

    // Start frame capture
    this.recordingInterval = window.setInterval(() => {
      this.captureFrame();
    }, 1000 / this.TARGET_FPS);
  }

  /**
   * Stop recording
   */
  public stopRecording(): void {
    if (!this.session.isRecording) return;

    this.session.isRecording = false;

    if (this.recordingInterval !== null) {
      window.clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    // Auto-detect highlights if enabled
    if (this.detectionConfig.autoDetect) {
      this.detectHighlights();
    }
  }

  /**
   * Record a game event
   */
  public recordEvent(event: RecordedEvent): void {
    if (!this.session.isRecording) return;

    // Calculate excitement and importance
    event.excitement = this.calculateExcitement(event);
    event.importance = this.calculateImportance(event);

    this.events.push(event);
    this.session.eventsRecorded++;

    // Check if this event should trigger immediate highlight
    if (this.shouldCreateImmediateHighlight(event)) {
      this.createHighlightFromEvent(event);
    }
  }

  /**
   * Get current recording status
   */
  public getRecordingStatus(): {
    isRecording: boolean;
    duration: number;
    frames: number;
    events: number;
    memoryUsage: number;
  } {
    return {
      isRecording: this.session.isRecording,
      duration: this.session.isRecording
        ? (Date.now() - this.session.recordingStartTime) / 1000
        : 0,
      frames: this.session.framesRecorded,
      events: this.session.eventsRecorded,
      memoryUsage: this.session.memoryUsage
    };
  }

  // ========================================================================
  // Public API - Playback
  // ========================================================================

  /**
   * Start replay playback
   */
  public startPlayback(startFrame: number = 0): void {
    if (this.frames.length === 0) return;

    this.session.isPlaying = true;
    this.session.isPaused = false;
    this.session.currentFrame = startFrame;
    this.session.totalFrames = this.frames.length;
  }

  /**
   * Stop replay playback
   */
  public stopPlayback(): void {
    this.session.isPlaying = false;
    this.session.currentFrame = 0;
  }

  /**
   * Pause/unpause playback
   */
  public togglePause(): void {
    this.session.isPaused = !this.session.isPaused;
  }

  /**
   * Set playback speed
   */
  public setPlaybackSpeed(speed: number): void {
    this.session.playbackSpeed = Math.max(0.1, Math.min(4.0, speed));
  }

  /**
   * Skip to frame
   */
  public skipToFrame(frameNumber: number): void {
    this.session.currentFrame = Math.max(
      0,
      Math.min(this.frames.length - 1, frameNumber)
    );
  }

  /**
   * Skip to timestamp
   */
  public skipToTimestamp(timestamp: number): void {
    // Find frame closest to timestamp
    let closestFrame = 0;
    let minDiff = Infinity;

    this.frames.forEach((frame, index) => {
      const diff = Math.abs(frame.timestamp - timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closestFrame = index;
      }
    });

    this.skipToFrame(closestFrame);
  }

  /**
   * Step forward one frame
   */
  public stepForward(): void {
    this.session.currentFrame = Math.min(
      this.frames.length - 1,
      this.session.currentFrame + 1
    );
  }

  /**
   * Step backward one frame
   */
  public stepBackward(): void {
    this.session.currentFrame = Math.max(0, this.session.currentFrame - 1);
  }

  /**
   * Get current frame
   */
  public getCurrentFrame(): ReplayFrame | null {
    return this.frames[this.session.currentFrame] || null;
  }

  /**
   * Update playback (call in game loop)
   */
  public updatePlayback(deltaTime: number): void {
    if (!this.session.isPlaying || this.session.isPaused) return;

    // Advance frame based on playback speed
    const frameAdvance = (deltaTime * this.TARGET_FPS * this.session.playbackSpeed) / 1000;

    this.session.currentFrame += frameAdvance;

    // Handle end of replay
    if (this.session.currentFrame >= this.frames.length) {
      if (this.session.isLooping) {
        this.session.currentFrame = 0;
      } else {
        this.stopPlayback();
      }
    }
  }

  // ========================================================================
  // Public API - Highlights
  // ========================================================================

  /**
   * Get all highlights
   */
  public getHighlights(): HighlightClip[] {
    return Array.from(this.highlights.values()).sort((a, b) => b.excitement - a.excitement);
  }

  /**
   * Get highlight by ID
   */
  public getHighlight(id: string): HighlightClip | null {
    return this.highlights.get(id) || null;
  }

  /**
   * Create manual highlight
   */
  public createHighlight(
    name: string,
    startFrame: number,
    endFrame: number,
    tags: string[] = []
  ): HighlightClip {
    const duration = ((endFrame - startFrame) / this.TARGET_FPS);

    // Calculate average excitement from events in this range
    const relevantEvents = this.getEventsInRange(startFrame, endFrame);
    const avgExcitement = relevantEvents.length > 0
      ? relevantEvents.reduce((sum, e) => sum + e.excitement, 0) / relevantEvents.length
      : 50;

    const clip: HighlightClip = {
      id: `highlight_${Date.now()}_${Math.random()}`,
      name,
      description: `Highlight: ${name}`,
      startFrame,
      endFrame,
      duration,
      timestamp: Date.now(),
      eventType: relevantEvents[0]?.eventType || 'hit',
      excitement: avgExcitement,
      importance: 70,
      tags,
      defaultSpeed: 1.0,
      cameraAngles: Array.from(this.cameraAngles.values()),
      defaultCameraAngle: 'broadcast',
      views: 0,
      likes: 0,
      shared: false
    };

    this.highlights.set(clip.id, clip);

    return clip;
  }

  /**
   * Delete highlight
   */
  public deleteHighlight(id: string): boolean {
    return this.highlights.delete(id);
  }

  /**
   * Play highlight
   */
  public playHighlight(id: string): void {
    const highlight = this.highlights.get(id);
    if (!highlight) return;

    this.session.selectedClip = highlight;
    this.session.currentFrame = highlight.startFrame;
    this.session.totalFrames = highlight.endFrame - highlight.startFrame;
    this.session.playbackSpeed = highlight.defaultSpeed;
    this.startPlayback(highlight.startFrame);

    // Track view
    highlight.views++;
  }

  /**
   * Auto-detect highlights in recorded footage
   */
  public detectHighlights(): HighlightClip[] {
    const detectedHighlights: HighlightClip[] = [];

    // Find exciting events
    const excitingEvents = this.events.filter(
      e =>
        e.excitement >= this.detectionConfig.minExcitement &&
        e.importance >= this.detectionConfig.minImportance
    );

    // Create highlights around each exciting event
    excitingEvents.forEach(event => {
      const clip = this.createHighlightFromEvent(event);
      if (clip) {
        detectedHighlights.push(clip);
      }
    });

    return detectedHighlights;
  }

  // ========================================================================
  // Public API - Camera Angles
  // ========================================================================

  /**
   * Get all camera angles
   */
  public getCameraAngles(): CameraAngle[] {
    return Array.from(this.cameraAngles.values());
  }

  /**
   * Set current camera angle
   */
  public setCameraAngle(angleId: string): void {
    const angle = this.cameraAngles.get(angleId);
    if (!angle) return;

    // Apply camera settings to current playback
    // (This would integrate with the game's camera system)
  }

  /**
   * Create custom camera angle
   */
  public createCameraAngle(angle: CameraAngle): void {
    this.cameraAngles.set(angle.id, angle);
  }

  // ========================================================================
  // Public API - Export
  // ========================================================================

  /**
   * Export highlight as video
   */
  public async exportHighlight(
    highlightId: string,
    settings: ExportSettings
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const highlight = this.highlights.get(highlightId);
    if (!highlight) {
      return { success: false, error: 'Highlight not found' };
    }

    try {
      // Extract frames for this highlight
      const clipFrames = this.frames.slice(highlight.startFrame, highlight.endFrame + 1);

      // Render frames to video
      // (This would use a library like MediaRecorder or FFmpeg.wasm)
      const videoBlob = await this.renderFramesToVideo(clipFrames, settings);

      // Create URL
      const url = URL.createObjectURL(videoBlob);

      // Mark as shared
      highlight.shared = true;

      return { success: true, url };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Export replay data as JSON
   */
  public exportReplayData(): string {
    const data = {
      session: this.session,
      frames: this.frames,
      events: this.events,
      highlights: Array.from(this.highlights.values())
    };

    return JSON.stringify(data);
  }

  /**
   * Import replay data from JSON
   */
  public importReplayData(json: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(json);

      this.frames = data.frames || [];
      this.events = data.events || [];

      if (data.highlights) {
        this.highlights.clear();
        data.highlights.forEach((h: HighlightClip) => {
          this.highlights.set(h.id, h);
        });
      }

      this.session.totalFrames = this.frames.length;

      return { success: true };
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // ========================================================================
  // Public API - Clip Editing
  // ========================================================================

  /**
   * Start marking clip (set start point)
   */
  public markClipStart(): void {
    this.session.clipStartFrame = this.session.currentFrame;
  }

  /**
   * End marking clip (set end point)
   */
  public markClipEnd(): void {
    this.session.clipEndFrame = this.session.currentFrame;
  }

  /**
   * Create clip from marked region
   */
  public createClipFromMarks(name: string, tags: string[] = []): HighlightClip | null {
    if (this.session.clipStartFrame === null || this.session.clipEndFrame === null) {
      return null;
    }

    const start = Math.min(this.session.clipStartFrame, this.session.clipEndFrame);
    const end = Math.max(this.session.clipStartFrame, this.session.clipEndFrame);

    return this.createHighlight(name, start, end, tags);
  }

  /**
   * Trim highlight
   */
  public trimHighlight(
    highlightId: string,
    newStart: number,
    newEnd: number
  ): boolean {
    const highlight = this.highlights.get(highlightId);
    if (!highlight) return false;

    highlight.startFrame = newStart;
    highlight.endFrame = newEnd;
    highlight.duration = (newEnd - newStart) / this.TARGET_FPS;

    return true;
  }

  // ========================================================================
  // Private Helper Methods - Recording
  // ========================================================================

  private captureFrame(): void {
    const now = Date.now();

    // Throttle if needed
    if (now - this.lastFrameTime < 1000 / this.TARGET_FPS) {
      return;
    }

    this.lastFrameTime = now;

    // Check memory limit
    if (this.estimateMemoryUsage() > this.MAX_MEMORY_MB * 1024 * 1024) {
      console.warn('Memory limit reached, stopping recording');
      this.stopRecording();
      return;
    }

    // Check frame limit
    if (this.frames.length >= this.MAX_FRAMES) {
      console.warn('Frame limit reached, stopping recording');
      this.stopRecording();
      return;
    }

    // Create frame snapshot
    const frame: ReplayFrame = {
      frameNumber: this.frames.length,
      timestamp: now,
      cameraPosition: { x: 0, y: 10, z: -30 }, // Would get from actual camera
      cameraTarget: { x: 0, y: 0, z: 0 },
      players: new Map(), // Would populate from game state
      ball: undefined, // Would populate from game state
      uiState: {
        scoreboard: { home: 0, away: 0 },
        count: { balls: 0, strikes: 0, outs: 0 }
      }
    };

    this.frames.push(frame);
    this.session.framesRecorded++;
    this.session.memoryUsage = this.estimateMemoryUsage();
  }

  private estimateMemoryUsage(): number {
    // Rough estimate: ~1KB per frame
    return this.frames.length * 1024 + this.events.length * 512;
  }

  // ========================================================================
  // Private Helper Methods - Excitement Calculation
  // ========================================================================

  private calculateExcitement(event: RecordedEvent): number {
    let excitement = 50; // Base excitement

    // Event type bonuses
    const priorit y = this.detectionConfig.eventPriorities.get(event.eventType) || 50;
    excitement = priority;

    // Game situation bonuses
    if (event.gameState.outs === 2) {
      excitement += 10; // 2 outs = more exciting
    }

    if (event.gameState.runners.second || event.gameState.runners.third) {
      excitement += 15; // RISP = more exciting
    }

    // Close game bonus
    const scoreDiff = Math.abs(event.gameState.score.home - event.gameState.score.away);
    if (scoreDiff <= 3) {
      excitement += 20;
    }

    // Late inning bonus
    if (event.gameState.inning >= 7) {
      excitement += 15;
    }

    return Math.min(100, excitement);
  }

  private calculateImportance(event: RecordedEvent): number {
    let importance = 50;

    // Game-changing events
    if (event.eventType === 'home_run') importance += 30;
    if (event.eventType === 'double_play') importance += 25;
    if (event.eventType === 'triple_play') importance += 40;

    // Situational importance
    if (event.gameState.inning >= 9) {
      importance += 20; // Extra innings or 9th inning
    }

    const scoreDiff = Math.abs(event.gameState.score.home - event.gameState.score.away);
    if (scoreDiff <= 1) {
      importance += 25; // One-run game
    }

    return Math.min(100, importance);
  }

  private shouldCreateImmediateHighlight(event: RecordedEvent): boolean {
    // Create immediate highlights for special events
    if (event.eventType === 'home_run') return true;
    if (event.eventType === 'triple_play') return true;
    if (event.eventType === 'double_play' && event.excitement > 80) return true;

    return false;
  }

  // ========================================================================
  // Private Helper Methods - Highlight Creation
  // ========================================================================

  private createHighlightFromEvent(event: RecordedEvent): HighlightClip | null {
    // Find the frame closest to this event
    const eventFrame = this.findFrameByTimestamp(event.timestamp);
    if (eventFrame === -1) return null;

    // Determine clip duration based on event type
    let beforeFrames = this.TARGET_FPS * 2; // 2 seconds before
    let afterFrames = this.TARGET_FPS * 3; // 3 seconds after

    if (event.eventType === 'home_run') {
      beforeFrames = this.TARGET_FPS * 3;
      afterFrames = this.TARGET_FPS * 5;
    } else if (event.eventType === 'double_play' || event.eventType === 'triple_play') {
      beforeFrames = this.TARGET_FPS * 2;
      afterFrames = this.TARGET_FPS * 4;
    }

    const startFrame = Math.max(0, eventFrame - beforeFrames);
    const endFrame = Math.min(this.frames.length - 1, eventFrame + afterFrames);

    // Create name based on event type
    const name = this.generateHighlightName(event);

    // Create tags
    const tags = this.generateHighlightTags(event);

    return this.createHighlight(name, startFrame, endFrame, tags);
  }

  private generateHighlightName(event: RecordedEvent): string {
    const eventNames: Record<string, string> = {
      home_run: 'Home Run!',
      double_play: 'Double Play',
      triple_play: 'Triple Play!',
      stolen_base: 'Stolen Base',
      catch: 'Great Catch',
      hit: 'Base Hit',
      score: 'Run Scored',
      strikeout: 'Strikeout'
    };

    return eventNames[event.eventType] || 'Highlight';
  }

  private generateHighlightTags(event: RecordedEvent): string[] {
    const tags: string[] = [event.eventType];

    if (event.excitement > 80) tags.push('amazing');
    if (event.importance > 80) tags.push('critical');
    if (event.gameState.inning >= 9) tags.push('late_game');
    if (event.gameState.outs === 2) tags.push('two_outs');

    const scoreDiff = Math.abs(event.gameState.score.home - event.gameState.score.away);
    if (scoreDiff <= 1) tags.push('close_game');

    return tags;
  }

  private findFrameByTimestamp(timestamp: number): number {
    let closestFrame = -1;
    let minDiff = Infinity;

    this.frames.forEach((frame, index) => {
      const diff = Math.abs(frame.timestamp - timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closestFrame = index;
      }
    });

    return closestFrame;
  }

  private getEventsInRange(startFrame: number, endFrame: number): RecordedEvent[] {
    const startTime = this.frames[startFrame]?.timestamp || 0;
    const endTime = this.frames[endFrame]?.timestamp || Infinity;

    return this.events.filter(
      e => e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  // ========================================================================
  // Private Helper Methods - Initialization
  // ========================================================================

  private createInitialSession(): ReplaySession {
    return {
      sessionId: `session_${Date.now()}`,
      isActive: false,
      isRecording: false,
      isPlaying: false,
      currentFrame: 0,
      totalFrames: 0,
      playbackSpeed: 1.0,
      isPaused: false,
      isLooping: false,
      recordingStartTime: 0,
      framesRecorded: 0,
      eventsRecorded: 0,
      memoryUsage: 0,
      clipStartFrame: null,
      clipEndFrame: null,
      selectedClip: null
    };
  }

  private initializeCameraAngles(): void {
    // Broadcast camera
    this.cameraAngles.set('broadcast', {
      id: 'broadcast',
      name: 'Broadcast',
      description: 'Traditional broadcast angle behind home plate',
      position: { x: 0, y: 20, z: -50 },
      target: { x: 0, y: 2, z: 20 },
      fov: 60,
      followBall: false,
      followPlayer: false,
      animated: false
    });

    // Center field camera
    this.cameraAngles.set('center_field', {
      id: 'center_field',
      name: 'Center Field',
      description: 'View from center field',
      position: { x: 0, y: 15, z: 120 },
      target: { x: 0, y: 2, z: 0 },
      fov: 50,
      followBall: false,
      followPlayer: false,
      animated: false
    });

    // Batter camera
    this.cameraAngles.set('batter', {
      id: 'batter',
      name: 'Batter View',
      description: 'Over-the-shoulder view from batter',
      position: { x: -2, y: 4, z: -2 },
      target: { x: 0, y: 2, z: 60 },
      fov: 70,
      followBall: true,
      followPlayer: false,
      animated: false
    });

    // Pitcher camera
    this.cameraAngles.set('pitcher', {
      id: 'pitcher',
      name: 'Pitcher View',
      description: 'View from behind the pitcher',
      position: { x: 0, y: 8, z: 65 },
      target: { x: 0, y: 2, z: 0 },
      fov: 60,
      followBall: true,
      followPlayer: false,
      animated: false
    });

    // Ball tracking camera
    this.cameraAngles.set('ball_track', {
      id: 'ball_track',
      name: 'Ball Track',
      description: 'Camera that follows the ball',
      position: { x: 10, y: 10, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      fov: 65,
      followBall: true,
      followPlayer: false,
      animated: false
    });

    // First base camera
    this.cameraAngles.set('first_base', {
      id: 'first_base',
      name: 'First Base',
      description: 'View from first base side',
      position: { x: 40, y: 10, z: 30 },
      target: { x: 0, y: 2, z: 40 },
      fov: 55,
      followBall: false,
      followPlayer: false,
      animated: false
    });

    // Third base camera
    this.cameraAngles.set('third_base', {
      id: 'third_base',
      name: 'Third Base',
      description: 'View from third base side',
      position: { x: -40, y: 10, z: 30 },
      target: { x: 0, y: 2, z: 40 },
      fov: 55,
      followBall: false,
      followPlayer: false,
      animated: false
    });

    // Aerial camera
    this.cameraAngles.set('aerial', {
      id: 'aerial',
      name: 'Aerial',
      description: 'Bird\'s eye view of the field',
      position: { x: 0, y: 80, z: 40 },
      target: { x: 0, y: 0, z: 40 },
      fov: 80,
      followBall: false,
      followPlayer: false,
      animated: false
    });
  }

  // ========================================================================
  // Private Helper Methods - Video Export
  // ========================================================================

  private async renderFramesToVideo(
    frames: ReplayFrame[],
    settings: ExportSettings
  ): Promise<Blob> {
    // This is a placeholder - real implementation would use MediaRecorder API
    // or FFmpeg.wasm to render frames to video

    return new Promise((resolve) => {
      // Simulate video rendering
      setTimeout(() => {
        const dummyBlob = new Blob(['video data'], { type: 'video/mp4' });
        resolve(dummyBlob);
      }, 1000);
    });
  }

  // ========================================================================
  // Public API - Configuration
  // ========================================================================

  /**
   * Configure highlight detection
   */
  public configureHighlightDetection(config: Partial<HighlightDetectionConfig>): void {
    this.detectionConfig = { ...this.detectionConfig, ...config };
  }

  /**
   * Get highlight detection config
   */
  public getHighlightDetectionConfig(): HighlightDetectionConfig {
    return { ...this.detectionConfig };
  }

  /**
   * Clear all recorded data
   */
  public clearRecording(): void {
    this.frames = [];
    this.events = [];
    this.highlights.clear();
    this.session = this.createInitialSession();
  }

  /**
   * Get session info
   */
  public getSession(): ReplaySession {
    return { ...this.session };
  }
}
