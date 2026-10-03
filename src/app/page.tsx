"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import {
  Brain, Zap, Target, Sparkles, ArrowRight,
  CheckCircle, TrendingUp, Users, DollarSign,
  Play, Rocket, Globe, Cpu,
} from "lucide-react";
import { ParticleField, CursorGlow, Magnetic, TiltCard, Scramble, LiveValue } from "@/components/landing-effects";

const FEATURES = [
  { icon: Brain, title: "AI Business Analyzer", desc: "AI анализирует ваш рынок, конкурентов, спрос и аудиторию за 60 секунд", color: "#06B6D4" },
  { icon: Users, title: "AI Audience Research", desc: "Автоматически находит холодную, тёплую и lookalike аудиторию с объяснением", color: "#7C3AED" },
  { icon: Sparkles, title: "AI Offer Generator", desc: "Создаёт убойные офферы, УТП, хуки и CTA под вашу нишу", color: "#10B981" },
  { icon: Zap, title: "AI Creative Generator", desc: "Генерирует рекламные тексты, баннеры, видеосценарии для Meta, TikTok, Google", color: "#06B6D4" },
  { icon: Rocket, title: "Auto Ads Launcher", desc: "Запускает кампании в Meta Ads, TikTok Ads и Google Ads автоматически", color: "#7C3AED" },
  { icon: TrendingUp, title: "Smart Optimization Engine", desc: "AI сам меняет креативы, аудитории и бюджет на основе реальных данных", color: "#10B981" },
];

const METRICS = [
  { value: 73, suffix: "%", label: "снижение CPL в среднем", icon: DollarSign },
  { value: 4.2, suffix: "x", label: "рост ROAS за 30 дней", icon: TrendingUp, decimals: 1 },
  { value: 89, suffix: "%", label: "экономия времени", icon: Zap },
  { value: 2400, suffix: "+", label: "активных бизнесов", icon: Globe },
];

const MARQUEE = ["Meta Ads", "Instagram", "TikTok Ads", "Google Ads", "Facebook", "Claude AI", "GPT-4o", "Pixel Tracking", "Lookalike AI", "Lead Ads"];

const PLANS = [
  { name: "Starter", price: "29", desc: "Для малого бизнеса", features: ["1 бизнес-аккаунт", "AI анализ рынка", "До 3 кампаний", "AI генератор офферов", "Базовая аналитика"], cta: "Начать бесплатно", highlight: false },
  { name: "Pro", price: "99", desc: "Для агентств и маркетологов", features: ["До 10 бизнес-аккаунтов", "Полный AI анализ", "Неограниченные кампании", "Auto Ads Launcher", "Smart Optimization", "Predictive AI", "CRM интеграции", "Priority поддержка"], cta: "Попробовать Pro", highlight: true },
  { name: "Enterprise", price: "299", desc: "Для крупных компаний", features: ["Неограниченные аккаунты", "White-label решение", "API доступ", "Dedicated AI агент", "Custom интеграции", "SLA 99.9%", "Персональный менеджер"], cta: "Связаться с нами", highlight: false },
];

const TESTIMONIALS = [
  { name: "Алихан Сейтов", role: "Основатель онлайн-школы", handle: "@alikhan", text: "За 2 недели CPL упал с 4500₸ до 980₸. AI сам нашёл аудиторию, которую я никогда бы не догадался таргетировать.", avatar: "АС", roas: "5.8x ROAS" },
  { name: "Гульнара Асанова", role: "Салон красоты", handle: "@gulnara", text: "Раньше платила таргетологу 200$, теперь AI делает всё лучше за 99$. Записи выросли на 340%.", avatar: "ГА", roas: "340% рост" },
  { name: "Максим Ковалёв", role: "E-commerce", handle: "@maxk", text: "Platform сама оптимизировала 47 объявлений за ночь. Утром ROAS был 6.2x. Это нереально.", avatar: "МК", roas: "6.2x ROAS" },
  { name: "Айгерим Ныгмет", role: "Кофейня", handle: "@aika", text: "Запустила первую кампанию за 8 минут без таргетолога. Очередь по утрам теперь стабильная.", avatar: "АН" },
  { name: "Данияр Ос", role: "Фитнес-клуб", handle: "@daniyar", text: "AI пишет офферы лучше моего копирайтера. Заявки на абонементы +210% за месяц.", avatar: "ДО", roas: "+210%" },
  { name: "Сабина Ким", role: "Бьюти-бренд", handle: "@sabina", text: "Креативы генерятся под каждую аудиторию автоматически. Я просто смотрю на растущий ROAS.", avatar: "СК" },
  { name: "Ерлан Туреш", role: "Автосервис", handle: "@erlan", text: "Думал AI это хайп. Оказалось — он реально снизил мне цену заявки в 3 раза.", avatar: "ЕТ", roas: "−68% CPL" },
  { name: "Малика Жан", role: "Онлайн-магазин", handle: "@malika", text: "Самое крутое — оптимизация 24/7. Пока сплю, бот масштабирует то что работает.", avatar: "МЖ" },
  { name: "Тимур Аб", role: "Агентство", handle: "@timur", text: "Веду 12 клиентов на Agency-плане. Заменил половину команды одной подпиской.", avatar: "ТА", roas: "12 клиентов" },
];

/* Animated number counter */
function Counter({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(() => spring.on("change", (v) => setDisplay(v.toFixed(decimals))), [spring, decimals]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* Scroll reveal wrapper */
function Reveal({ children, delay = 0, y = 24 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const previewY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const previewRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);
  const previewScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  // Spotlight cursor tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>(".spotlight-card").forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B14] overflow-x-hidden noise-overlay">
      {/* Animated aurora background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60 animate-grid-pan" />
        <div className="absolute -top-20 left-1/4 w-[700px] h-[700px] bg-[#06B6D4] opacity-[0.06] rounded-full blur-[130px] animate-aurora" />
        <div className="absolute top-1/3 right-1/5 w-[600px] h-[600px] bg-[#7C3AED] opacity-[0.07] rounded-full blur-[130px] animate-aurora-slow" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-[#10B981] opacity-[0.04] rounded-full blur-[120px] animate-float-slow" />
      </div>

      {/* Interactive constellation + cursor glow */}
      <ParticleField />
      <CursorGlow />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-4 left-4 right-4 z-50 glass-card rounded-2xl px-6 py-3 flex items-center justify-between max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-[0_0_20px_-2px_rgba(124,58,237,0.7)]">
            <Target className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-white font-display">AI Targetologist</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-white transition-colors cursor-pointer">Функции</a>
          <a href="#metrics" className="hover:text-white transition-colors cursor-pointer">Результаты</a>
          <a href="#pricing" className="hover:text-white transition-colors cursor-pointer">Цены</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-white transition-colors">Войти</Link>
          <Link href="/register" className="btn-neon text-sm py-2 px-4">Начать бесплатно</Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-40 pb-24 px-4 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="pill-glow mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#06B6D4] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06B6D4]" />
              </span>
              <span>Powered by Claude AI + GPT-4o</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight font-display text-balance">
              Ваш персональный{" "}
              <span className="gradient-text">AI-маркетолог</span>{" "}
              работает 24/7
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              Платформа анализирует ваш бизнес, находит аудиторию, пишет офферы,
              генерирует креативы и запускает рекламу — полностью автоматически.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic strength={0.5}>
                <Link href="/register" className="btn-neon flex items-center gap-2 text-base group">
                  Запустить AI-рекламу
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.5}>
                <button className="btn-ghost-neon flex items-center gap-2 text-base">
                  <Play className="w-4 h-4" />
                  Смотреть демо
                </button>
              </Magnetic>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Бесплатно 14 дней · Без карты · Отмена в любой момент
            </p>
          </motion.div>

          {/* Hero Dashboard Preview with parallax */}
          <motion.div
            style={{ y: previewY, rotate: previewRotate, scale: previewScale }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-16 relative"
          >
            <TiltCard max={6} className="max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl p-1 neon-border shadow-neon-lg relative overflow-hidden">
                {/* scan line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#06B6D4] to-transparent animate-scan z-20" />
                <DashboardPreview />
              </div>
            </TiltCard>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-[#06B6D4] opacity-20 blur-3xl rounded-full animate-glow-breathe" />
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <section className="relative z-10 py-8 mask-fade-x">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 gap-4 animate-marquee">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-card whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span className="text-sm text-muted-foreground">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section id="metrics" className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {METRICS.map((m, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="stat-card spotlight-card text-center h-full">
                  <m.icon className="w-5 h-5 text-[#06B6D4] mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-black text-white mb-1 font-display">
                    <Counter value={m.value} suffix={m.suffix} decimals={m.decimals ?? 0} />
                  </div>
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-display">
                10 AI-модулей в одной <span className="gradient-text">платформе</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Заменяет команду из таргетолога, копирайтера, аналитика и медиабаера
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="gradient-border spotlight-card rounded-xl p-6 cursor-default h-full">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}30`, boxShadow: `0 0 20px -6px ${f.color}50` }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2 font-display">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI Workflow */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4 font-display">
                От нуля до запущенной рекламы <span className="gradient-text">за 10 минут</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-5 gap-4 items-center">
            {[
              { step: "01", label: "Вводите данные бизнеса", icon: Cpu },
              { step: "02", label: "AI анализирует рынок", icon: Brain },
              { step: "03", label: "Генерирует стратегию", icon: Sparkles },
              { step: "04", label: "Запускает кампании", icon: Rocket },
              { step: "05", label: "Оптимизирует 24/7", icon: TrendingUp },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center relative">
                  <div className="w-14 h-14 rounded-2xl glass-card border border-[rgba(124,58,237,0.2)] flex items-center justify-center mb-3 relative z-10 animate-float" style={{ animationDelay: `${i * 0.4}s` }}>
                    <item.icon className="w-6 h-6 text-[#06B6D4]" />
                  </div>
                  <div className="text-xs font-mono text-[#06B6D4] mb-1">{item.step}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{item.label}</div>
                  {i < 4 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-gradient-to-r from-[rgba(124,58,237,0.4)] to-transparent" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — Join the club (Tella-style wall) */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-3 font-display tracking-tight">
                Вступай в <span className="gradient-text">клуб</span>
              </h2>
              <p className="text-muted-foreground text-lg">Мы бы похвалили себя сами, но за нас это делают клиенты</p>
            </div>
          </Reveal>

          {/* Masonry wall */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-40px" }}
                className="break-inside-avoid mb-4 gradient-border spotlight-card rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{t.avatar}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.handle} · {t.role}</div>
                  </div>
                  {t.roas && (
                    <div className="ml-auto text-[11px] font-semibold text-[#10B981] bg-[rgba(16,185,129,0.1)] px-2 py-1 rounded-full whitespace-nowrap">{t.roas}</div>
                  )}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{t.text}</p>
              </motion.div>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="flex justify-center mt-10">
              <Magnetic strength={0.4}>
                <Link href="/register" className="btn-neon inline-flex items-center gap-2 text-base">
                  Попробовать бесплатно
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing — Tella style */}
      <section id="pricing" className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-4 font-display tracking-tight">Цены</h2>
              <div className="inline-flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Месяц</span>
                <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#7C3AED]">
                  <span className="inline-block h-5 w-5 translate-x-5 rounded-full bg-white transition" />
                </span>
                <span className="text-white font-medium">Год <span className="text-[#10B981]">−20%</span></span>
              </div>
            </div>
          </Reveal>

          {/* Two hero cards */}
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Pro — vibrant purple */}
            <Reveal>
              <div className="relative rounded-3xl p-8 h-full overflow-hidden bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] shadow-[0_20px_60px_-15px_rgba(124,58,237,0.6)]">
                {/* glossy highlight */}
                <div className="absolute -top-1/3 -left-1/4 w-2/3 h-2/3 bg-white/20 blur-3xl rounded-full pointer-events-none" />
                <div className="relative">
                  <span className="inline-block px-3 py-1 rounded-lg bg-white/15 text-white text-xs font-semibold mb-6 backdrop-blur-sm">Pro</span>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-5xl font-black text-white font-display">$99</span>
                    <span className="text-white/70 text-sm mb-2">/мес</span>
                  </div>
                  <p className="text-white/80 text-sm mb-6">Для агентств и маркетологов</p>
                  <ul className="space-y-2.5 mb-8">
                    {PLANS[1].features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-white/90">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 text-white" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block w-full text-center py-3 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 transition-colors cursor-pointer">Попробовать бесплатно</Link>
                  <p className="text-center text-white/60 text-xs mt-3">14 дней бесплатно · без карты</p>
                </div>
              </div>
            </Reveal>

            {/* Starter — dark */}
            <Reveal delay={0.1}>
              <div className="relative rounded-3xl p-8 h-full glass-card spotlight-card">
                <span className="inline-block px-3 py-1 rounded-lg border border-border text-white text-xs font-semibold mb-6">Starter</span>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-white font-display">$29</span>
                  <span className="text-muted-foreground text-sm mb-2">/мес</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">Для малого бизнеса</p>
                <ul className="space-y-2.5 mb-8">
                  {PLANS[0].features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-[#10B981]" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full text-center py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors cursor-pointer">Начать</Link>
                <p className="text-center text-muted-foreground text-xs mt-3">Узнать больше</p>
              </div>
            </Reveal>
          </div>

          {/* Enterprise — wide card */}
          <Reveal delay={0.15}>
            <div className="mt-5 max-w-3xl mx-auto glass-card spotlight-card rounded-3xl p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 rounded-lg border border-border text-white text-xs font-semibold mb-3">Enterprise</span>
                  <h3 className="text-2xl font-black text-white font-display mb-1">По запросу</h3>
                  <p className="text-muted-foreground text-sm">White-label, API, dedicated AI-агент и персональный менеджер для крупных команд.</p>
                </div>
                <div className="md:w-px md:h-20 md:bg-border" />
                <div className="flex-1">
                  <ul className="grid grid-cols-2 gap-2 mb-5">
                    {PLANS[2].features.slice(0, 4).map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-foreground/80">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#10B981]" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block w-full text-center py-2.5 rounded-xl border border-border text-white font-semibold text-sm hover:bg-white/5 transition-colors cursor-pointer">Связаться с нами</Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="glass-card rounded-3xl p-12 neon-border shadow-neon-md relative overflow-hidden">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#06B6D4] opacity-10 blur-[100px] rounded-full animate-glow-breathe" />
              <h2 className="relative text-4xl font-black text-white mb-4 font-display">
                Запустите{" "}
                <Scramble text="AI-рекламу" className="gradient-text-static font-mono" />{" "}
                <span className="gradient-text">прямо сейчас</span>
              </h2>
              <p className="relative text-muted-foreground mb-8">14 дней бесплатно. Без карты. Результат с первой кампании.</p>
              <Magnetic strength={0.5}>
                <Link href="/register" className="relative btn-neon inline-flex items-center gap-2 text-lg px-8 py-4 group">
                  Начать бесплатно
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#06B6D4] flex items-center justify-center">
              <Target className="w-3 h-3 text-black" />
            </div>
            <span className="text-sm font-semibold text-white">AI Targetologist</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 AI Targetologist. Все права защищены.</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Условия использования</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="bg-[#0D0D16] rounded-xl p-6 text-left">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Сегодня</div>
          <div className="text-white font-semibold font-display">Обзор кампаний</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs text-[#10B981]">AI активен</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Потрачено", node: <LiveValue base={1240} prefix="$" />, change: "+12%" },
          { label: "Лиды", node: <LiveValue base={342} />, change: "+28%" },
          { label: "ROAS", node: <LiveValue base={4.8} suffix="x" decimals={1} />, change: "+0.6x" },
          { label: "CPL", node: <LiveValue base={3.62} prefix="$" decimals={2} />, change: "-18%" },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]"
          >
            <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
            <div className="text-lg font-bold text-white tabular-nums">{m.node}</div>
            <div className="text-xs text-[#10B981]">{m.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Animated bar chart */}
      <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.05] mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Конверсии за неделю</span>
          <span className="text-xs text-[#10B981]">+34%</span>
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {[40, 55, 35, 70, 50, 85, 100].map((hpct, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${hpct}%` }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="flex-1 rounded-sm bg-gradient-to-t from-[#06B6D4]/30 to-[#06B6D4] relative group"
            >
              <div className="absolute inset-0 rounded-sm bg-[#06B6D4] opacity-0 group-hover:opacity-30 blur-sm transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-[rgba(124,58,237,0.05)] rounded-lg p-3 border border-[rgba(124,58,237,0.1)] mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-xs font-semibold text-[#06B6D4]">AI Рекомендация</span>
        </div>
        <p className="text-xs text-muted-foreground">
          CTR снизился на 12%. Рекомендую сменить hook в Ad Set #3. Новый вариант уже сгенерирован.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {["Meta Ads", "TikTok", "Google"].map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-xs text-muted-foreground">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
