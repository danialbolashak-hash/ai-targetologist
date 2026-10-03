"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, ChevronRight, ChevronLeft, Building, DollarSign,
  MapPin, Users, AlertCircle, Rocket, Brain, Sparkles,
  Check, Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Ваш бизнес", desc: "Расскажите об основе" },
  { id: 2, title: "Рынок", desc: "Конкуренты и цели" },
  { id: 3, title: "Бюджет", desc: "Инвестиции в рекламу" },
  { id: 4, title: "AI Анализ", desc: "Обработка данных" },
];

const NICHES = [
  "Красота и уход", "Медицина", "Образование", "E-commerce",
  "Недвижимость", "Рестораны и кафе", "Фитнес", "Юридические услуги",
  "Финансы", "IT и Software", "Строительство", "Авто",
];

const GOALS = ["Лиды", "Продажи", "Охват", "Трафик на сайт"];

interface BusinessData {
  niche: string;
  product: string;
  avgCheck: string;
  city: string;
  country: string;
  competitors: string;
  painPoints: string;
  goals: string[];
  budget: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<BusinessData>({
    niche: "",
    product: "",
    avgCheck: "",
    city: "",
    country: "Казахстан",
    competitors: "",
    painPoints: "",
    goals: [],
    budget: "",
  });

  const update = (field: keyof BusinessData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const startAnalysis = async () => {
    setStep(4);
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 3500));
    setAnalyzing(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
            <Target className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-white">AI Targetologist</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                  step > s.id
                    ? "bg-[#00D4FF] text-black"
                    : step === s.id
                    ? "bg-[rgba(0,212,255,0.15)] text-[#00D4FF] border border-[rgba(0,212,255,0.4)]"
                    : "bg-white/[0.04] text-muted-foreground border border-border"
                }`}
              >
                {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-px transition-all duration-300 ${step > s.id ? "bg-[#00D4FF]" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card rounded-2xl p-8">
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">О вашем бизнесе</h2>
                    <p className="text-sm text-muted-foreground">AI использует эти данные для анализа рынка</p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Ниша бизнеса</label>
                    <div className="grid grid-cols-3 gap-2">
                      {NICHES.map((n) => (
                        <button
                          key={n}
                          onClick={() => update("niche", n)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 text-left cursor-pointer ${
                            data.niche === n
                              ? "bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                              : "border-border text-muted-foreground hover:border-[rgba(255,255,255,0.15)] hover:text-white"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Продукт / Услуга</label>
                    <input
                      type="text"
                      placeholder="Например: Перманентный макияж, уход за бровями"
                      value={data.product}
                      onChange={(e) => update("product", e.target.value)}
                      className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Средний чек</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        placeholder="50"
                        value={data.avgCheck}
                        onChange={(e) => update("avgCheck", e.target.value)}
                        className="w-full bg-white/[0.04] border border-border rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Город</label>
                      <input
                        type="text"
                        placeholder="Алматы"
                        value={data.city}
                        onChange={(e) => update("city", e.target.value)}
                        className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Страна</label>
                      <input
                        type="text"
                        placeholder="Казахстан"
                        value={data.country}
                        onChange={(e) => update("country", e.target.value)}
                        className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Рынок и конкуренты</h2>
                    <p className="text-sm text-muted-foreground">Поможет AI создать уникальное позиционирование</p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Главные конкуренты</label>
                    <textarea
                      placeholder="Например: Beauty Room, Студия Аида, @lashes_almaty..."
                      value={data.competitors}
                      onChange={(e) => update("competitors", e.target.value)}
                      rows={3}
                      className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Боли клиентов</label>
                    <textarea
                      placeholder="Например: Страх боли, дорогие процедуры, долгий результат, ненатуральный вид..."
                      value={data.painPoints}
                      onChange={(e) => update("painPoints", e.target.value)}
                      rows={3}
                      className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Цели рекламы</label>
                    <div className="flex flex-wrap gap-2">
                      {GOALS.map((g) => (
                        <button
                          key={g}
                          onClick={() => toggleGoal(g)}
                          className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 cursor-pointer ${
                            data.goals.includes(g)
                              ? "bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                              : "border-border text-muted-foreground hover:border-[rgba(255,255,255,0.15)] hover:text-white"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Рекламный бюджет</h2>
                    <p className="text-sm text-muted-foreground">AI распределит бюджет для максимального ROI</p>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-3 block">Месячный бюджет</label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {["200", "500", "1000", "2000", "5000", "10000+"].map((b) => (
                        <button
                          key={b}
                          onClick={() => update("budget", b === "10000+" ? "10000" : b)}
                          className={`py-3 text-sm rounded-xl border transition-all duration-200 cursor-pointer ${
                            data.budget === (b === "10000+" ? "10000" : b)
                              ? "bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.3)] text-[#00D4FF]"
                              : "border-border text-muted-foreground hover:border-[rgba(255,255,255,0.15)] hover:text-white"
                          }`}
                        >
                          ${b}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        placeholder="Или введите свой бюджет"
                        value={data.budget}
                        onChange={(e) => update("budget", e.target.value)}
                        className="w-full bg-white/[0.04] border border-border rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-4 bg-[rgba(0,212,255,0.03)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-[#00D4FF]" />
                      <span className="text-xs font-semibold text-[#00D4FF]">AI Прогноз</span>
                    </div>
                    {data.budget ? (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Лидов/мес", value: Math.round(parseInt(data.budget || "0") / 4.5) },
                          { label: "Прогноз CPL", value: `$${Math.max(2, Math.round(parseInt(data.budget || "0") * 0.015))}` },
                          { label: "Прогноз ROI", value: `${Math.round(280 + Math.random() * 100)}%` },
                        ].map((p, i) => (
                          <div key={i} className="text-center">
                            <div className="text-lg font-bold text-white">{p.value}</div>
                            <div className="text-xs text-muted-foreground">{p.label}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Введите бюджет для получения прогноза</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4 — AI Analysis */}
              {step === 4 && (
                <div className="text-center py-6">
                  {!done ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Brain className="w-8 h-8 text-[#00D4FF]" />
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">AI анализирует ваш бизнес</h2>
                      <p className="text-sm text-muted-foreground mb-8">Это займёт около 30 секунд</p>
                      <div className="space-y-3 text-left">
                        {[
                          "Анализ рынка и конкурентов...",
                          "Исследование целевой аудитории...",
                          "Создание стратегии...",
                          "Генерация офферов...",
                        ].map((t, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Loader2 className="w-3.5 h-3.5 text-[#00D4FF] animate-spin flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{t}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-[#00FF88]" />
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">Анализ завершён!</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        AI подготовил стратегию, аудитории и офферы для вашего бизнеса
                      </p>
                      <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                          { icon: Users, label: "3 аудитории", color: "#00D4FF" },
                          { icon: Sparkles, label: "5 офферов", color: "#7C3AED" },
                          { icon: Rocket, label: "2 кампании", color: "#00FF88" },
                        ].map((item, i) => (
                          <div key={i} className="glass-card rounded-xl p-3 text-center">
                            <item.icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.color }} />
                            <div className="text-xs text-muted-foreground">{item.label}</div>
                          </div>
                        ))}
                      </div>
                      <a href="/dashboard" className="btn-neon inline-flex items-center gap-2">
                        Перейти в дашборд
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>
              )}

              {/* Navigation */}
              {step < 4 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <button
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    disabled={step === 1}
                    className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${
                      step === 1 ? "text-transparent" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Назад
                  </button>

                  {step < 3 ? (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      className="btn-neon flex items-center gap-2 text-sm py-2.5"
                    >
                      Далее
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={startAnalysis}
                      className="btn-neon flex items-center gap-2 text-sm py-2.5"
                    >
                      <Brain className="w-4 h-4" />
                      Запустить AI анализ
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Шаг {Math.min(step, 3)} из 3 · Займёт 2-3 минуты
        </p>
      </div>
    </div>
  );
}
