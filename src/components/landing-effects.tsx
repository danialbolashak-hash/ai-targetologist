"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Particle constellation field (canvas)
   ───────────────────────────────────────────────────────── */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const mouse = { x: -1000, y: -1000 };

    const COUNT = Math.min(90, Math.floor((w * h) / 18000));
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.5,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse repulsion
        const dxm = p.x - mouse.x;
        const dym = p.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 130) {
          const force = (130 - dm) / 130;
          p.x += (dxm / dm) * force * 1.5;
          p.y += (dym / dm) * force * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(167,139,250,0.6)";
        ctx.fill();

        // connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const op = (1 - dist / 120) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(124,58,237,${op})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // line to mouse (cyan accent)
        if (dm < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(6,182,212,${(1 - dm / 160) * 0.4})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1] opacity-70" />;
}

/* ─────────────────────────────────────────────────────────
   Cursor glow (follows mouse, big soft light)
   ───────────────────────────────────────────────────────── */
export function CursorGlow() {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 120, damping: 20 });
  const sy = useSpring(y, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 250);
      y.set(e.clientY - 250);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-[2] hidden md:block"
    >
      <div className="w-full h-full rounded-full bg-[#7C3AED] opacity-[0.06] blur-[90px]" />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Magnetic wrapper — element drifts toward cursor
   ───────────────────────────────────────────────────────── */
export function Magnetic({ children, strength = 0.4 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={reset} className="inline-block">
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   3D tilt card — rotates toward cursor
   ───────────────────────────────────────────────────────── */
export function TiltCard({ children, className = "", max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max);
    rx.set(-py * max);
  };
  const reset = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Text scramble — decodes into final text
   ───────────────────────────────────────────────────────── */
export function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    let frame = 0;
    let raf = 0;

    const run = () => {
      const reveal = Math.floor(frame / 2);
      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (i < reveal || text[i] === " ") result += text[i];
        else result += chars[Math.floor(Math.random() * chars.length)];
      }
      setOut(result);
      frame++;
      if (reveal <= text.length) raf = requestAnimationFrame(run);
      else setOut(text);
    };

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !done.current) {
        done.current = true;
        run();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);

    return () => { cancelAnimationFrame(raf); obs.disconnect(); };
  }, [text]);

  return <span ref={ref} className={className}>{out}</span>;
}

/* ─────────────────────────────────────────────────────────
   Live ticking value
   ───────────────────────────────────────────────────────── */
export function LiveValue({ base, prefix = "", suffix = "", decimals = 0, swing = 0.02 }: { base: number; prefix?: string; suffix?: string; decimals?: number; swing?: number }) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setVal(base * (1 + (Math.random() - 0.5) * swing));
    }, 2000);
    return () => clearInterval(id);
  }, [base, swing]);
  return <>{prefix}{val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}
