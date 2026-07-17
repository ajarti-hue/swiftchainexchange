import { useNavigate, useLocation } from "react-router-dom";
import { Bitcoin, Gift, User, LogIn, Settings, Menu, X, Shield, Activity, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavLoader } from "@/components/NavLoader";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.jpeg";

const TopNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { goWithLoader } = useNavLoader();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  // Hide on chat screen for focus
  if (pathname.startsWith("/chat/")) return null;

  const linkBase = "px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5";
  const linkActive = "bg-primary/10 text-primary";
  const linkIdle = "text-foreground/70 hover:text-foreground hover:bg-muted/60";
  const cls = (to: string) => `${linkBase} ${pathname === to ? linkActive : linkIdle}`;

  const navItems = [
    { to: "/crypto", label: "Crypto", Icon: Bitcoin, loader: "Loading Crypto" },
    { to: "/gift-card", label: "Gift Cards", Icon: Gift, loader: "Loading Gift Cards" },
    { to: "/market", label: "Live Market", Icon: Activity, loader: "Loading Live Market" },
    { to: "/security", label: "Security", Icon: Shield, loader: "Loading Security Center" },
  ];

  const go = (to: string, loader: string) => {
    if (pathname === to) return;
    goWithLoader(to, loader);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo = always home */}
        <button
          onClick={() => navigate("/")}
          aria-label="SwiftChain X — home"
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="SwiftChain X" className="h-9 w-9 rounded-lg object-cover" />
          <span className="font-display text-base font-bold text-foreground hidden sm:inline">SwiftChain<span className="text-primary">X</span></span>
        </button>

        {/* Center tabs (Coinbase-style) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, Icon, loader }) => (
            <button key={to} onClick={() => go(to, loader)} className={cls(to)}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              {isAdmin && (
                <button onClick={() => navigate("/admin")} className="hidden sm:flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/80">
                  <Settings size={14} /> Admin
                </button>
              )}
              <button onClick={() => navigate("/account")} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-button)]">
                <User size={14} /> Account
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/auth")} className="hidden sm:flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20">
                <LogIn size={14} /> Login
              </button>
              <button onClick={() => navigate("/auth")} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-button)]">
                Get Started
              </button>
            </>
          )}
          <button onClick={() => setOpen(o => !o)} className="md:hidden rounded-lg p-2 text-foreground/70 hover:bg-muted" aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navItems.map(({ to, label, Icon, loader }) => (
              <button key={to} onClick={() => { setOpen(false); go(to, loader); }} className={cls(to)}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNav;
