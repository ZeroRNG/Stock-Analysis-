import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MarketSentiment } from "@shared/schema";

function SentimentCard({ item, isLoading }: { item?: MarketSentiment; isLoading: boolean }) {
  if (isLoading || !item) {
    return (
      <div className="rounded-2xl p-4 bg-card border border-card-border">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-6 w-20" />
      </div>
    );
  }

  const { name, change } = item;
  
  let bgColor = "bg-muted";
  let textColor = "text-muted-foreground";
  let Icon = Minus;
  let statusText = "N/A";
  
  if (change !== null) {
    if (change > 1) {
      bgColor = "bg-bullish";
      textColor = "text-bullish-foreground";
      Icon = TrendingUp;
      statusText = `+${change.toFixed(2)}%`;
    } else if (change < -1) {
      bgColor = "bg-bearish";
      textColor = "text-white";
      Icon = TrendingDown;
      statusText = `${change.toFixed(2)}%`;
    } else {
      bgColor = "bg-neutral";
      textColor = "text-black";
      Icon = Minus;
      statusText = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    }
  }

  return (
    <div 
      className={`rounded-2xl p-4 ${bgColor} shadow-lg transition-transform hover:-translate-y-1`}
      data-testid={`sentiment-card-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`text-sm font-medium ${textColor} opacity-90`}>{name}</div>
      <div className={`flex items-center gap-2 mt-1 ${textColor}`}>
        <Icon className="w-5 h-5" />
        <span className="text-lg font-mono font-semibold">{statusText}</span>
      </div>
    </div>
  );
}

export function MarketSentimentHeatmap() {
  const { data: sentiments, isLoading } = useQuery<MarketSentiment[]>({
    queryKey: ["/api/market-sentiment"],
  });

  const defaultItems: MarketSentiment[] = [
    { name: "S&P 500", symbol: "^GSPC", change: null },
    { name: "NASDAQ", symbol: "^IXIC", change: null },
    { name: "Dow Jones", symbol: "^DJI", change: null },
    { name: "Bitcoin", symbol: "BTC-USD", change: null },
    { name: "Gold", symbol: "GC=F", change: null },
  ];

  const items = sentiments || defaultItems;

  return (
    <section className="mb-12" data-testid="market-sentiment-section">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-primary" />
        Market Sentiment Heatmap
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item, idx) => (
          <SentimentCard 
            key={item.symbol || idx} 
            item={item} 
            isLoading={isLoading} 
          />
        ))}
      </div>
    </section>
  );
}
