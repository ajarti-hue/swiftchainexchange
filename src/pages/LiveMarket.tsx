import CryptoMarketSection from "@/components/CryptoMarketSection";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity } from "lucide-react";

const LiveMarket = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Live Market</h1>
            <p className="text-xs text-muted-foreground">Real-time prices & 24h top movers</p>
          </div>
        </div>
        <CryptoMarketSection defaultTab="market" tabs={["market", "movers"]} />
      </div>
      <Footer />
    </div>
  );
};

export default LiveMarket;
