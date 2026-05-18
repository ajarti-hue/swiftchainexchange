import { Shield, Zap, Users, Award } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { icon: Users, render: <AnimatedCounter to={12400} suffix="+" />, label: "Trades completed", tint: "hsl(205 80% 55%)" },
  { icon: Zap, render: <span>&lt; 5 min</span>, label: "Average payout", tint: "hsl(45 95% 55%)" },
  { icon: Shield, render: <AnimatedCounter to={100} suffix="%" />, label: "Insured exchanges", tint: "hsl(160 70% 45%)" },
  { icon: Award, render: <span>4.9 / 5</span>, label: "Customer rating", tint: "hsl(280 70% 60%)" },
];

const TrustStatsBand = () => (
  <div className="mx-auto max-w-6xl px-4 -mt-8 relative z-10">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl glass p-3 shadow-[var(--shadow-card)]">
      {stats.map(({ icon: Icon, render, label, tint }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl bg-card/60 px-4 py-3 backdrop-blur lift-card">
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
            <p className="font-display text-lg font-bold leading-none text-foreground">{render}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TrustStatsBand;
