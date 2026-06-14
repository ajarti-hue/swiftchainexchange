import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Footer from "@/components/Footer";

const RiskDisclosure = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="rounded-2xl border border-amber-500/30 bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-amber-500" size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Important</span>
          </div>
          <h1 className="font-display text-3xl font-black text-card-foreground mb-1">Risk Disclosure</h1>
          <p className="text-xs text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

          <div className="space-y-5 text-sm text-card-foreground leading-relaxed">
            <p className="font-semibold">Please read this disclosure carefully before trading on SwiftChain Exchange.</p>

            <h2 className="font-display text-lg font-bold">1. Market Risk</h2>
            <p>Cryptocurrencies and gift cards can lose value rapidly. Prices can fluctuate significantly within minutes. You may receive back less than you paid.</p>

            <h2 className="font-display text-lg font-bold">2. No Guarantee of Returns</h2>
            <p>SwiftChain Exchange does not provide investment advice. Past performance of any digital asset does not guarantee future results. Only trade what you can afford to lose.</p>

            <h2 className="font-display text-lg font-bold">3. Irreversible Transactions</h2>
            <p>Crypto transactions are generally irreversible. Sending funds to the wrong wallet address, network or memo may result in permanent loss. Always double-check details before confirming.</p>

            <h2 className="font-display text-lg font-bold">4. Regulatory Risk</h2>
            <p>The legal status of crypto assets in Ghana and other jurisdictions is evolving. Changes in law or policy by the Bank of Ghana or the Securities &amp; Exchange Commission may affect your ability to use certain features.</p>

            <h2 className="font-display text-lg font-bold">5. Operational Risk</h2>
            <p>Despite our security measures, no online platform is 100% immune to outages, bugs, network congestion or third-party failures (e.g. Mobile Money operators, blockchain networks).</p>

            <h2 className="font-display text-lg font-bold">6. Fraud &amp; Scams</h2>
            <p>Beware of impersonators. SwiftChain Exchange only communicates from official channels listed on our site. Never share passwords, recovery phrases or one-time codes with anyone.</p>

            <h2 className="font-display text-lg font-bold">7. Your Responsibility</h2>
            <p>By using SwiftChain Exchange you confirm that you understand these risks, are of legal age, and are not acting on behalf of an undisclosed third party.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RiskDisclosure;
