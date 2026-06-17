import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Bitcoin } from "lucide-react";
import { sendToWhatsApp, buildCryptoMessage } from "@/lib/whatsapp";
import { createOrder } from "@/lib/createOrder";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import CryptoMarketSection from "@/components/CryptoMarketSection";

const CRYPTOS = [
  "Bitcoin (BTC)", "Ethereum (ETH)", "USDT (Tether)", "BNB",
  "Solana (SOL)", "XRP", "Litecoin (LTC)", "USDC", "Other"
];

const ACTIONS = ["Buy", "Sell"];

const CryptoTrade = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [crypto, setCrypto] = useState("");
  const [action, setAction] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = crypto && action && amount;

  const handleStartChat = async () => {
    if (!canSubmit) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to start an order chat." });
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    try {
      const id = await createOrder({ trade_type: "Crypto", action, item: crypto, amount });
      navigate(`/chat/${id}`);
    } catch (e: any) {
      toast({ title: "Could not start order", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    if (!canSubmit) return;
    sendToWhatsApp(buildCryptoMessage(crypto, action, amount));
  };

  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bitcoin size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Crypto</h1>
            <p className="text-xs text-muted-foreground">Live market, top movers & our GHS rates</p>
          </div>
        </div>

        {/* Market + Rates */}
        <div className="mt-6 mb-10">
          <CryptoMarketSection defaultTab="market" />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] max-w-lg mx-auto">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Start a Crypto Order</h2>

        <div className="space-y-6">
          {/* Action */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">What do you want to do?</label>
            <div className="grid grid-cols-2 gap-3">
              {ACTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    action === a
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-button)]"
                      : "border-border bg-card text-card-foreground hover:border-primary/50"
                  }`}
                >
                  {a} Crypto
                </button>
              ))}
            </div>
          </div>

          {/* Crypto Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Select Cryptocurrency</label>
            <div className="grid grid-cols-3 gap-2">
              {CRYPTOS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCrypto(c)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                    crypto === c
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
            onClick={handleStartChat}
            disabled={!canSubmit || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-display font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageCircle size={18} />
            {submitting ? "Opening chat..." : "Start Order Chat"}
          </button>
          <button
            onClick={handleWhatsApp}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-card-foreground hover:border-primary/50 transition-all disabled:opacity-40"
          >
            <Send size={16} />
            Or continue on WhatsApp
          </button>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CryptoTrade;
