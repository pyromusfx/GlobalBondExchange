import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { countries, featuredCountries, newsFeed } from "@shared/countries";
import { 
  insertKycSchema, 
  insertTransactionSchema, 
  insertUserHoldingsSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Initialize country data
  await initializeCountryData();

  // KYC submission route
  app.post("/api/kyc", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const validatedData = insertKycSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      const kycInfo = await storage.submitKyc(validatedData);
      return res.status(201).json(kycInfo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  // Get KYC status
  app.get("/api/kyc", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const kycInfo = await storage.getKycByUserId(req.user.id);
      if (!kycInfo) {
        return res.status(404).json({ message: "KYC information not found" });
      }
      return res.status(200).json(kycInfo);
    } catch (error) {
      next(error);
    }
  });

  // Get all countries
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getAllCountries();
      return res.status(200).json(countries);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching countries" });
    }
  });

  // Get countries for pre-sale
  app.get("/api/presale", async (req, res) => {
    try {
      const presaleCountries = await storage.getPresaleCountries();
      return res.status(200).json(presaleCountries);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching pre-sale countries" });
    }
  });

  // Get featured countries
  app.get("/api/countries/featured", async (req, res) => {
    try {
      const featuredCountries = await storage.getFeaturedCountries();
      return res.status(200).json(featuredCountries);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching featured countries" });
    }
  });

  // Get country by code
  app.get("/api/countries/:code", async (req, res) => {
    try {
      const country = await storage.getCountryByCode(req.params.code);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      return res.status(200).json(country);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching country" });
    }
  });

  // Buy shares in a country
  app.post("/api/trade/buy", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { countryCode, shares, price, leverage = 1 } = req.body;
      
      // Validate trade data
      const validatedData = insertTransactionSchema.parse({
        userId: req.user.id,
        countryCode,
        type: "buy",
        shares: shares,
        price: price,
        leverage: leverage,
        total: parseFloat(shares) * parseFloat(price)
      });

      // Check if user has enough balance
      if (req.user.walletBalance < validatedData.total) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Execute the transaction
      const transaction = await storage.executeTrade(validatedData);
      
      // Update user's holdings
      const holdingData = insertUserHoldingsSchema.parse({
        userId: req.user.id,
        countryCode,
        shares: shares,
        averageBuyPrice: price
      });
      
      await storage.updateUserHoldings(holdingData);
      
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  // Sell shares in a country
  app.post("/api/trade/sell", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { countryCode, shares, price, leverage = 1 } = req.body;
      
      // Validate trade data
      const validatedData = insertTransactionSchema.parse({
        userId: req.user.id,
        countryCode,
        type: "sell",
        shares: shares,
        price: price,
        leverage: leverage,
        total: parseFloat(shares) * parseFloat(price)
      });

      // Check if user has enough shares
      const userHolding = await storage.getUserHolding(req.user.id, countryCode);
      if (!userHolding || userHolding.shares < parseFloat(shares)) {
        return res.status(400).json({ message: "Insufficient shares" });
      }

      // Execute the transaction
      const transaction = await storage.executeTrade(validatedData);
      
      // Update user's holdings
      await storage.updateUserHoldingsAfterSell(req.user.id, countryCode, parseFloat(shares));
      
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  // Get user's holdings
  app.get("/api/holdings", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const holdings = await storage.getUserHoldings(req.user.id);
      return res.status(200).json(holdings);
    } catch (error) {
      next(error);
    }
  });

  // Get user's transactions
  app.get("/api/transactions", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      return res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  });

  // Get news feed
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getLatestNews();
      return res.status(200).json(news);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching news" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize country data
async function initializeCountryData() {
  try {
    // Check if countries already exist
    const existingCountries = await storage.getAllCountries();
    
    if (existingCountries.length === 0) {
      // Initialize countries with default values
      for (const country of countries) {
        await storage.addCountry({
          countryCode: country.code,
          countryName: country.name,
          totalShares: 10000000,
          availableShares: 10000000,
          currentPrice: "0.5",
          previousPrice: "0.5",
          isPreSale: true,
          preSaleProgress: "0"
        });
      }

      // Set pre-sale progress for featured countries
      for (const featured of featuredCountries) {
        const progress = (featured.preSaleProgress / 100).toString();
        const availableShares = Math.floor(10000000 * (1 - featured.preSaleProgress / 100));
        
        await storage.updateCountry(featured.code, {
          preSaleProgress: progress,
          availableShares
        });
      }
    }

    // Initialize news feed if empty
    const existingNews = await storage.getLatestNews();
    
    if (existingNews.length === 0) {
      for (const news of newsFeed) {
        await storage.addNewsItem({
          countryCode: news.code,
          title: news.headline,
          content: news.headline,
          source: "Sekance News"
        });
      }
    }
  } catch (error) {
    console.error("Error initializing country data:", error);
  }
}
