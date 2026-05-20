import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-lg px-4 py-8">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Privacy Policy</h1>

        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>When you use SwiftChain X, we only collect the information you voluntarily provide through our trade forms — such as the type of trade, gift card or cryptocurrency selected, and the trade amount. This information is sent directly to our WhatsApp for processing.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <p>Your trade details are used solely to process and complete your requested transaction via WhatsApp. We do not store your personal data on any server or database. All communication happens directly through WhatsApp.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">3. Data Storage</h2>
            <p>SwiftChain X does not operate a database. No personal information is stored on our website. Trade conversations are retained only within WhatsApp as per WhatsApp's own privacy policy.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">4. Third-Party Services</h2>
            <p>We use WhatsApp (owned by Meta) to communicate and complete trades. By using our services, you also agree to WhatsApp's terms and privacy policies. We do not share your information with any other third parties.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">5. Cookies</h2>
            <p>Our website does not use cookies or any tracking technologies. We do not collect browsing data or analytics from our visitors.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">6. Your Rights</h2>
            <p>Since we do not store personal data, there is no data to request, modify, or delete. If you have any concerns about your privacy, contact us directly at +233 555 098 098 via WhatsApp.</p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Any changes will be reflected on this page. Last updated: February 2026.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
