import { ArrowDownToLine, ArrowUpFromLine, MessageCircle } from "lucide-react";
import { useState } from "react";

// Curated indicative rates (GHS per $1). Admin can update these or wire to DB later.
const GIFT_CARD_RATES = [
  { brand: "Amazon", buy: 13.5, sell: 12.8 },
  { brand: "iTunes / Apple", buy: 13.2, sell: 12.5 },
  { brand: "Google Play", buy: 13.0, sell: 12.3 },
  { brand: "Steam", buy: 13.6, sell: 12.9 },
  { brand: "Walmart", buy: 13.4, sell: 12.7 },
  { brand: "eBay", buy: 13.3, sell: 12.6 },
  { brand: "Razer Gold", buy: 13.7, sell: 13.0 },
  { brand: "Visa / Vanilla", buy: 12.8, sell: 12.1 },
];

const GiftCardRatesStrip = () => {
  const [mode, setMode] = useState<"buy" | "sell">("sell");
  return (
    <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex border-b border-border">
        <button
          onClick={() => setMode("sell")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors ${
            mode === "sell" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUpFromLine size={14} /> Sell to us (GHS)
        </button>
        <button
          onClick={() => setMode("buy")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors ${
            mode === "buy" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowDownToLine size={14} /> Buy from us (GHS)
        </button>
      </div>
      <div className="p-5">
        <p className="text-xs text-muted-foreground mb-3">
          Indicative rates · GHS per $1 · {mode === "sell" ? "We buy gift cards from you" : "We sell gift cards to you"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GIFT_CARD_RATES.map((r) => (
            <div key={r.brand} className="rounded-lg border border-border bg-muted/30 p-4 text-center hover:border-primary/40 transition-all">
              <p className="text-[11px] font-semibold text-card-foreground mb-1 truncate">{r.brand}</p>
              <p className={`text-lg font-bold font-display ${mode === "buy" ? "text-foreground" : "text-[hsl(142,70%,40%)]"}`}>
                ₵{mode === "buy" ? r.buy.toFixed(1) : r.sell.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
        <a
          href="https://whatsapp.com/channel/0029Vb7LE6T89ingo3wmca3s"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
        >
          <MessageCircle size={12} /> Get exact live rate on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default GiftCardRatesStrip;
