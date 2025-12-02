import logoPath from "@assets/Logo for Fintech Brand 'StockSense AI'_1764652532258.jpg";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img 
            src={logoPath} 
            alt="StockSense AI" 
            className="h-24 w-auto"
            data-testid="logo"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight" data-testid="app-title">
              StockSense AI
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Smarter Markets. Smarter Decisions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-bullish animate-pulse"></span>
            Live Market Data
          </div>
          <Button
            data-testid="button-logout"
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
