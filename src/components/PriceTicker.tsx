import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const PriceTicker = () => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1"
        );
        const data = await r.json();
        if (Array.isArray(data)) setCoins(data);
      } catch {
        /* silent */
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  if (coins.length === 0) return null;

  const row = [...coins, ...coins];

  return (
    <div className="relative overflow-hidden border-y border-border bg-card/70 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-card to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card to-transparent z-10" />
      <div className="flex marquee whitespace-nowrap py-2.5" style={{ width: "200%" }}>
        {row.map((c, i) => {
          const up = c.price_change_percentage_24h >= 0;
          return (
            <div key={`${c.id}-${i}`} className="flex items-center gap-2 px-5 text-xs">
              <span className="font-semibold uppercase text-foreground tracking-wide">{c.symbol}</span>
              <span className="text-muted-foreground">${c.current_price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
              <span className={`flex items-center gap-0.5 font-semibold ${up ? "text-green-500" : "text-red-500"}`}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(c.price_change_percentage_24h).toFixed(2)}%
              </span>
              <span className="mx-2 text-border">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceTicker;
