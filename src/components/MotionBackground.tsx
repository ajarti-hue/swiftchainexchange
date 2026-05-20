import { useEffect, useRef } from "react";

/**
 * Global HD crypto-themed motion background.
 * Canvas renders: drifting blockchain nodes connected by glowing lines,
 * floating crypto glyphs (₿ Ξ ₮ $), and a subtle parallax gradient.
 * Fixed, behind everything, pointer-events none, reduced-motion aware.
 */
const GLYPHS = ["₿", "Ξ", "₮", "$", "◈", "◆"];

const MotionBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Get theme color from CSS var
    const getPrimary = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      return v || "215 60% 45%";
    };
    const getAccent = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      return v || "205 70% 55%";
    };

    // Particles (blockchain nodes)
    const nodeCount = Math.min(70, Math.floor((w * h) / 22000));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 2.2,
    }));

    // Floating glyphs
    const glyphCount = Math.min(14, Math.floor(w / 130));
    const glyphs = Array.from({ length: glyphCount }, (_, i) => ({
      ch: GLYPHS[i % GLYPHS.length],
      x: Math.random() * w,
      y: Math.random() * h,
      vy: -0.15 - Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.12,
      size: 18 + Math.random() * 34,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.003,
      alpha: 0.06 + Math.random() * 0.1,
    }));

    let last = performance.now();
    const maxDist = 140;

    const render = (t: number) => {
      const dt = Math.min(33, t - last);
      last = t;

      ctx.clearRect(0, 0, w, h);

      const primary = getPrimary();
      const accent = getAccent();

      // Soft radial gradient overlay
      const grad = ctx.createRadialGradient(w * 0.85, h * 0.1, 0, w * 0.85, h * 0.1, Math.max(w, h));
      grad.addColorStop(0, `hsla(${accent} / 0.10)`);
      grad.addColorStop(1, "hsla(0 0% 0% / 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Glyphs
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const g of glyphs) {
        g.x += g.vx * (dt / 16);
        g.y += g.vy * (dt / 16);
        g.rot += g.vr * dt;
        if (g.y < -40) {
          g.y = h + 40;
          g.x = Math.random() * w;
        }
        if (g.x < -40) g.x = w + 40;
        if (g.x > w + 40) g.x = -40;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.rot);
        ctx.font = `600 ${g.size}px "Space Grotesk", system-ui, sans-serif`;
        ctx.fillStyle = `hsla(${primary} / ${g.alpha})`;
        ctx.fillText(g.ch, 0, 0);
        ctx.restore();
      }

      // Update nodes
      for (const n of nodes) {
        n.x += n.vx * (dt / 16);
        n.y += n.vy * (dt / 16);
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.25;
            ctx.strokeStyle = `hsla(${primary} / ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = `hsla(${accent} / 0.55)`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        // glow
        ctx.beginPath();
        ctx.fillStyle = `hsla(${accent} / 0.08)`;
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 700px at 80% -10%, hsl(var(--accent) / 0.18), transparent 60%), radial-gradient(900px 600px at -10% 110%, hsl(var(--primary) / 0.18), transparent 60%), hsl(var(--background))",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90" />
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
};

export default MotionBackground;
