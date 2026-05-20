import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-lg px-4 py-8">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Terms of Service</h1>

        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">1. Overview</h2>
            <p>SwiftChain X facilitates peer-to-peer gift card and cryptocurrency exchanges. By using our services, you agree to these terms. All trades are completed personally via WhatsApp with our verified team.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old to use our services. You are responsible for ensuring that your use of SwiftChain X complies with local laws and regulations in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">3. How Trades Work</h2>
            <p>SwiftChain X provides a platform to initiate trade requests. Once you submit your trade details, you will be redirected to WhatsApp where our team will verify and complete the trade manually. Rates are confirmed before any exchange is finalized.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">4. Rates & Pricing</h2>
            <p>Exchange rates are subject to change based on market conditions. Always check our WhatsApp channel for the latest rates before initiating a trade. Rates are confirmed during the WhatsApp conversation before any exchange is finalized.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">5. Refund & Dispute Policy</h2>
            <p>Once a trade is completed and confirmed by both parties, it cannot be reversed. In case of disputes, contact us directly via WhatsApp at +233 555 098 098. We commit to resolving disputes fairly and promptly.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">6. Prohibited Activities</h2>
            <p>You may not use SwiftChain X for money laundering, fraud, or any illegal activity. We reserve the right to refuse service and report suspicious activity to the appropriate authorities.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
            <p>SwiftChain X is not liable for losses resulting from market volatility, third-party actions, or incorrect information provided by users. Users trade at their own risk.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">8. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of our services constitutes acceptance of any changes. Last updated: February 2026.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
