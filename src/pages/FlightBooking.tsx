import { useEffect, useState } from "react";
import { MessageCircle, Send, Plane, MapPin, Clock, Luggage, CalendarDays } from "lucide-react";
import Footer from "@/components/Footer";

const WHATSAPP = "https://wa.me/233555098098";
const TELEGRAM = "https://t.me/swiftchainexchange"; // Replace with your real Telegram username/link

const FlightBooking = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf = 0;
    const animate = () => {
      setOffset((prev) => (prev + 0.15) % 100);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated sky background */}
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-40">
        {/* Clouds */}
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

        {/* Flight path */}
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

        {/* Plane */}
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

        {/* City dots / world map abstract */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-30">
          {[
            { left: "8%", bottom: "18%" },
            { left: "22%", bottom: "42%" },
            { left: "38%", bottom: "28%" },
            { left: "55%", bottom: "55%" },
            { left: "72%", bottom: "32%" },
            { left: "88%", bottom: "48%" },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-primary/60 pulse-dot"
              style={{ left: dot.left, bottom: dot.bottom, animationDelay: `${i * 0.4}s` }}
            />
          ))}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <path
              d="M 8% 82% L 22% 58% L 38% 72% L 55% 45% L 72% 68% L 88% 52%"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-primary/20"
            />
          </svg>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-1.5 text-xs font-semibold text-foreground mb-6 shadow-sm">
            <Plane size={14} className="text-primary" /> Flight Itinerary Booking
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5">
            <span className="text-foreground">Book Your Next </span>
            <span className="text-gradient-anim">Trip With Us.</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            A modern flight booking experience is on the way. For now, send us your travel details on WhatsApp or Telegram and we'll prepare your itinerary in minutes.
          </p>

          {/* Simulated search card */}
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 shadow-[var(--shadow-card)] mb-10 text-left">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl bg-muted/60 p-4 flex items-center gap-3">
                <MapPin size={18} className="text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">From</p>
                  <p className="text-sm font-semibold text-card-foreground">Accra (ACC)</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/60 p-4 flex items-center gap-3">
                <MapPin size={18} className="text-accent" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">To</p>
                  <p className="text-sm font-semibold text-card-foreground">Your destination</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/60 p-4 flex items-center gap-3">
                <CalendarDays size={18} className="text-emerald-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Departure</p>
                  <p className="text-sm font-semibold text-card-foreground">Pick a date</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/60 p-4 flex items-center gap-3">
                <Luggage size={18} className="text-amber-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Passengers</p>
                  <p className="text-sm font-semibold text-card-foreground">1 adult</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
              <Clock size={16} />
              <span className="font-medium">Coming soon — book manually via WhatsApp for now.</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl bg-[hsl(142_70%_45%)] px-8 py-4 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-all hover:translate-y-[-2px]"
            >
              <MessageCircle size={18} /> Book on WhatsApp
            </a>
            <a
              href={TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl glass px-8 py-4 text-sm font-bold text-foreground hover:bg-card transition-all"
            >
              <Send size={18} className="text-primary group-hover:translate-x-0.5 transition-transform" /> Book on Telegram
            </a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Typical response time: under 10 minutes · Available 7 days a week
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FlightBooking;
