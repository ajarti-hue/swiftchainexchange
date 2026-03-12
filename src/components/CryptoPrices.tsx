import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink, X, Newspaper } from "lucide-react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
  published_at: string;
}

const COINS = ["bitcoin", "ethereum", "bitcoin-cash", "ripple", "tether", "litecoin", "stellar", "dash"];

const CryptoPrices = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

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

  const fetchNews = async (coin: CoinData) => {
    setSelectedCoin(coin);
    setNewsLoading(true);
    setNews([]);
    try {
      // Use CoinGecko's status updates or a free news proxy
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`
      );
      if (res.ok) {
        const data = await res.json();
        const description = data.description?.en || "";
        // Build pseudo-news from coin info + links
        const links: NewsItem[] = [];
        if (data.links?.homepage?.[0]) {
          links.push({ title: `${coin.name} Official Website`, url: data.links.homepage[0], source: "Official", published_at: "" });
        }
        if (data.links?.blockchain_site?.[0]) {
          links.push({ title: `${coin.name} on Blockchain Explorer`, url: data.links.blockchain_site[0], source: "Explorer", published_at: "" });
        }
        if (data.links?.subreddit_url) {
          links.push({ title: `${coin.name} Reddit Community`, url: data.links.subreddit_url, source: "Reddit", published_at: "" });
        }
        if (data.links?.repos_url?.github?.[0]) {
          links.push({ title: `${coin.name} GitHub Repository`, url: data.links.repos_url.github[0], source: "GitHub", published_at: "" });
        }
        // Add a CoinGecko page link
        links.push({ title: `${coin.name} on CoinGecko`, url: `https://www.coingecko.com/en/coins/${coin.id}`, source: "CoinGecko", published_at: "" });
        // Add a Google News search link
        links.push({ title: `Latest ${coin.name} News on Google`, url: `https://news.google.com/search?q=${encodeURIComponent(coin.name + " crypto")}`, source: "Google News", published_at: "" });
        setNews(links);
      }
    } catch (err) {
      console.error("Failed to fetch news", err);
      // Fallback links
      setNews([
        { title: `${coin.name} on CoinGecko`, url: `https://www.coingecko.com/en/coins/${coin.id}`, source: "CoinGecko", published_at: "" },
        { title: `Latest ${coin.name} News`, url: `https://news.google.com/search?q=${encodeURIComponent(coin.name + " crypto")}`, source: "Google News", published_at: "" },
      ]);
    } finally {
      setNewsLoading(false);
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
            <button
              key={coin.id}
              onClick={() => fetchNews(coin)}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-button)] hover:border-primary/40 cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <span className="text-sm font-semibold text-card-foreground">{coin.name}</span>
                  <span className="ml-1.5 text-xs font-bold text-muted-foreground uppercase">{coin.symbol}</span>
                </div>
                <Newspaper size={14} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            </button>
          );
        })}
      </div>

      {/* News Dialog */}
      {selectedCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedCoin(null)}>
          <div
            className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCoin(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <img src={selectedCoin.image} alt={selectedCoin.name} className="h-10 w-10 rounded-full" />
              <div>
                <h3 className="font-display text-lg font-bold text-card-foreground">{selectedCoin.name}</h3>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{selectedCoin.symbol} · {formatPrice(selectedCoin.current_price)}</p>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-card-foreground mb-3">Resources & News</h4>
            {newsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {news.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group/link"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.source}</p>
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground shrink-0 group-hover/link:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoPrices;
