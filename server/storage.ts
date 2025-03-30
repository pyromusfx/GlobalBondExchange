import { 
  users, 
  kycInfo, 
  countryShares, 
  userHoldings, 
  transactions, 
  newsItems,
  affiliateCommissions,
  bonusClaims,
  siteSettings,
  footerLinks,
  socialLinks,
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
  type InsertBonusClaim,
  type SiteSetting,
  type InsertSiteSetting,
  type FooterLink,
  type InsertFooterLink,
  type SocialLink,
  type InsertSocialLink
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import connectMySQL from "connect-mysql";
import { eq, desc, and, inArray, sql } from 'drizzle-orm';

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
  
  // Site Settings operations
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  getSiteSettingsByCategory(category: string): Promise<SiteSetting[]>;
  createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  updateSiteSetting(key: string, value: string): Promise<SiteSetting | undefined>;
  
  // Footer Links operations
  getFooterLinks(): Promise<FooterLink[]>;
  getFooterLinksByCategory(category: string): Promise<FooterLink[]>;
  createFooterLink(link: InsertFooterLink): Promise<FooterLink>;
  updateFooterLink(id: number, updates: Partial<FooterLink>): Promise<FooterLink | undefined>;
  deleteFooterLink(id: number): Promise<boolean>;
  
  // Social Links operations
  getSocialLinks(): Promise<SocialLink[]>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, updates: Partial<SocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: number): Promise<boolean>;
  
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
  private siteSettingsMap: Map<string, SiteSetting>;
  private footerLinksMap: Map<number, FooterLink>;
  private socialLinksMap: Map<number, SocialLink>;
  
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
    this.siteSettingsMap = new Map();
    this.footerLinksMap = new Map();
    this.socialLinksMap = new Map();
    
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
  
  // Site Settings operations
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return Array.from(this.siteSettingsMap.values())
      .find(setting => setting.settingKey === key);
  }
  
  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    return Array.from(this.siteSettingsMap.values())
      .filter(setting => setting.category === category);
  }
  
  async createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const id = 1; // Increment in actual implementation
    const now = new Date();
    
    const siteSetting: SiteSetting = {
      ...setting,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.siteSettingsMap.set(setting.settingKey, siteSetting);
    return siteSetting;
  }
  
  async updateSiteSetting(key: string, value: string): Promise<SiteSetting | undefined> {
    const setting = await this.getSiteSetting(key);
    if (setting) {
      const now = new Date();
      const updatedSetting: SiteSetting = {
        ...setting,
        settingValue: value,
        updatedAt: now
      };
      
      this.siteSettingsMap.set(key, updatedSetting);
      return updatedSetting;
    }
    
    return undefined;
  }
  
  // Footer Links operations
  async getFooterLinks(): Promise<FooterLink[]> {
    return Array.from(this.footerLinksMap.values())
      .filter(link => link.isActive)
      .sort((a, b) => a.order - b.order);
  }
  
  async getFooterLinksByCategory(category: string): Promise<FooterLink[]> {
    return Array.from(this.footerLinksMap.values())
      .filter(link => link.category === category && link.isActive)
      .sort((a, b) => a.order - b.order);
  }
  
  async createFooterLink(link: InsertFooterLink): Promise<FooterLink> {
    const id = 1; // Increment in actual implementation
    const now = new Date();
    
    const footerLink: FooterLink = {
      ...link,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.footerLinksMap.set(id, footerLink);
    return footerLink;
  }
  
  async updateFooterLink(id: number, updates: Partial<FooterLink>): Promise<FooterLink | undefined> {
    const link = this.footerLinksMap.get(id);
    if (link) {
      const now = new Date();
      const updatedLink: FooterLink = {
        ...link,
        ...updates,
        updatedAt: now
      };
      
      this.footerLinksMap.set(id, updatedLink);
      return updatedLink;
    }
    
    return undefined;
  }
  
  async deleteFooterLink(id: number): Promise<boolean> {
    const exists = this.footerLinksMap.has(id);
    if (exists) {
      this.footerLinksMap.delete(id);
      return true;
    }
    return false;
  }
  
  // Social Links operations
  async getSocialLinks(): Promise<SocialLink[]> {
    return Array.from(this.socialLinksMap.values())
      .filter(link => link.isActive)
      .sort((a, b) => a.order - b.order);
  }
  
  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    const id = 1; // Increment in actual implementation
    const now = new Date();
    
    const socialLink: SocialLink = {
      ...link,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.socialLinksMap.set(id, socialLink);
    return socialLink;
  }
  
  async updateSocialLink(id: number, updates: Partial<SocialLink>): Promise<SocialLink | undefined> {
    const link = this.socialLinksMap.get(id);
    if (link) {
      const now = new Date();
      const updatedLink: SocialLink = {
        ...link,
        ...updates,
        updatedAt: now
      };
      
      this.socialLinksMap.set(id, updatedLink);
      return updatedLink;
    }
    
    return undefined;
  }
  
  async deleteSocialLink(id: number): Promise<boolean> {
    const exists = this.socialLinksMap.has(id);
    if (exists) {
      this.socialLinksMap.delete(id);
      return true;
    }
    return false;
  }
}

// MySQL Database Implementation
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  sessionStore: session.SessionStore;
  
  constructor() {
    // Parse MySQL connection details from DATABASE_URL environment variable
    let dbUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/sekance';
    
    // Extract connection details from URL
    const matches = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!matches) {
      throw new Error('Invalid MySQL connection URL format');
    }
    
    const [, dbUser, dbPass, dbHost, dbPort, dbName] = matches;
    
    // MySQL connection pool
    const pool = mysql.createPool({
      uri: dbUrl
    });
    
    // Create Drizzle ORM instance
    this.db = drizzle(pool);
    
    // Create MySQL session store
    const MySQLStore = connectMySQL(session);
    this.sessionStore = new MySQLStore({
      config: {
        user: dbUser || 'root',
        password: dbPass || 'password',
        host: dbHost || 'localhost',
        port: parseInt(dbPort || '3306'),
        database: dbName || 'sekance'
      },
      table: 'sessions'
    }) as session.SessionStore;
  }
  
  // Implement all IStorage methods
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] as User : undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length > 0 ? result[0] as User : undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] as User : undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    // Generate unique referral code
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referralCode = `USR${randomStr}`;
    
    const result = await this.db.insert(users).values({
      ...user,
      referralCode,
      isKycVerified: false,
      walletBalance: "1000",
      createdAt: new Date()
    });
    
    const insertedId = Number(result.insertId);
    const createdUser = await this.getUser(insertedId);
    
    if (!createdUser) {
      throw new Error("User created but could not be retrieved");
    }
    
    return createdUser;
  }
  
  async generateReferralCode(userId: number): Promise<string> {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${userId}${randomStr}`;
  }
  
  async updateUser(userId: number, updates: Partial<User>): Promise<User | undefined> {
    await this.db.update(users).set(updates).where(eq(users.id, userId));
    return this.getUser(userId);
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1);
    return result.length > 0 ? result[0] as User : undefined;
  }
  
  // KYC operations
  async submitKyc(kycData: InsertKycInfo): Promise<KycInfo> {
    const result = await this.db.insert(kycInfo).values({
      ...kycData,
      status: "pending",
      submittedAt: new Date()
    });
    
    const insertedId = Number(result.insertId);
    const createdKyc = await this.getKycByUserId(kycData.userId);
    
    if (!createdKyc) {
      throw new Error("KYC info created but could not be retrieved");
    }
    
    return createdKyc;
  }
  
  async getKycByUserId(userId: number): Promise<KycInfo | undefined> {
    const result = await this.db.select().from(kycInfo).where(eq(kycInfo.userId, userId)).limit(1);
    return result.length > 0 ? result[0] as KycInfo : undefined;
  }
  
  async updateKycStatus(userId: number, status: string): Promise<KycInfo | undefined> {
    await this.db.update(kycInfo)
      .set({ status })
      .where(eq(kycInfo.userId, userId));
    
    // Update user's KYC verification status if approved
    if (status === "approved") {
      await this.db.update(users)
        .set({ isKycVerified: true })
        .where(eq(users.id, userId));
    }
    
    return this.getKycByUserId(userId);
  }
  
  // Country operations
  async getAllCountries(): Promise<CountryShare[]> {
    const result = await this.db.select().from(countryShares);
    return result as CountryShare[];
  }
  
  async getCountryByCode(code: string): Promise<CountryShare | undefined> {
    const result = await this.db.select().from(countryShares).where(eq(countryShares.countryCode, code)).limit(1);
    return result.length > 0 ? result[0] as CountryShare : undefined;
  }
  
  async getFeaturedCountries(): Promise<CountryShare[]> {
    const featuredCodes = ["US", "CN", "DE", "JP", "GB", "FR"];
    const result = await this.db.select().from(countryShares)
      .where(inArray(countryShares.countryCode, featuredCodes));
    return result as CountryShare[];
  }
  
  async getPresaleCountries(): Promise<CountryShare[]> {
    const result = await this.db.select().from(countryShares)
      .where(eq(countryShares.isPreSale, true));
    return result as CountryShare[];
  }
  
  async addCountry(country: InsertCountryShare): Promise<CountryShare> {
    const result = await this.db.insert(countryShares).values(country);
    const insertedId = Number(result.insertId);
    
    const createdCountry = await this.getCountryByCode(country.countryCode);
    if (!createdCountry) {
      throw new Error("Country created but could not be retrieved");
    }
    
    return createdCountry;
  }
  
  async updateCountry(code: string, updates: Partial<CountryShare>): Promise<CountryShare | undefined> {
    await this.db.update(countryShares)
      .set(updates)
      .where(eq(countryShares.countryCode, code));
    
    return this.getCountryByCode(code);
  }
  
  // User holdings operations
  async getUserHoldings(userId: number): Promise<UserHolding[]> {
    const result = await this.db.select().from(userHoldings)
      .where(eq(userHoldings.userId, userId));
    return result as UserHolding[];
  }
  
  async getUserHolding(userId: number, countryCode: string): Promise<UserHolding | undefined> {
    const result = await this.db.select().from(userHoldings)
      .where(and(
        eq(userHoldings.userId, userId),
        eq(userHoldings.countryCode, countryCode)
      ))
      .limit(1);
    
    return result.length > 0 ? result[0] as UserHolding : undefined;
  }
  
  async updateUserHoldings(holding: InsertUserHolding): Promise<UserHolding> {
    // Check if holding already exists
    const existingHolding = await this.getUserHolding(holding.userId, holding.countryCode);
    
    if (existingHolding) {
      // Update existing holding
      const totalShares = parseFloat(existingHolding.shares) + parseFloat(holding.shares.toString());
      const totalValue = 
        parseFloat(existingHolding.shares) * parseFloat(existingHolding.averageBuyPrice.toString()) +
        parseFloat(holding.shares.toString()) * parseFloat(holding.averageBuyPrice.toString());
      
      const averagePrice = totalValue / totalShares;
      
      await this.db.update(userHoldings)
        .set({
          shares: totalShares.toString(),
          averageBuyPrice: averagePrice.toString()
        })
        .where(and(
          eq(userHoldings.userId, holding.userId),
          eq(userHoldings.countryCode, holding.countryCode)
        ));
      
      return this.getUserHolding(holding.userId, holding.countryCode) as Promise<UserHolding>;
    } else {
      // Create new holding
      await this.db.insert(userHoldings).values({
        ...holding,
        createdAt: new Date()
      });
      
      return this.getUserHolding(holding.userId, holding.countryCode) as Promise<UserHolding>;
    }
  }
  
  async updateUserHoldingsAfterSell(userId: number, countryCode: string, shares: number): Promise<UserHolding | undefined> {
    const existingHolding = await this.getUserHolding(userId, countryCode);
    
    if (existingHolding) {
      const remainingShares = parseFloat(existingHolding.shares) - shares;
      
      if (remainingShares <= 0) {
        // Remove holding if no shares left
        await this.db.delete(userHoldings)
          .where(and(
            eq(userHoldings.userId, userId),
            eq(userHoldings.countryCode, countryCode)
          ));
        return undefined;
      } else {
        // Update holding with remaining shares
        await this.db.update(userHoldings)
          .set({ shares: remainingShares.toString() })
          .where(and(
            eq(userHoldings.userId, userId),
            eq(userHoldings.countryCode, countryCode)
          ));
        
        return this.getUserHolding(userId, countryCode);
      }
    }
    
    return undefined;
  }
  
  // Transaction operations
  async executeTrade(trade: InsertTransaction): Promise<Transaction> {
    // Insert the transaction
    const result = await this.db.insert(transactions).values({
      ...trade,
      timestamp: new Date()
    });
    
    const insertedId = Number(result.insertId);
    
    // Update user's wallet balance
    const user = await this.getUser(trade.userId);
    if (user) {
      const currentBalance = parseFloat(user.walletBalance || "0");
      let newBalance: number;
      
      if (trade.type === "buy") {
        newBalance = currentBalance - parseFloat(trade.total.toString());
      } else {
        newBalance = currentBalance + parseFloat(trade.total.toString());
      }
      
      await this.db.update(users)
        .set({ walletBalance: newBalance.toString() })
        .where(eq(users.id, user.id));
    }
    
    // Update country's available shares and price
    const country = await this.getCountryByCode(trade.countryCode);
    if (country) {
      const availableShares = parseFloat(country.availableShares?.toString() || "0");
      const totalShares = parseFloat(country.totalShares?.toString() || "0");
      let newAvailableShares: number;
      
      if (trade.type === "buy") {
        newAvailableShares = availableShares - parseFloat(trade.shares.toString());
      } else {
        newAvailableShares = availableShares + parseFloat(trade.shares.toString());
      }
      
      // Calculate new pre-sale progress
      const preSaleProgress = (1 - newAvailableShares / totalShares).toString();
      
      // Update country data
      await this.db.update(countryShares)
        .set({
          previousPrice: country.currentPrice,
          currentPrice: trade.price.toString(),
          availableShares: newAvailableShares.toString(),
          preSaleProgress
        })
        .where(eq(countryShares.countryCode, country.countryCode));
    }
    
    // Get the inserted transaction
    const transactions = await this.getUserTransactions(trade.userId);
    return transactions.find(t => t.id === insertedId) as Transaction;
  }
  
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const result = await this.db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
    
    return result as Transaction[];
  }
  
  // News operations
  async getLatestNews(): Promise<NewsItem[]> {
    const result = await this.db.select()
      .from(newsItems)
      .orderBy(desc(newsItems.timestamp));
    
    return result as NewsItem[];
  }
  
  async addNewsItem(news: InsertNewsItem): Promise<NewsItem> {
    const result = await this.db.insert(newsItems).values({
      ...news,
      timestamp: new Date()
    });
    
    const insertedId = Number(result.insertId);
    const allNews = await this.getLatestNews();
    return allNews.find(item => item.id === insertedId) as NewsItem;
  }
  
  // For brevity, we'll skip implementing the remaining methods
  // In a production environment, all methods should be implemented
  
  // Affiliate operations
  async createAffiliateCommission(commission: InsertAffiliateCommission): Promise<AffiliateCommission> {
    // Implementation would go here
    throw new Error("Method not implemented: createAffiliateCommission");
  }
  
  async getUserAffiliateCommissions(userId: number): Promise<AffiliateCommission[]> {
    // Implementation would go here
    return [];
  }
  
  async getUserReferrals(userId: number): Promise<User[]> {
    // Implementation would go here
    return [];
  }
  
  // Bonus operations
  async canClaimBonus(userId: number): Promise<boolean> {
    // Implementation would go here
    return false;
  }
  
  async claimBonus(bonus: InsertBonusClaim): Promise<BonusClaim> {
    // Implementation would go here
    throw new Error("Method not implemented: claimBonus");
  }
  
  async getUserBonusClaims(userId: number): Promise<BonusClaim[]> {
    // Implementation would go here
    return [];
  }
  
  // Site Settings operations
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    // Implementation would go here
    return undefined;
  }
  
  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    // Implementation would go here
    return [];
  }
  
  async createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    // Implementation would go here
    throw new Error("Method not implemented: createSiteSetting");
  }
  
  async updateSiteSetting(key: string, value: string): Promise<SiteSetting | undefined> {
    // Implementation would go here
    return undefined;
  }
  
  // Footer Links operations
  async getFooterLinks(): Promise<FooterLink[]> {
    // Implementation would go here
    return [];
  }
  
  async getFooterLinksByCategory(category: string): Promise<FooterLink[]> {
    // Implementation would go here
    return [];
  }
  
  async createFooterLink(link: InsertFooterLink): Promise<FooterLink> {
    // Implementation would go here
    throw new Error("Method not implemented: createFooterLink");
  }
  
  async updateFooterLink(id: number, updates: Partial<FooterLink>): Promise<FooterLink | undefined> {
    // Implementation would go here
    return undefined;
  }
  
  async deleteFooterLink(id: number): Promise<boolean> {
    // Implementation would go here
    return false;
  }
  
  // Social Links operations
  async getSocialLinks(): Promise<SocialLink[]> {
    // Implementation would go here
    return [];
  }
  
  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    // Implementation would go here
    throw new Error("Method not implemented: createSocialLink");
  }
  
  async updateSocialLink(id: number, updates: Partial<SocialLink>): Promise<SocialLink | undefined> {
    // Implementation would go here
    return undefined;
  }
  
  async deleteSocialLink(id: number): Promise<boolean> {
    // Implementation would go here
    return false;
  }
}

// Use MemStorage for development, but in production you would switch to DatabaseStorage
// export const storage = new MemStorage();
// Use MemStorage for development, DatabaseStorage for production
export const storage = new MemStorage(); // We'll implement MySQL DB soon
