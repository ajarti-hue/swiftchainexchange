import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, KeyRound, Eye, BadgeCheck, AlertTriangle, CheckCircle2, ServerCog, Mail } from "lucide-react";
import Footer from "@/components/Footer";

const SecurityCenter = () => {
  const navigate = useNavigate();

  const active = [
    { icon: Mail, title: "Email 2FA verification", body: "A fresh 6-digit code is sent to your inbox at signup and expires in 15 minutes." },
    { icon: Lock, title: "Row-level database security", body: "Your orders, chats and profile are isolated. No other user — and no client-side hack — can read them." },
    { icon: Eye, title: "Private chat storage", body: "Gift-card photos and payment proofs are stored in a private bucket and served via short-lived signed URLs." },
    { icon: KeyRound, title: "Server-verified roles", body: "Admin permissions are checked on the server through a security-definer function. No localStorage flags." },
    { icon: ServerCog, title: "Locked internal functions", body: "Database triggers and helpers are EXECUTE-restricted so they cannot be invoked by the public API." },
    { icon: BadgeCheck, title: "Verified order pipeline", body: "Every order is reviewed by a human admin before payout. Anomalies are paused for manual review." },
  ];

  const roadmap = [
    "TOTP authenticator app (Google Authenticator, Authy)",
    "SMS one-time codes on withdrawal",
    "Trusted device management",
    "Login activity history with IP & user-agent",
    "Withdrawal confirmation cooldown",
  ];

  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Home
        </button>

        {/* Hero */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-primary/5 p-8 mb-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="text-emerald-500" size={20} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Security Center</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-3">Your safety is our product.</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            SwiftChain Exchange combines modern application security with human review on every trade.
            Here's exactly what's protecting your account today, and what's coming next.
          </p>
        </div>

        {/* Active protections */}
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Active protections</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {active.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-card-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Coming soon</h2>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] mb-10">
          <ul className="space-y-3">
            {roadmap.map((r) => (
              <li key={r} className="flex items-center gap-3 text-sm text-card-foreground">
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Best practices */}
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Stay safe — best practices</h2>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 mb-10">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-foreground font-semibold">
              SwiftChain Exchange will <span className="underline">never</span> ask for your password, recovery codes,
              or full wallet seed phrase. Anyone who does is impersonating us.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground pl-7 list-disc">
            <li>Use a strong, unique password (12+ characters, mix of letters/numbers/symbols).</li>
            <li>Verify our WhatsApp number is <strong className="text-foreground">+233 555 098 098</strong> before sending any details.</li>
            <li>Double-check wallet addresses character by character before sending crypto.</li>
            <li>Only use our official site URL. Bookmark it to avoid phishing clones.</li>
            <li>If something feels off, pause the trade and message support.</li>
          </ul>
        </div>

        {/* Report */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] text-center">
          <h3 className="font-display text-lg font-bold text-card-foreground mb-2">Spotted a security issue?</h3>
          <p className="text-sm text-muted-foreground mb-4">We take responsible disclosure seriously. Get in touch directly.</p>
          <a href="mailto:ajartisanvista@gmail.com?subject=Security%20Report" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-button)] hover:translate-y-[-2px] transition-all">
            <Mail size={16} /> Report to security team
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SecurityCenter;
