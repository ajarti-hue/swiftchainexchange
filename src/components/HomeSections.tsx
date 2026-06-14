import { Shield, Zap, Users, Lock, CheckCircle2, Award, Globe, HeartHandshake, Clock, BadgeCheck, Eye, KeyRound } from "lucide-react";
import Reveal from "./Reveal";

/* ---------------- Mission ---------------- */
export const MissionSection = () => (
  <section className="border-y border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
    <Reveal className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-3">
            Our Mission
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-4 leading-tight">
            Making digital finance simple, safe and accessible to every Ghanaian.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
            SwiftChain Exchange exists to remove the friction between cedis and the digital
            economy. Whether you're paying for a service in USDT, cashing out an Amazon gift
            card, or sending Bitcoin to family abroad — we believe it should feel effortless,
            transparent and human.
          </p>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            We pair the speed of crypto rails with the trust of a real local desk, so you
            never trade with a faceless bot — every order is personally verified by our team.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Globe, label: "Built in Ghana, for Africa" },
            { icon: HeartHandshake, label: "Human-verified trades" },
            { icon: Clock, label: "Round-the-clock support" },
            { icon: BadgeCheck, label: "Transparent pricing" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <Icon className="text-primary mb-3" size={22} />
              <p className="text-sm font-semibold text-card-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  </section>
);

/* ---------------- Why Choose ---------------- */
export const WhyChooseSection = () => {
  const items = [
    { icon: Zap, title: "Instant Mobile Money payouts", body: "MTN, Vodafone, AirtelTigo — funds usually land in under 5 minutes once verified." },
    { icon: Shield, title: "Personally verified trades", body: "A real human reviews every order. No silent failures, no opaque order books." },
    { icon: Award, title: "Best rates in Ghana", body: "Live GHS rates pulled from our trading desk daily — published on WhatsApp." },
    { icon: Users, title: "5,000+ happy traders", body: "Loyal community of crypto users, freelancers and importers across Ghana." },
    { icon: Lock, title: "Encrypted by default", body: "Email verification, role-based access, signed attachment URLs, locked databases." },
    { icon: CheckCircle2, title: "No hidden fees", body: "The cedi amount you see is the cedi amount you receive. Period." },
  ];
  return (
    <section className="bg-background">
      <Reveal className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-3">
            Why SwiftChain Exchange
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
            Built different. On purpose.
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Six reasons traders across Ghana keep coming back to SwiftChain Exchange.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] hover:border-primary/40 hover:shadow-lg transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon size={22} />
              </div>
              <h3 className="font-display text-base font-bold text-card-foreground mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
};

/* ---------------- Security & Compliance ---------------- */
export const SecurityComplianceSection = () => {
  const layers = [
    { icon: KeyRound, title: "6-digit email 2FA", body: "Every account is verified by a fresh code that expires in 15 minutes." },
    { icon: Lock, title: "Row-level database security", body: "Customers can only ever read their own orders, messages and profile data." },
    { icon: Eye, title: "Private chat attachments", body: "Order screenshots & gift-card photos are stored in a private bucket with short-lived signed links." },
    { icon: Shield, title: "Role-based admin access", body: "Admin actions require server-verified roles — never client-side flags." },
  ];
  return (
    <section className="border-y border-border bg-gradient-to-b from-card to-background">
      <Reveal className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
          <div>
            <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
              Security & Compliance
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-4 leading-tight">
              Your funds and data are protected at every layer.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              We follow industry-standard practices for authentication, data isolation and
              transaction review. Our compliance program is aligned with the Bank of Ghana's
              guidance on virtual asset service providers.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> AML &amp; KYC review on all high-value trades</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Suspicious activity monitoring</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Data minimization &amp; encrypted storage</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Transparent dispute resolution</li>
            </ul>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {layers.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <Icon className="text-emerald-500 mb-3" size={22} />
                <h3 className="font-display text-sm font-bold text-card-foreground mb-1.5">{title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};

/* ---------------- Partners / Networks ---------------- */
export const PartnersStrip = () => {
  const partners = ["Bitcoin", "Ethereum", "Tether USDT", "Perfect Money", "MTN MoMo", "Vodafone Cash", "AirtelTigo", "Amazon", "iTunes", "Steam", "Google Play", "Walmart"];
  return (
    <section className="bg-card border-y border-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-6">
          Networks &amp; brands we support
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {partners.map((p) => (
            <span key={p} className="text-sm sm:text-base font-display font-bold text-foreground/60 hover:text-foreground transition-colors">
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- How It Works (3 steps) ---------------- */
export const HowItWorksSection = () => {
  const steps = [
    { n: "01", title: "Create your account", body: "Sign up in under a minute and verify your email with a secure 6-digit code." },
    { n: "02", title: "Place your order", body: "Pick crypto or gift cards, enter the amount, and our SwiftBot walks you through it." },
    { n: "03", title: "Get paid in cedis", body: "Our team verifies the trade and sends Mobile Money straight to your phone." },
  ];
  return (
    <section className="bg-background">
      <Reveal className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-3">
            How it works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">
            From signup to paid — in 3 steps.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 relative">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="font-display text-4xl font-black text-primary/30 mb-2">{s.n}</div>
              <h3 className="font-display text-lg font-bold text-card-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
};
