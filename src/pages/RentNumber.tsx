import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Search, Copy, Timer, CheckCircle2, XCircle, ShieldCheck, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";

type Service = { id: string; name: string; price_ghs: number; category: string; emoji: string };
type Country = { id: string; name: string };

interface Rental {
  id: string;
  service: string;
  service_name: string;
  country: string;
  country_name: string;
  price_ghs: number;
  status: string;
  phone_number: string | null;
  provider_expires_at: string | null;
  sms_sender: string | null;
  sms_code: string | null;
  sms_text: string | null;
  sms_received_at: string | null;
  momo_reference: string | null;
  created_at: string;
}

const MOMO_NUMBER = "0248302549";
const MOMO_NAME = "AJ ARTISAN VISTA";

const RentNumber = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("any");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [creating, setCreating] = useState(false);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [activeRental, setActiveRental] = useState<Rental | null>(null);
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  // Load catalog
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.functions.invoke("rent-number", {
        body: { action: "catalog" },
      });
      if (error) { console.error(error); return; }
      setServices(data?.services ?? []);
      setCountries(data?.countries ?? []);
    })();
  }, []);

  // Load user rentals
  const loadRentals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("number_rentals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setRentals((data as Rental[]) ?? []);
    // If any is active (waiting_sms or payment_confirmed), promote
    const active = (data as Rental[] | null)?.find((r) =>
      ["waiting_sms", "payment_confirmed", "sms_received", "pending_payment"].includes(r.status)
    );
    setActiveRental(active ?? null);
  };
  useEffect(() => { loadRentals(); }, [user]);

  // Realtime updates for this user's rentals
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("number_rentals_" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "number_rentals", filter: `user_id=eq.${user.id}` }, () => {
        loadRentals();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  // Ticker for countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Poll for SMS every 4s while waiting
  useEffect(() => {
    if (!activeRental || activeRental.status !== "waiting_sms") return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      setChecking(true);
      await supabase.functions.invoke("rent-number", { body: { action: "check", rental_id: activeRental.id } }).catch(() => {});
      setChecking(false);
    };
    tick();
    const iv = setInterval(tick, 4000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [activeRental?.id, activeRental?.status]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.category || "Other"));
    return ["All", ...Array.from(set)];
  }, [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      const inCat = activeCategory === "All" || s.category === activeCategory;
      if (!inCat) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.id.includes(q);
    });
  }, [query, services, activeCategory]);

  const grouped = useMemo(() => {
    if (activeCategory !== "All") return null;
    const map: Record<string, Service[]> = {};
    filtered.forEach((s) => {
      const c = s.category || "Other";
      (map[c] ||= []).push(s);
    });
    return map;
  }, [filtered, activeCategory]);

  const selected = services.find((s) => s.id === selectedService);

  const startRental = async () => {
    if (!selectedService) {
      toast({ title: "Pick a service", description: "Choose which app you need the code for.", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("rent-number", {
      body: { action: "create", service: selectedService, country: selectedCountry },
    });
    setCreating(false);
    if (error) {
      toast({ title: "Could not create rental", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Rental created", description: "Send the MoMo payment and we'll assign your number." });
    await loadRentals();
    setActiveRental(data.rental);
  };

  const cancel = async (id: string) => {
    if (!confirm("Cancel this rental? If the number was already assigned, it may not be refundable.")) return;
    await supabase.functions.invoke("rent-number", { body: { action: "cancel", rental_id: id } });
    await loadRentals();
  };

  const copy = async (text: string, label = "Copied") => {
    await navigator.clipboard.writeText(text);
    toast({ title: label });
  };

  const secondsLeft = activeRental?.provider_expires_at
    ? Math.max(0, Math.floor((new Date(activeRental.provider_expires_at).getTime() - now) / 1000))
    : 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  if (authLoading) return null;

  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Hero */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-6 mb-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Phone size={22} /></div>
            <div>
              <h1 className="font-display text-2xl font-bold">Rent a Number</h1>
              <p className="text-sm text-muted-foreground">Temporary phone number for one SMS verification. 20 minutes, one-time use.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-muted px-2.5 py-1 flex items-center gap-1"><ShieldCheck size={11}/> Private &amp; safe</span>
            <span className="rounded-full bg-muted px-2.5 py-1 flex items-center gap-1"><Timer size={11}/> 20-min window</span>
            <span className="rounded-full bg-muted px-2.5 py-1 flex items-center gap-1"><MessageSquare size={11}/> One SMS included</span>
          </div>
        </div>

        {/* Active rental */}
        {activeRental && (
          <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-6 mb-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">Active rental</p>
                <p className="font-display text-lg font-bold">{activeRental.service_name} · {activeRental.country_name}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                activeRental.status === "sms_received" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                activeRental.status === "waiting_sms" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                activeRental.status === "pending_payment" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                "bg-muted text-muted-foreground"
              }`}>{activeRental.status.replace(/_/g, " ")}</span>
            </div>

            {activeRental.status === "pending_payment" && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold mb-2">Send GHS {Number(activeRental.price_ghs).toFixed(2)} via MTN MoMo</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">MoMo Number</span><button onClick={() => copy(MOMO_NUMBER)} className="font-semibold flex items-center gap-1 text-primary">{MOMO_NUMBER} <Copy size={12}/></button></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Merchant Name</span><span className="font-semibold">{MOMO_NAME}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><button onClick={() => copy(activeRental.momo_reference ?? "")} className="font-mono font-semibold flex items-center gap-1 text-primary">{activeRental.momo_reference} <Copy size={12}/></button></div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">Include the reference in the payment note. Once we confirm, your number appears here automatically.</p>
                <div className="mt-3 flex gap-2">
                  <a href={`https://wa.me/233555098098?text=${encodeURIComponent(`Hi, I paid GHS ${activeRental.price_ghs} for a rental. Ref: ${activeRental.momo_reference}`)}`} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-green-600 text-white text-sm font-semibold py-2 text-center hover:bg-green-700">Notify on WhatsApp</a>
                  <Button variant="outline" size="sm" onClick={() => cancel(activeRental.id)}>Cancel</Button>
                </div>
              </div>
            )}

            {activeRental.phone_number && (
              <div className="rounded-xl border border-border bg-card p-4 mt-3">
                <p className="text-xs text-muted-foreground mb-1">Your temporary number</p>
                <button onClick={() => copy(activeRental.phone_number!)} className="w-full text-left flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold tracking-wide">{activeRental.phone_number}</span>
                  <Copy size={16} className="text-primary"/>
                </button>
                {activeRental.provider_expires_at && (
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><Timer size={11}/> Expires in {mm}:{ss}</p>
                )}
              </div>
            )}

            {activeRental.status === "waiting_sms" && (
              <div className="mt-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
                <div className="flex justify-center mb-2">{checking ? <Loader2 className="animate-spin text-primary" size={20}/> : <MessageSquare className="text-primary" size={20}/>}</div>
                <p className="text-sm font-semibold">Waiting for SMS…</p>
                <p className="text-[11px] text-muted-foreground">We check every few seconds. Use the number above on {activeRental.service_name}.</p>
              </div>
            )}

            {activeRental.status === "sms_received" && activeRental.sms_code && (
              <div className="mt-3 rounded-xl border-2 border-green-500/40 bg-green-500/5 p-4">
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1 flex items-center gap-1"><CheckCircle2 size={14}/> Code received from {activeRental.sms_sender ?? "sender"}</p>
                <button onClick={() => copy(activeRental.sms_code!)} className="w-full text-left flex items-center justify-between mt-1">
                  <span className="font-mono text-3xl font-bold tracking-widest text-green-700 dark:text-green-400">{activeRental.sms_code}</span>
                  <Copy size={18} className="text-green-700 dark:text-green-400"/>
                </button>
                {activeRental.sms_text && <p className="text-[11px] text-muted-foreground mt-2 break-words">{activeRental.sms_text}</p>}
              </div>
            )}

            {activeRental.status === "expired" && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1"><XCircle size={14}/> Rental expired without an SMS. You can request a refund by messaging support.</p>
            )}
          </div>
        )}

        {/* Picker */}
        {!activeRental && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pick a service</label>
              <div className="relative mt-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search Telegram, Tinder, Amazon, PayPal…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9"/>
              </div>
            </div>

            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeCategory === c
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-button)]"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="max-h-[26rem] overflow-y-auto pr-1 mb-4">
              {grouped ? (
                Object.entries(grouped).map(([cat, list]) => (
                  <div key={cat} className="mb-5 last:mb-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 sticky top-0 bg-card/95 backdrop-blur py-1">{cat}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {list.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedService(s.id)}
                          className={`text-left rounded-xl border p-3 transition-all group ${
                            selectedService === s.id
                              ? "border-primary bg-primary/10 shadow-[var(--shadow-button)] scale-[1.02]"
                              : "border-border bg-background hover:border-primary/40 hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl leading-none">{s.emoji}</span>
                            <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                          </div>
                          <p className="text-xs text-primary font-bold mt-1">GHS {s.price_ghs}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filtered.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      className={`text-left rounded-xl border p-3 transition-all ${
                        selectedService === s.id
                          ? "border-primary bg-primary/10 shadow-[var(--shadow-button)] scale-[1.02]"
                          : "border-border bg-background hover:border-primary/40 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{s.emoji}</span>
                        <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                      </div>
                      <p className="text-xs text-primary font-bold mt-1">GHS {s.price_ghs}</p>
                    </button>
                  ))}
                </div>
              )}
              {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">No services match "{query}"</p>}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Country (optional)</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">"Any country" is cheapest and fastest.</p>
            </div>

            <Button onClick={startRental} disabled={!selectedService || creating} className="w-full" size="lg">
              {creating ? <><Loader2 size={16} className="animate-spin mr-2"/> Creating…</> :
                selected ? `Rent for GHS ${selected.price_ghs}` : "Select a service"}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground mt-3">You'll pay via MoMo. Once we confirm, your number appears here — no page refresh needed.</p>
          </div>
        )}

        {/* History */}
        {rentals.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent rentals</p>
            <ul className="divide-y divide-border">
              {rentals.map((r) => (
                <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{r.service_name} <span className="text-muted-foreground font-normal">· {r.country_name}</span></p>
                    <p className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString()} · GHS {Number(r.price_ghs).toFixed(2)}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted">{r.status.replace(/_/g, " ")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentNumber;
