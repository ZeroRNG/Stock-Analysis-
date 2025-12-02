import { z } from "zod";

export const marketSentimentSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  change: z.number().nullable(),
});

export type MarketSentiment = z.infer<typeof marketSentimentSchema>;

export const newsArticleSchema = z.object({
  title: z.string(),
  source: z.string(),
  image: z.string().nullable(),
  url: z.string().nullable(),
  published: z.string().nullable(),
  sentiment: z.enum(["Bullish", "Bearish", "Neutral"]),
  sentimentColor: z.string(),
  category: z.string(),
});

export type NewsArticle = z.infer<typeof newsArticleSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  question: z.string().min(1),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const stockBasicInfoSchema = z.object({
  currentPrice: z.union([z.number(), z.string()]),
  marketCap: z.union([z.number(), z.string()]),
  peRatio: z.union([z.number(), z.string()]),
  name: z.string().optional(),
  symbol: z.string().optional(),
});

export type StockBasicInfo = z.infer<typeof stockBasicInfoSchema>;

export const technicalIndicatorsSchema = z.object({
  sma50: z.number().nullable(),
  sma200: z.number().nullable(),
  volatility: z.number().nullable(),
  relativeStrength: z.number().nullable(),
  roc: z.number().nullable(),
});

export type TechnicalIndicators = z.infer<typeof technicalIndicatorsSchema>;

export const priceHistoryPointSchema = z.object({
  date: z.string(),
  close: z.number(),
  open: z.number().optional(),
  high: z.number().optional(),
  low: z.number().optional(),
  volume: z.number().optional(),
});

export type PriceHistoryPoint = z.infer<typeof priceHistoryPointSchema>;

export const stockDataSchema = z.object({
  basicInfo: stockBasicInfoSchema,
  indicators: technicalIndicatorsSchema,
  priceHistory: z.array(priceHistoryPointSchema),
});

export type StockData = z.infer<typeof stockDataSchema>;

export const pdfReportRequestSchema = z.object({
  ticker: z.string(),
  question: z.string(),
  aiAnalysis: z.string(),
  indicators: technicalIndicatorsSchema,
});

export type PdfReportRequest = z.infer<typeof pdfReportRequestSchema>;

export const users = {};
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
