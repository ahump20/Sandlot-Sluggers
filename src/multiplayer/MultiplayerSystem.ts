/**
 * Comprehensive Multiplayer System
 * Real-time multiplayer with synchronization, matchmaking, and networking
 */

export enum ConnectionState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    AUTHENTICATING = 'AUTHENTICATING',
    AUTHENTICATED = 'AUTHENTICATED',
    IN_LOBBY = 'IN_LOBBY',
    IN_GAME = 'IN_GAME',
    RECONNECTING = 'RECONNECTING'
}

export enum GameMode {
    VERSUS = 'VERSUS',                    // 1v1
    CO_OP = 'CO_OP',                      // 2 players vs AI
    TEAM_VERSUS = 'TEAM_VERSUS',          // 2v2
    TOURNAMENT = 'TOURNAMENT',            // Multi-round competition
    HOME_RUN_DERBY = 'HOME_RUN_DERBY'     // Home run competition
}

export enum MatchmakingStatus {
    IDLE = 'IDLE',
    SEARCHING = 'SEARCHING',
    MATCH_FOUND = 'MATCH_FOUND',
    CONNECTING_TO_MATCH = 'CONNECTING_TO_MATCH',
    FAILED = 'FAILED'
}

export interface PlayerSession {
    playerId: string;
    username: string;
    displayName: string;
    level: number;
    rating: number;               // ELO/MMR rating
    rank: string;
    profilePicture?: string;
    isReady: boolean;
    isHost: boolean;
    team?: string;
    ping: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface GameSession {
    sessionId: string;
    hostId: string;
    gameMode: GameMode;
    maxPlayers: number;
    currentPlayers: Map<string, PlayerSession>;
    isPrivate: boolean;
    joinCode?: string;
    settings: {
        difficulty: string;
        inningCount: number;
        stadium: string;
        weather: string;
        rules: any;
    };
    state: 'lobby' | 'starting' | 'in_progress' | 'finished';
    startTime?: Date;
    endTime?: Date;
}

export interface MatchmakingCriteria {
    gameMode: GameMode;
    skillRating: number;
    skillRange: number;           // ±range for matchmaking
    maxPing: number;
    region: string;
    partySize: number;
}

export interface MatchmakingResult {
    matchId: string;
    players: PlayerSession[];
    averageRating: number;
    estimatedPing: number;
    server: string;
}

export interface NetworkMessage {
    messageId: string;
    timestamp: number;
    senderId: string;
    messageType: string;
    data: any;
    reliable: boolean;
    ordered: boolean;
}

export interface GameStateSnapshot {
    timestamp: number;
    tick: number;
    inning: number;
    outs: number;
    balls: number;
    strikes: number;
    homeScore: number;
    awayScore: number;
    bases: boolean[];
    ballPosition: [number, number, number];
    ballVelocity: [number, number, number];
    playerPositions: Map<string, [number, number, number]>;
    currentBatter: string;
    currentPitcher: string;
}

export interface InputCommand {
    commandId: string;
    tick: number;
    playerId: string;
    action: string;
    parameters: any;
    timestamp: number;
}

export interface LagCompensation {
    clientTick: number;
    serverTick: number;
    roundTripTime: number;       // ms
    clientTimeOffset: number;    // ms
    interpolationDelay: number;  // ms
}

export interface ChatMessage {
    messageId: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Date;
    type: 'all' | 'team' | 'whisper';
    recipient?: string;
}

export interface VoiceChatSession {
    sessionId: string;
    participants: string[];
    isMuted: Map<string, boolean>;
    isDeafened: Map<string, boolean>;
    volume: Map<string, number>;
}

export interface Leaderboard {
    leaderboardId: string;
    name: string;
    category: 'rating' | 'wins' | 'home_runs' | 'batting_average' | 'strikeouts';
    timeframe: 'all_time' | 'season' | 'monthly' | 'weekly' | 'daily';
    entries: LeaderboardEntry[];
    lastUpdated: Date;
}

export interface LeaderboardEntry {
    rank: number;
    playerId: string;
    username: string;
    value: number;
    change: number;              // Rank change since last update
    metadata?: any;
}

export interface Achievement {
    achievementId: string;
    playerId: string;
    unlockedAt: Date;
    notified: boolean;
}

export interface PartyInvite {
    inviteId: string;
    fromPlayerId: string;
    fromPlayerName: string;
    toPlayerId: string;
    partyId: string;
    timestamp: Date;
    expiresAt: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface Party {
    partyId: string;
    leaderId: string;
    members: Map<string, PlayerSession>;
    maxSize: number;
    isOpen: boolean;
}

/**
 * Comprehensive Multiplayer System
 */
export class MultiplayerSystem {
    private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
    private localPlayerId: string = '';
    private localPlayerSession: PlayerSession | null = null;

    // Current session
    private currentSession: GameSession | null = null;
    private isHost: boolean = false;

    // Matchmaking
    private matchmakingStatus: MatchmakingStatus = MatchmakingStatus.IDLE;
    private matchmakingStartTime: number = 0;
    private matchmakingCriteria: MatchmakingCriteria | null = null;

    // Network
    private serverUrl: string = '';
    private websocket: WebSocket | null = null;
    private messageQueue: NetworkMessage[] = [];
    private messageHandlers: Map<string, ((message: NetworkMessage) => void)[]> = new Map();

    // Synchronization
    private serverTick: number = 0;
    private clientTick: number = 0;
    private tickRate: number = 60;            // Ticks per second
    private lastTickTime: number = 0;

    private stateHistory: GameStateSnapshot[] = [];
    private maxHistorySize: number = 180;     // 3 seconds at 60 ticks/second

    private pendingInputs: InputCommand[] = [];
    private lagCompensation: LagCompensation = {
        clientTick: 0,
        serverTick: 0,
        roundTripTime: 0,
        clientTimeOffset: 0,
        interpolationDelay: 33                // 2 ticks at 60Hz
    };

    // Chat
    private chatHistory: ChatMessage[] = [];
    private maxChatHistory: number = 100;

    // Voice chat
    private voiceChat: VoiceChatSession | null = null;

    // Party system
    private currentParty: Party | null = null;
    private pendingInvites: Map<string, PartyInvite> = new Map();

    // Leaderboards
    private leaderboards: Map<string, Leaderboard> = new Map();

    // Statistics
    private networkStats: {
        packetsSent: number;
        packetsReceived: number;
        bytestSent: number;
        bytesReceived: number;
        packetsLost: number;
        averagePing: number;
        jitter: number;
    };

    // Reconnection
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 2000;    // ms

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;

        // Initialize network stats
        this.networkStats = {
            packetsSent: 0,
            packetsReceived: 0,
            bytestSent: 0,
            bytesReceived: 0,
            packetsLost: 0,
            averagePing: 0,
            jitter: 0
        };
    }

    /**
     * Connect to multiplayer server
     */
    public async connect(playerId: string, authToken: string): Promise<boolean> {
        if (this.connectionState !== ConnectionState.DISCONNECTED &&
            this.connectionState !== ConnectionState.RECONNECTING) {
            console.log('Already connected or connecting');
            return false;
        }

        this.connectionState = ConnectionState.CONNECTING;
        this.localPlayerId = playerId;

        try {
            // Establish WebSocket connection
            this.websocket = new WebSocket(this.serverUrl);

            this.websocket.onopen = () => {
                console.log('WebSocket connected');
                this.connectionState = ConnectionState.CONNECTED;

                // Send authentication
                this.authenticate(playerId, authToken);
            };

            this.websocket.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.handleConnectionError();
            };

            this.websocket.onclose = () => {
                console.log('WebSocket closed');
                this.handleDisconnection();
            };

            return true;
        } catch (error) {
            console.error('Failed to connect:', error);
            this.connectionState = ConnectionState.DISCONNECTED;
            return false;
        }
    }

    /**
     * Authenticate with server
     */
    private authenticate(playerId: string, authToken: string): void {
        this.connectionState = ConnectionState.AUTHENTICATING;

        const authMessage: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: playerId,
            messageType: 'authenticate',
            data: {
                playerId,
                authToken
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(authMessage);
    }

    /**
     * Disconnect from server
     */
    public disconnect(): void {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        this.connectionState = ConnectionState.DISCONNECTED;
        this.currentSession = null;
        this.matchmakingStatus = MatchmakingStatus.IDLE;
    }

    /**
     * Handle incoming message
     */
    private handleMessage(data: string): void {
        try {
            const message: NetworkMessage = JSON.parse(data);

            this.networkStats.packetsReceived++;
            this.networkStats.bytesReceived += data.length;

            // Handle message based on type
            switch (message.messageType) {
                case 'auth_success':
                    this.handleAuthSuccess(message);
                    break;

                case 'auth_failed':
                    this.handleAuthFailed(message);
                    break;

                case 'game_state':
                    this.handleGameState(message);
                    break;

                case 'player_joined':
                    this.handlePlayerJoined(message);
                    break;

                case 'player_left':
                    this.handlePlayerLeft(message);
                    break;

                case 'matchmaking_result':
                    this.handleMatchmakingResult(message);
                    break;

                case 'chat_message':
                    this.handleChatMessage(message);
                    break;

                case 'party_invite':
                    this.handlePartyInvite(message);
                    break;

                case 'ping':
                    this.handlePing(message);
                    break;

                default:
                    // Trigger custom handlers
                    this.triggerMessageHandlers(message.messageType, message);
            }
        } catch (error) {
            console.error('Failed to handle message:', error);
        }
    }

    /**
     * Handle authentication success
     */
    private handleAuthSuccess(message: NetworkMessage): void {
        this.connectionState = ConnectionState.AUTHENTICATED;

        // Store player session info
        if (message.data.playerSession) {
            this.localPlayerSession = message.data.playerSession;
        }

        console.log('Authentication successful');
    }

    /**
     * Handle authentication failure
     */
    private handleAuthFailed(message: NetworkMessage): void {
        console.error('Authentication failed:', message.data.reason);
        this.disconnect();
    }

    /**
     * Handle game state update
     */
    private handleGameState(message: NetworkMessage): void {
        const state: GameStateSnapshot = message.data;

        // Update server tick
        this.serverTick = state.tick;

        // Store state in history
        this.stateHistory.push(state);

        // Limit history size
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift();
        }

        // Process any pending inputs that are now confirmed
        this.processPendingInputs(state.tick);
    }

    /**
     * Handle player joined
     */
    private handlePlayerJoined(message: NetworkMessage): void {
        if (!this.currentSession) return;

        const player: PlayerSession = message.data;
        this.currentSession.currentPlayers.set(player.playerId, player);

        console.log(`Player joined: ${player.username}`);
    }

    /**
     * Handle player left
     */
    private handlePlayerLeft(message: NetworkMessage): void {
        if (!this.currentSession) return;

        const playerId = message.data.playerId;
        this.currentSession.currentPlayers.delete(playerId);

        console.log(`Player left: ${playerId}`);
    }

    /**
     * Handle matchmaking result
     */
    private handleMatchmakingResult(message: NetworkMessage): void {
        this.matchmakingStatus = MatchmakingStatus.MATCH_FOUND;

        const result: MatchmakingResult = message.data;

        console.log(`Match found! ${result.players.length} players, avg rating: ${result.averageRating}`);

        // Auto-join match
        this.joinSession(result.matchId);
    }

    /**
     * Handle chat message
     */
    private handleChatMessage(message: NetworkMessage): void {
        const chatMessage: ChatMessage = message.data;

        this.chatHistory.push(chatMessage);

        // Limit history
        if (this.chatHistory.length > this.maxChatHistory) {
            this.chatHistory.shift();
        }

        console.log(`[CHAT] ${chatMessage.senderName}: ${chatMessage.message}`);
    }

    /**
     * Handle party invite
     */
    private handlePartyInvite(message: NetworkMessage): void {
        const invite: PartyInvite = message.data;

        this.pendingInvites.set(invite.inviteId, invite);

        console.log(`Party invite from ${invite.fromPlayerName}`);
    }

    /**
     * Handle ping message
     */
    private handlePing(message: NetworkMessage): void {
        // Send pong response
        const pong: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'pong',
            data: {
                pingMessageId: message.messageId,
                clientTimestamp: message.timestamp
            },
            reliable: false,
            ordered: false
        };

        this.sendMessage(pong);

        // Calculate RTT
        const rtt = Date.now() - message.timestamp;
        this.lagCompensation.roundTripTime = rtt;

        // Update average ping
        this.networkStats.averagePing =
            (this.networkStats.averagePing * 0.9) + (rtt * 0.1);
    }

    /**
     * Send network message
     */
    public sendMessage(message: NetworkMessage): boolean {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            console.error('Cannot send message: not connected');
            return false;
        }

        try {
            const data = JSON.stringify(message);

            this.websocket.send(data);

            this.networkStats.packetsSent++;
            this.networkStats.bytestSent += data.length;

            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    /**
     * Start matchmaking
     */
    public startMatchmaking(criteria: MatchmakingCriteria): void {
        if (this.connectionState !== ConnectionState.AUTHENTICATED) {
            console.error('Must be authenticated to start matchmaking');
            return;
        }

        this.matchmakingStatus = MatchmakingStatus.SEARCHING;
        this.matchmakingCriteria = criteria;
        this.matchmakingStartTime = Date.now();

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'start_matchmaking',
            data: criteria,
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        console.log('Matchmaking started...');
    }

    /**
     * Cancel matchmaking
     */
    public cancelMatchmaking(): void {
        if (this.matchmakingStatus !== MatchmakingStatus.SEARCHING) {
            return;
        }

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'cancel_matchmaking',
            data: {},
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        this.matchmakingStatus = MatchmakingStatus.IDLE;
        this.matchmakingCriteria = null;

        console.log('Matchmaking cancelled');
    }

    /**
     * Create game session (as host)
     */
    public createSession(gameMode: GameMode, settings: any): string {
        if (this.connectionState !== ConnectionState.AUTHENTICATED) {
            console.error('Must be authenticated to create session');
            return '';
        }

        const sessionId = this.generateSessionId();

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'create_session',
            data: {
                sessionId,
                gameMode,
                settings
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        this.isHost = true;

        return sessionId;
    }

    /**
     * Join game session
     */
    public joinSession(sessionId: string): void {
        if (this.connectionState !== ConnectionState.AUTHENTICATED) {
            console.error('Must be authenticated to join session');
            return;
        }

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'join_session',
            data: {
                sessionId
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        this.isHost = false;
    }

    /**
     * Leave current session
     */
    public leaveSession(): void {
        if (!this.currentSession) return;

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'leave_session',
            data: {
                sessionId: this.currentSession.sessionId
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        this.currentSession = null;
        this.isHost = false;
    }

    /**
     * Send player input
     */
    public sendInput(action: string, parameters: any): void {
        if (!this.currentSession) return;

        this.clientTick++;

        const input: InputCommand = {
            commandId: this.generateCommandId(),
            tick: this.clientTick,
            playerId: this.localPlayerId,
            action,
            parameters,
            timestamp: Date.now()
        };

        // Store in pending inputs
        this.pendingInputs.push(input);

        // Send to server
        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'player_input',
            data: input,
            reliable: false,  // Inputs can be unreliable for better latency
            ordered: false
        };

        this.sendMessage(message);
    }

    /**
     * Process pending inputs
     */
    private processPendingInputs(confirmedTick: number): void {
        // Remove confirmed inputs
        this.pendingInputs = this.pendingInputs.filter(
            input => input.tick > confirmedTick
        );
    }

    /**
     * Send chat message
     */
    public sendChatMessage(message: string, type: 'all' | 'team' | 'whisper' = 'all', recipient?: string): void {
        if (!this.localPlayerSession) return;

        const chatMessage: ChatMessage = {
            messageId: this.generateMessageId(),
            senderId: this.localPlayerId,
            senderName: this.localPlayerSession.username,
            message,
            timestamp: new Date(),
            type,
            recipient
        };

        const networkMessage: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'chat_message',
            data: chatMessage,
            reliable: true,
            ordered: true
        };

        this.sendMessage(networkMessage);

        // Add to local history
        this.chatHistory.push(chatMessage);
    }

    /**
     * Create party
     */
    public createParty(maxSize: number = 4): string {
        const partyId = this.generatePartyId();

        if (!this.localPlayerSession) return '';

        this.currentParty = {
            partyId,
            leaderId: this.localPlayerId,
            members: new Map([[this.localPlayerId, this.localPlayerSession]]),
            maxSize,
            isOpen: true
        };

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'create_party',
            data: {
                partyId,
                maxSize
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        return partyId;
    }

    /**
     * Invite player to party
     */
    public inviteToParty(playerId: string): void {
        if (!this.currentParty || this.currentParty.leaderId !== this.localPlayerId) {
            console.error('Must be party leader to invite');
            return;
        }

        const inviteId = this.generateInviteId();

        const invite: PartyInvite = {
            inviteId,
            fromPlayerId: this.localPlayerId,
            fromPlayerName: this.localPlayerSession?.username || 'Unknown',
            toPlayerId: playerId,
            partyId: this.currentParty.partyId,
            timestamp: new Date(),
            expiresAt: new Date(Date.now() + 60000), // 1 minute
            status: 'pending'
        };

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'party_invite',
            data: invite,
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);
    }

    /**
     * Accept party invite
     */
    public acceptPartyInvite(inviteId: string): void {
        const invite = this.pendingInvites.get(inviteId);
        if (!invite || invite.status !== 'pending') return;

        invite.status = 'accepted';

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'party_invite_response',
            data: {
                inviteId,
                accepted: true
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        this.pendingInvites.delete(inviteId);
    }

    /**
     * Decline party invite
     */
    public declinePartyInvite(inviteId: string): void {
        const invite = this.pendingInvites.get(inviteId);
        if (!invite || invite.status !== 'pending') return;

        invite.status = 'declined';

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'party_invite_response',
            data: {
                inviteId,
                accepted: false
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        this.pendingInvites.delete(inviteId);
    }

    /**
     * Leave party
     */
    public leaveParty(): void {
        if (!this.currentParty) return;

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'leave_party',
            data: {
                partyId: this.currentParty.partyId
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        this.currentParty = null;
    }

    /**
     * Get leaderboard
     */
    public async fetchLeaderboard(
        category: Leaderboard['category'],
        timeframe: Leaderboard['timeframe']
    ): Promise<Leaderboard | null> {
        const leaderboardId = `${category}_${timeframe}`;

        const message: NetworkMessage = {
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            messageType: 'fetch_leaderboard',
            data: {
                category,
                timeframe
            },
            reliable: true,
            ordered: true
        };

        this.sendMessage(message);

        // In real implementation, would wait for response
        return null;
    }

    /**
     * Update network statistics
     */
    public updateNetworkStats(deltaTime: number): void {
        // Would calculate packet loss, jitter, etc.
    }

    /**
     * Handle connection error
     */
    private handleConnectionError(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.connectionState = ConnectionState.RECONNECTING;

            console.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            // Try to reconnect after delay
            setTimeout(() => {
                if (this.localPlayerId) {
                    this.connect(this.localPlayerId, ''); // Would need to store auth token
                }
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            this.connectionState = ConnectionState.DISCONNECTED;
        }
    }

    /**
     * Handle disconnection
     */
    private handleDisconnection(): void {
        this.connectionState = ConnectionState.DISCONNECTED;
        this.currentSession = null;
        this.matchmakingStatus = MatchmakingStatus.IDLE;
    }

    /**
     * Register message handler
     */
    public onMessage(messageType: string, handler: (message: NetworkMessage) => void): void {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }

        this.messageHandlers.get(messageType)!.push(handler);
    }

    /**
     * Trigger message handlers
     */
    private triggerMessageHandlers(messageType: string, message: NetworkMessage): void {
        const handlers = this.messageHandlers.get(messageType);
        if (!handlers) return;

        for (const handler of handlers) {
            try {
                handler(message);
            } catch (error) {
                console.error(`Error in message handler for ${messageType}:`, error);
            }
        }
    }

    /**
     * Generate unique IDs
     */
    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateCommandId(): string {
        return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generatePartyId(): string {
        return `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateInviteId(): string {
        return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get connection state
     */
    public getConnectionState(): ConnectionState {
        return this.connectionState;
    }

    /**
     * Get matchmaking status
     */
    public getMatchmakingStatus(): MatchmakingStatus {
        return this.matchmakingStatus;
    }

    /**
     * Get current session
     */
    public getCurrentSession(): GameSession | null {
        return this.currentSession;
    }

    /**
     * Get network statistics
     */
    public getNetworkStats() {
        return { ...this.networkStats };
    }

    /**
     * Get chat history
     */
    public getChatHistory(): ChatMessage[] {
        return [...this.chatHistory];
    }

    /**
     * Get current party
     */
    public getCurrentParty(): Party | null {
        return this.currentParty;
    }

    /**
     * Get pending invites
     */
    public getPendingInvites(): PartyInvite[] {
        return Array.from(this.pendingInvites.values());
    }

    /**
     * Dispose multiplayer system
     */
    public dispose(): void {
        this.disconnect();
        this.messageHandlers.clear();
        this.pendingInvites.clear();
        this.chatHistory = [];
        this.stateHistory = [];
        this.pendingInputs = [];
    }
}
