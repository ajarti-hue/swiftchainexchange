import { useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import Footer from "@/components/Footer";

const KycPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Home
        </button>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="text-primary" size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Compliance</span>
          </div>
          <h1 className="font-display text-3xl font-black text-card-foreground mb-1">KYC Verification Policy</h1>
          <p className="text-xs text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

          <div className="space-y-5 text-sm text-card-foreground leading-relaxed">
            <p>Know-Your-Customer (KYC) checks help us keep SwiftChain Exchange a safe, fraud-free environment for genuine traders. This policy explains what we collect, when, and why.</p>

            <h2 className="font-display text-lg font-bold">1. Tiered Verification</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Tier 1 — Basic.</strong> Verified email address. Required for all accounts. Suitable for trades up to a daily equivalent of <strong>USD 500</strong>.</li>
              <li><strong>Tier 2 — Standard.</strong> Full name, date of birth, phone number and a clear photo of a government-issued ID (Ghana Card, passport or driver's licence). Required for trades up to <strong>USD 5,000</strong> per day.</li>
              <li><strong>Tier 3 — Enhanced.</strong> Proof of address (utility bill or bank statement &lt; 3 months) and source-of-funds declaration. Required for trades above <strong>USD 5,000</strong> per day.</li>
            </ul>

            <h2 className="font-display text-lg font-bold">2. Acceptable Documents</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ghana Card (national ID) — both sides.</li>
              <li>International passport — biodata page.</li>
              <li>Driver's licence — both sides.</li>
              <li>Recent utility bill, bank statement or tenancy agreement for proof of address.</li>
            </ul>

            <h2 className="font-display text-lg font-bold">3. How We Use Your Documents</h2>
            <p>Documents are used solely to confirm your identity, comply with AML laws and protect your account. They are stored encrypted, accessed only by authorised personnel, and never sold or shared with marketers.</p>

            <h2 className="font-display text-lg font-bold">4. Refusal &amp; Account Restrictions</h2>
            <p>We reserve the right to refuse, pause or close any account that declines verification, provides false documents, or whose activity does not match the declared profile.</p>

            <h2 className="font-display text-lg font-bold">5. Your Rights</h2>
            <p>You can request a copy of, correction to, or deletion of your KYC data at any time (subject to legal retention obligations). Email <a href="mailto:ajartisanvista@gmail.com" className="text-primary underline">ajartisanvista@gmail.com</a> with the subject "KYC Data Request".</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default KycPolicy;
