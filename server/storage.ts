import { 
  users, 
  kycInfo, 
  countryShares, 
  userHoldings, 
  transactions, 
  newsItems,
  affiliateCommissions,
  bonusClaims,
  type User, 
  type InsertUser, 
  type KycInfo, 
  type InsertKycInfo, 
  type CountryShare, 
  type InsertCountryShare, 
  type UserHolding, 
  type InsertUserHolding, 
  type Transaction, 
  type InsertTransaction, 
  type NewsItem, 
  type InsertNewsItem,
  type AffiliateCommission,
  type InsertAffiliateCommission,
  type BonusClaim,
  type InsertBonusClaim
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  generateReferralCode(userId: number): Promise<string>;
  updateUser(userId: number, updates: Partial<User>): Promise<User | undefined>;
  
  // KYC operations
  submitKyc(kycData: InsertKycInfo): Promise<KycInfo>;
  getKycByUserId(userId: number): Promise<KycInfo | undefined>;
  updateKycStatus(userId: number, status: string): Promise<KycInfo | undefined>;
  
  // Country operations
  getAllCountries(): Promise<CountryShare[]>;
  getCountryByCode(code: string): Promise<CountryShare | undefined>;
  getFeaturedCountries(): Promise<CountryShare[]>;
  getPresaleCountries(): Promise<CountryShare[]>;
  addCountry(country: InsertCountryShare): Promise<CountryShare>;
  updateCountry(code: string, updates: Partial<CountryShare>): Promise<CountryShare | undefined>;
  
  // User holdings operations
  getUserHoldings(userId: number): Promise<UserHolding[]>;
  getUserHolding(userId: number, countryCode: string): Promise<UserHolding | undefined>;
  updateUserHoldings(holding: InsertUserHolding): Promise<UserHolding>;
  updateUserHoldingsAfterSell(userId: number, countryCode: string, shares: number): Promise<UserHolding | undefined>;
  
  // Transaction operations
  executeTrade(trade: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // News operations
  getLatestNews(): Promise<NewsItem[]>;
  addNewsItem(news: InsertNewsItem): Promise<NewsItem>;
  
  // Affiliate operations
  createAffiliateCommission(commission: InsertAffiliateCommission): Promise<AffiliateCommission>;
  getUserAffiliateCommissions(userId: number): Promise<AffiliateCommission[]>;
  getUserReferrals(userId: number): Promise<User[]>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  
  // Bonus operations
  canClaimBonus(userId: number): Promise<boolean>;
  claimBonus(bonus: InsertBonusClaim): Promise<BonusClaim>;
  getUserBonusClaims(userId: number): Promise<BonusClaim[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private kycMap: Map<number, KycInfo>;
  private countriesMap: Map<string, CountryShare>;
  private holdingsMap: Map<string, UserHolding>; // key: userId-countryCode
  private transactionsMap: Map<number, Transaction>;
  private newsMap: Map<number, NewsItem>;
  private affiliateCommissionsMap: Map<number, AffiliateCommission>;
  private bonusClaimsMap: Map<number, BonusClaim>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number = 1;
  private kycIdCounter: number = 1;
  private countryIdCounter: number = 1;
  private holdingIdCounter: number = 1;
  private transactionIdCounter: number = 1;
  private newsIdCounter: number = 1;
  private affiliateCommissionIdCounter: number = 1;
  private bonusClaimIdCounter: number = 1;

  constructor() {
    this.usersMap = new Map();
    this.kycMap = new Map();
    this.countriesMap = new Map();
    this.holdingsMap = new Map();
    this.transactionsMap = new Map();
    this.newsMap = new Map();
    this.affiliateCommissionsMap = new Map();
    this.bonusClaimsMap = new Map();
    
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Generate a unique referral code for the user
    const referralCode = await this.generateReferralCode(id);
    
    const user: User = { 
      ...insertUser, 
      id, 
      isKycVerified: false,
      walletBalance: "1000",
      referralCode,
      createdAt: now
    };
    this.usersMap.set(id, user);
    return user;
  }
  
  async generateReferralCode(userId: number): Promise<string> {
    // Create a referral code based on userId and a random string
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${userId}${randomStr}`;
  }
  
  async updateUser(userId: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.usersMap.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.referralCode === referralCode
    );
  }

  // KYC operations
  async submitKyc(kycData: InsertKycInfo): Promise<KycInfo> {
    const id = this.kycIdCounter++;
    const now = new Date();
    const kyc: KycInfo = {
      ...kycData,
      id,
      status: "pending",
      submittedAt: now
    };
    this.kycMap.set(id, kyc);
    return kyc;
  }

  async getKycByUserId(userId: number): Promise<KycInfo | undefined> {
    return Array.from(this.kycMap.values()).find(
      (kyc) => kyc.userId === userId
    );
  }

  async updateKycStatus(userId: number, status: string): Promise<KycInfo | undefined> {
    const kyc = await this.getKycByUserId(userId);
    if (kyc) {
      kyc.status = status;
      this.kycMap.set(kyc.id, kyc);
      
      // Update user's KYC verification status if approved
      if (status === "approved") {
        const user = await this.getUser(userId);
        if (user) {
          user.isKycVerified = true;
          this.usersMap.set(userId, user);
        }
      }
      
      return kyc;
    }
    return undefined;
  }

  // Country operations
  async getAllCountries(): Promise<CountryShare[]> {
    return Array.from(this.countriesMap.values());
  }

  async getCountryByCode(code: string): Promise<CountryShare | undefined> {
    return this.countriesMap.get(code);
  }

  async getFeaturedCountries(): Promise<CountryShare[]> {
    const featuredCodes = ["US", "CN", "DE", "JP", "GB", "FR"];
    return Array.from(this.countriesMap.values()).filter(
      country => featuredCodes.includes(country.countryCode)
    );
  }

  async getPresaleCountries(): Promise<CountryShare[]> {
    return Array.from(this.countriesMap.values()).filter(
      country => country.isPreSale === true
    );
  }

  async addCountry(country: InsertCountryShare): Promise<CountryShare> {
    const id = this.countryIdCounter++;
    const countryShare: CountryShare = {
      ...country,
      id
    };
    this.countriesMap.set(country.countryCode, countryShare);
    return countryShare;
  }

  async updateCountry(code: string, updates: Partial<CountryShare>): Promise<CountryShare | undefined> {
    const country = await this.getCountryByCode(code);
    if (country) {
      const updatedCountry = { ...country, ...updates };
      this.countriesMap.set(code, updatedCountry);
      return updatedCountry;
    }
    return undefined;
  }

  // User holdings operations
  async getUserHoldings(userId: number): Promise<UserHolding[]> {
    return Array.from(this.holdingsMap.values()).filter(
      holding => holding.userId === userId
    );
  }

  async getUserHolding(userId: number, countryCode: string): Promise<UserHolding | undefined> {
    const key = `${userId}-${countryCode}`;
    return this.holdingsMap.get(key);
  }

  async updateUserHoldings(holding: InsertUserHolding): Promise<UserHolding> {
    const key = `${holding.userId}-${holding.countryCode}`;
    const existingHolding = this.holdingsMap.get(key);
    
    if (existingHolding) {
      // Update existing holding
      const totalShares = parseFloat(existingHolding.shares) + parseFloat(holding.shares.toString());
      const totalValue = 
        parseFloat(existingHolding.shares) * parseFloat(existingHolding.averageBuyPrice.toString()) +
        parseFloat(holding.shares.toString()) * parseFloat(holding.averageBuyPrice.toString());
      
      const averagePrice = totalValue / totalShares;
      
      const updatedHolding: UserHolding = {
        ...existingHolding,
        shares: totalShares.toString(),
        averageBuyPrice: averagePrice.toString()
      };
      
      this.holdingsMap.set(key, updatedHolding);
      return updatedHolding;
    } else {
      // Create new holding
      const id = this.holdingIdCounter++;
      const now = new Date();
      const newHolding: UserHolding = {
        ...holding,
        id,
        createdAt: now
      };
      
      this.holdingsMap.set(key, newHolding);
      return newHolding;
    }
  }

  async updateUserHoldingsAfterSell(userId: number, countryCode: string, shares: number): Promise<UserHolding | undefined> {
    const key = `${userId}-${countryCode}`;
    const existingHolding = this.holdingsMap.get(key);
    
    if (existingHolding) {
      const remainingShares = parseFloat(existingHolding.shares) - shares;
      
      if (remainingShares <= 0) {
        // Remove holding if no shares left
        this.holdingsMap.delete(key);
        return undefined;
      } else {
        // Update holding with remaining shares
        const updatedHolding: UserHolding = {
          ...existingHolding,
          shares: remainingShares.toString()
        };
        
        this.holdingsMap.set(key, updatedHolding);
        return updatedHolding;
      }
    }
    
    return undefined;
  }

  // Transaction operations
  async executeTrade(trade: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = {
      ...trade,
      id,
      timestamp: now
    };
    
    this.transactionsMap.set(id, transaction);
    
    // Update user's wallet balance
    const user = await this.getUser(trade.userId);
    if (user) {
      const currentBalance = parseFloat(user.walletBalance);
      let newBalance: number;
      
      if (trade.type === "buy") {
        newBalance = currentBalance - parseFloat(trade.total.toString());
      } else {
        newBalance = currentBalance + parseFloat(trade.total.toString());
      }
      
      user.walletBalance = newBalance.toString();
      this.usersMap.set(user.id, user);
    }
    
    // Update country's available shares and price
    const country = await this.getCountryByCode(trade.countryCode);
    if (country) {
      const availableShares = parseFloat(country.availableShares.toString());
      const totalShares = parseFloat(country.totalShares.toString());
      let newAvailableShares: number;
      
      if (trade.type === "buy") {
        newAvailableShares = availableShares - parseFloat(trade.shares.toString());
      } else {
        newAvailableShares = availableShares + parseFloat(trade.shares.toString());
      }
      
      // Calculate new pre-sale progress
      const preSaleProgress = (1 - newAvailableShares / totalShares).toString();
      
      // Update country data
      country.previousPrice = country.currentPrice;
      country.currentPrice = trade.price.toString();
      country.availableShares = newAvailableShares.toString();
      country.preSaleProgress = preSaleProgress;
      
      this.countriesMap.set(country.countryCode, country);
    }
    
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactionsMap.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // News operations
  async getLatestNews(): Promise<NewsItem[]> {
    return Array.from(this.newsMap.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async addNewsItem(news: InsertNewsItem): Promise<NewsItem> {
    const id = this.newsIdCounter++;
    const now = new Date();
    const newsItem: NewsItem = {
      ...news,
      id,
      timestamp: now
    };
    
    this.newsMap.set(id, newsItem);
    return newsItem;
  }

  // Affiliate operations
  async createAffiliateCommission(commission: InsertAffiliateCommission): Promise<AffiliateCommission> {
    const id = this.affiliateCommissionIdCounter++;
    const now = new Date();
    const affiliateCommission: AffiliateCommission = {
      ...commission,
      id,
      status: "pending",
      createdAt: now,
      paidAt: null
    };
    
    this.affiliateCommissionsMap.set(id, affiliateCommission);
    return affiliateCommission;
  }
  
  async getUserAffiliateCommissions(userId: number): Promise<AffiliateCommission[]> {
    return Array.from(this.affiliateCommissionsMap.values())
      .filter(commission => commission.referrerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUserReferrals(userId: number): Promise<User[]> {
    return Array.from(this.usersMap.values())
      .filter(user => user.referredBy === userId);
  }
  
  // Bonus operations
  async canClaimBonus(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // User can claim bonus once every 24 hours
    if (!user.lastBonusClaimDate) return true;
    
    const now = new Date();
    const lastClaim = new Date(user.lastBonusClaimDate);
    const hoursDiff = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
  }
  
  async claimBonus(bonus: InsertBonusClaim): Promise<BonusClaim> {
    const id = this.bonusClaimIdCounter++;
    const now = new Date();
    const bonusClaim: BonusClaim = {
      ...bonus,
      id,
      claimDate: now
    };
    
    this.bonusClaimsMap.set(id, bonusClaim);
    
    // Update user's last bonus claim date
    const user = await this.getUser(bonus.userId);
    if (user) {
      user.lastBonusClaimDate = now;
      this.usersMap.set(user.id, user);
      
      // Add the bonus shares to user's holdings
      await this.updateUserHoldings({
        userId: bonus.userId,
        countryCode: bonus.countryCode,
        shares: bonus.shares,
        averageBuyPrice: "0" // Bonus shares are free
      });
    }
    
    return bonusClaim;
  }
  
  async getUserBonusClaims(userId: number): Promise<BonusClaim[]> {
    return Array.from(this.bonusClaimsMap.values())
      .filter(claim => claim.userId === userId)
      .sort((a, b) => b.claimDate.getTime() - a.claimDate.getTime());
  }
}

export const storage = new MemStorage();
