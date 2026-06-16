import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, ExternalLink, X, Newspaper } from "lucide-react";

interface CryptoRate {
  id: string;
  crypto_name: string;
  crypto_symbol: string;
  buy_rate: number;
  sell_rate: number;
  currency: string;
  updated_at: string;
}

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

const CryptoMarketSection = () => {
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"rates" | "market" | "movers">("rates");
  const [movers, setMovers] = useState<CoinData[]>([]);
  const [moversLoading, setMoversLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase
        .from("crypto_rates")
        .select("*")
        .order("crypto_name");
      if (data) setRates(data as CryptoRate[]);
      setRatesLoading(false);
    };
    fetchRates();
  }, []);

  const fetchPrices = async () => {
    try {
      setPricesLoading(true);
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
      setPricesLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchMovers = async () => {
    try {
      setMoversLoading(true);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h&sparkline=false`
      );
      if (res.ok) {
        const data: CoinData[] = await res.json();
        const sorted = [...data].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
        const gainers = sorted.slice(0, 5);
        const losers = sorted.slice(-5).reverse();
        setMovers([...gainers, ...losers]);
      }
    } catch (e) { console.error("movers fetch", e); }
    finally { setMoversLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "movers" && movers.length === 0) fetchMovers();
  }, [activeTab]);

  const fetchNews = async (coin: CoinData) => {
    setSelectedCoin(coin);
    setNewsLoading(true);
    setNews([]);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`
      );
      if (res.ok) {
        const data = await res.json();
        const links: NewsItem[] = [];
        if (data.links?.homepage?.[0]) links.push({ title: `${coin.name} Official Website`, url: data.links.homepage[0], source: "Official", published_at: "" });
        if (data.links?.blockchain_site?.[0]) links.push({ title: `${coin.name} on Blockchain Explorer`, url: data.links.blockchain_site[0], source: "Explorer", published_at: "" });
        if (data.links?.subreddit_url) links.push({ title: `${coin.name} Reddit Community`, url: data.links.subreddit_url, source: "Reddit", published_at: "" });
        if (data.links?.repos_url?.github?.[0]) links.push({ title: `${coin.name} GitHub Repository`, url: data.links.repos_url.github[0], source: "GitHub", published_at: "" });
        links.push({ title: `${coin.name} on CoinGecko`, url: `https://www.coingecko.com/en/coins/${coin.id}`, source: "CoinGecko", published_at: "" });
        links.push({ title: `Latest ${coin.name} News on Google`, url: `https://news.google.com/search?q=${encodeURIComponent(coin.name + " crypto")}`, source: "Google News", published_at: "" });
        setNews(links);
      }
    } catch {
      setNews([
        { title: `${coin.name} on CoinGecko`, url: `https://www.coingecko.com/en/coins/${coin.id}`, source: "CoinGecko", published_at: "" },
        { title: `Latest ${coin.name} News`, url: `https://news.google.com/search?q=${encodeURIComponent(coin.name + " crypto")}`, source: "Google News", published_at: "" },
      ]);
    } finally {
      setNewsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(4)}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("rates")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "rates"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <ArrowUpDown size={15} /> Our Rates (GHS)
        </button>
        <button
          onClick={() => setActiveTab("market")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "market"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <TrendingUp size={15} /> Live Market (USD)
        </button>
        <button
          onClick={() => setActiveTab("movers")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "movers"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <TrendingUp size={15} /> Top Movers (24h)
        </button>
      </div>

      <div className="p-5">
        {/* Our Rates Tab */}
        {activeTab === "rates" && (
          <>
            {ratesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : rates.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No rates available yet.</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">Buy/Sell rates in GHS</p>
                  <span className="text-[10px] text-muted-foreground">
                    Updated {rates[0] ? new Date(rates[0].updated_at).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="rounded-lg border border-border bg-muted/30 p-3 text-center transition-all hover:border-primary/30"
                    >
                      <p className="text-xs font-bold text-primary mb-1">{rate.crypto_symbol}</p>
                      <p className="text-[10px] text-muted-foreground mb-2 truncate">{rate.crypto_name}</p>
                      <div className="flex justify-between text-[10px]">
                        <div>
                          <span className="text-muted-foreground">Buy</span>
                          <p className="font-bold text-card-foreground">{rate.buy_rate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sell</span>
                          <p className="font-bold text-card-foreground">{rate.sell_rate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Live Market Tab */}
        {activeTab === "market" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">Click any coin for resources & news</p>
              <button
                onClick={fetchPrices}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw size={12} className={pricesLoading ? "animate-spin" : ""} />
                {lastUpdated ? `${lastUpdated.toLocaleTimeString()}` : "Refresh"}
              </button>
            </div>
            {pricesLoading && coins.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-20 mb-2" />
                    <div className="h-5 bg-muted rounded w-28" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {coins.map((coin) => {
                  const isPositive = coin.price_change_percentage_24h >= 0;
                  return (
                    <button
                      key={coin.id}
                      onClick={() => fetchNews(coin)}
                      className="rounded-lg border border-border bg-muted/30 p-4 transition-all duration-300 hover:scale-105 hover:border-primary/40 cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                        <span className="text-xs font-semibold text-card-foreground">{coin.name}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{coin.symbol}</span>
                        <Newspaper size={12} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-sm font-bold text-card-foreground font-display">
                          {formatPrice(coin.current_price)}
                        </span>
                        <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-[hsl(142,70%,40%)]" : "text-destructive"}`}>
                          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* News Dialog */}
      {selectedCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedCoin(null)}>
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedCoin(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
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
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group/link">
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

export default CryptoMarketSection;
