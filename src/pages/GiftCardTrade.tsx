import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Send } from "lucide-react";
import { sendToWhatsApp, buildGiftCardMessage } from "@/lib/whatsapp";
import logo from "@/assets/logo.jpeg";

const GIFT_CARDS = [
  "Amazon", "iTunes/Apple", "Google Play", "Steam", "Walmart",
  "eBay", "Nike", "Sephora", "Vanilla Visa", "Razer Gold", "Other"
];

const TRADE_TYPES = ["Buy", "Sell"];

const GiftCardTrade = () => {
  const navigate = useNavigate();
  const [card, setCard] = useState("");
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");

  const canSubmit = card && type && amount;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const msg = buildGiftCardMessage(card, type, amount);
    sendToWhatsApp(msg);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="SwiftChain X" className="h-10 w-10 rounded-lg object-cover" />
          <h1 className="font-display text-2xl font-bold text-foreground">Trade Gift Card</h1>
        </div>

        <div className="space-y-6">
          {/* Trade Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">What do you want to do?</label>
            <div className="grid grid-cols-2 gap-3">
              {TRADE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    type === t
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-button)]"
                      : "border-border bg-card text-card-foreground hover:border-primary/50"
                  }`}
                >
                  {t} Gift Card
                </button>
              ))}
            </div>
          </div>

          {/* Gift Card Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Select Gift Card</label>
            <div className="grid grid-cols-3 gap-2">
              {GIFT_CARDS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCard(c)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                    card === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-card-foreground hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Amount (USD)</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            Continue on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftCardTrade;
