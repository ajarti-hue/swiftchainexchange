import { useNavigate } from "react-router-dom";
import { Gift, Bitcoin, MessageCircle, Shield, User, LogIn, ArrowRight, Settings, TrendingUp, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CryptoMarketSection from "@/components/CryptoMarketSection";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import AboutSection from "@/components/AboutSection";
import ReviewsSection from "@/components/ReviewsSection";
import RewardsBanner from "@/components/RewardsBanner";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import Hero3DScene from "@/components/Hero3DScene";
import TrustStatsBand from "@/components/TrustStatsBand";
import PriceTicker from "@/components/PriceTicker";
import Reveal from "@/components/Reveal";
import { MissionSection, WhyChooseSection, SecurityComplianceSection, PartnersStrip, HowItWorksSection } from "@/components/HomeSections";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.jpeg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [tradeCount, setTradeCount] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
        setIsAdmin(!!data);
      });
      supabase.from("profiles").select("total_trades").eq("user_id", user.id).single().then(({ data }) => {
        if (data) setTradeCount(data.total_trades);
      });
    } else {
      setIsAdmin(false);
      setTradeCount(null);
    }
  }, [user]);

  return (
    <div className="min-h-screen relative">
      {user && tradeCount !== null && (
        <div className="mx-auto max-w-7xl px-4 pt-3 flex justify-end">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <TrendingUp size={12} /> {tradeCount} trade{tradeCount !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden grain" style={{ background: "var(--gradient-hero)" }}>
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-50" style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-40" style={{ background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)" }} />
        {/* Particle dots */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                top: `${(i * 53) % 100}%`,
                left: `${(i * 37) % 100}%`,
                width: `${4 + (i % 5) * 2}px`,
                height: `${4 + (i % 5) * 2}px`,
                animationDelay: `${(i % 7) * 1.3}s`,
                animationDuration: `${10 + (i % 6) * 2}s`,
                opacity: 0.35,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-foreground mb-6 shadow-sm">
              <Sparkles size={12} className="text-amber-500" /> Ghana's most trusted crypto & gift card desk
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-[1.05]">
              <span className="text-foreground">Trade Crypto &</span>
              <br />
              <span className="text-gradient-anim">Gift Cards in Cedis.</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed max-w-xl">
              Instant Mobile Money payouts. Personally verified trades. Real human support around the clock — Bitcoin, USDT, Ethereum, Perfect Money, Amazon, iTunes, Steam and 50+ more.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => navigate("/gift-card")}
                    className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-button)] hover:translate-y-[-2px] transition-all btn-shimmer"
                  >
                    Trade Gift Cards <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate("/crypto")}
                    className="flex items-center gap-2 rounded-xl glass px-6 py-3.5 text-sm font-bold text-foreground hover:bg-card transition-all"
                  >
                    Trade Crypto <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/auth")}
                    className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-button)] hover:translate-y-[-2px] transition-all btn-shimmer"
                  >
                    Register / Join Us <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate("/auth")}
                    className="flex items-center gap-2 rounded-xl glass px-6 py-3.5 text-sm font-bold text-foreground hover:bg-card transition-all"
                  >
                    Login For Best Rates
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5"><Shield size={12} className="text-primary" /> Insured</div>
              <div className="flex items-center gap-1.5"><Bitcoin size={12} className="text-amber-500" /> BTC · ETH · USDT · PM</div>
              <div className="flex items-center gap-1.5"><MessageCircle size={12} className="text-green-500" /> In-app & WhatsApp support</div>
            </div>
          </div>

          <div className="hidden lg:block">
            <Hero3DScene />
          </div>
        </div>

        <div className="lg:hidden px-4 pb-8">
          <Hero3DScene />
        </div>
      </div>

      {/* Trust stats */}
      <TrustStatsBand />

      {/* Live ticker */}
      <div className="mt-8">
        <PriceTicker />
      </div>

      {/* Email Verification Alert */}
      <div className="mx-auto max-w-6xl px-4 mt-6 relative z-10 mb-4">
        <EmailVerificationBanner />
      </div>

      {/* Combined Crypto Rates & Market Prices */}
      <div className="mx-auto max-w-6xl px-4 mb-6">
        <CryptoMarketSection />
      </div>

      {/* Trade Options */}
      <Reveal className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Start Trading Now</h2>
          <p className="text-muted-foreground text-sm">Choose what you'd like to trade below</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/gift-card")}
            className="group w-full rounded-xl bg-card p-8 text-left shadow-[var(--shadow-card)] lift-card border border-border"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Gift size={28} />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-card-foreground">Trade Gift Card</h3>
            <p className="text-sm text-muted-foreground">Buy or sell gift cards — Amazon, iTunes, Google Play & more</p>
          </button>
          <button
            onClick={() => navigate("/crypto")}
            className="group w-full rounded-xl bg-card p-8 text-left shadow-[var(--shadow-card)] lift-card border border-border"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Bitcoin size={28} />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-card-foreground">Trade Crypto</h3>
            <p className="text-sm text-muted-foreground">Buy or sell Bitcoin, Ethereum, USDT and other cryptocurrencies</p>
          </button>
        </div>
      </Reveal>

      {/* How it works */}
      <HowItWorksSection />

      {/* Partners / Networks */}
      <PartnersStrip />

      {/* Mission */}
      <MissionSection />

      {/* Why Choose */}
      <WhyChooseSection />

      {/* Security & Compliance */}
      <SecurityComplianceSection />


      {/* About / Why We Are Special */}
      <div className="bg-card border-y border-border">
        <div className="mx-auto max-w-6xl px-4">
          <AboutSection />
        </div>
      </div>

      {/* Reviews & Rewards */}
      <div className="mx-auto max-w-2xl px-4 py-12">
        <RewardsBanner />
        <ReviewsSection />
      </div>

      {/* WhatsApp Channel CTA */}
      <div className="bg-card border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Bitcoin size={24} className="text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Check Our Latest Rates</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            🔥 Join our WhatsApp channel for the latest daily rates on all gift cards and cryptocurrencies. Never miss a great deal!
          </p>
          <a
            href="https://whatsapp.com/channel/0029Vb7LE6T89ingo3wmca3s"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[hsl(142_70%_45%)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90"
          >
            <MessageCircle size={16} /> Join Our WhatsApp Channel
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl font-bold text-card-foreground mb-4 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how">
              <AccordionTrigger className="text-sm text-card-foreground">How does trading work?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">Simply select whether you want to trade gift cards or crypto, fill in the details, and you'll be redirected to our WhatsApp where we verify and complete the trade personally.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="rates">
              <AccordionTrigger className="text-sm text-card-foreground">How do I check current rates?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">Join our WhatsApp channel for the latest daily rates on all gift cards and cryptocurrencies.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="safe">
              <AccordionTrigger className="text-sm text-card-foreground">Is it safe to trade here?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">Yes! Every trade is personally verified by our team via WhatsApp. We insure all crypto exchanges and have a dispute resolution process in place.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="payment">
              <AccordionTrigger className="text-sm text-card-foreground">What payment methods do you accept?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">We accept Mobile Money (MTN, Vodafone, AirtelTigo), Bank Transfer, and Cash payments for all transactions.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="cards">
              <AccordionTrigger className="text-sm text-card-foreground">Which gift cards do you accept?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">We accept Amazon, iTunes/Apple, Google Play, Steam, Walmart, eBay, Nike, Sephora, and many more. Contact us for any card not listed.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="account">
              <AccordionTrigger className="text-sm text-card-foreground">Do I need an account to trade?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">No! Trading is available to everyone via WhatsApp. However, creating a free account lets you track your trades, earn rewards, and leave reviews.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
