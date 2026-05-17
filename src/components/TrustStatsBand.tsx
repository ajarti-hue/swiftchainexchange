import { Shield, Zap, Users, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "12,400+", label: "Trades completed", tint: "hsl(205 80% 55%)" },
  { icon: Zap, value: "< 5 min", label: "Average payout", tint: "hsl(45 95% 55%)" },
  { icon: Shield, value: "100%", label: "Insured exchanges", tint: "hsl(160 70% 45%)" },
  { icon: Award, value: "4.9 / 5", label: "Customer rating", tint: "hsl(280 70% 60%)" },
];

const TrustStatsBand = () => (
  <div className="mx-auto max-w-6xl px-4 -mt-8 relative z-10">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl glass p-3 shadow-[var(--shadow-card)]">
      {stats.map(({ icon: Icon, value, label, tint }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl bg-card/60 px-4 py-3 backdrop-blur">
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${tint}, hsl(215 60% 25%))`,
              boxShadow: `0 8px 20px -6px ${tint}`,
            }}
          >
            <Icon size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold leading-none text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TrustStatsBand;
