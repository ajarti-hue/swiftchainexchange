import { Bitcoin } from "lucide-react";

const Coin = ({ className, label, color, style }: { className: string; label: string; color: string; style?: React.CSSProperties }) => (
  <div className={`absolute float-coin ${className}`} style={style}>
    <div
      className="relative grid place-items-center rounded-full shadow-2xl"
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(circle at 30% 25%, hsl(0 0% 100% / 0.85), ${color} 55%, hsl(215 60% 18%) 100%)`,
        boxShadow: `0 30px 60px -20px ${color}, inset 0 -8px 20px hsl(0 0% 0% / 0.35), inset 0 8px 16px hsl(0 0% 100% / 0.25)`,
        transform: "rotate(-8deg)",
      }}
    >
      <span className="font-display font-black text-white/95 drop-shadow-lg" style={{ fontSize: "44%" }}>{label}</span>
      <div className="absolute inset-2 rounded-full border border-white/15" />
    </div>
  </div>
);

const Hero3DScene = () => {
  return (
    <div className="relative h-[320px] lg:h-[440px] w-full">
      {/* glowing orb backdrop */}
      <div
        className="absolute -inset-10 rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(205 80% 60% / 0.55), transparent 60%)" }}
      />

      {/* Grid plate */}
      <div
        className="absolute inset-x-6 bottom-0 h-40 rounded-[2rem] glass overflow-hidden"
        style={{ transform: "perspective(900px) rotateX(40deg)", transformOrigin: "center bottom" }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(hsl(205 80% 60% / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(205 80% 60% / 0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <Coin className="left-[8%] top-[10%] h-28 w-28 lg:h-36 lg:w-36" label="BTC" color="hsl(35 95% 55%)" style={{ ["--rot" as any]: "-6deg", animationDelay: "0s" }} />
      <Coin className="right-[6%] top-[18%] h-24 w-24 lg:h-32 lg:w-32" label="ETH" color="hsl(235 75% 58%)" style={{ ["--rot" as any]: "8deg", animationDelay: "1.2s" }} />
      <Coin className="left-[34%] top-[42%] h-20 w-20 lg:h-28 lg:w-28" label="USDT" color="hsl(160 70% 40%)" style={{ ["--rot" as any]: "-3deg", animationDelay: "0.6s" }} />
      <Coin className="right-[28%] bottom-[14%] h-16 w-16 lg:h-24 lg:w-24" label="PM" color="hsl(0 75% 55%)" style={{ ["--rot" as any]: "4deg", animationDelay: "2.1s" }} />

      {/* Live badge */}
      <div className="absolute top-2 right-2 lg:top-4 lg:right-4 flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[10px] font-semibold text-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        LIVE · Accra, Ghana
      </div>

      {/* Bitcoin icon floating */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-2xl glass px-3 py-2 text-xs font-medium text-foreground shadow-xl">
        <Bitcoin size={14} className="text-amber-500" />
        Best GHS rates · Updated minute-by-minute
      </div>
    </div>
  );
};

export default Hero3DScene;
