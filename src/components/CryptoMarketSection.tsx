import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, RefreshCw, ExternalLink, X, Newspaper, LineChart } from "lucide-react";

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

type Tab = "buy" | "sell" | "market" | "movers";

const CryptoMarketSection = ({ defaultTab = "buy" as Tab }: { defaultTab?: Tab }) => {
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [movers, setMovers] = useState<CoinData[]>([]);
  const [moversLoading, setMoversLoading] = useState(false);

  useEffect(() => {
    supabase.from("crypto_rates").select("*").order("crypto_name").then(({ data }) => {
      if (data) setRates(data as CryptoRate[]);
      setRatesLoading(false);
    });
  }, []);

  const fetchPrices = async () => {
    try {
      setPricesLoading(true);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(",")}&order=market_cap_desc&sparkline=false`
      );
      if (res.ok) {
        setCoins(await res.json());
        setLastUpdated(new Date());
      }
    } catch (err) { console.error(err); }
    finally { setPricesLoading(false); }
  };

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 60000);
    return () => clearInterval(id);
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
        setMovers([...sorted.slice(0, 5), ...sorted.slice(-5).reverse()]);
      }
    } catch (e) { console.error(e); }
    finally { setMoversLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "movers" && movers.length === 0) fetchMovers();
  }, [activeTab]);

  const fetchNews = async (coin: CoinData) => {
    setSelectedCoin(coin); setNewsLoading(true); setNews([]);
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`);
      const links: NewsItem[] = [];
      if (res.ok) {
        const data = await res.json();
        if (data.links?.homepage?.[0]) links.push({ title: `${coin.name} Official Website`, url: data.links.homepage[0], source: "Official", published_at: "" });
        if (data.links?.subreddit_url) links.push({ title: `${coin.name} Reddit`, url: data.links.subreddit_url, source: "Reddit", published_at: "" });
      }
      links.push({ title: `${coin.name} on CoinGecko`, url: `https://www.coingecko.com/en/coins/${coin.id}`, source: "CoinGecko", published_at: "" });
      links.push({ title: `Latest ${coin.name} News`, url: `https://news.google.com/search?q=${encodeURIComponent(coin.name + " crypto")}`, source: "Google News", published_at: "" });
      setNews(links);
    } finally { setNewsLoading(false); }
  };

  const formatPrice = (p: number) => p >= 1 ? `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${p.toFixed(4)}`;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "buy", label: "Buy Rates (GHS)", icon: ArrowDownToLine },
    { id: "sell", label: "Sell Rates (GHS)", icon: ArrowUpFromLine },
    { id: "market", label: "Live Market", icon: LineChart },
    { id: "movers", label: "Top Movers", icon: TrendingUp },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === id ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {(activeTab === "buy" || activeTab === "sell") && (
          <>
            {ratesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
              </div>
            ) : rates.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No rates available yet.</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  {activeTab === "buy" ? "Rate we sell crypto to you (GHS per $1)" : "Rate we buy crypto from you (GHS per $1)"} · Updated {rates[0] ? new Date(rates[0].updated_at).toLocaleDateString() : "—"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rates.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border bg-muted/30 p-4 text-center hover:border-primary/40 transition-all">
                      <p className="text-sm font-bold text-primary mb-1">{r.crypto_symbol}</p>
                      <p className="text-[10px] text-muted-foreground mb-2 truncate">{r.crypto_name}</p>
                      <p className={`text-lg font-bold font-display ${activeTab === "buy" ? "text-foreground" : "text-[hsl(142,70%,40%)]"}`}>
                        ₵{activeTab === "buy" ? r.buy_rate : r.sell_rate}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "market" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">Click any coin for resources</p>
              <button onClick={fetchPrices} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw size={12} className={pricesLoading ? "animate-spin" : ""} />
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "Refresh"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {coins.map((coin) => {
                const isUp = coin.price_change_percentage_24h >= 0;
                return (
                  <button key={coin.id} onClick={() => fetchNews(coin)} className="rounded-lg border border-border bg-muted/30 p-4 hover:scale-105 hover:border-primary/40 transition-all text-left group">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                      <span className="text-xs font-semibold">{coin.name}</span>
                      <Newspaper size={12} className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground" />
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-bold font-display">{formatPrice(coin.current_price)}</span>
                      <div className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? "text-[hsl(142,70%,40%)]" : "text-destructive"}`}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "movers" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">Top 5 gainers & losers — last 24h</p>
              <button onClick={fetchMovers} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw size={12} className={moversLoading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
            {moversLoading && movers.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "GAINERS", color: "text-[hsl(142,70%,40%)]", items: movers.slice(0, 5), icon: TrendingUp, sign: "+" },
                  { title: "LOSERS", color: "text-destructive", items: movers.slice(5), icon: TrendingDown, sign: "" },
                ].map((g) => (
                  <div key={g.title}>
                    <h4 className={`text-xs font-bold mb-2 flex items-center gap-1 ${g.color}`}><g.icon size={12} /> {g.title}</h4>
                    <div className="space-y-2">
                      {g.items.map((coin) => (
                        <button key={coin.id} onClick={() => fetchNews(coin)} className="w-full flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:border-primary/40 transition-all text-left">
                          <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{coin.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{coin.symbol}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">{formatPrice(coin.current_price)}</p>
                            <p className={`text-[11px] font-semibold ${g.color}`}>{g.sign}{coin.price_change_percentage_24h.toFixed(2)}%</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedCoin(null)}>
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedCoin(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            <div className="flex items-center gap-3 mb-5">
              <img src={selectedCoin.image} alt={selectedCoin.name} className="h-10 w-10 rounded-full" />
              <div>
                <h3 className="font-display text-lg font-bold">{selectedCoin.name}</h3>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{selectedCoin.symbol} · {formatPrice(selectedCoin.current_price)}</p>
              </div>
            </div>
            <h4 className="text-sm font-semibold mb-3">Resources & News</h4>
            {newsLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {news.map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group/link">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.source}</p>
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground shrink-0 group-hover/link:text-primary" />
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
