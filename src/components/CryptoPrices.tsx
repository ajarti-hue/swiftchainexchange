import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const COINS = ["bitcoin", "ethereum", "bitcoin-cash", "ripple", "tether", "litecoin", "stellar", "dash"];

const CryptoPrices = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(",")}&order=market_cap_desc&sparkline=false`
      );
      if (res.ok) {
        const data = await res.json();
        setCoins(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch crypto prices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(4)}`;
  };

  if (loading && coins.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-3" />
            <div className="h-6 bg-muted rounded w-32 mb-2" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Live Market Prices</h2>
        <button
          onClick={fetchPrices}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Refresh"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coins.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <div
              key={coin.id}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-button)] transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                <div>
                  <span className="text-sm font-semibold text-card-foreground">{coin.name}</span>
                  <span className="ml-1.5 text-xs font-bold text-muted-foreground uppercase">{coin.symbol}</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-bold text-card-foreground font-display">
                  {formatPrice(coin.current_price)}
                </span>
                <div className={`flex items-center gap-0.5 text-sm font-semibold ${isPositive ? "text-[hsl(142_70%_40%)]" : "text-destructive"}`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoPrices;
