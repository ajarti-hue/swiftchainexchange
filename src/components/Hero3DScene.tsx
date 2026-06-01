import { useEffect, useRef, useState } from "react";
import { Bitcoin } from "lucide-react";

/**
 * Premium 3D hero scene — rotating crypto coins on a perspective grid plate
 * with mouse parallax, glowing orbital rings and a live status badge.
 */
const COINS = [
  { label: "BTC", color: "hsl(35 95% 55%)",  size: "h-28 w-28 lg:h-40 lg:w-40", pos: "left-[6%]  top-[8%]",   depth: 1.2, delay: "0s"   },
  { label: "ETH", color: "hsl(235 75% 58%)", size: "h-24 w-24 lg:h-32 lg:w-32", pos: "right-[4%] top-[14%]",  depth: 0.9, delay: "1.2s" },
  { label: "USDT",color: "hsl(160 70% 40%)", size: "h-20 w-20 lg:h-28 lg:w-28", pos: "left-[34%] top-[42%]",  depth: 0.7, delay: "0.6s" },
  { label: "PM",  color: "hsl(0 75% 55%)",   size: "h-16 w-16 lg:h-24 lg:w-24", pos: "right-[26%] bottom-[14%]", depth: 1.0, delay: "2.1s" },
  { label: "SOL", color: "hsl(280 80% 60%)", size: "h-14 w-14 lg:h-20 lg:w-20", pos: "left-[18%] bottom-[18%]",  depth: 0.6, delay: "1.8s" },
];

const Coin = ({ label, color, size, pos, depth, delay, mouse }: {
  label: string; color: string; size: string; pos: string; depth: number; delay: string;
  mouse: { x: number; y: number };
}) => {
  const tx = mouse.x * 18 * depth;
  const ty = mouse.y * 18 * depth;
  const rx = -mouse.y * 12 * depth;
  const ry = mouse.x * 12 * depth;
  return (
    // Layer 1: position + mouse parallax translate + float anim
    <div
      className={`absolute ${pos} ${size} will-change-transform`}
      style={{
        transform: `translate3d(${tx}px, ${ty}px, 0)`,
        transition: "transform 220ms cubic-bezier(.2,.7,.2,1)",
        animationDelay: delay,
      }}
    >
      {/* Layer 2: mouse-driven tilt */}
      <div
        className="h-full w-full"
        style={{
          transform: `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          transition: "transform 220ms cubic-bezier(.2,.7,.2,1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Layer 3: continuous Y-spin */}
        <div className="h-full w-full coin-spin" style={{ transformStyle: "preserve-3d" }}>
          {/* Layer 4: the coin face */}
          <div
            className="relative h-full w-full grid place-items-center rounded-full shadow-2xl"
            style={{
              background: `radial-gradient(circle at 30% 25%, hsl(0 0% 100% / 0.92), ${color} 55%, hsl(215 60% 14%) 100%)`,
              boxShadow: `0 30px 60px -20px ${color}, inset 0 -8px 20px hsl(0 0% 0% / 0.4), inset 0 8px 16px hsl(0 0% 100% / 0.3)`,
            }}
          >
            <span className="font-display font-black text-white/95 drop-shadow-lg select-none" style={{ fontSize: "40%" }}>{label}</span>
            <div className="absolute inset-2 rounded-full border border-white/20" />
            <div className="absolute inset-4 rounded-full border border-white/10" />
            <div
              className="absolute inset-0 rounded-full opacity-70 mix-blend-overlay"
              style={{ background: "linear-gradient(135deg, hsl(0 0% 100% / 0.45), transparent 50%)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Hero3DScene = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1; // -1..1
      const y = ((e.clientY - r.top) / r.height) * 2 - 1;
      setMouse({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    };
    const onLeave = () => setMouse({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [setMouse]);

  return (
    <div ref={wrapRef} className="relative h-[340px] lg:h-[480px] w-full select-none">
      {/* glowing orb backdrop */}
      <div
        className="absolute -inset-10 rounded-full blur-3xl opacity-70 pulse-soft"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(205 80% 60% / 0.55), transparent 60%)" }}
      />

      {/* orbital rings */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="ring-orbit h-[78%] w-[78%] rounded-full border border-primary/20" />
        <div className="ring-orbit-rev absolute h-[58%] w-[58%] rounded-full border border-accent/25" />
        <div className="absolute h-[34%] w-[34%] rounded-full border border-primary/15" />
      </div>

      {/* perspective grid plate */}
      <div
        className="absolute inset-x-6 bottom-0 h-44 rounded-[2rem] glass overflow-hidden"
        style={{ transform: "perspective(900px) rotateX(42deg)", transformOrigin: "center bottom" }}
      >
        <div
          className="absolute inset-0 opacity-40 grid-sweep"
          style={{
            backgroundImage:
              "linear-gradient(hsl(205 80% 60% / 0.45) 1px, transparent 1px), linear-gradient(90deg, hsl(205 80% 60% / 0.45) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 60%)" }}
        />
      </div>

      {COINS.map((c) => (
        <Coin key={c.label} {...c} mouse={mouse} />
      ))}

      {/* Live badge */}
      <div className="absolute top-2 right-2 lg:top-4 lg:right-4 flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[10px] font-semibold text-foreground shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        LIVE · Accra, Ghana
      </div>

      {/* Floating GHS badge */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-2xl glass px-3 py-2 text-xs font-medium text-foreground shadow-xl">
        <Bitcoin size={14} className="text-amber-500" />
        Best GHS rates · Updated minute-by-minute
      </div>
    </div>
  );
};

export default Hero3DScene;
