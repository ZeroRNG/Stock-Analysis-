import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Newspaper } from "lucide-react";
import type { NewsArticle } from "@shared/schema";

function timeAgo(published: string | null): string {
  if (!published) return "Unknown";
  
  const publishedDate = new Date(published);
  const now = new Date();
  const diff = now.getTime() - publishedDate.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full aspect-video" />
      <div className="p-4">
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-3/4 mb-4" />
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case "Bullish":
        return "bg-bullish text-primary-foreground";
      case "Bearish":
        return "bg-bearish text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover-elevate group"
      data-testid={`news-card-${article.title.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="aspect-[3/2] overflow-hidden bg-muted">
        <img
          src={article.image || "https://via.placeholder.com/400x225?text=No+Image"}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=No+Image";
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
          {article.title}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="secondary" className="text-xs">
            {article.category}
          </Badge>
          <Badge 
            className={`text-xs ${getSentimentStyles(article.sentiment)}`}
          >
            {article.sentiment}
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {timeAgo(article.published)}
          </Badge>
        </div>
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            data-testid="news-read-more-link"
          >
            Read more
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </Card>
  );
}

export function NewsCards() {
  const { data: articles, isLoading, error } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  return (
    <section className="mb-8" data-testid="news-section">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Newspaper className="w-6 h-6 text-primary" />
        Market Pulse — Latest Business News
      </h2>
      
      {error && (
        <Card className="p-6 text-center text-muted-foreground">
          Could not load news. Please try again later.
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))
          : articles?.map((article, idx) => (
              <NewsCard key={idx} article={article} />
            ))}
      </div>
    </section>
  );
}
