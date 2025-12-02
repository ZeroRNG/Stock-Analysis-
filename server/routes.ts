import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import YahooFinance from "yahoo-finance2";
import PDFDocument from "pdfkit";
import OpenAI from "openai";
import type { 
  MarketSentiment, 
  NewsArticle, 
  StockData,
  PdfReportRequest 
} from "@shared/schema";
import type { IStorage } from "./storage";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MARKET_INDICES = [
  { name: "S&P 500", symbol: "^GSPC" },
  { name: "NASDAQ", symbol: "^IXIC" },
  { name: "Dow Jones", symbol: "^DJI" },
  { name: "Bitcoin", symbol: "BTC-USD" },
  { name: "Gold", symbol: "GC=F" },
];

function classifyNews(title: string): { sentiment: "Bullish" | "Bearish" | "Neutral"; sentimentColor: string; category: string } {
  const lowerTitle = title.toLowerCase();
  
  const bearishWords = ["falls", "drop", "plunge", "down", "loss", "selloff", "cuts", "fears", "crash", "decline"];
  const bullishWords = ["jumps", "rises", "up", "soars", "beats", "growth", "record", "rally", "surge", "gain"];
  
  let sentiment: "Bullish" | "Bearish" | "Neutral" = "Neutral";
  let sentimentColor = "#9CA3AF";
  
  if (bearishWords.some(w => lowerTitle.includes(w))) {
    sentiment = "Bearish";
    sentimentColor = "#EF4444";
  } else if (bullishWords.some(w => lowerTitle.includes(w))) {
    sentiment = "Bullish";
    sentimentColor = "#10B981";
  }
  
  let category = "Markets";
  if (lowerTitle.includes("bitcoin") || lowerTitle.includes("crypto")) {
    category = "Crypto";
  } else if (lowerTitle.includes("fed") || lowerTitle.includes("inflation")) {
    category = "Macro";
  } else if (lowerTitle.includes("earnings")) {
    category = "Earnings";
  } else if (lowerTitle.includes("trump") || lowerTitle.includes("election")) {
    category = "Politics";
  }
  
  return { sentiment, sentimentColor, category };
}

function getDateMonthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password || username.length < 3 || password.length < 4) {
        return res.status(400).json({ error: "Invalid username or password" });
      }
      
      const existing = await app.locals.storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }
      
      const user = await app.locals.storage.createUser({ username, password });
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const user = await app.locals.storage.getUserByUsername(username);
      if (!user || !app.locals.storage.verifyPassword(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out" });
      });
    } else {
      res.json({ message: "Logged out" });
    }
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ userId });
  });
  
  app.get("/api/market-sentiment", async (_req: Request, res: Response) => {
    try {
      const results: MarketSentiment[] = await Promise.all(
        MARKET_INDICES.map(async ({ name, symbol }) => {
          try {
            const quote = await yahooFinance.quote(symbol);
            const change = quote.regularMarketChangePercent ?? null;
            return {
              name,
              symbol,
              change: change !== null ? Math.round(change * 100) / 100 : null,
            };
          } catch {
            return { name, symbol, change: null };
          }
        })
      );
      res.json(results);
    } catch (error) {
      console.error("Market sentiment error:", error);
      res.status(500).json({ error: "Failed to fetch market sentiment" });
    }
  });

  app.get("/api/news", async (_req: Request, res: Response) => {
    try {
      const apiKey = process.env.NEWS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "News API key not configured" });
      }
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=stocks+business&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }
      
      const data = await response.json();
      const seenUrls = new Set<string>();
      const articles: NewsArticle[] = [];
      
      for (const a of (data.articles || [])) {
        if (articles.length >= 6) break;
        
        const url = a.url || "";
        if (url && seenUrls.has(url)) continue;
        
        if (url) seenUrls.add(url);
        
        const { sentiment, sentimentColor, category } = classifyNews(a.title || "");
        articles.push({
          title: a.title || "No Title",
          source: a.source?.name || "Unknown",
          image: a.urlToImage || null,
          url: url || null,
          published: a.publishedAt || null,
          sentiment,
          sentimentColor,
          category,
        });
      }
      
      res.json(articles);
    } catch (error) {
      console.error("News fetch error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { question } = req.body;
      
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are StockSense AI, an expert financial advisor specializing in stock market analysis, technical indicators, and investment insights. Provide clear, concise, and actionable advice."
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 1024,
      });
      
      const responseText = response.choices[0].message.content || "Unable to generate response";
      
      res.json({ response: responseText });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  app.get("/api/stock/:ticker", async (req: Request, res: Response) => {
    try {
      const { ticker } = req.params;
      const upperTicker = ticker.toUpperCase();
      
      const sixMonthsAgo = getDateMonthsAgo(6);
      const oneMonthAgo = getDateMonthsAgo(1);
      
      const [quote, history] = await Promise.all([
        yahooFinance.quote(upperTicker),
        yahooFinance.chart(upperTicker, { period1: sixMonthsAgo, interval: "1d" }),
      ]);
      
      const priceHistory = history.quotes.map((q: any) => ({
        date: q.date?.toISOString() || new Date().toISOString(),
        close: q.close || 0,
        open: q.open,
        high: q.high,
        low: q.low,
        volume: q.volume,
      })).filter((p: any) => p.close > 0);
      
      let sma50 = null;
      let sma200 = null;
      let volatility = null;
      let roc = null;
      let relativeStrength = null;
      
      if (priceHistory.length >= 50) {
        const closes = priceHistory.map((p: any) => p.close);
        const last50 = closes.slice(-50);
        sma50 = last50.reduce((a: number, b: number) => a + b, 0) / 50;
        
        if (closes.length >= 200) {
          const last200 = closes.slice(-200);
          sma200 = last200.reduce((a: number, b: number) => a + b, 0) / 200;
        }
        
        if (closes.length >= 30) {
          const returns = [];
          for (let i = closes.length - 30; i < closes.length; i++) {
            if (closes[i - 1]) {
              returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
            }
          }
          if (returns.length > 0) {
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
            volatility = Math.sqrt(variance) * 100;
          }
        }
        
        if (closes.length >= 14) {
          const current = closes[closes.length - 1];
          const prev14 = closes[closes.length - 15];
          if (prev14) {
            roc = ((current - prev14) / prev14) * 100;
          }
        }
        
        try {
          const spyHistory = await yahooFinance.chart("SPY", { period1: oneMonthAgo, interval: "1d" });
          const spyCloses = spyHistory.quotes.map((q: any) => q.close).filter(Boolean);
          if (spyCloses.length >= 2 && closes.length >= 30) {
            const stockReturn = (closes[closes.length - 1] - closes[closes.length - 30]) / closes[closes.length - 30];
            const spyReturn = (spyCloses[spyCloses.length - 1] - spyCloses[0]) / spyCloses[0];
            relativeStrength = (stockReturn - spyReturn) * 100;
          }
        } catch {
          relativeStrength = null;
        }
      }
      
      const stockData: StockData = {
        basicInfo: {
          currentPrice: quote.regularMarketPrice || "N/A",
          marketCap: quote.marketCap || "N/A",
          peRatio: quote.trailingPE || "N/A",
          name: quote.shortName || quote.longName || upperTicker,
          symbol: upperTicker,
        },
        indicators: {
          sma50: sma50 !== null ? Math.round(sma50 * 100) / 100 : null,
          sma200: sma200 !== null ? Math.round(sma200 * 100) / 100 : null,
          volatility: volatility !== null ? Math.round(volatility * 100) / 100 : null,
          roc: roc !== null ? Math.round(roc * 100) / 100 : null,
          relativeStrength: relativeStrength !== null ? Math.round(relativeStrength * 100) / 100 : null,
        },
        priceHistory,
      };
      
      res.json(stockData);
    } catch (error) {
      console.error("Stock fetch error:", error);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  app.post("/api/generate-pdf", async (req: Request, res: Response) => {
    try {
      const { ticker, question, aiAnalysis, indicators }: PdfReportRequest = req.body;
      
      if (!ticker || !question || !aiAnalysis || !indicators) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=stocksense_${ticker}_report.pdf`);
      
      doc.pipe(res);
      
      doc.fontSize(20).font("Helvetica-Bold").text("StockSense AI — Analysis Report", { align: "center" });
      doc.moveDown();
      
      doc.fontSize(14).font("Helvetica-Bold").text(`Ticker: ${ticker}`);
      doc.moveDown(0.5);
      
      doc.fontSize(12).font("Helvetica-Bold").text("User Question:");
      doc.fontSize(10).font("Helvetica").text(question);
      doc.moveDown();
      
      doc.fontSize(12).font("Helvetica-Bold").text("Technical Indicators:");
      doc.fontSize(10).font("Helvetica");
      doc.text(`SMA 50: ${indicators.sma50 !== null ? `$${indicators.sma50}` : "N/A"}`);
      doc.text(`SMA 200: ${indicators.sma200 !== null ? `$${indicators.sma200}` : "N/A"}`);
      doc.text(`Volatility (30d): ${indicators.volatility !== null ? `${indicators.volatility}%` : "N/A"}`);
      doc.text(`Momentum (ROC 14): ${indicators.roc !== null ? `${indicators.roc}%` : "N/A"}`);
      doc.text(`Relative Strength vs S&P500: ${indicators.relativeStrength !== null ? `${indicators.relativeStrength}%` : "N/A"}`);
      doc.moveDown();
      
      doc.fontSize(12).font("Helvetica-Bold").text("AI Analysis:");
      doc.fontSize(10).font("Helvetica").text(aiAnalysis);
      doc.moveDown();
      
      doc.fontSize(8).fillColor("gray").text(`Generated on ${new Date().toISOString()}`, { align: "center" });
      doc.text("Data provided for informational purposes only. Not financial advice.", { align: "center" });
      
      doc.end();
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  return httpServer;
}
