import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, Plane, MapPin, Clock, Luggage, CalendarDays, User, Cake, ArrowLeftRight, Pencil, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";

const WHATSAPP_NUMBER = "233555098098";
const TELEGRAM = "https://t.me/+233555098098";

type TripType = "one-way" | "round-trip";

const FlightBooking = () => {
  const [offset, setOffset] = useState(0);

  const [tripType, setTripType] = useState<TripType>("one-way");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [passport, setPassport] = useState("");
  const [from, setFrom] = useState("Accra (ACC)");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [departTime, setDepartTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabin, setCabin] = useState("Economy");
  const [bags, setBags] = useState("1 checked bag");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let raf = 0;
    const animate = () => {
      setOffset((prev) => (prev + 0.15) % 100);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ready = fullName.trim() && dob && to.trim() && departDate;

  const message = useMemo(() => {
    const lines = [
      "✈️ *Flight Booking Request — Swift Trade Hub*",
      "",
      `Trip type: ${tripType === "one-way" ? "One way" : "Round trip"}`,
      `Passenger: ${fullName || "-"}`,
      `Date of birth: ${dob || "-"}`,
      nationality ? `Nationality: ${nationality}` : "",
      passport ? `Passport / ID: ${passport}` : "",
      `From: ${from || "-"}`,
      `To: ${to || "-"}`,
      `Departure: ${departDate || "-"}${departTime ? ` at ${departTime}` : ""}`,
      tripType === "round-trip" ? `Return: ${returnDate || "-"}` : "",
      `Passengers: ${adults} adult(s)${children ? `, ${children} child(ren)` : ""}`,
      `Cabin: ${cabin}`,
      `Baggage: ${bags}`,
      budget ? `Budget: ${budget}` : "",
      notes ? `Notes: ${notes}` : "",
      "",
      "Please check availability and send me the best options.",
    ].filter(Boolean);
    return lines.join("\n");
  }, [tripType, fullName, dob, nationality, passport, from, to, departDate, departTime, returnDate, adults, children, cabin, bags, budget, notes]);

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const copyAndOpenTelegram = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      /* clipboard may be blocked — user can still paste manually */
    }
    window.open(TELEGRAM, "_blank", "noopener,noreferrer");
  };

  const field = "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors";
  const label = "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated sky background */}
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-40">
        {[
          { top: "12%", scale: 1, duration: "28s" },
          { top: "28%", scale: 0.7, duration: "38s" },
          { top: "52%", scale: 1.2, duration: "32s" },
          { top: "74%", scale: 0.6, duration: "45s" },
        ].map((cloud, i) => (
          <div
            key={i}
            className="cloud-drift absolute"
            style={{
              top: cloud.top,
              left: `${-20 + i * 30}%`,
              transform: `scale(${cloud.scale})`,
              animationDuration: cloud.duration,
              animationDelay: `${i * 3}s`,
            }}
          >
            <svg width="200" height="80" viewBox="0 0 200 80" fill="none" className="text-foreground/10">
              <path
                d="M25 60C11.2 60 0 48.8 0 35C0 21.2 11.2 10 25 10C27.5 10 29.9 10.4 32.1 11.1C37.6 4.4 46.2 0 55.7 0C72.6 0 86.6 12.3 89.3 28.5C91.8 27.5 94.5 27 97.3 27C116.6 27 132.3 42.7 132.3 62H25V60Z"
                fill="currentColor"
              />
            </svg>
          </div>
        ))}

        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <path
            d="M -10 85 Q 30 20, 55 50 T 110 35 T 220 60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-primary/20"
            strokeDasharray="8 8"
          />
        </svg>

        <div
          className="absolute transition-none"
          style={{
            top: `${42 + Math.sin(offset * 0.08) * 6}%`,
            left: `${offset}%`,
            transform: `rotate(${3 + Math.sin(offset * 0.05) * 2}deg)`,
          }}
        >
          <Plane size={48} className="text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]" />
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-14 lg:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-1.5 text-xs font-semibold text-foreground mb-6 shadow-sm">
            <Plane size={14} className="text-primary" /> Flight Itinerary Booking
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-4">
            <span className="text-foreground">Book Your Next </span>
            <span className="text-gradient-anim">Trip With Us.</span>
          </h1>

          <p className="text-muted-foreground text-base mb-2 max-w-xl mx-auto leading-relaxed">
            Fill in your travel details below. We check live availability with our airline partners and send you
            bookable options — usually within minutes.
          </p>
        </div>

        {/* Booking form / confirmation */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
          {confirming ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <h2 className="font-display text-lg font-bold text-card-foreground">Confirm your booking request</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5">Check everything below, then send it to us on WhatsApp or Telegram.</p>

              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-border bg-background/60 p-5 mb-6 text-sm">
                {[
                  ["Trip type", tripType === "one-way" ? "One way" : "Round trip"],
                  ["Passenger", fullName],
                  ["Date of birth", dob],
                  ["Nationality", nationality || "—"],
                  ["Passport / ID", passport || "—"],
                  ["From", from],
                  ["To", to],
                  ["Departure", `${departDate}${departTime ? ` at ${departTime}` : ""}`],
                  ...(tripType === "round-trip" ? [["Return", returnDate || "—"] as const] : []),
                  ["Travellers", `${adults} adult(s)${children ? `, ${children} child(ren)` : ""}`],
                  ["Cabin", cabin],
                  ["Baggage", bags],
                  ["Budget", budget || "—"],
                  ["Notes", notes || "—"],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{k}</dt>
                    <dd className="text-card-foreground font-medium break-words">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white bg-[hsl(142_70%_45%)] hover:opacity-90 hover:-translate-y-0.5 shadow-lg transition-all"
                >
                  <MessageCircle size={18} /> Confirm & send on WhatsApp
                </a>
                <button
                  onClick={copyAndOpenTelegram}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl glass px-6 py-4 text-sm font-bold text-foreground hover:bg-card transition-all"
                >
                  <Send size={18} className="text-primary" /> Confirm & send on Telegram
                </button>
              </div>
              <button
                onClick={() => setConfirming(false)}
                className="mt-4 mx-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil size={12} /> Edit details
              </button>
              <p className="mt-3 text-xs text-muted-foreground text-center">
                Telegram: your details are copied to the clipboard — just paste and send.
              </p>
            </div>
          ) : (
          <>
          {/* Trip type */}
          <div className="inline-flex rounded-xl bg-muted/60 p-1 mb-6">
            {(["one-way", "round-trip"] as TripType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTripType(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  tripType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "one-way" ? "One way" : "Round trip"}
              </button>
            ))}
          </div>

          {/* Passenger */}
          <h2 className="flex items-center gap-2 text-sm font-bold text-card-foreground mb-3">
            <User size={16} className="text-primary" /> Passenger details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-7">
            <div>
              <label className={label} htmlFor="fullName">Full name (as on passport)</label>
              <input id="fullName" className={field} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Kwame Mensah" />
            </div>
            <div>
              <label className={label} htmlFor="dob"><Cake size={11} className="inline mr-1" />Date of birth</label>
              <input id="dob" type="date" className={field} value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="nationality">Nationality</label>
              <input id="nationality" className={field} value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Ghanaian" />
            </div>
            <div>
              <label className={label} htmlFor="passport">Passport / ID number (optional)</label>
              <input id="passport" className={field} value={passport} onChange={(e) => setPassport(e.target.value)} placeholder="G1234567" />
            </div>
          </div>

          {/* Route */}
          <h2 className="flex items-center gap-2 text-sm font-bold text-card-foreground mb-3">
            <ArrowLeftRight size={16} className="text-accent" /> Route & dates
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-7">
            <div>
              <label className={label} htmlFor="from"><MapPin size={11} className="inline mr-1" />From</label>
              <input id="from" className={field} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Accra (ACC)" />
            </div>
            <div>
              <label className={label} htmlFor="to"><MapPin size={11} className="inline mr-1" />To</label>
              <input id="to" className={field} value={to} onChange={(e) => setTo(e.target.value)} placeholder="London (LHR)" />
            </div>
            <div>
              <label className={label} htmlFor="departDate"><CalendarDays size={11} className="inline mr-1" />Departure date</label>
              <input id="departDate" type="date" className={field} value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="departTime"><Clock size={11} className="inline mr-1" />Preferred departure time</label>
              <input id="departTime" type="time" className={field} value={departTime} onChange={(e) => setDepartTime(e.target.value)} />
            </div>
            {tripType === "round-trip" && (
              <div>
                <label className={label} htmlFor="returnDate">Return date</label>
                <input id="returnDate" type="date" className={field} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
            )}
          </div>

          {/* Preferences */}
          <h2 className="flex items-center gap-2 text-sm font-bold text-card-foreground mb-3">
            <Luggage size={16} className="text-amber-500" /> Travellers & preferences
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-7">
            <div>
              <label className={label} htmlFor="adults">Adults</label>
              <input id="adults" type="number" min={1} max={9} className={field} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))} />
            </div>
            <div>
              <label className={label} htmlFor="children">Children</label>
              <input id="children" type="number" min={0} max={9} className={field} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))} />
            </div>
            <div>
              <label className={label} htmlFor="cabin">Cabin class</label>
              <select id="cabin" className={field} value={cabin} onChange={(e) => setCabin(e.target.value)}>
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="bags">Baggage</label>
              <select id="bags" className={field} value={bags} onChange={(e) => setBags(e.target.value)}>
                <option>Hand luggage only</option>
                <option>1 checked bag</option>
                <option>2 checked bags</option>
                <option>3+ checked bags</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="budget">Budget (GHS, optional)</label>
              <input id="budget" className={field} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 12,000" />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="notes">Extra notes</label>
              <textarea id="notes" rows={3} className={field} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Flexible dates, preferred airline, visa itinerary only, etc." />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary mb-6">
            <Clock size={16} className="shrink-0" />
            <span className="font-medium">Instant online search is coming soon — for now we check availability manually and reply in minutes.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={ready ? waLink : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!ready}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white transition-all ${
                ready ? "bg-[hsl(142_70%_45%)] hover:opacity-90 hover:-translate-y-0.5 shadow-lg" : "bg-muted-foreground/40 pointer-events-none"
              }`}
            >
              <MessageCircle size={18} /> Send request on WhatsApp
            </a>
            <button
              onClick={copyAndOpenTelegram}
              disabled={!ready}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl glass px-6 py-4 text-sm font-bold text-foreground transition-all ${
                ready ? "hover:bg-card" : "opacity-50 cursor-not-allowed"
              }`}
            >
              <Send size={18} className="text-primary" /> Send on Telegram
            </button>
          </div>

          {!ready && (
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Add your full name, date of birth, destination and departure date to continue.
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Telegram: your details are copied to the clipboard — just paste and send. Typical response under 10 minutes, 7 days a week.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FlightBooking;
