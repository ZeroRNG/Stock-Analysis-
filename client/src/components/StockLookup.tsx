import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { StockData } from "@shared/schema";

interface StockLookupProps {
  onTickerChange: (ticker: string) => void;
  onIndicatorsLoaded: (indicators: StockData["indicators"]) => void;
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  isLoading 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className="text-xl font-mono font-semibold">
            {typeof value === "number" 
              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function formatMarketCap(value: number | string): string {
  if (typeof value === "string") return value;
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export function StockLookup({ onTickerChange, onIndicatorsLoaded }: StockLookupProps) {
  const [inputTicker, setInputTicker] = useState("AAPL");
  const [ticker, setTicker] = useState("AAPL");

  const { data: stockData, isLoading, error } = useQuery<StockData>({
    queryKey: ["/api/stock", ticker],
    enabled: !!ticker,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      const normalizedTicker = inputTicker.trim().toUpperCase();
      setTicker(normalizedTicker);
      onTickerChange(normalizedTicker);
    }
  };

  useEffect(() => {
    if (stockData?.indicators) {
      onIndicatorsLoaded(stockData.indicators);
    }
  }, [stockData?.indicators, onIndicatorsLoaded]);

  useEffect(() => {
    onTickerChange(ticker);
  }, [ticker, onTickerChange]);

  const chartData = stockData?.priceHistory?.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    close: point.close,
  })) || [];

  return (
    <section className="mb-12" data-testid="stock-lookup-section">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Search className="w-6 h-6" />
        Quick Stock Lookup
      </h2>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <Input
          value={inputTicker}
          onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
          placeholder="Enter ticker (e.g., AAPL, TSLA, MSFT)"
          className="max-w-xs font-mono"
          data-testid="ticker-input"
        />
        <Button type="submit" data-testid="search-ticker-btn">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>

      {error && (
        <Card className="p-6 text-center text-muted-foreground mb-6">
          Could not load stock data for {ticker}. Please check the ticker and try again.
        </Card>
      )}

      {(isLoading || stockData) && (
        <>
          <Card className="mb-6 p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-lg">{ticker}</span>
                {stockData?.basicInfo?.name && (
                  <span className="text-muted-foreground font-normal text-base">
                    — {stockData.basicInfo.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <Skeleton className="w-full h-64 rounded-xl" />
              ) : chartData.length > 0 ? (
                <div className="h-64" data-testid="price-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        tickFormatter={(val) => `$${val}`}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--popover-foreground))",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No price history available
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard
              label="Current Price"
              value={stockData?.basicInfo?.currentPrice 
                ? `$${typeof stockData.basicInfo.currentPrice === 'number' 
                    ? stockData.basicInfo.currentPrice.toFixed(2) 
                    : stockData.basicInfo.currentPrice}`
                : "N/A"}
              icon={DollarSign}
              isLoading={isLoading}
            />
            <MetricCard
              label="Market Cap"
              value={stockData?.basicInfo?.marketCap 
                ? formatMarketCap(stockData.basicInfo.marketCap)
                : "N/A"}
              icon={BarChart3}
              isLoading={isLoading}
            />
            <MetricCard
              label="P/E Ratio"
              value={stockData?.basicInfo?.peRatio ?? "N/A"}
              icon={TrendingUp}
              isLoading={isLoading}
            />
          </div>

          <TechnicalIndicatorsPanel 
            indicators={stockData?.indicators} 
            isLoading={isLoading} 
          />
        </>
      )}
    </section>
  );
}

function TechnicalIndicatorsPanel({ 
  indicators, 
  isLoading 
}: { 
  indicators?: StockData["indicators"]; 
  isLoading: boolean;
}) {
  return (
    <div data-testid="technical-indicators">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Technical Indicators
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">SMA 50</div>
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <p className="text-lg font-mono font-semibold">
                {indicators?.sma50 !== null ? `$${indicators?.sma50?.toFixed(2)}` : "N/A"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">SMA 200</div>
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <p className="text-lg font-mono font-semibold">
                {indicators?.sma200 !== null ? `$${indicators?.sma200?.toFixed(2)}` : "N/A"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Volatility (30d)</div>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-lg font-mono font-semibold">
                {indicators?.volatility !== null ? `${indicators?.volatility?.toFixed(2)}%` : "N/A"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Momentum (ROC 14)</div>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className={`text-lg font-mono font-semibold ${
                indicators?.roc && indicators.roc > 0 ? "text-bullish" : 
                indicators?.roc && indicators.roc < 0 ? "text-bearish" : ""
              }`}>
                {indicators?.roc !== null 
                  ? `${indicators?.roc >= 0 ? '+' : ''}${indicators?.roc?.toFixed(2)}%` 
                  : "N/A"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Rel. Strength vs S&P</div>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className={`text-lg font-mono font-semibold ${
                indicators?.relativeStrength && indicators.relativeStrength > 0 ? "text-bullish" : 
                indicators?.relativeStrength && indicators.relativeStrength < 0 ? "text-bearish" : ""
              }`}>
                {indicators?.relativeStrength !== null 
                  ? `${indicators?.relativeStrength >= 0 ? '+' : ''}${indicators?.relativeStrength?.toFixed(2)}%` 
                  : "N/A"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
