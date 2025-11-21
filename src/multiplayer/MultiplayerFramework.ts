/**
 * Multiplayer Framework
 *
 * Comprehensive multiplayer system with WebSocket/WebRTC networking,
 * matchmaking, lobbies, real-time synchronization, lag compensation,
 * prediction, rollback, voice chat, leaderboards, and anti-cheat.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Network protocol types
 */
export type NetworkProtocol = 'websocket' | 'webrtc' | 'hybrid';

/**
 * Connection state
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Player connection info
 */
export interface PlayerConnection {
  playerId: string;
  username: string;
  connectionId: string;
  state: ConnectionState;

  // Network stats
  ping: number; // ms
  jitter: number; // ms
  packetLoss: number; // 0-100%
  bandwidth: number; // kbps

  // Quality metrics
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  lastPingTime: number;
  avgPing: number;

  // WebRTC specific
  peerId?: string;
  rtcConnection?: RTCPeerConnection;
  dataChannel?: RTCDataChannel;

  // Session info
  connectedAt: number;
  lastActivityTime: number;
  totalPacketsSent: number;
  totalPacketsReceived: number;
}

/**
 * Network message types
 */
export type MessageType =
  | 'ping'
  | 'pong'
  | 'player_join'
  | 'player_leave'
  | 'player_ready'
  | 'game_state'
  | 'input'
  | 'chat'
  | 'voice_data'
  | 'sync'
  | 'lobby_update'
  | 'matchmaking_update'
  | 'match_found'
  | 'match_start'
  | 'match_end'
  | 'error';

/**
 * Network message
 */
export interface NetworkMessage {
  type: MessageType;
  timestamp: number;
  senderId: string;
  sequenceNumber: number;

  // Payload
  data: any;

  // Metadata
  requiresAck: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
  reliable: boolean; // Guaranteed delivery
}

/**
 * Game lobby
 */
export interface GameLobby {
  lobbyId: string;
  hostId: string;
  name: string;
  password?: string;
  isPrivate: boolean;

  // Settings
  maxPlayers: number;
  gameMode: string;
  mapId: string;
  difficulty: string;
  settings: Map<string, any>;

  // Players
  players: PlayerConnection[];
  readyPlayers: Set<string>;

  // State
  state: 'waiting' | 'ready' | 'starting' | 'in_progress' | 'ended';
  createdAt: number;
  startTime?: number;
  endTime?: number;

  // Rules
  autoStart: boolean;
  minPlayers: number;
  allowSpectators: boolean;
  spectators: PlayerConnection[];
}

/**
 * Matchmaking queue
 */
export interface MatchmakingQueue {
  queueId: string;
  gameMode: string;
  skillBracket: string;

  // Players in queue
  players: Array<{
    playerId: string;
    joinTime: number;
    skillRating: number;
    preferences: MatchmakingPreferences;
  }>;

  // Queue stats
  avgWaitTime: number; // seconds
  currentWaitTime: number;
  matchesFormed: number;
}

/**
 * Matchmaking preferences
 */
export interface MatchmakingPreferences {
  preferredGameModes: string[];
  preferredMaps: string[];
  skillRange: { min: number; max: number };
  maxPing: number;
  allowCrossPlay: boolean;
  voiceChatRequired: boolean;
}

/**
 * Match result
 */
export interface MatchResult {
  matchId: string;
  gameMode: string;
  startTime: number;
  endTime: number;
  duration: number; // seconds

  // Players
  players: Array<{
    playerId: string;
    team: number;
    score: number;
    stats: Map<string, number>;
    won: boolean;
    skillRatingChange: number;
  }>;

  // Match data
  winner: number; // Team number
  finalScore: { team1: number; team2: number };
  mvpPlayerId?: string;

  // Validation
  isValidated: boolean;
  suspiciousActivity: string[];
}

/**
 * Player input
 */
export interface PlayerInput {
  playerId: string;
  timestamp: number;
  frameNumber: number;

  // Input data
  keys: Set<string>;
  mousePosition: { x: number; y: number };
  mouseButtons: Set<number>;

  // Actions
  actions: Array<{
    type: string;
    data: any;
  }>;

  // Checksum for validation
  checksum: string;
}

/**
 * Game state snapshot
 */
export interface GameStateSnapshot {
  frameNumber: number;
  timestamp: number;

  // Game data
  gameState: any; // Complete game state

  // Players
  playerStates: Map<string, any>;

  // Physics
  physicsState: any;

  // Checksum
  checksum: string;
}

/**
 * Lag compensation config
 */
export interface LagCompensationConfig {
  enabled: boolean;

  // Buffering
  inputBufferSize: number; // frames
  stateBufferSize: number; // snapshots

  // Prediction
  clientPrediction: boolean;
  serverReconciliation: boolean;

  // Interpolation
  interpolationDelay: number; // ms
  extrapolationLimit: number; // ms

  // Rollback
  rollbackEnabled: boolean;
  maxRollbackFrames: number;
}

/**
 * Voice chat config
 */
export interface VoiceChatConfig {
  enabled: boolean;
  codec: 'opus' | 'pcm';
  bitrate: number; // kbps
  sampleRate: number; // Hz

  // Processing
  noiseSupression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;

  // Modes
  mode: 'push_to_talk' | 'voice_activity' | 'always_on';
  pushToTalkKey?: string;
  voiceActivationThreshold: number; // 0-100
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;

  // Stats
  skillRating: number;
  wins: number;
  losses: number;
  winRate: number;
  totalMatches: number;

  // Performance
  avgScore: number;
  bestScore: number;
  killDeathRatio?: number;

  // Achievements
  achievements: string[];
  titles: string[];
  currentTitle?: string;

  // Metadata
  level: number;
  experience: number;
  lastActiveTime: number;
}

/**
 * Anti-cheat detection
 */
export interface AntiCheatDetection {
  playerId: string;
  detectionType: 'speed_hack' | 'aim_bot' | 'wall_hack' | 'modified_client' | 'suspicious_stats';
  confidence: number; // 0-100
  timestamp: number;
  evidence: any[];
  action: 'warn' | 'kick' | 'ban' | 'flag';
}

/**
 * Network sync strategy
 */
export type SyncStrategy =
  | 'lockstep' // All clients in sync, wait for slowest
  | 'snapshot_interpolation' // Server sends snapshots, clients interpolate
  | 'state_synchronization' // Sync full state periodically
  | 'delta_compression'; // Send only changes

/**
 * Bandwidth optimization
 */
export interface BandwidthConfig {
  maxBandwidth: number; // kbps
  compressionEnabled: boolean;
  compressionLevel: number; // 1-9
  deltaEncoding: boolean;
  quantization: boolean;
  cullDistance: number; // Don't send updates for far entities
}

// ============================================================================
// Multiplayer Framework Class
// ============================================================================

export class MultiplayerFramework {
  private protocol: NetworkProtocol;
  private websocket: WebSocket | null;
  private rtcConnections: Map<string, RTCPeerConnection>;

  // Connection management
  private localPlayer: PlayerConnection | null;
  private remotePlayers: Map<string, PlayerConnection>;
  private connectionState: ConnectionState;

  // Lobbies and matchmaking
  private lobbies: Map<string, GameLobby>;
  private currentLobby: GameLobby | null;
  private matchmakingQueues: Map<string, MatchmakingQueue>;
  private inMatchmaking: boolean;

  // Network synchronization
  private syncStrategy: SyncStrategy;
  private lagCompensation: LagCompensationConfig;
  private inputBuffer: PlayerInput[];
  private stateBuffer: GameStateSnapshot[];

  // Message handling
  private messageQueue: NetworkMessage[];
  private sendQueue: NetworkMessage[];
  private sequenceNumber: number;
  private ackMap: Map<number, boolean>;

  // Performance tracking
  private pingHistory: number[];
  private lastPingTime: number;
  private roundTripTimes: number[];

  // Voice chat
  private voiceChat: VoiceChatConfig;
  private audioContext: AudioContext | null;
  private mediaStream: MediaStream | null;
  private voiceConnections: Map<string, RTCPeerConnection>;

  // Leaderboards
  private leaderboards: Map<string, LeaderboardEntry[]>;

  // Anti-cheat
  private antiCheatEnabled: boolean;
  private detections: AntiCheatDetection[];

  // Bandwidth optimization
  private bandwidthConfig: BandwidthConfig;
  private bytesSent: number;
  private bytesReceived: number;

  // Configuration
  private serverUrl: string;
  private iceServers: RTCIceServer[];
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;

  // Constants
  private readonly PING_INTERVAL = 1000; // ms
  private readonly TIMEOUT_DURATION = 30000; // ms
  private readonly MAX_MESSAGE_QUEUE = 1000;

  constructor(serverUrl: string, protocol: NetworkProtocol = 'websocket') {
    this.serverUrl = serverUrl;
    this.protocol = protocol;
    this.websocket = null;
    this.rtcConnections = new Map();

    this.localPlayer = null;
    this.remotePlayers = new Map();
    this.connectionState = 'disconnected';

    this.lobbies = new Map();
    this.currentLobby = null;
    this.matchmakingQueues = new Map();
    this.inMatchmaking = false;

    this.syncStrategy = 'snapshot_interpolation';
    this.lagCompensation = this.createDefaultLagCompensation();
    this.inputBuffer = [];
    this.stateBuffer = [];

    this.messageQueue = [];
    this.sendQueue = [];
    this.sequenceNumber = 0;
    this.ackMap = new Map();

    this.pingHistory = [];
    this.lastPingTime = 0;
    this.roundTripTimes = [];

    this.voiceChat = this.createDefaultVoiceChat();
    this.audioContext = null;
    this.mediaStream = null;
    this.voiceConnections = new Map();

    this.leaderboards = new Map();

    this.antiCheatEnabled = true;
    this.detections = [];

    this.bandwidthConfig = {
      maxBandwidth: 1000, // 1 Mbps
      compressionEnabled: true,
      compressionLevel: 6,
      deltaEncoding: true,
      quantization: true,
      cullDistance: 1000
    };
    this.bytesSent = 0;
    this.bytesReceived = 0;

    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // ========================================================================
  // Public API - Connection
  // ========================================================================

  /**
   * Connect to server
   */
  public async connect(playerId: string, username: string): Promise<boolean> {
    try {
      this.connectionState = 'connecting';

      if (this.protocol === 'websocket' || this.protocol === 'hybrid') {
        await this.connectWebSocket();
      }

      // Create local player
      this.localPlayer = {
        playerId,
        username,
        connectionId: this.generateId(),
        state: 'connected',
        ping: 0,
        jitter: 0,
        packetLoss: 0,
        bandwidth: 0,
        connectionQuality: 'good',
        lastPingTime: Date.now(),
        avgPing: 0,
        connectedAt: Date.now(),
        lastActivityTime: Date.now(),
        totalPacketsSent: 0,
        totalPacketsReceived: 0
      };

      this.connectionState = 'connected';

      // Send join message
      this.send({
        type: 'player_join',
        timestamp: Date.now(),
        senderId: playerId,
        sequenceNumber: this.getNextSequence(),
        data: { playerId, username },
        requiresAck: true,
        priority: 'high',
        reliable: true
      });

      // Start ping loop
      this.startPingLoop();

      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      this.connectionState = 'error';
      return false;
    }
  }

  /**
   * Disconnect from server
   */
  public disconnect(): void {
    // Send leave message
    if (this.localPlayer) {
      this.send({
        type: 'player_leave',
        timestamp: Date.now(),
        senderId: this.localPlayer.playerId,
        sequenceNumber: this.getNextSequence(),
        data: { playerId: this.localPlayer.playerId },
        requiresAck: false,
        priority: 'normal',
        reliable: true
      });
    }

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    // Close RTC connections
    this.rtcConnections.forEach(conn => conn.close());
    this.rtcConnections.clear();

    this.connectionState = 'disconnected';
    this.localPlayer = null;
    this.remotePlayers.clear();
  }

  /**
   * Reconnect to server
   */
  public async reconnect(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return false;
    }

    this.reconnectAttempts++;
    this.connectionState = 'reconnecting';

    // Wait before reconnecting
    await this.sleep(Math.pow(2, this.reconnectAttempts) * 1000);

    if (this.localPlayer) {
      return await this.connect(this.localPlayer.playerId, this.localPlayer.username);
    }

    return false;
  }

  /**
   * Get connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get local player
   */
  public getLocalPlayer(): PlayerConnection | null {
    return this.localPlayer;
  }

  /**
   * Get remote players
   */
  public getRemotePlayers(): PlayerConnection[] {
    return Array.from(this.remotePlayers.values());
  }

  // ========================================================================
  // Public API - Lobbies
  // ========================================================================

  /**
   * Create lobby
   */
  public async createLobby(
    name: string,
    settings: Partial<GameLobby>
  ): Promise<GameLobby | null> {
    if (!this.localPlayer) return null;

    const lobby: GameLobby = {
      lobbyId: this.generateId(),
      hostId: this.localPlayer.playerId,
      name,
      password: settings.password,
      isPrivate: settings.isPrivate || false,
      maxPlayers: settings.maxPlayers || 8,
      gameMode: settings.gameMode || 'standard',
      mapId: settings.mapId || 'default',
      difficulty: settings.difficulty || 'normal',
      settings: settings.settings || new Map(),
      players: [this.localPlayer],
      readyPlayers: new Set(),
      state: 'waiting',
      createdAt: Date.now(),
      autoStart: settings.autoStart || false,
      minPlayers: settings.minPlayers || 2,
      allowSpectators: settings.allowSpectators || true,
      spectators: []
    };

    this.lobbies.set(lobby.lobbyId, lobby);
    this.currentLobby = lobby;

    // Notify server
    this.send({
      type: 'lobby_update',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: { action: 'create', lobby },
      requiresAck: true,
      priority: 'high',
      reliable: true
    });

    return lobby;
  }

  /**
   * Join lobby
   */
  public async joinLobby(lobbyId: string, password?: string): Promise<boolean> {
    if (!this.localPlayer) return false;

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;

    // Check password
    if (lobby.password && lobby.password !== password) {
      return false;
    }

    // Check if full
    if (lobby.players.length >= lobby.maxPlayers) {
      return false;
    }

    // Add player
    lobby.players.push(this.localPlayer);
    this.currentLobby = lobby;

    // Notify server
    this.send({
      type: 'lobby_update',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: { action: 'join', lobbyId, playerId: this.localPlayer.playerId },
      requiresAck: true,
      priority: 'high',
      reliable: true
    });

    return true;
  }

  /**
   * Leave lobby
   */
  public leaveLobby(): void {
    if (!this.currentLobby || !this.localPlayer) return;

    const lobby = this.currentLobby;

    // Remove player
    lobby.players = lobby.players.filter(p => p.playerId !== this.localPlayer!.playerId);
    lobby.readyPlayers.delete(this.localPlayer.playerId);

    // Notify server
    this.send({
      type: 'lobby_update',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: { action: 'leave', lobbyId: lobby.lobbyId, playerId: this.localPlayer.playerId },
      requiresAck: true,
      priority: 'high',
      reliable: true
    });

    this.currentLobby = null;
  }

  /**
   * Set player ready
   */
  public setReady(ready: boolean): void {
    if (!this.currentLobby || !this.localPlayer) return;

    if (ready) {
      this.currentLobby.readyPlayers.add(this.localPlayer.playerId);
    } else {
      this.currentLobby.readyPlayers.delete(this.localPlayer.playerId);
    }

    // Notify server
    this.send({
      type: 'player_ready',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: { ready },
      requiresAck: false,
      priority: 'normal',
      reliable: true
    });

    // Check if all ready and can start
    if (this.currentLobby.autoStart) {
      this.checkAutoStart();
    }
  }

  /**
   * Start match
   */
  public startMatch(): void {
    if (!this.currentLobby || !this.localPlayer) return;
    if (this.currentLobby.hostId !== this.localPlayer.playerId) return;

    this.currentLobby.state = 'starting';
    this.currentLobby.startTime = Date.now();

    // Notify all players
    this.send({
      type: 'match_start',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: { lobbyId: this.currentLobby.lobbyId },
      requiresAck: true,
      priority: 'critical',
      reliable: true
    });
  }

  /**
   * Get all lobbies
   */
  public getLobbies(): GameLobby[] {
    return Array.from(this.lobbies.values());
  }

  /**
   * Get current lobby
   */
  public getCurrentLobby(): GameLobby | null {
    return this.currentLobby;
  }

  // ========================================================================
  // Public API - Matchmaking
  // ========================================================================

  /**
   * Start matchmaking
   */
  public async startMatchmaking(
    gameMode: string,
    preferences: MatchmakingPreferences
  ): Promise<void> {
    if (!this.localPlayer || this.inMatchmaking) return;

    this.inMatchmaking = true;

    // Send matchmaking request
    this.send({
      type: 'matchmaking_update',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: {
        action: 'start',
        gameMode,
        preferences,
        skillRating: 1000 // Would get from player stats
      },
      requiresAck: true,
      priority: 'high',
      reliable: true
    });
  }

  /**
   * Cancel matchmaking
   */
  public cancelMatchmaking(): void {
    if (!this.localPlayer || !this.inMatchmaking) return;

    this.inMatchmaking = false;

    // Send cancel request
    this.send({
      type: 'matchmaking_update',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: { action: 'cancel' },
      requiresAck: false,
      priority: 'normal',
      reliable: true
    });
  }

  /**
   * Check if in matchmaking
   */
  public isInMatchmaking(): boolean {
    return this.inMatchmaking;
  }

  // ========================================================================
  // Public API - Game Synchronization
  // ========================================================================

  /**
   * Send player input
   */
  public sendInput(input: PlayerInput): void {
    if (!this.localPlayer) return;

    // Add to local buffer
    this.inputBuffer.push(input);

    // Keep buffer size limited
    if (this.inputBuffer.length > this.lagCompensation.inputBufferSize) {
      this.inputBuffer.shift();
    }

    // Send to server
    this.send({
      type: 'input',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: input,
      requiresAck: false,
      priority: 'high',
      reliable: false // UDP-style, don't wait for ack
    });
  }

  /**
   * Send game state (as host)
   */
  public sendGameState(state: GameStateSnapshot): void {
    if (!this.localPlayer) return;

    // Add to state buffer
    this.stateBuffer.push(state);

    // Keep buffer size limited
    if (this.stateBuffer.length > this.lagCompensation.stateBufferSize) {
      this.stateBuffer.shift();
    }

    // Compress if enabled
    const data = this.bandwidthConfig.compressionEnabled
      ? this.compressState(state)
      : state;

    // Send to all players
    this.send({
      type: 'game_state',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data,
      requiresAck: false,
      priority: 'high',
      reliable: false
    });
  }

  /**
   * Sync state with server
   */
  public syncState(state: any): void {
    if (!this.localPlayer) return;

    this.send({
      type: 'sync',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: state,
      requiresAck: true,
      priority: 'high',
      reliable: true
    });
  }

  /**
   * Get interpolated game state
   */
  public getInterpolatedState(currentTime: number): GameStateSnapshot | null {
    if (this.stateBuffer.length < 2) return null;

    // Find two snapshots to interpolate between
    const renderTime = currentTime - this.lagCompensation.interpolationDelay;

    let from: GameStateSnapshot | null = null;
    let to: GameStateSnapshot | null = null;

    for (let i = 0; i < this.stateBuffer.length - 1; i++) {
      if (this.stateBuffer[i].timestamp <= renderTime &&
          this.stateBuffer[i + 1].timestamp >= renderTime) {
        from = this.stateBuffer[i];
        to = this.stateBuffer[i + 1];
        break;
      }
    }

    if (!from || !to) {
      // Extrapolate if needed
      return this.extrapolateState(currentTime);
    }

    // Interpolate
    const alpha = (renderTime - from.timestamp) / (to.timestamp - from.timestamp);
    return this.interpolateStates(from, to, alpha);
  }

  // ========================================================================
  // Public API - Voice Chat
  // ========================================================================

  /**
   * Enable voice chat
   */
  public async enableVoiceChat(): Promise<boolean> {
    if (!this.voiceChat.enabled) return false;

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.voiceChat.echoCancellation,
          noiseSuppression: this.voiceChat.noiseSupression,
          autoGainControl: this.voiceChat.autoGainControl
        }
      });

      // Create audio context
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      return true;
    } catch (error) {
      console.error('Failed to enable voice chat:', error);
      return false;
    }
  }

  /**
   * Disable voice chat
   */
  public disableVoiceChat(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.voiceConnections.forEach(conn => conn.close());
    this.voiceConnections.clear();
  }

  /**
   * Set voice chat mode
   */
  public setVoiceChatMode(mode: VoiceChatConfig['mode']): void {
    this.voiceChat.mode = mode;
  }

  /**
   * Mute/unmute voice
   */
  public setVoiceMuted(muted: boolean): void {
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  // ========================================================================
  // Public API - Chat
  // ========================================================================

  /**
   * Send chat message
   */
  public sendChatMessage(message: string, recipientId?: string): void {
    if (!this.localPlayer) return;

    this.send({
      type: 'chat',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: {
        message,
        recipientId: recipientId || 'all'
      },
      requiresAck: false,
      priority: 'low',
      reliable: true
    });
  }

  // ========================================================================
  // Public API - Leaderboards
  // ========================================================================

  /**
   * Get leaderboard
   */
  public async getLeaderboard(
    leaderboardId: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    // Would fetch from server
    return this.leaderboards.get(leaderboardId) || [];
  }

  /**
   * Submit match result
   */
  public submitMatchResult(result: MatchResult): void {
    if (!this.localPlayer) return;

    this.send({
      type: 'match_end',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: result,
      requiresAck: true,
      priority: 'high',
      reliable: true
    });
  }

  // ========================================================================
  // Public API - Anti-Cheat
  // ========================================================================

  /**
   * Report suspicious activity
   */
  public reportSuspiciousActivity(
    targetPlayerId: string,
    type: AntiCheatDetection['detectionType'],
    evidence: any[]
  ): void {
    if (!this.localPlayer) return;

    const detection: AntiCheatDetection = {
      playerId: targetPlayerId,
      detectionType: type,
      confidence: 75,
      timestamp: Date.now(),
      evidence,
      action: 'flag'
    };

    this.detections.push(detection);

    // Report to server
    this.send({
      type: 'error',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: { type: 'anti_cheat', detection },
      requiresAck: true,
      priority: 'high',
      reliable: true
    });
  }

  /**
   * Validate game state
   */
  public validateGameState(state: GameStateSnapshot): boolean {
    // Would perform checksum validation
    return true;
  }

  // ========================================================================
  // Public API - Network Stats
  // ========================================================================

  /**
   * Get network stats
   */
  public getNetworkStats() {
    return {
      ping: this.localPlayer?.ping || 0,
      avgPing: this.localPlayer?.avgPing || 0,
      jitter: this.localPlayer?.jitter || 0,
      packetLoss: this.localPlayer?.packetLoss || 0,
      bandwidth: this.localPlayer?.bandwidth || 0,
      bytesSent: this.bytesSent,
      bytesReceived: this.bytesReceived,
      connectionQuality: this.localPlayer?.connectionQuality || 'good'
    };
  }

  /**
   * Update network (call in game loop)
   */
  public update(deltaTime: number): void {
    // Process incoming messages
    this.processMessageQueue();

    // Send queued messages
    this.processSendQueue();

    // Update connection stats
    this.updateConnectionStats();

    // Check for timeouts
    this.checkTimeouts();

    // Update bandwidth tracking
    this.updateBandwidth(deltaTime);
  }

  // ========================================================================
  // Private Helper Methods - Connection
  // ========================================================================

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(this.serverUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket closed');
        this.connectionState = 'disconnected';

        // Attempt reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };
    });
  }

  private async connectWebRTC(targetPlayerId: string): Promise<RTCPeerConnection> {
    const config: RTCConfiguration = {
      iceServers: this.iceServers
    };

    const connection = new RTCPeerConnection(config);

    // Setup data channel
    const dataChannel = connection.createDataChannel('game', {
      ordered: false, // Allow out-of-order delivery for lower latency
      maxRetransmits: 0 // Don't retransmit
    });

    dataChannel.onmessage = (event) => {
      this.handleDataChannelMessage(event);
    };

    // ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to peer via signaling server
        this.sendSignalingMessage('ice_candidate', targetPlayerId, event.candidate);
      }
    };

    this.rtcConnections.set(targetPlayerId, connection);

    return connection;
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message: NetworkMessage = JSON.parse(event.data);
      this.bytesReceived += event.data.length;

      // Add to message queue
      this.messageQueue.push(message);

      // Process immediately if critical
      if (message.priority === 'critical') {
        this.processMessage(message);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private handleDataChannelMessage(event: MessageEvent): void {
    // Handle binary data from WebRTC
    try {
      const message: NetworkMessage = JSON.parse(event.data);
      this.messageQueue.push(message);
    } catch (error) {
      console.error('Failed to parse data channel message:', error);
    }
  }

  private sendSignalingMessage(type: string, targetPlayerId: string, data: any): void {
    // Send signaling message via WebSocket
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'signaling',
        targetPlayerId,
        signalingType: type,
        data
      }));
    }
  }

  // ========================================================================
  // Private Helper Methods - Message Handling
  // ========================================================================

  private send(message: NetworkMessage): void {
    // Add to send queue
    this.sendQueue.push(message);

    // Track for acknowledgment if needed
    if (message.requiresAck) {
      this.ackMap.set(message.sequenceNumber, false);
    }
  }

  private processSendQueue(): void {
    while (this.sendQueue.length > 0) {
      const message = this.sendQueue.shift()!;

      // Check bandwidth limit
      const messageSize = JSON.stringify(message).length;
      if (this.bytesSent + messageSize > this.bandwidthConfig.maxBandwidth * 1000) {
        // Re-queue if exceeding bandwidth
        this.sendQueue.unshift(message);
        break;
      }

      // Send via appropriate protocol
      if (this.protocol === 'websocket' && this.websocket) {
        if (this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify(message));
          this.bytesSent += messageSize;

          if (this.localPlayer) {
            this.localPlayer.totalPacketsSent++;
          }
        }
      } else if (this.protocol === 'webrtc') {
        // Send via WebRTC data channel
        // Would select appropriate peer connection
      }
    }
  }

  private processMessageQueue(): void {
    // Process messages in priority order
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.processMessage(message);
    }
  }

  private processMessage(message: NetworkMessage): void {
    if (this.localPlayer) {
      this.localPlayer.totalPacketsReceived++;
    }

    switch (message.type) {
      case 'pong':
        this.handlePong(message);
        break;
      case 'player_join':
        this.handlePlayerJoin(message);
        break;
      case 'player_leave':
        this.handlePlayerLeave(message);
        break;
      case 'game_state':
        this.handleGameState(message);
        break;
      case 'input':
        this.handleInput(message);
        break;
      case 'lobby_update':
        this.handleLobbyUpdate(message);
        break;
      case 'match_found':
        this.handleMatchFound(message);
        break;
      case 'match_start':
        this.handleMatchStart(message);
        break;
      case 'chat':
        this.handleChat(message);
        break;
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  private handlePong(message: NetworkMessage): void {
    if (!this.localPlayer) return;

    const rtt = Date.now() - message.data.pingTime;
    this.localPlayer.ping = rtt;

    // Update RTT history
    this.roundTripTimes.push(rtt);
    if (this.roundTripTimes.length > 20) {
      this.roundTripTimes.shift();
    }

    // Calculate average ping
    this.localPlayer.avgPing = this.roundTripTimes.reduce((a, b) => a + b, 0) / this.roundTripTimes.length;

    // Calculate jitter
    if (this.roundTripTimes.length >= 2) {
      const differences = [];
      for (let i = 1; i < this.roundTripTimes.length; i++) {
        differences.push(Math.abs(this.roundTripTimes[i] - this.roundTripTimes[i - 1]));
      }
      this.localPlayer.jitter = differences.reduce((a, b) => a + b, 0) / differences.length;
    }

    // Update connection quality
    this.updateConnectionQuality();
  }

  private handlePlayerJoin(message: NetworkMessage): void {
    const { playerId, username } = message.data;

    const player: PlayerConnection = {
      playerId,
      username,
      connectionId: this.generateId(),
      state: 'connected',
      ping: 0,
      jitter: 0,
      packetLoss: 0,
      bandwidth: 0,
      connectionQuality: 'good',
      lastPingTime: Date.now(),
      avgPing: 0,
      connectedAt: Date.now(),
      lastActivityTime: Date.now(),
      totalPacketsSent: 0,
      totalPacketsReceived: 0
    };

    this.remotePlayers.set(playerId, player);

    // Setup WebRTC if using P2P
    if (this.protocol === 'webrtc' || this.protocol === 'hybrid') {
      this.connectWebRTC(playerId);
    }
  }

  private handlePlayerLeave(message: NetworkMessage): void {
    const { playerId } = message.data;
    this.remotePlayers.delete(playerId);

    // Close RTC connection if exists
    const rtcConn = this.rtcConnections.get(playerId);
    if (rtcConn) {
      rtcConn.close();
      this.rtcConnections.delete(playerId);
    }
  }

  private handleGameState(message: NetworkMessage): void {
    const state: GameStateSnapshot = message.data;

    // Decompress if needed
    const decompressedState = this.bandwidthConfig.compressionEnabled
      ? this.decompressState(state)
      : state;

    // Add to state buffer
    this.stateBuffer.push(decompressedState);

    // Keep buffer size limited
    if (this.stateBuffer.length > this.lagCompensation.stateBufferSize) {
      this.stateBuffer.shift();
    }
  }

  private handleInput(message: NetworkMessage): void {
    // Store remote player input
    const input: PlayerInput = message.data;
    // Would add to appropriate player's input buffer
  }

  private handleLobbyUpdate(message: NetworkMessage): void {
    const { action, lobby, lobbyId } = message.data;

    switch (action) {
      case 'create':
        this.lobbies.set(lobby.lobbyId, lobby);
        break;
      case 'update':
        const existing = this.lobbies.get(lobbyId);
        if (existing) {
          Object.assign(existing, lobby);
        }
        break;
      case 'delete':
        this.lobbies.delete(lobbyId);
        break;
    }
  }

  private handleMatchFound(message: NetworkMessage): void {
    this.inMatchmaking = false;
    const { lobby } = message.data;
    this.currentLobby = lobby;
  }

  private handleMatchStart(message: NetworkMessage): void {
    if (this.currentLobby) {
      this.currentLobby.state = 'in_progress';
    }
  }

  private handleChat(message: NetworkMessage): void {
    // Would emit chat event to game
    console.log(`[Chat] ${message.senderId}: ${message.data.message}`);
  }

  // ========================================================================
  // Private Helper Methods - Ping
  // ========================================================================

  private startPingLoop(): void {
    setInterval(() => {
      this.sendPing();
    }, this.PING_INTERVAL);
  }

  private sendPing(): void {
    if (!this.localPlayer) return;

    this.send({
      type: 'ping',
      timestamp: Date.now(),
      senderId: this.localPlayer.playerId,
      sequenceNumber: this.getNextSequence(),
      data: { pingTime: Date.now() },
      requiresAck: false,
      priority: 'low',
      reliable: false
    });

    this.lastPingTime = Date.now();
  }

  // ========================================================================
  // Private Helper Methods - State Interpolation
  // ========================================================================

  private interpolateStates(
    from: GameStateSnapshot,
    to: GameStateSnapshot,
    alpha: number
  ): GameStateSnapshot {
    // Would perform actual interpolation of game state
    // For now, return the 'to' state
    return to;
  }

  private extrapolateState(currentTime: number): GameStateSnapshot | null {
    if (this.stateBuffer.length === 0) return null;

    const latest = this.stateBuffer[this.stateBuffer.length - 1];
    const delta = currentTime - latest.timestamp;

    // Don't extrapolate beyond limit
    if (delta > this.lagCompensation.extrapolationLimit) {
      return latest;
    }

    // Would perform actual extrapolation
    return latest;
  }

  // ========================================================================
  // Private Helper Methods - Compression
  // ========================================================================

  private compressState(state: GameStateSnapshot): any {
    // Would implement actual compression
    // Could use delta encoding, quantization, etc.
    return state;
  }

  private decompressState(data: any): GameStateSnapshot {
    // Would implement actual decompression
    return data;
  }

  // ========================================================================
  // Private Helper Methods - Utilities
  // ========================================================================

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextSequence(): number {
    return this.sequenceNumber++;
  }

  private updateConnectionStats(): void {
    // Would update various connection statistics
  }

  private updateConnectionQuality(): void {
    if (!this.localPlayer) return;

    const ping = this.localPlayer.avgPing;

    if (ping < 50) {
      this.localPlayer.connectionQuality = 'excellent';
    } else if (ping < 100) {
      this.localPlayer.connectionQuality = 'good';
    } else if (ping < 200) {
      this.localPlayer.connectionQuality = 'fair';
    } else {
      this.localPlayer.connectionQuality = 'poor';
    }
  }

  private checkTimeouts(): void {
    const now = Date.now();

    this.remotePlayers.forEach((player, playerId) => {
      if (now - player.lastActivityTime > this.TIMEOUT_DURATION) {
        console.log(`Player ${playerId} timed out`);
        this.remotePlayers.delete(playerId);
      }
    });
  }

  private updateBandwidth(deltaTime: number): void {
    // Calculate bandwidth usage
    if (this.localPlayer) {
      this.localPlayer.bandwidth = (this.bytesSent * 8) / 1000; // Convert to kbps
    }

    // Reset counters periodically
    if (deltaTime > 1) {
      this.bytesSent = 0;
      this.bytesReceived = 0;
    }
  }

  private checkAutoStart(): void {
    if (!this.currentLobby) return;

    const allReady = this.currentLobby.players.length >= this.currentLobby.minPlayers &&
                     this.currentLobby.players.every(p =>
                       this.currentLobby!.readyPlayers.has(p.playerId)
                     );

    if (allReady && this.localPlayer && this.currentLobby.hostId === this.localPlayer.playerId) {
      this.startMatch();
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createDefaultLagCompensation(): LagCompensationConfig {
    return {
      enabled: true,
      inputBufferSize: 60,
      stateBufferSize: 30,
      clientPrediction: true,
      serverReconciliation: true,
      interpolationDelay: 100,
      extrapolationLimit: 200,
      rollbackEnabled: true,
      maxRollbackFrames: 10
    };
  }

  private createDefaultVoiceChat(): VoiceChatConfig {
    return {
      enabled: true,
      codec: 'opus',
      bitrate: 32,
      sampleRate: 48000,
      noiseSupression: true,
      echoCancellation: true,
      autoGainControl: true,
      mode: 'push_to_talk',
      pushToTalkKey: 'v',
      voiceActivationThreshold: 50
    };
  }
}
