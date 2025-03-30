import { mysqlTable, varchar, int, decimal, boolean, timestamp, text, index, unique, primaryKey } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import session from "express-session";

// Users table
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  isKycVerified: boolean("is_kyc_verified").default(false),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("1000"),
  referralCode: varchar("referral_code", { length: 255 }).unique(),
  referredBy: int("referred_by").references(() => users.id),
  lastBonusClaimDate: timestamp("last_bonus_claim_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// KYC information table
export const kycInfo = mysqlTable("kyc_info", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  dateOfBirth: varchar("date_of_birth", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 255 }),
  postalCode: varchar("postal_code", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 255 }),
  idType: varchar("id_type", { length: 255 }),
  idNumber: varchar("id_number", { length: 255 }),
  status: varchar("status", { length: 255 }).default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Country shares table
export const countryShares = mysqlTable("country_shares", {
  id: int("id").autoincrement().primaryKey(),
  countryCode: varchar("country_code", { length: 10 }).notNull().unique(),
  countryName: varchar("country_name", { length: 255 }).notNull(),
  totalShares: int("total_shares").default(10000000), // 10 million shares
  availableShares: int("available_shares").default(10000000),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).default("0.5"),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }).default("0.5"),
  isPreSale: boolean("is_pre_sale").default(true),
  preSaleProgress: decimal("pre_sale_progress", { precision: 10, scale: 2 }).default("0"),
});

// User holdings table
export const userHoldings = mysqlTable("user_holdings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  countryCode: varchar("country_code", { length: 10 }).notNull().references(() => countryShares.countryCode),
  shares: decimal("shares", { precision: 10, scale: 2 }).notNull(),
  averageBuyPrice: decimal("average_buy_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userCountryIdx: unique("user_country_idx").on(table.userId, table.countryCode),
  };
});

// Transactions table
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  countryCode: varchar("country_code", { length: 10 }).notNull().references(() => countryShares.countryCode),
  type: varchar("type", { length: 10 }).notNull(), // buy, sell
  shares: decimal("shares", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  leverage: int("leverage").default(1),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// News items table
export const newsItems = mysqlTable("news_items", {
  id: int("id").autoincrement().primaryKey(),
  countryCode: varchar("country_code", { length: 10 }).references(() => countryShares.countryCode),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  source: varchar("source", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Affiliate commissions table
export const affiliateCommissions = mysqlTable("affiliate_commissions", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrer_id").notNull().references(() => users.id),
  referredUserId: int("referred_user_id").notNull().references(() => users.id),
  transactionId: int("transaction_id").references(() => transactions.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, paid
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Bonus claims table
export const bonusClaims = mysqlTable("bonus_claims", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  countryCode: varchar("country_code", { length: 10 }).notNull().references(() => countryShares.countryCode),
  shares: decimal("shares", { precision: 10, scale: 2 }).notNull(),
  claimDate: timestamp("claim_date").defaultNow(),
});

// Schema validations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export const insertKycSchema = createInsertSchema(kycInfo).omit({
  id: true,
  submittedAt: true,
  status: true,
});

export const insertCountrySharesSchema = createInsertSchema(countryShares).omit({
  id: true,
});

export const insertUserHoldingsSchema = createInsertSchema(userHoldings).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertNewsItemSchema = createInsertSchema(newsItems).omit({
  id: true,
  timestamp: true,
});

export const insertAffiliateCommissionSchema = createInsertSchema(affiliateCommissions).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertBonusClaimSchema = createInsertSchema(bonusClaims).omit({
  id: true,
  claimDate: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type KycInfo = typeof kycInfo.$inferSelect;
export type InsertKycInfo = z.infer<typeof insertKycSchema>;

export type CountryShare = typeof countryShares.$inferSelect;
export type InsertCountryShare = z.infer<typeof insertCountrySharesSchema>;

export type UserHolding = typeof userHoldings.$inferSelect;
export type InsertUserHolding = z.infer<typeof insertUserHoldingsSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;

export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;
export type InsertAffiliateCommission = z.infer<typeof insertAffiliateCommissionSchema>;

export type BonusClaim = typeof bonusClaims.$inferSelect;
export type InsertBonusClaim = z.infer<typeof insertBonusClaimSchema>;

// Site Settings
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("setting_key", { length: 255 }).notNull().unique(),
  settingValue: text("setting_value"),
  category: varchar("category", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Footer Links
export const footerLinks = mysqlTable("footer_links", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  order: int("order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social Links
export const socialLinks = mysqlTable("social_links", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 255 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  order: int("order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFooterLinksSchema = createInsertSchema(footerLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialLinksSchema = createInsertSchema(socialLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingsSchema>;

export type FooterLink = typeof footerLinks.$inferSelect;
export type InsertFooterLink = z.infer<typeof insertFooterLinksSchema>;

export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinksSchema>;

// Login type
export type LoginCredentials = Pick<InsertUser, "username" | "password">;
