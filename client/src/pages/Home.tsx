import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketSentimentHeatmap } from "@/components/MarketSentimentHeatmap";
import { NewsCards } from "@/components/NewsCards";
import { ChatBot } from "@/components/ChatBot";
import { StockLookup } from "@/components/StockLookup";
import { PdfExport } from "@/components/PdfExport";
import type { TechnicalIndicators } from "@shared/schema";

export default function Home() {
  const [lastTicker, setLastTicker] = useState<string | null>("AAPL");
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [lastAiAnalysis, setLastAiAnalysis] = useState<string | null>(null);
  const [lastIndicators, setLastIndicators] = useState<TechnicalIndicators | null>(null);

  const handleChatQuestion = useCallback((question: string, response: string) => {
    setLastQuestion(question);
    setLastAiAnalysis(response);
  }, []);

  const handleTickerChange = useCallback((ticker: string) => {
    setLastTicker(ticker);
  }, []);

  const handleIndicatorsLoaded = useCallback((indicators: TechnicalIndicators) => {
    setLastIndicators(indicators);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <MarketSentimentHeatmap />
        
        <div className="border-t border-border my-8" />
        
        <NewsCards />
        
        <div className="border-t border-border my-8" />
        
        <ChatBot onAskQuestion={handleChatQuestion} />
        
        <div className="border-t border-border my-8" />
        
        <StockLookup 
          onTickerChange={handleTickerChange}
          onIndicatorsLoaded={handleIndicatorsLoaded}
        />
        
        <div className="border-t border-border my-8" />
        
        <PdfExport
          ticker={lastTicker}
          question={lastQuestion}
          aiAnalysis={lastAiAnalysis}
          indicators={lastIndicators}
        />
      </main>
      
      <Footer />
    </div>
  );
}
