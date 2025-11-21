/**
 * Comprehensive Economy and Monetization System for Sandlot Sluggers
 * Manages in-game currencies, purchases, and monetization
 *
 * Features:
 * - Multiple currency types (coins, gems, tickets, season points)
 * - Virtual store with dynamic pricing
 * - Real money transactions (IAP)
 * - Daily deals and flash sales
 * - Bundle system
 * - Season pass and battle pass
 * - Loot boxes and packs
 * - Crafting economy
 * - Trading system between players
 * - Auction house
 * - Currency conversion
 * - Price elasticity and demand modeling
 * - Promotional offers
 * - Reward multipliers and boosters
 * - Transaction history and analytics
 */

import { Observable } from '@babylonjs/core/Misc/observable';

export enum CurrencyType {
    COINS = 'coins',
    GEMS = 'gems',
    TICKETS = 'tickets',
    SEASON_POINTS = 'season_points',
    PREMIUM_CURRENCY = 'premium_currency',
    EVENT_TOKENS = 'event_tokens'
}

export enum PurchaseType {
    DIRECT = 'direct',
    BUNDLE = 'bundle',
    LOOT_BOX = 'loot_box',
    SUBSCRIPTION = 'subscription',
    BATTLE_PASS = 'battle_pass',
    SEASON_PASS = 'season_pass'
}

export enum ItemRarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary',
    MYTHIC = 'mythic'
}

export enum StoreCategory {
    FEATURED = 'featured',
    CHARACTERS = 'characters',
    EQUIPMENT = 'equipment',
    COSMETICS = 'cosmetics',
    BUNDLES = 'bundles',
    CURRENCY = 'currency',
    LOOT_BOXES = 'loot_boxes',
    SPECIAL_OFFERS = 'special_offers',
    SEASONAL = 'seasonal'
}

export interface Currency {
    type: CurrencyType;
    amount: number;
    isPremium: boolean;
}

export interface Wallet {
    playerId: string;
    currencies: Map<CurrencyType, number>;
    lifetimeEarned: Map<CurrencyType, number>;
    lifetimeSpent: Map<CurrencyType, number>;
}

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    category: StoreCategory;
    rarity: ItemRarity;
    price: Currency[];
    realMoneyPrice?: number; // In USD cents
    discount?: number; // Percentage 0-100
    originalPrice?: Currency[];
    stock?: number; // Null = unlimited
    purchaseLimit?: number; // Per player
    purchaseCount: number; // Per player
    featured: boolean;
    isNew: boolean;
    isLimitedTime: boolean;
    expirationDate?: Date;
    requiredLevel?: number;
    requiredAchievement?: string;
    tags: string[];
    previewImage: string;
}

export interface Bundle {
    id: string;
    name: string;
    description: string;
    items: BundleItem[];
    totalValue: Currency[];
    price: Currency[];
    realMoneyPrice?: number;
    discount: number;
    featured: boolean;
    isLimitedTime: boolean;
    expirationDate?: Date;
    purchaseLimit?: number;
    previewImage: string;
}

export interface BundleItem {
    itemId: string;
    itemType: string;
    quantity: number;
    value: Currency[];
}

export interface LootBox {
    id: string;
    name: string;
    description: string;
    price: Currency[];
    realMoneyPrice?: number;
    contents: LootBoxPool[];
    guaranteedItems?: string[];
    previewImage: string;
    animations: string[];
}

export interface LootBoxPool {
    rarity: ItemRarity;
    dropRate: number; // 0-1
    items: LootBoxItem[];
}

export interface LootBoxItem {
    itemId: string;
    itemType: string;
    quantity: number;
    weight: number;
}

export interface Transaction {
    id: string;
    playerId: string;
    timestamp: Date;
    type: 'purchase' | 'earn' | 'spend' | 'trade' | 'gift';
    itemId?: string;
    currencyChanges: Map<CurrencyType, number>;
    realMoneyAmount?: number;
    paymentMethod?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    metadata?: any;
}

export interface DailyDeal {
    id: string;
    item: StoreItem;
    discountPercentage: number;
    expiresAt: Date;
}

export interface FlashSale {
    id: string;
    items: StoreItem[];
    discountPercentage: number;
    startTime: Date;
    endTime: Date;
    notified: boolean;
}

export interface Subscription {
    id: string;
    name: string;
    description: string;
    pricePerMonth: number;
    benefits: SubscriptionBenefit[];
    active: boolean;
    startDate: Date;
    nextBillingDate: Date;
    autoRenew: boolean;
}

export interface SubscriptionBenefit {
    type: string;
    value: number;
    description: string;
}

export interface SeasonPass {
    id: string;
    seasonNumber: number;
    tiers: SeasonPassTier[];
    currentTier: number;
    experience: number;
    purchased: boolean;
    price: Currency[];
    realMoneyPrice: number;
}

export interface SeasonPassTier {
    tier: number;
    experienceRequired: number;
    freeRewards: PassReward[];
    premiumRewards: PassReward[];
}

export interface PassReward {
    itemId: string;
    itemType: string;
    quantity: number;
    rarity: ItemRarity;
}

export interface TradeOffer {
    id: string;
    fromPlayerId: string;
    toPlayerId: string;
    offeredItems: TradeItem[];
    requestedItems: TradeItem[];
    offeredCurrency: Map<CurrencyType, number>;
    requestedCurrency: Map<CurrencyType, number>;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
    createdAt: Date;
    expiresAt: Date;
}

export interface TradeItem {
    itemId: string;
    itemType: string;
    quantity: number;
}

export interface AuctionListing {
    id: string;
    sellerId: string;
    itemId: string;
    itemType: string;
    quantity: number;
    startingBid: number;
    currentBid: number;
    buyoutPrice?: number;
    currentBidder?: string;
    bidHistory: AuctionBid[];
    startTime: Date;
    endTime: Date;
    status: 'active' | 'sold' | 'expired' | 'cancelled';
}

export interface AuctionBid {
    bidderId: string;
    amount: number;
    timestamp: Date;
}

export interface PriceHistory {
    itemId: string;
    dataPoints: PriceDataPoint[];
}

export interface PriceDataPoint {
    timestamp: Date;
    price: number;
    volume: number;
}

export interface PlayerEconomyStats {
    playerId: string;
    totalEarned: Map<CurrencyType, number>;
    totalSpent: Map<CurrencyType, number>;
    totalRealMoneySpent: number;
    purchaseHistory: Transaction[];
    favoriteCategories: Map<StoreCategory, number>;
    averageSessionSpending: number;
    daysSinceLastPurchase: number;
    lifetimeValue: number;
}

export class EconomySystem {
    private wallets: Map<string, Wallet>;
    private storeItems: Map<string, StoreItem>;
    private bundles: Map<string, Bundle>;
    private lootBoxes: Map<string, LootBox>;
    private transactions: Map<string, Transaction>;
    private dailyDeals: Map<string, DailyDeal>;
    private flashSales: FlashSale[];
    private subscriptions: Map<string, Subscription>;
    private seasonPasses: Map<string, SeasonPass>;
    private tradeOffers: Map<string, TradeOffer>;
    private auctionListings: Map<string, AuctionListing>;
    private priceHistory: Map<string, PriceHistory>;
    private playerStats: Map<string, PlayerEconomyStats>;

    // Economy parameters
    private readonly COIN_TO_GEM_RATIO: number = 100; // 100 coins = 1 gem
    private readonly DAILY_COIN_CAP: number = 10000;
    private readonly TRADE_TAX_PERCENTAGE: number = 5;
    private readonly AUCTION_HOUSE_FEE: number = 10;

    // Observables for events
    public onPurchaseCompleted: Observable<Transaction>;
    public onCurrencyChanged: Observable<{ playerId: string; currency: CurrencyType; amount: number; newTotal: number }>;
    public onItemUnlocked: Observable<{ playerId: string; itemId: string }>;
    public onTradeCompleted: Observable<TradeOffer>;
    public onAuctionWon: Observable<AuctionListing>;
    public onDailyDealRefreshed: Observable<DailyDeal[]>;
    public onFlashSaleStarted: Observable<FlashSale>;

    constructor() {
        this.wallets = new Map();
        this.storeItems = new Map();
        this.bundles = new Map();
        this.lootBoxes = new Map();
        this.transactions = new Map();
        this.dailyDeals = new Map();
        this.flashSales = [];
        this.subscriptions = new Map();
        this.seasonPasses = new Map();
        this.tradeOffers = new Map();
        this.auctionListings = new Map();
        this.priceHistory = new Map();
        this.playerStats = new Map();

        this.onPurchaseCompleted = new Observable();
        this.onCurrencyChanged = new Observable();
        this.onItemUnlocked = new Observable();
        this.onTradeCompleted = new Observable();
        this.onAuctionWon = new Observable();
        this.onDailyDealRefreshed = new Observable();
        this.onFlashSaleStarted = new Observable();

        this.initializeStore();
    }

    private initializeStore(): void {
        // Initialize starter items
        this.addStoreItem({
            id: 'starter_bat',
            name: 'Starter Bat',
            description: 'A basic wooden bat for beginners',
            category: StoreCategory.EQUIPMENT,
            rarity: ItemRarity.COMMON,
            price: [{ type: CurrencyType.COINS, amount: 500, isPremium: false }],
            featured: false,
            isNew: false,
            isLimitedTime: false,
            purchaseCount: 0,
            tags: ['equipment', 'bat', 'starter'],
            previewImage: 'items/starter_bat.png'
        });

        // Premium items
        this.addStoreItem({
            id: 'legendary_bat',
            name: 'Legendary Thunder Bat',
            description: 'A bat infused with lightning power',
            category: StoreCategory.EQUIPMENT,
            rarity: ItemRarity.LEGENDARY,
            price: [{ type: CurrencyType.GEMS, amount: 1000, isPremium: true }],
            realMoneyPrice: 999, // $9.99
            featured: true,
            isNew: true,
            isLimitedTime: false,
            purchaseCount: 0,
            requiredLevel: 20,
            tags: ['equipment', 'bat', 'legendary', 'premium'],
            previewImage: 'items/legendary_bat.png'
        });

        // Initialize bundles
        this.addBundle({
            id: 'starter_bundle',
            name: 'Starter Pack',
            description: 'Everything you need to get started!',
            items: [
                { itemId: 'starter_bat', itemType: 'equipment', quantity: 1, value: [{ type: CurrencyType.COINS, amount: 500, isPremium: false }] },
                { itemId: 'coins_1000', itemType: 'currency', quantity: 1, value: [{ type: CurrencyType.COINS, amount: 1000, isPremium: false }] }
            ],
            totalValue: [{ type: CurrencyType.COINS, amount: 1500, isPremium: false }],
            price: [{ type: CurrencyType.COINS, amount: 1000, isPremium: false }],
            realMoneyPrice: 499, // $4.99
            discount: 33,
            featured: true,
            isLimitedTime: false,
            previewImage: 'bundles/starter_pack.png'
        });

        // Initialize loot boxes
        this.addLootBox({
            id: 'standard_pack',
            name: 'Standard Pack',
            description: 'Contains 5 random items',
            price: [{ type: CurrencyType.GEMS, amount: 100, isPremium: true }],
            realMoneyPrice: 99, // $0.99
            contents: [
                {
                    rarity: ItemRarity.COMMON,
                    dropRate: 0.60,
                    items: [
                        { itemId: 'common_bat', itemType: 'equipment', quantity: 1, weight: 1 },
                        { itemId: 'common_glove', itemType: 'equipment', quantity: 1, weight: 1 }
                    ]
                },
                {
                    rarity: ItemRarity.RARE,
                    dropRate: 0.30,
                    items: [
                        { itemId: 'rare_bat', itemType: 'equipment', quantity: 1, weight: 1 }
                    ]
                },
                {
                    rarity: ItemRarity.LEGENDARY,
                    dropRate: 0.10,
                    items: [
                        { itemId: 'legendary_bat', itemType: 'equipment', quantity: 1, weight: 1 }
                    ]
                }
            ],
            previewImage: 'lootboxes/standard_pack.png',
            animations: ['open_standard']
        });
    }

    public createWallet(playerId: string): Wallet {
        const wallet: Wallet = {
            playerId,
            currencies: new Map([
                [CurrencyType.COINS, 1000], // Starting coins
                [CurrencyType.GEMS, 50], // Starting gems
                [CurrencyType.TICKETS, 0],
                [CurrencyType.SEASON_POINTS, 0]
            ]),
            lifetimeEarned: new Map(),
            lifetimeSpent: new Map()
        };

        this.wallets.set(playerId, wallet);

        // Initialize player stats
        this.playerStats.set(playerId, {
            playerId,
            totalEarned: new Map(),
            totalSpent: new Map(),
            totalRealMoneySpent: 0,
            purchaseHistory: [],
            favoriteCategories: new Map(),
            averageSessionSpending: 0,
            daysSinceLastPurchase: 0,
            lifetimeValue: 0
        });

        return wallet;
    }

    public getCurrency(playerId: string, currencyType: CurrencyType): number {
        const wallet = this.wallets.get(playerId);
        return wallet?.currencies.get(currencyType) || 0;
    }

    public addCurrency(playerId: string, currencyType: CurrencyType, amount: number): boolean {
        const wallet = this.wallets.get(playerId);
        if (!wallet) return false;

        const current = wallet.currencies.get(currencyType) || 0;
        const newAmount = current + amount;

        wallet.currencies.set(currencyType, newAmount);

        // Track lifetime earned
        const lifetimeEarned = wallet.lifetimeEarned.get(currencyType) || 0;
        wallet.lifetimeEarned.set(currencyType, lifetimeEarned + amount);

        this.onCurrencyChanged.notifyObservers({
            playerId,
            currency: currencyType,
            amount,
            newTotal: newAmount
        });

        return true;
    }

    public removeCurrency(playerId: string, currencyType: CurrencyType, amount: number): boolean {
        const wallet = this.wallets.get(playerId);
        if (!wallet) return false;

        const current = wallet.currencies.get(currencyType) || 0;
        if (current < amount) return false;

        const newAmount = current - amount;
        wallet.currencies.set(currencyType, newAmount);

        // Track lifetime spent
        const lifetimeSpent = wallet.lifetimeSpent.get(currencyType) || 0;
        wallet.lifetimeSpent.set(currencyType, lifetimeSpent + amount);

        this.onCurrencyChanged.notifyObservers({
            playerId,
            currency: currencyType,
            amount: -amount,
            newTotal: newAmount
        });

        return true;
    }

    public purchaseItem(playerId: string, itemId: string): Transaction | null {
        const item = this.storeItems.get(itemId);
        if (!item) return null;

        // Check purchase limit
        if (item.purchaseLimit && item.purchaseCount >= item.purchaseLimit) {
            return null;
        }

        // Check if player can afford
        if (!this.canAfford(playerId, item.price)) {
            return null;
        }

        // Process payment
        for (const currency of item.price) {
            this.removeCurrency(playerId, currency.type, currency.amount);
        }

        // Create transaction
        const transaction: Transaction = {
            id: `txn_${Date.now()}_${playerId}`,
            playerId,
            timestamp: new Date(),
            type: 'purchase',
            itemId,
            currencyChanges: new Map(item.price.map(c => [c.type, -c.amount])),
            status: 'completed'
        };

        this.transactions.set(transaction.id, transaction);

        // Update item
        item.purchaseCount++;
        if (item.stock !== undefined) {
            item.stock--;
        }

        // Update player stats
        this.updatePlayerStats(playerId, transaction);

        this.onPurchaseCompleted.notifyObservers(transaction);
        this.onItemUnlocked.notifyObservers({ playerId, itemId });

        return transaction;
    }

    private canAfford(playerId: string, price: Currency[]): boolean {
        for (const currency of price) {
            const available = this.getCurrency(playerId, currency.type);
            if (available < currency.amount) {
                return false;
            }
        }
        return true;
    }

    public purchaseBundle(playerId: string, bundleId: string): Transaction | null {
        const bundle = this.bundles.get(bundleId);
        if (!bundle) return null;

        // Check if player can afford
        if (!this.canAfford(playerId, bundle.price)) {
            return null;
        }

        // Process payment
        for (const currency of bundle.price) {
            this.removeCurrency(playerId, currency.type, currency.amount);
        }

        // Grant bundle items
        const unlockedItems: string[] = [];
        for (const bundleItem of bundle.items) {
            if (bundleItem.itemType === 'currency') {
                this.addCurrency(playerId, bundleItem.itemId as CurrencyType, bundleItem.quantity);
            } else {
                // Grant item
                unlockedItems.push(bundleItem.itemId);
                this.onItemUnlocked.notifyObservers({ playerId, itemId: bundleItem.itemId });
            }
        }

        // Create transaction
        const transaction: Transaction = {
            id: `txn_${Date.now()}_${playerId}`,
            playerId,
            timestamp: new Date(),
            type: 'purchase',
            itemId: bundleId,
            currencyChanges: new Map(bundle.price.map(c => [c.type, -c.amount])),
            status: 'completed',
            metadata: { bundleItems: unlockedItems }
        };

        this.transactions.set(transaction.id, transaction);
        this.updatePlayerStats(playerId, transaction);
        this.onPurchaseCompleted.notifyObservers(transaction);

        return transaction;
    }

    public openLootBox(playerId: string, lootBoxId: string): { items: LootBoxItem[]; transaction: Transaction } | null {
        const lootBox = this.lootBoxes.get(lootBoxId);
        if (!lootBox) return null;

        // Check if player can afford
        if (!this.canAfford(playerId, lootBox.price)) {
            return null;
        }

        // Process payment
        for (const currency of lootBox.price) {
            this.removeCurrency(playerId, currency.type, currency.amount);
        }

        // Roll items
        const items = this.rollLootBoxItems(lootBox, 5); // 5 items per box

        // Grant items
        for (const item of items) {
            this.onItemUnlocked.notifyObservers({ playerId, itemId: item.itemId });
        }

        // Create transaction
        const transaction: Transaction = {
            id: `txn_${Date.now()}_${playerId}`,
            playerId,
            timestamp: new Date(),
            type: 'purchase',
            itemId: lootBoxId,
            currencyChanges: new Map(lootBox.price.map(c => [c.type, -c.amount])),
            status: 'completed',
            metadata: { lootBoxItems: items }
        };

        this.transactions.set(transaction.id, transaction);
        this.updatePlayerStats(playerId, transaction);
        this.onPurchaseCompleted.notifyObservers(transaction);

        return { items, transaction };
    }

    private rollLootBoxItems(lootBox: LootBox, count: number): LootBoxItem[] {
        const items: LootBoxItem[] = [];

        for (let i = 0; i < count; i++) {
            // Determine rarity
            const roll = Math.random();
            let cumulativeRate = 0;
            let selectedPool: LootBoxPool | null = null;

            for (const pool of lootBox.contents) {
                cumulativeRate += pool.dropRate;
                if (roll <= cumulativeRate) {
                    selectedPool = pool;
                    break;
                }
            }

            if (!selectedPool) continue;

            // Select item from pool based on weight
            const totalWeight = selectedPool.items.reduce((sum, item) => sum + item.weight, 0);
            const itemRoll = Math.random() * totalWeight;
            let cumulativeWeight = 0;

            for (const item of selectedPool.items) {
                cumulativeWeight += item.weight;
                if (itemRoll <= cumulativeWeight) {
                    items.push(item);
                    break;
                }
            }
        }

        return items;
    }

    public createTradeOffer(fromPlayerId: string, toPlayerId: string, offer: Omit<TradeOffer, 'id' | 'status' | 'createdAt' | 'expiresAt'>): TradeOffer {
        const tradeOffer: TradeOffer = {
            id: `trade_${Date.now()}`,
            ...offer,
            status: 'pending',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };

        this.tradeOffers.set(tradeOffer.id, tradeOffer);

        return tradeOffer;
    }

    public acceptTrade(tradeId: string): boolean {
        const trade = this.tradeOffers.get(tradeId);
        if (!trade || trade.status !== 'pending') return false;

        // Verify both players can complete trade
        if (!this.canAfford(trade.fromPlayerId, Array.from(trade.requestedCurrency.entries()).map(([type, amount]) => ({ type, amount, isPremium: false })))) {
            return false;
        }
        if (!this.canAfford(trade.toPlayerId, Array.from(trade.offeredCurrency.entries()).map(([type, amount]) => ({ type, amount, isPremium: false })))) {
            return false;
        }

        // Exchange currencies
        for (const [currencyType, amount] of trade.offeredCurrency.entries()) {
            this.removeCurrency(trade.fromPlayerId, currencyType, amount);
            const taxedAmount = Math.floor(amount * (1 - this.TRADE_TAX_PERCENTAGE / 100));
            this.addCurrency(trade.toPlayerId, currencyType, taxedAmount);
        }

        for (const [currencyType, amount] of trade.requestedCurrency.entries()) {
            this.removeCurrency(trade.toPlayerId, currencyType, amount);
            const taxedAmount = Math.floor(amount * (1 - this.TRADE_TAX_PERCENTAGE / 100));
            this.addCurrency(trade.fromPlayerId, currencyType, taxedAmount);
        }

        // Exchange items would happen here

        trade.status = 'accepted';
        this.onTradeCompleted.notifyObservers(trade);

        return true;
    }

    public createAuctionListing(listing: Omit<AuctionListing, 'id' | 'currentBid' | 'bidHistory' | 'status'>): AuctionListing {
        const auctionListing: AuctionListing = {
            id: `auction_${Date.now()}`,
            ...listing,
            currentBid: listing.startingBid,
            bidHistory: [],
            status: 'active'
        };

        this.auctionListings.set(auctionListing.id, auctionListing);

        return auctionListing;
    }

    public placeBid(auctionId: string, bidderId: string, amount: number): boolean {
        const listing = this.auctionListings.get(auctionId);
        if (!listing || listing.status !== 'active') return false;

        // Check if bid is higher than current
        if (amount <= listing.currentBid) return false;

        // Check if player can afford
        if (this.getCurrency(bidderId, CurrencyType.COINS) < amount) return false;

        // Refund previous bidder
        if (listing.currentBidder) {
            this.addCurrency(listing.currentBidder, CurrencyType.COINS, listing.currentBid);
        }

        // Hold new bid amount
        this.removeCurrency(bidderId, CurrencyType.COINS, amount);

        // Update listing
        listing.currentBid = amount;
        listing.currentBidder = bidderId;
        listing.bidHistory.push({
            bidderId,
            amount,
            timestamp: new Date()
        });

        return true;
    }

    public refreshDailyDeals(): void {
        this.dailyDeals.clear();

        // Select random items for daily deals
        const allItems = Array.from(this.storeItems.values());
        const dealsCount = 5;

        for (let i = 0; i < dealsCount && i < allItems.length; i++) {
            const item = allItems[Math.floor(Math.random() * allItems.length)];
            const discount = 20 + Math.floor(Math.random() * 30); // 20-50% off

            const deal: DailyDeal = {
                id: `daily_deal_${Date.now()}_${i}`,
                item: { ...item },
                discountPercentage: discount,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            };

            // Apply discount to item price
            deal.item.discount = discount;
            deal.item.originalPrice = [...item.price];
            deal.item.price = item.price.map(c => ({
                ...c,
                amount: Math.floor(c.amount * (1 - discount / 100))
            }));

            this.dailyDeals.set(deal.id, deal);
        }

        this.onDailyDealRefreshed.notifyObservers(Array.from(this.dailyDeals.values()));
    }

    public startFlashSale(items: string[], discount: number, duration: number): FlashSale {
        const flashSaleItems = items.map(id => this.storeItems.get(id)).filter(item => item !== undefined) as StoreItem[];

        const flashSale: FlashSale = {
            id: `flash_sale_${Date.now()}`,
            items: flashSaleItems,
            discountPercentage: discount,
            startTime: new Date(),
            endTime: new Date(Date.now() + duration),
            notified: false
        };

        this.flashSales.push(flashSale);
        this.onFlashSaleStarted.notifyObservers(flashSale);

        return flashSale;
    }

    private updatePlayerStats(playerId: string, transaction: Transaction): void {
        const stats = this.playerStats.get(playerId);
        if (!stats) return;

        stats.purchaseHistory.push(transaction);

        // Update spending totals
        for (const [currency, amount] of transaction.currencyChanges.entries()) {
            const current = stats.totalSpent.get(currency) || 0;
            stats.totalSpent.set(currency, current + Math.abs(amount));
        }

        if (transaction.realMoneyAmount) {
            stats.totalRealMoneySpent += transaction.realMoneyAmount;
            stats.lifetimeValue += transaction.realMoneyAmount;
        }

        stats.daysSinceLastPurchase = 0;
    }

    private addStoreItem(item: StoreItem): void {
        this.storeItems.set(item.id, item);
    }

    private addBundle(bundle: Bundle): void {
        this.bundles.set(bundle.id, bundle);
    }

    private addLootBox(lootBox: LootBox): void {
        this.lootBoxes.set(lootBox.id, lootBox);
    }

    public getStoreItems(category?: StoreCategory): StoreItem[] {
        let items = Array.from(this.storeItems.values());

        if (category) {
            items = items.filter(item => item.category === category);
        }

        return items;
    }

    public update(deltaTime: number): void {
        // Check expired auctions
        const now = new Date();
        for (const listing of this.auctionListings.values()) {
            if (listing.status === 'active' && listing.endTime <= now) {
                this.finalizeAuction(listing);
            }
        }

        // Check expired trade offers
        for (const trade of this.tradeOffers.values()) {
            if (trade.status === 'pending' && trade.expiresAt <= now) {
                trade.status = 'expired';
            }
        }

        // Check expired flash sales
        this.flashSales = this.flashSales.filter(sale => sale.endTime > now);
    }

    private finalizeAuction(listing: AuctionListing): void {
        if (listing.currentBidder) {
            // Transfer item to winner
            this.onItemUnlocked.notifyObservers({ playerId: listing.currentBidder, itemId: listing.itemId });

            // Pay seller (minus fees)
            const sellerAmount = Math.floor(listing.currentBid * (1 - this.AUCTION_HOUSE_FEE / 100));
            this.addCurrency(listing.sellerId, CurrencyType.COINS, sellerAmount);

            listing.status = 'sold';
            this.onAuctionWon.notifyObservers(listing);
        } else {
            listing.status = 'expired';
        }
    }

    public dispose(): void {
        this.wallets.clear();
        this.storeItems.clear();
        this.bundles.clear();
        this.lootBoxes.clear();
        this.transactions.clear();
        this.dailyDeals.clear();
        this.flashSales = [];
        this.subscriptions.clear();
        this.seasonPasses.clear();
        this.tradeOffers.clear();
        this.auctionListings.clear();
        this.priceHistory.clear();
        this.playerStats.clear();
    }
}
