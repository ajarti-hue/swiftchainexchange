import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpDown } from "lucide-react";

interface CryptoRate {
  id: string;
  crypto_name: string;
  crypto_symbol: string;
  buy_rate: number;
  sell_rate: number;
  currency: string;
  updated_at: string;
}

const CryptoRatesSection = () => {
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase
        .from("crypto_rates")
        .select("*")
        .order("crypto_name");
      if (data) setRates(data as CryptoRate[]);
      setLoading(false);
    };
    fetchRates();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (rates.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={18} className="text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">Today's Exchange Rates</h2>
        </div>
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
                <p className="font-bold text-card-foreground">{rate.buy_rate} {rate.currency}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sell</span>
                <p className="font-bold text-card-foreground">{rate.sell_rate} {rate.currency}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoRatesSection;
