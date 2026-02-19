import { useNavigate } from "react-router-dom";
import { Gift, Bitcoin, Phone, MessageCircle } from "lucide-react";
import TradeCard from "@/components/TradeCard";
import logo from "@/assets/logo.jpeg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <img
            src={logo}
            alt="SwiftChain X"
            className="mx-auto mb-6 h-24 w-24 rounded-2xl object-cover shadow-[var(--shadow-card)]"
          />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            SwiftChain X
          </h1>
          <p className="text-muted-foreground text-sm">
            Fast & secure gift card and crypto trading. Choose what you'd like to do below.
          </p>
        </div>
      </div>

      {/* Trade Options */}
      <div className="mx-auto max-w-lg px-4 -mt-2 pb-8">
        <div className="grid gap-4">
          <TradeCard
            icon={<Gift size={24} />}
            title="Trade Gift Card"
            description="Buy or sell gift cards — Amazon, iTunes, Google Play & more"
            onClick={() => navigate("/gift-card")}
          />
          <TradeCard
            icon={<Bitcoin size={24} />}
            title="Trade Crypto"
            description="Buy or sell Bitcoin, Ethereum, USDT and other cryptocurrencies"
            onClick={() => navigate("/crypto")}
          />
        </div>

        {/* Crypto Promo Box */}
        <div className="mt-6 relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-[var(--shadow-card)]">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-accent/10 blur-xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary" style={{ transform: "perspective(400px) rotateY(-8deg) rotateX(5deg)", boxShadow: "4px 4px 12px hsl(215 60% 45% / 0.15), -2px -2px 6px hsl(0 0% 100% / 0.3)" }}>
                  <Bitcoin size={22} />
                </div>
                <h3 className="font-display text-base font-bold text-card-foreground">Crypto & Gift Cards</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                🔥 Check our latest rates on WhatsApp before you trade! Never miss a great deal.
              </p>
              <a
                href="https://whatsapp.com/channel/0029Vb7LE6T89ingo3wmca3s"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(142_70%_45%)] px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90"
              >
                <MessageCircle size={14} />
                Join Our WhatsApp Channel
              </a>
            </div>
            <div className="hidden sm:flex flex-col items-center gap-1 text-primary/60" style={{ transform: "perspective(600px) rotateY(-12deg) rotateX(8deg)" }}>
              <div className="rounded-xl bg-primary/10 p-3 shadow-[2px_4px_12px_hsl(215_60%_45%/0.12)]">
                <Bitcoin size={32} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-card-foreground mb-3">Contact us directly</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://wa.me/233555098098"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
            <a
              href="tel:+233555098098"
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Phone size={16} />
              +233 555 098 098
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 SwiftChain X. All trades verified personally.
        </p>
      </div>
    </div>
  );
};

export default Index;
