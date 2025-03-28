import { pgTable, text, serial, integer, decimal, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  isKycVerified: boolean("is_kyc_verified").default(false),
  walletBalance: decimal("wallet_balance").default("1000"),
  createdAt: timestamp("created_at").defaultNow(),
});

// KYC information table
export const kycInfo = pgTable("kyc_info", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  country: text("country").notNull(),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  phoneNumber: text("phone_number"),
  idType: text("id_type"),
  idNumber: text("id_number"),
  status: text("status").default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Country shares table
export const countryShares = pgTable("country_shares", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull().unique(),
  countryName: text("country_name").notNull(),
  totalShares: integer("total_shares").default(10000000), // 10 million shares
  availableShares: integer("available_shares").default(10000000),
  currentPrice: decimal("current_price").default("0.5"),
  previousPrice: decimal("previous_price").default("0.5"),
  isPreSale: boolean("is_pre_sale").default(true),
  preSaleProgress: decimal("pre_sale_progress").default("0"),
});

// User holdings table
export const userHoldings = pgTable("user_holdings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  countryCode: text("country_code").notNull().references(() => countryShares.countryCode),
  shares: decimal("shares").notNull(),
  averageBuyPrice: decimal("average_buy_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userCountryIdx: uniqueIndex("user_country_idx").on(table.userId, table.countryCode),
  };
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  countryCode: text("country_code").notNull().references(() => countryShares.countryCode),
  type: text("type").notNull(), // buy, sell
  shares: decimal("shares").notNull(),
  price: decimal("price").notNull(),
  leverage: integer("leverage").default(1),
  total: decimal("total").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// News items table
export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").references(() => countryShares.countryCode),
  title: text("title").notNull(),
  content: text("content").notNull(),
  source: text("source"),
  timestamp: timestamp("timestamp").defaultNow(),
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

// Login type
export type LoginCredentials = Pick<InsertUser, "username" | "password">;
