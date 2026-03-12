import { useNavigate } from "react-router-dom";
import { Gift, Bitcoin, MessageCircle, Shield, User, LogIn, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CryptoPrices from "@/components/CryptoPrices";
import AboutSection from "@/components/AboutSection";
import ReviewsSection from "@/components/ReviewsSection";
import RewardsBanner from "@/components/RewardsBanner";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpeg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SwiftChain X" className="h-10 w-10 rounded-xl object-cover" />
            <span className="font-display text-lg font-bold text-foreground hidden sm:inline">SwiftChain X</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://whatsapp.com/channel/0029Vb7LE6T89ingo3wmca3s"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle size={14} /> WhatsApp Channel
            </a>
            {user ? (
              <button
                onClick={() => navigate("/account")}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-[var(--shadow-button)]"
              >
                <User size={14} /> My Account
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
                >
                  <LogIn size={14} /> Login
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-[var(--shadow-button)]"
                >
                  Register / Join Us
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 50%)" }} />
        <div className="relative mx-auto max-w-6xl px-4 py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Shield size={12} /> Trusted & Insured Exchange
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Buy and Sell Bitcoin & Other Digital Currencies
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed max-w-xl">
              Buy & Sell Bitcoin, Perfect Money & Other Cryptocurrencies, 24/7 easily and swiftly in Ghana 🇬🇭 using Mobile Money, Bank Transfer or Cash.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => navigate("/gift-card")}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-button)] hover:bg-primary/90 transition-all"
                  >
                    Trade Gift Cards <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate("/crypto")}
                    className="flex items-center gap-2 rounded-xl border-2 border-primary bg-card px-6 py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-all"
                  >
                    Trade Crypto <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/auth")}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-button)] hover:bg-primary/90 transition-all"
                  >
                    Register / Join Us <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate("/auth")}
                    className="flex items-center gap-2 rounded-xl border-2 border-primary bg-card px-6 py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-all"
                  >
                    Login For Best Rates
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crypto Prices Section */}
      <div className="mx-auto max-w-6xl px-4 -mt-6 relative z-10">
        <CryptoPrices />
      </div>

      {/* Trade Options */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Start Trading Now</h2>
          <p className="text-muted-foreground text-sm">Choose what you'd like to trade below</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/gift-card")}
            className="group w-full rounded-xl bg-card p-8 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--shadow-button)] border border-border"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Gift size={28} />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-card-foreground">Trade Gift Card</h3>
            <p className="text-sm text-muted-foreground">Buy or sell gift cards — Amazon, iTunes, Google Play & more</p>
          </button>
          <button
            onClick={() => navigate("/crypto")}
            className="group w-full rounded-xl bg-card p-8 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--shadow-button)] border border-border"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Bitcoin size={28} />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-card-foreground">Trade Crypto</h3>
            <p className="text-sm text-muted-foreground">Buy or sell Bitcoin, Ethereum, USDT and other cryptocurrencies</p>
          </button>
        </div>
      </div>

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
