import { Observable } from '@babylonjs/core';

/**
 * Friend status
 */
export enum FriendStatus {
    NONE = 'none',
    PENDING_SENT = 'pending_sent',
    PENDING_RECEIVED = 'pending_received',
    FRIENDS = 'friends',
    BLOCKED = 'blocked'
}

/**
 * Online status
 */
export enum OnlineStatus {
    ONLINE = 'online',
    AWAY = 'away',
    BUSY = 'busy',
    OFFLINE = 'offline',
    IN_GAME = 'in_game',
    IN_MATCH = 'in_match'
}

/**
 * Friend data
 */
export interface Friend {
    playerId: string;
    username: string;
    displayName: string;
    avatar?: string;
    level: number;
    status: FriendStatus;
    onlineStatus: OnlineStatus;
    lastOnline: number;
    addedDate: number;
    favorited?: boolean;
    metadata?: {
        gamesPlayed?: number;
        winRate?: number;
        rank?: number;
        team?: string;
    };
}

/**
 * Friend request
 */
export interface FriendRequest {
    id: string;
    fromPlayerId: string;
    toPlayerId: string;
    fromUsername: string;
    message?: string;
    timestamp: number;
    expiryDate?: number;
}

/**
 * Party member
 */
export interface PartyMember {
    playerId: string;
    username: string;
    level: number;
    ready: boolean;
    leader: boolean;
    joinedAt: number;
}

/**
 * Party
 */
export interface Party {
    id: string;
    leaderId: string;
    members: Map<string, PartyMember>;
    maxSize: number;
    isPublic: boolean;
    inviteOnly: boolean;
    createdAt: number;
    activity?: string;
}

/**
 * Chat message
 */
export interface ChatMessage {
    id: string;
    fromPlayerId: string;
    fromUsername: string;
    toPlayerId?: string;
    channelId?: string;
    message: string;
    timestamp: number;
    edited?: boolean;
    editedAt?: number;
    deleted?: boolean;
    metadata?: {
        mentions?: string[];
        attachments?: string[];
    };
}

/**
 * Chat channel
 */
export interface ChatChannel {
    id: string;
    name: string;
    type: 'direct' | 'party' | 'team' | 'global' | 'custom';
    participants: Set<string>;
    messages: ChatMessage[];
    maxMessages: number;
    createdAt: number;
    muted?: boolean;
}

/**
 * Guild/Team
 */
export interface Guild {
    id: string;
    name: string;
    tag: string;
    description: string;
    ownerId: string;
    officers: Set<string>;
    members: Map<string, GuildMember>;
    maxMembers: number;
    level: number;
    experience: number;
    createdAt: number;
    isPublic: boolean;
    requirements?: {
        minLevel?: number;
        minRank?: number;
        applicationRequired?: boolean;
    };
    perks?: Map<string, number>;
    metadata?: {
        wins?: number;
        losses?: number;
        tournamentWins?: number;
    };
}

/**
 * Guild member
 */
export interface GuildMember {
    playerId: string;
    username: string;
    rank: 'member' | 'officer' | 'owner';
    joinedAt: number;
    contribution: number;
    lastActive: number;
}

/**
 * Guild application
 */
export interface GuildApplication {
    id: string;
    guildId: string;
    playerId: string;
    username: string;
    message: string;
    timestamp: number;
    status: 'pending' | 'accepted' | 'rejected';
}

/**
 * Player profile
 */
export interface PlayerProfile {
    playerId: string;
    username: string;
    displayName: string;
    avatar: string;
    banner?: string;
    level: number;
    prestigeLevel: number;
    title?: string;
    badges: string[];
    stats: {
        gamesPlayed: number;
        gamesWon: number;
        winRate: number;
        battingAverage: number;
        homeRuns: number;
        strikeouts: number;
        [key: string]: number;
    };
    achievements: {
        total: number;
        unlocked: number;
        points: number;
    };
    createdAt: number;
    lastActive: number;
    privacy: {
        showStats: boolean;
        showFriends: boolean;
        allowFriendRequests: boolean;
        allowPartyInvites: boolean;
    };
}

/**
 * Notification
 */
export interface SocialNotification {
    id: string;
    type: 'friend_request' | 'party_invite' | 'guild_invite' | 'message' | 'achievement' | 'custom';
    fromPlayerId?: string;
    fromUsername?: string;
    message: string;
    timestamp: number;
    read: boolean;
    actionable?: boolean;
    actionData?: any;
    expiryDate?: number;
}

/**
 * Party invite
 */
export interface PartyInvite {
    id: string;
    partyId: string;
    fromPlayerId: string;
    toPlayerId: string;
    fromUsername: string;
    timestamp: number;
    expiryDate: number;
}

/**
 * Gift
 */
export interface Gift {
    id: string;
    fromPlayerId: string;
    toPlayerId: string;
    itemId: string;
    quantity: number;
    message?: string;
    timestamp: number;
    claimed: boolean;
}

/**
 * Social System
 * Comprehensive social features including friends, parties, guilds, chat
 */
export class SocialSystem {
    // Current player ID
    private currentPlayerId: string = '';

    // Friends
    private friends: Map<string, Friend> = new Map();
    private friendRequests: Map<string, FriendRequest> = new Map();
    private blockedPlayers: Set<string> = new Set();

    // Party
    private currentParty?: Party;
    private partyInvites: Map<string, PartyInvite> = new Map();

    // Chat
    private chatChannels: Map<string, ChatChannel> = new Map();
    private mutedPlayers: Set<string> = new Set();

    // Guild
    private currentGuild?: Guild;
    private guildApplications: Map<string, GuildApplication> = new Map();

    // Notifications
    private notifications: SocialNotification[] = [];
    private maxNotifications: number = 100;

    // Gifts
    private pendingGifts: Map<string, Gift> = new Map();

    // Player cache
    private playerProfiles: Map<string, PlayerProfile> = new Map();

    // Observables
    private onFriendAddedObservable: Observable<Friend> = new Observable();
    private onFriendRemovedObservable: Observable<string> = new Observable();
    private onFriendRequestReceivedObservable: Observable<FriendRequest> = new Observable();
    private onPartyInviteObservable: Observable<PartyInvite> = new Observable();
    private onPartyMemberJoinedObservable: Observable<PartyMember> = new Observable();
    private onPartyMemberLeftObservable: Observable<string> = new Observable();
    private onChatMessageObservable: Observable<ChatMessage> = new Observable();
    private onNotificationObservable: Observable<SocialNotification> = new Observable();
    private onGuildInviteObservable: Observable<Guild> = new Observable();

    // Settings
    private enabled: boolean = true;
    private maxFriends: number = 200;
    private maxPartySize: number = 6;
    private chatHistorySize: number = 500;

    // Server connection
    private serverUrl?: string;
    private connected: boolean = false;

    constructor(playerId: string, serverUrl?: string) {
        this.currentPlayerId = playerId;
        this.serverUrl = serverUrl;
        this.initializeDefaultChannels();
    }

    /**
     * Initialize default chat channels
     */
    private initializeDefaultChannels(): void {
        this.chatChannels.set('global', {
            id: 'global',
            name: 'Global',
            type: 'global',
            participants: new Set(),
            messages: [],
            maxMessages: this.chatHistorySize,
            createdAt: Date.now()
        });
    }

    /**
     * Send friend request
     */
    public async sendFriendRequest(targetPlayerId: string, message?: string): Promise<boolean> {
        if (!this.enabled) return false;

        // Check if already friends or blocked
        if (this.friends.has(targetPlayerId) || this.blockedPlayers.has(targetPlayerId)) {
            return false;
        }

        // Check friend limit
        if (this.friends.size >= this.maxFriends) {
            console.warn('Friend limit reached');
            return false;
        }

        const requestId = this.generateId('freq');
        const request: FriendRequest = {
            id: requestId,
            fromPlayerId: this.currentPlayerId,
            toPlayerId: targetPlayerId,
            fromUsername: 'Current Player', // Would be fetched from profile
            message,
            timestamp: Date.now(),
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        };

        this.friendRequests.set(requestId, request);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/friends/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request)
                });
            } catch (error) {
                console.error('Failed to send friend request:', error);
            }
        }

        return true;
    }

    /**
     * Accept friend request
     */
    public async acceptFriendRequest(requestId: string): Promise<boolean> {
        const request = this.friendRequests.get(requestId);
        if (!request) return false;

        // Create friend entry
        const friend: Friend = {
            playerId: request.fromPlayerId,
            username: request.fromUsername,
            displayName: request.fromUsername,
            level: 1, // Would be fetched from profile
            status: FriendStatus.FRIENDS,
            onlineStatus: OnlineStatus.OFFLINE,
            lastOnline: Date.now(),
            addedDate: Date.now()
        };

        this.friends.set(request.fromPlayerId, friend);
        this.friendRequests.delete(requestId);

        // Notify observers
        this.onFriendAddedObservable.notifyObservers(friend);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/friends/accept`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestId })
                });
            } catch (error) {
                console.error('Failed to accept friend request:', error);
            }
        }

        return true;
    }

    /**
     * Reject friend request
     */
    public async rejectFriendRequest(requestId: string): Promise<boolean> {
        const request = this.friendRequests.get(requestId);
        if (!request) return false;

        this.friendRequests.delete(requestId);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/friends/reject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestId })
                });
            } catch (error) {
                console.error('Failed to reject friend request:', error);
            }
        }

        return true;
    }

    /**
     * Remove friend
     */
    public async removeFriend(playerId: string): Promise<boolean> {
        if (!this.friends.has(playerId)) return false;

        this.friends.delete(playerId);

        // Close direct message channel if exists
        const dmChannelId = this.getDirectMessageChannelId(playerId);
        this.chatChannels.delete(dmChannelId);

        // Notify observers
        this.onFriendRemovedObservable.notifyObservers(playerId);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/friends/remove`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId })
                });
            } catch (error) {
                console.error('Failed to remove friend:', error);
            }
        }

        return true;
    }

    /**
     * Block player
     */
    public async blockPlayer(playerId: string): Promise<boolean> {
        // Remove from friends if applicable
        if (this.friends.has(playerId)) {
            await this.removeFriend(playerId);
        }

        this.blockedPlayers.add(playerId);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/friends/block`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId })
                });
            } catch (error) {
                console.error('Failed to block player:', error);
            }
        }

        return true;
    }

    /**
     * Unblock player
     */
    public async unblockPlayer(playerId: string): Promise<boolean> {
        this.blockedPlayers.delete(playerId);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/friends/unblock`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId })
                });
            } catch (error) {
                console.error('Failed to unblock player:', error);
            }
        }

        return true;
    }

    /**
     * Create party
     */
    public createParty(isPublic: boolean = false, inviteOnly: boolean = true): Party | null {
        if (this.currentParty) {
            console.warn('Already in a party');
            return null;
        }

        const partyId = this.generateId('party');
        const party: Party = {
            id: partyId,
            leaderId: this.currentPlayerId,
            members: new Map(),
            maxSize: this.maxPartySize,
            isPublic,
            inviteOnly,
            createdAt: Date.now()
        };

        // Add self as leader
        party.members.set(this.currentPlayerId, {
            playerId: this.currentPlayerId,
            username: 'Current Player',
            level: 1,
            ready: false,
            leader: true,
            joinedAt: Date.now()
        });

        this.currentParty = party;

        // Create party chat channel
        const channelId = `party_${partyId}`;
        this.chatChannels.set(channelId, {
            id: channelId,
            name: 'Party Chat',
            type: 'party',
            participants: new Set([this.currentPlayerId]),
            messages: [],
            maxMessages: this.chatHistorySize,
            createdAt: Date.now()
        });

        return party;
    }

    /**
     * Invite player to party
     */
    public async inviteToParty(playerId: string): Promise<boolean> {
        if (!this.currentParty) return false;

        // Check if player is friend
        if (!this.friends.has(playerId)) {
            console.warn('Can only invite friends to party');
            return false;
        }

        // Check party size
        if (this.currentParty.members.size >= this.currentParty.maxSize) {
            console.warn('Party is full');
            return false;
        }

        const inviteId = this.generateId('pinv');
        const invite: PartyInvite = {
            id: inviteId,
            partyId: this.currentParty.id,
            fromPlayerId: this.currentPlayerId,
            toPlayerId: playerId,
            fromUsername: 'Current Player',
            timestamp: Date.now(),
            expiryDate: Date.now() + 5 * 60 * 1000 // 5 minutes
        };

        this.partyInvites.set(inviteId, invite);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/party/invite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(invite)
                });
            } catch (error) {
                console.error('Failed to send party invite:', error);
            }
        }

        return true;
    }

    /**
     * Accept party invite
     */
    public async acceptPartyInvite(inviteId: string): Promise<boolean> {
        const invite = this.partyInvites.get(inviteId);
        if (!invite) return false;

        // Leave current party if in one
        if (this.currentParty) {
            await this.leaveParty();
        }

        // Would join the party via server
        this.partyInvites.delete(inviteId);

        return true;
    }

    /**
     * Leave party
     */
    public async leaveParty(): Promise<boolean> {
        if (!this.currentParty) return false;

        const partyId = this.currentParty.id;
        const isLeader = this.currentParty.leaderId === this.currentPlayerId;

        this.currentParty = undefined;

        // Remove party chat channel
        const channelId = `party_${partyId}`;
        this.chatChannels.delete(channelId);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/party/leave`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ partyId, isLeader })
                });
            } catch (error) {
                console.error('Failed to leave party:', error);
            }
        }

        return true;
    }

    /**
     * Kick party member
     */
    public async kickPartyMember(playerId: string): Promise<boolean> {
        if (!this.currentParty || this.currentParty.leaderId !== this.currentPlayerId) {
            return false;
        }

        if (!this.currentParty.members.has(playerId)) {
            return false;
        }

        this.currentParty.members.delete(playerId);

        // Notify observers
        this.onPartyMemberLeftObservable.notifyObservers(playerId);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/party/kick`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ partyId: this.currentParty.id, playerId })
                });
            } catch (error) {
                console.error('Failed to kick party member:', error);
            }
        }

        return true;
    }

    /**
     * Send chat message
     */
    public async sendChatMessage(
        message: string,
        channelId?: string,
        toPlayerId?: string
    ): Promise<ChatMessage | null> {
        if (!this.enabled) return null;

        // Determine channel
        let channel: ChatChannel | undefined;

        if (toPlayerId) {
            // Direct message
            const dmChannelId = this.getDirectMessageChannelId(toPlayerId);
            channel = this.chatChannels.get(dmChannelId);

            if (!channel) {
                // Create DM channel
                channel = {
                    id: dmChannelId,
                    name: `DM with ${toPlayerId}`,
                    type: 'direct',
                    participants: new Set([this.currentPlayerId, toPlayerId]),
                    messages: [],
                    maxMessages: this.chatHistorySize,
                    createdAt: Date.now()
                };
                this.chatChannels.set(dmChannelId, channel);
            }
        } else if (channelId) {
            channel = this.chatChannels.get(channelId);
        }

        if (!channel) {
            console.error('Channel not found');
            return null;
        }

        const chatMessage: ChatMessage = {
            id: this.generateId('msg'),
            fromPlayerId: this.currentPlayerId,
            fromUsername: 'Current Player',
            toPlayerId,
            channelId: channel.id,
            message,
            timestamp: Date.now()
        };

        channel.messages.push(chatMessage);

        // Trim old messages
        if (channel.messages.length > channel.maxMessages) {
            channel.messages.shift();
        }

        // Notify observers
        this.onChatMessageObservable.notifyObservers(chatMessage);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/chat/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(chatMessage)
                });
            } catch (error) {
                console.error('Failed to send chat message:', error);
            }
        }

        return chatMessage;
    }

    /**
     * Get direct message channel ID
     */
    private getDirectMessageChannelId(playerId: string): string {
        const ids = [this.currentPlayerId, playerId].sort();
        return `dm_${ids[0]}_${ids[1]}`;
    }

    /**
     * Create guild
     */
    public async createGuild(
        name: string,
        tag: string,
        description: string,
        isPublic: boolean = true
    ): Promise<Guild | null> {
        if (this.currentGuild) {
            console.warn('Already in a guild');
            return null;
        }

        const guildId = this.generateId('guild');
        const guild: Guild = {
            id: guildId,
            name,
            tag,
            description,
            ownerId: this.currentPlayerId,
            officers: new Set(),
            members: new Map(),
            maxMembers: 50,
            level: 1,
            experience: 0,
            createdAt: Date.now(),
            isPublic
        };

        // Add self as owner
        guild.members.set(this.currentPlayerId, {
            playerId: this.currentPlayerId,
            username: 'Current Player',
            rank: 'owner',
            joinedAt: Date.now(),
            contribution: 0,
            lastActive: Date.now()
        });

        this.currentGuild = guild;

        // Create guild chat channel
        const channelId = `guild_${guildId}`;
        this.chatChannels.set(channelId, {
            id: channelId,
            name: 'Guild Chat',
            type: 'team',
            participants: new Set([this.currentPlayerId]),
            messages: [],
            maxMessages: this.chatHistorySize,
            createdAt: Date.now()
        });

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/guild/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(guild)
                });
            } catch (error) {
                console.error('Failed to create guild:', error);
            }
        }

        return guild;
    }

    /**
     * Apply to guild
     */
    public async applyToGuild(guildId: string, message: string): Promise<boolean> {
        if (this.currentGuild) {
            console.warn('Already in a guild');
            return false;
        }

        const applicationId = this.generateId('gapp');
        const application: GuildApplication = {
            id: applicationId,
            guildId,
            playerId: this.currentPlayerId,
            username: 'Current Player',
            message,
            timestamp: Date.now(),
            status: 'pending'
        };

        this.guildApplications.set(applicationId, application);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/guild/apply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(application)
                });
            } catch (error) {
                console.error('Failed to apply to guild:', error);
            }
        }

        return true;
    }

    /**
     * Leave guild
     */
    public async leaveGuild(): Promise<boolean> {
        if (!this.currentGuild) return false;

        const guildId = this.currentGuild.id;
        this.currentGuild = undefined;

        // Remove guild chat channel
        const channelId = `guild_${guildId}`;
        this.chatChannels.delete(channelId);

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/guild/leave`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ guildId })
                });
            } catch (error) {
                console.error('Failed to leave guild:', error);
            }
        }

        return true;
    }

    /**
     * Add notification
     */
    public addNotification(notification: Omit<SocialNotification, 'id'>): void {
        const fullNotification: SocialNotification = {
            id: this.generateId('notif'),
            ...notification
        };

        this.notifications.push(fullNotification);

        // Trim old notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.shift();
        }

        this.onNotificationObservable.notifyObservers(fullNotification);
    }

    /**
     * Mark notification as read
     */
    public markNotificationRead(notificationId: string): void {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }

    /**
     * Clear all notifications
     */
    public clearNotifications(): void {
        this.notifications = [];
    }

    /**
     * Send gift
     */
    public async sendGift(toPlayerId: string, itemId: string, quantity: number, message?: string): Promise<boolean> {
        if (!this.friends.has(toPlayerId)) {
            console.warn('Can only send gifts to friends');
            return false;
        }

        const giftId = this.generateId('gift');
        const gift: Gift = {
            id: giftId,
            fromPlayerId: this.currentPlayerId,
            toPlayerId,
            itemId,
            quantity,
            message,
            timestamp: Date.now(),
            claimed: false
        };

        // Send to server
        if (this.serverUrl && this.connected) {
            try {
                await fetch(`${this.serverUrl}/gift/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gift)
                });
            } catch (error) {
                console.error('Failed to send gift:', error);
                return false;
            }
        }

        return true;
    }

    /**
     * Get friends
     */
    public getFriends(onlineOnly: boolean = false): Friend[] {
        let friends = Array.from(this.friends.values());

        if (onlineOnly) {
            friends = friends.filter(f => f.onlineStatus !== OnlineStatus.OFFLINE);
        }

        return friends.sort((a, b) => {
            // Online friends first
            if (a.onlineStatus !== OnlineStatus.OFFLINE && b.onlineStatus === OnlineStatus.OFFLINE) {
                return -1;
            }
            if (a.onlineStatus === OnlineStatus.OFFLINE && b.onlineStatus !== OnlineStatus.OFFLINE) {
                return 1;
            }
            // Then by favorited
            if (a.favorited && !b.favorited) return -1;
            if (!a.favorited && b.favorited) return 1;
            // Then alphabetically
            return a.username.localeCompare(b.username);
        });
    }

    /**
     * Get friend requests
     */
    public getFriendRequests(): FriendRequest[] {
        return Array.from(this.friendRequests.values())
            .filter(r => r.toPlayerId === this.currentPlayerId);
    }

    /**
     * Get current party
     */
    public getCurrentParty(): Party | undefined {
        return this.currentParty;
    }

    /**
     * Get party invites
     */
    public getPartyInvites(): PartyInvite[] {
        return Array.from(this.partyInvites.values())
            .filter(i => i.toPlayerId === this.currentPlayerId);
    }

    /**
     * Get chat channel
     */
    public getChatChannel(channelId: string): ChatChannel | undefined {
        return this.chatChannels.get(channelId);
    }

    /**
     * Get all chat channels
     */
    public getChatChannels(): ChatChannel[] {
        return Array.from(this.chatChannels.values());
    }

    /**
     * Get current guild
     */
    public getCurrentGuild(): Guild | undefined {
        return this.currentGuild;
    }

    /**
     * Get notifications
     */
    public getNotifications(unreadOnly: boolean = false): SocialNotification[] {
        let notifications = [...this.notifications].reverse();

        if (unreadOnly) {
            notifications = notifications.filter(n => !n.read);
        }

        return notifications;
    }

    /**
     * Get pending gifts
     */
    public getPendingGifts(): Gift[] {
        return Array.from(this.pendingGifts.values())
            .filter(g => !g.claimed);
    }

    /**
     * Subscribe to friend added
     */
    public onFriendAdded(callback: (friend: Friend) => void): void {
        this.onFriendAddedObservable.add(callback);
    }

    /**
     * Subscribe to friend removed
     */
    public onFriendRemoved(callback: (playerId: string) => void): void {
        this.onFriendRemovedObservable.add(callback);
    }

    /**
     * Subscribe to friend request received
     */
    public onFriendRequestReceived(callback: (request: FriendRequest) => void): void {
        this.onFriendRequestReceivedObservable.add(callback);
    }

    /**
     * Subscribe to party invite
     */
    public onPartyInvite(callback: (invite: PartyInvite) => void): void {
        this.onPartyInviteObservable.add(callback);
    }

    /**
     * Subscribe to chat message
     */
    public onChatMessage(callback: (message: ChatMessage) => void): void {
        this.onChatMessageObservable.add(callback);
    }

    /**
     * Subscribe to notification
     */
    public onNotification(callback: (notification: SocialNotification) => void): void {
        this.onNotificationObservable.add(callback);
    }

    /**
     * Generate unique ID
     */
    private generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Set server URL
     */
    public setServerUrl(url: string): void {
        this.serverUrl = url;
    }

    /**
     * Set connected status
     */
    public setConnected(connected: boolean): void {
        this.connected = connected;
    }

    /**
     * Export social data
     */
    public exportData(): string {
        const data = {
            friends: Array.from(this.friends.entries()),
            blockedPlayers: Array.from(this.blockedPlayers),
            currentParty: this.currentParty,
            currentGuild: this.currentGuild,
            notifications: this.notifications,
            mutedPlayers: Array.from(this.mutedPlayers)
        };

        return JSON.stringify(data);
    }

    /**
     * Import social data
     */
    public importData(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this.friends = new Map(parsed.friends);
            this.blockedPlayers = new Set(parsed.blockedPlayers);
            this.currentParty = parsed.currentParty;
            this.currentGuild = parsed.currentGuild;
            this.notifications = parsed.notifications || [];
            this.mutedPlayers = new Set(parsed.mutedPlayers || []);
        } catch (error) {
            console.error('Failed to import social data:', error);
        }
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.friends.clear();
        this.friendRequests.clear();
        this.blockedPlayers.clear();
        this.chatChannels.clear();
        this.partyInvites.clear();
        this.guildApplications.clear();
        this.pendingGifts.clear();

        this.onFriendAddedObservable.clear();
        this.onFriendRemovedObservable.clear();
        this.onFriendRequestReceivedObservable.clear();
        this.onPartyInviteObservable.clear();
        this.onPartyMemberJoinedObservable.clear();
        this.onPartyMemberLeftObservable.clear();
        this.onChatMessageObservable.clear();
        this.onNotificationObservable.clear();
        this.onGuildInviteObservable.clear();
    }
}
