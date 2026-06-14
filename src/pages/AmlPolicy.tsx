import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

const AmlPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-primary" size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Compliance</span>
          </div>
          <h1 className="font-display text-3xl font-black text-card-foreground mb-1">Anti-Money Laundering (AML) Policy</h1>
          <p className="text-xs text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-5 text-sm text-card-foreground leading-relaxed">
            <p>SwiftChain Exchange ("we", "us") is committed to preventing the use of our platform for money laundering, terrorist financing or any other financial crime. This AML Policy outlines the principles and procedures we follow.</p>

            <h2 className="font-display text-lg font-bold">1. Scope</h2>
            <p>This policy applies to all customers, employees and trades conducted through SwiftChain Exchange, in line with the Bank of Ghana's directives on virtual asset service providers and the Anti-Money Laundering Act, 2020 (Act 1044).</p>

            <h2 className="font-display text-lg font-bold">2. Customer Due Diligence (CDD)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verified email address for all account holders.</li>
              <li>Government-issued ID for trades above defined thresholds (see KYC Policy).</li>
              <li>Source-of-funds questions for unusually large or repeated transactions.</li>
            </ul>

            <h2 className="font-display text-lg font-bold">3. Transaction Monitoring</h2>
            <p>We monitor trading activity in real time. Patterns such as structuring, rapid in-and-out trades, or transactions inconsistent with a customer's stated profile are flagged for manual review and may be paused.</p>

            <h2 className="font-display text-lg font-bold">4. Prohibited Activity</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Funds derived from illegal activity.</li>
              <li>Trading on behalf of an undisclosed third party.</li>
              <li>Use of stolen payment instruments or gift cards.</li>
              <li>Customers appearing on sanctions or PEP watch-lists without enhanced review.</li>
            </ul>

            <h2 className="font-display text-lg font-bold">5. Reporting</h2>
            <p>Suspicious transactions are reported to the Financial Intelligence Centre (FIC) of Ghana in accordance with applicable law. We may freeze assets pending investigation.</p>

            <h2 className="font-display text-lg font-bold">6. Record Keeping</h2>
            <p>Customer identification data and transaction records are retained for at least five (5) years after the end of the customer relationship.</p>

            <h2 className="font-display text-lg font-bold">7. Staff Training</h2>
            <p>Our team receives ongoing training on AML red flags, escalation procedures and customer privacy.</p>

            <h2 className="font-display text-lg font-bold">8. Contact</h2>
            <p>For AML-related questions, email <a className="text-primary underline" href="mailto:ajartisanvista@gmail.com">ajartisanvista@gmail.com</a>.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AmlPolicy;
