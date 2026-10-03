"use client";

import { useState } from "react";
import {
  TrendingUp, AlertTriangle, CheckCircle, Brain,
  Zap, ArrowUpRight, ArrowDownRight, RefreshCw,
  ChevronRight, Play, Loader2, DollarSign,
} from "lucide-react";

const RECOMMENDATIONS = [
  {
    id: "1",
    campaign: "Салон красоты — Холодная",
    type: "CREATIVE",
    priority: "HIGH",
    title: "CTR снизился до 1.2%",
    description: "Текущий хук перестал работать. AI сгенерировал 3 новых варианта с прогнозом CTR 3.5%+.",
    metric: { label: "CTR", current: "1.2%", projected: "3.5%", up: true },
    action: "Сменить креатив",
    status: "PENDING",
  },
  {
    id: "2",
    campaign: "Онлайн-школа — Ретаргетинг",
    type: "BUDGET",
    priority: "MEDIUM",
    title: "Связка работает отлично — масштабируй",
    description: "ROAS 6.8x при расходе $280. Увеличение бюджета на 50% прогнозирует +67 лидов при сохранении CPL.",
    metric: { label: "Прогноз лидов", current: "134", projected: "201", up: true },
    action: "Увеличить бюджет",
    status: "PENDING",
  },
  {
    id: "3",
    campaign: "Стоматология — Lookalike 3%",
    type: "AUDIENCE",
    priority: "HIGH",
    title: "CPM $220 — аудитория слишком узкая",
    description: "Аудитория 45K человек — слишком мала. AI рекомендует расширить до Lookalike 6% и добавить интересы.",
    metric: { label: "CPM", current: "$220", projected: "$140", up: false },
    action: "Расширить аудиторию",
    status: "PENDING",
  },
  {
    id: "4",
    campaign: "E-commerce — TikTok",
    type: "OFFER",
    priority: "MEDIUM",
    title: "Конверсия в покупку падает",
    description: "CR с клика упал до 0.8%. Текущий оффер не закрывает возражение 'дорого'. AI подготовил 2 новых оффера с акцентом на ценность.",
    metric: { label: "CR", current: "0.8%", projected: "2.1%", up: true },
    action: "Сменить оффер",
    status: "PENDING",
  },
  {
    id: "5",
    campaign: "Салон красоты — Холодная",
    type: "SCALING",
    priority: "LOW",
    title: "Готова к масштабированию на Россию",
    description: "Связка устойчива 14 дней. AI предлагает запустить аналогичную кампанию с гео Москва + Санкт-Петербург.",
    metric: { label: "Потенциал лидов", current: "89/мес", projected: "400/мес", up: true },
    action: "Расширить гео",
    status: "APPLIED",
  },
];

const TYPE_COLORS: Record<string, string> = {
  CREATIVE: "#7C3AED",
  BUDGET: "#00FF88",
  AUDIENCE: "#00D4FF",
  OFFER: "#F59E0B",
  SCALING: "#EC4899",
};

const TYPE_LABELS: Record<string, string> = {
  CREATIVE: "Креатив",
  BUDGET: "Бюджет",
  AUDIENCE: "Аудитория",
  OFFER: "Оффер",
  SCALING: "Масштаб",
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#FF4444",
  MEDIUM: "#F59E0B",
  LOW: "#00D4FF",
};

export default function OptimizationPage() {
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set(["5"]));

  const applyRec = async (id: string) => {
    setApplying(id);
    await new Promise((r) => setTimeout(r, 1800));
    setApplying(null);
    setApplied((prev) => new Set([...prev, id]));
  };

  const pending = RECOMMENDATIONS.filter((r) => !applied.has(r.id));
  const done = RECOMMENDATIONS.filter((r) => applied.has(r.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Optimization</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI анализирует кампании и предлагает улучшения</p>
        </div>
        <button className="btn-ghost-neon flex items-center gap-2 text-sm py-2.5">
          <RefreshCw className="w-4 h-4" />
          Обновить анализ
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ожидают применения", value: pending.length, icon: AlertTriangle, color: "#F59E0B" },
          { label: "Применено сегодня", value: done.length, icon: CheckCircle, color: "#00FF88" },
          { label: "Прогноз экономии CPL", value: "−34%", icon: TrendingUp, color: "#00D4FF" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Recommendations */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Ожидают применения</h2>
          <div className="space-y-3">
            {pending.map((rec) => (
              <div key={rec.id} className="glass-card rounded-xl p-5 hover:border-[rgba(0,212,255,0.12)] transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${TYPE_COLORS[rec.type]}15`, color: TYPE_COLORS[rec.type] }}
                      >
                        {TYPE_LABELS[rec.type]}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${PRIORITY_COLORS[rec.priority]}15`, color: PRIORITY_COLORS[rec.priority] }}
                      >
                        {rec.priority === "HIGH" ? "Важно" : rec.priority === "MEDIUM" ? "Средний" : "Низкий"}
                      </span>
                      <span className="text-xs text-muted-foreground">{rec.campaign}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{rec.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{rec.description}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{rec.metric.label}:</span>
                        <span className="text-xs text-red-400 font-medium">{rec.metric.current}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-[#00FF88] font-medium">{rec.metric.projected}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => applyRec(rec.id)}
                    disabled={applying === rec.id}
                    className="flex-shrink-0 btn-neon text-xs py-2 px-4 flex items-center gap-2 disabled:opacity-70"
                  >
                    {applying === rec.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Применяю...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        {rec.action}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applied */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Применено</h2>
          <div className="space-y-2">
            {done.map((rec) => (
              <div key={rec.id} className="glass-card rounded-xl p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#00FF88] flex-shrink-0" />
                    <div>
                      <div className="text-sm text-white">{rec.title}</div>
                      <div className="text-xs text-muted-foreground">{rec.campaign}</div>
                    </div>
                  </div>
                  <span className="text-xs text-[#00FF88]">Применено</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
