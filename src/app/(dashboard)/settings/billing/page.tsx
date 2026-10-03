"use client";

import { useState } from "react";
import { CheckCircle, Zap, Building, Crown, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: 29,
    icon: Zap,
    color: "#00D4FF",
    desc: "Для малого бизнеса",
    features: [
      "1 бизнес-аккаунт",
      "1 рекламный аккаунт",
      "До 3 кампаний",
      "AI анализ рынка",
      "AI генератор офферов",
      "Базовая аналитика",
      "Мониторинг каждые 6ч",
    ],
    limits: { campaigns: 3, adAccounts: 1, businesses: 1 },
  },
  {
    id: "PRO",
    name: "Pro",
    price: 99,
    icon: Crown,
    color: "#00D4FF",
    desc: "Для серьёзного бизнеса",
    highlight: true,
    features: [
      "До 5 бизнес-аккаунтов",
      "До 3 рекл. аккаунтов",
      "Неограниченные кампании",
      "Auto Ads Launcher",
      "Smart Optimization",
      "AI Scaling Bot",
      "Мониторинг каждые 2ч",
      "CRM интеграции",
      "Priority поддержка",
    ],
    limits: { campaigns: -1, adAccounts: 3, businesses: 5 },
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: 299,
    icon: Building,
    color: "#7C3AED",
    desc: "Для агентств",
    features: [
      "Неограниченные аккаунты",
      "White-label решение",
      "API доступ",
      "Мониторинг каждые 30 мин",
      "Dedicated AI агент",
      "Custom интеграции",
      "SLA 99.9%",
      "Персональный менеджер",
    ],
    limits: { campaigns: -1, adAccounts: -1, businesses: -1 },
  },
];

export default function BillingPage() {
  const [current] = useState("PRO");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === current) return;
    setLoading(planId);
    await new Promise((r) => setTimeout(r, 1500));
    // In production: redirect to Stripe checkout
    window.location.href = `/api/stripe/checkout?plan=${planId}`;
  };

  const discount = billing === "annual" ? 0.8 : 1;

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Подписка</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Текущий план: Pro · Следующее списание 19.07.2024</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3">
        <span className={`text-sm ${billing === "monthly" ? "text-white" : "text-muted-foreground"}`}>Ежемесячно</span>
        <button
          onClick={() => setBilling((b) => b === "monthly" ? "annual" : "monthly")}
          className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${billing === "annual" ? "bg-[#00D4FF]" : "bg-white/10"}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${billing === "annual" ? "left-6" : "left-1"}`} />
        </button>
        <span className={`text-sm ${billing === "annual" ? "text-white" : "text-muted-foreground"}`}>
          Ежегодно
          <span className="ml-2 text-xs text-[#00FF88] font-medium">−20%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === current;
          return (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-6 relative transition-all duration-300 ${
                plan.highlight ? "border-[rgba(0,212,255,0.25)] shadow-neon-sm" : ""
              } ${isCurrent ? "border-[rgba(0,255,136,0.2)]" : ""}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00D4FF] text-black text-[10px] font-bold px-3 py-1 rounded-full">
                  Популярный
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-[#00FF88] text-black text-[10px] font-bold px-3 py-1 rounded-full">
                  Текущий
                </div>
              )}

              <div className="mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${plan.color}12`, border: `1px solid ${plan.color}25` }}>
                  <plan.icon className="w-4 h-4" style={{ color: plan.color }} />
                </div>
                <h3 className="font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
              </div>

              <div className="flex items-end gap-1 mb-4">
                <span className="text-3xl font-black text-white">${Math.round(plan.price * discount)}</span>
                <span className="text-muted-foreground text-sm mb-1">/мес</span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || loading === plan.id}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isCurrent
                    ? "bg-white/[0.04] text-muted-foreground cursor-default"
                    : plan.highlight
                    ? "btn-neon cursor-pointer"
                    : "btn-ghost-neon cursor-pointer"
                }`}
              >
                {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isCurrent ? "Текущий план" : loading === plan.id ? "Переключаю..." : "Выбрать"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Usage */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Использование в этом месяце</h3>
        <div className="space-y-3">
          {[
            { label: "Кампании", used: 4, max: -1, unit: "" },
            { label: "Рекл. аккаунты", used: 1, max: 3, unit: "" },
            { label: "AI запросов", used: 847, max: 5000, unit: "" },
            { label: "Оптимизаций", used: 23, max: -1, unit: "" },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-white">{item.used}{item.max > 0 ? ` / ${item.max}` : ""}</span>
              </div>
              {item.max > 0 && (
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00D4FF] transition-all"
                    style={{ width: `${Math.min(100, (item.used / item.max) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
