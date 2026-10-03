"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, Rocket, Users, Target, DollarSign,
  CheckCircle, ChevronRight, ChevronLeft, Loader2,
  Sparkles, Play, Zap, AlertTriangle,
} from "lucide-react";

const OBJECTIVES = [
  { value: "OUTCOME_LEADS", label: "Генерация лидов", desc: "Сбор контактов потенциальных клиентов", icon: Users },
  { value: "OUTCOME_SALES", label: "Продажи", desc: "Прямые покупки через рекламу", icon: DollarSign },
  { value: "OUTCOME_TRAFFIC", label: "Трафик", desc: "Переходы на сайт или лендинг", icon: Rocket },
  { value: "OUTCOME_AWARENESS", label: "Охват", desc: "Максимальный охват аудитории", icon: Target },
];

interface NewCampaignState {
  name: string;
  objective: string;
  dailyBudget: string;
  targetROAS: string;
  targetCPL: string;
  audienceIds: string[];
  offerIds: string[];
  adAccountId: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiBuilding, setAiBuilding] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; name: string } | null>(null);

  const [form, setForm] = useState<NewCampaignState>({
    name: "",
    objective: "OUTCOME_LEADS",
    dailyBudget: "50",
    targetROAS: "3",
    targetCPL: "5",
    audienceIds: ["aud_1", "aud_2"],
    offerIds: ["offer_1"],
    adAccountId: "acc_1",
  });

  const update = (field: keyof NewCampaignState, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleLaunch = async () => {
    setAiBuilding(true);

    // Simulate AI building campaign
    await new Promise((r) => setTimeout(r, 3000));

    setCreatedCampaign({ id: "camp_new_1", name: form.name });
    setAiBuilding(false);
    setStep(4);
  };

  const handleApproveAndLaunch = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push("/campaigns");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Новая кампания</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI создаёт всё автоматически</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {["Настройки", "Стратегия", "Превью", "Запуск"].map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              step > i + 1 ? "bg-[#00D4FF] text-black"
              : step === i + 1 ? "bg-[rgba(0,212,255,0.15)] text-[#00D4FF] border border-[rgba(0,212,255,0.3)]"
              : "bg-white/[0.04] text-muted-foreground border border-border"
            }`}>
              {step > i + 1 ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${step === i + 1 ? "text-white" : "text-muted-foreground"}`}>{s}</span>
            {i < 3 && <div className={`flex-1 h-px ${step > i + 1 ? "bg-[#00D4FF]" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        {/* Step 1: Settings */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-white">Основные настройки</h2>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Название кампании</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Например: Салон красоты — Алматы — Июль"
                className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Цель кампании</label>
              <div className="grid grid-cols-2 gap-2">
                {OBJECTIVES.map((obj) => (
                  <button
                    key={obj.value}
                    onClick={() => update("objective", obj.value)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      form.objective === obj.value
                        ? "border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.06)]"
                        : "border-border hover:border-[rgba(255,255,255,0.15)]"
                    }`}
                  >
                    <obj.icon className={`w-4 h-4 mb-1.5 ${form.objective === obj.value ? "text-[#00D4FF]" : "text-muted-foreground"}`} />
                    <div className={`text-xs font-medium ${form.objective === obj.value ? "text-white" : "text-muted-foreground"}`}>{obj.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{obj.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Дневной бюджет ($)</label>
                <input
                  type="number"
                  value={form.dailyBudget}
                  onChange={(e) => update("dailyBudget", e.target.value)}
                  className="w-full bg-white/[0.04] border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Target ROAS</label>
                <input
                  type="number"
                  value={form.targetROAS}
                  onChange={(e) => update("targetROAS", e.target.value)}
                  className="w-full bg-white/[0.04] border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Target CPL ($)</label>
                <input
                  type="number"
                  value={form.targetCPL}
                  onChange={(e) => update("targetCPL", e.target.value)}
                  className="w-full bg-white/[0.04] border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: AI Strategy */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">AI Стратегия</h2>
            <div className="bg-[rgba(0,212,255,0.04)] rounded-xl p-4 border border-[rgba(0,212,255,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-[#00D4FF]" />
                <span className="text-sm font-semibold text-[#00D4FF]">AI подобрал для кампании</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "2 аудитории", sub: "Холодная + Lookalike 3%", color: "#00D4FF" },
                  { label: "1 оффер", sub: "Score 9.2/10 — лучший для вашей ниши", color: "#7C3AED" },
                  { label: "4 объявления", sub: "2 формата × 2 аудитории", color: "#00FF88" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <div>
                      <span className="text-sm font-medium text-white">{item.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] rounded-xl p-4 border border-border">
              <div className="text-xs font-semibold text-white mb-2">Прогноз результатов</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Лидов/мес", value: Math.round(parseFloat(form.dailyBudget) * 30 / parseFloat(form.targetCPL)) },
                  { label: "Прогноз CPL", value: `$${form.targetCPL}` },
                  { label: "Прогноз ROAS", value: `${form.targetROAS}x` },
                ].map((p, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl font-bold text-[#00D4FF]">{p.value}</div>
                    <div className="text-xs text-muted-foreground">{p.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Превью кампании</h2>
            <div className="space-y-3">
              {[
                { label: "Кампания", value: form.name, mono: false },
                { label: "Цель", value: form.objective.replace("OUTCOME_", ""), mono: false },
                { label: "Дневной бюджет", value: `$${form.dailyBudget}`, mono: false },
                { label: "Аудитории", value: "2 сегмента", mono: false },
                { label: "Объявления", value: "4 объявления", mono: false },
                { label: "Рекл. аккаунт", value: "act_1234567890", mono: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-sm text-white ${item.mono ? "font-mono text-xs" : "font-medium"}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(251,191,36,0.06)] border border-[rgba(251,191,36,0.12)]">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                После нажатия «Запустить» AI создаст кампанию в Meta Ads со статусом PAUSED.
                Вы подтверждаете запуск кнопкой «Approve & Launch».
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Launch */}
        {step === 4 && (
          <div className="text-center py-4">
            {aiBuilding ? (
              <>
                <div className="w-16 h-16 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Brain className="w-7 h-7 text-[#00D4FF]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI строит кампанию...</h3>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  {["Создаю структуру кампании...", "Генерирую тексты объявлений...", "Настраиваю аудитории...", "Загружаю в Meta Ads..."].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin text-[#00D4FF]" />
                      {t}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.2)] flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Кампания готова к запуску</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  AI создал «{createdCampaign?.name}» в Meta Ads. Статус: PAUSED.<br />
                  Нажмите чтобы активировать.
                </p>
                <button
                  onClick={handleApproveAndLaunch}
                  disabled={loading}
                  className="btn-neon flex items-center gap-2 mx-auto text-base px-8 py-4 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  {loading ? "Запускаю..." : "Approve & Launch"}
                </button>
                <p className="text-xs text-muted-foreground mt-3">
                  После запуска AI будет управлять кампанией автоматически
                </p>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer ${step === 1 ? "invisible" : ""}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !form.name}
                className="btn-neon flex items-center gap-2 text-sm py-2.5 disabled:opacity-50"
              >
                Далее <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleLaunch} className="btn-neon flex items-center gap-2 text-sm py-2.5">
                <Sparkles className="w-4 h-4" />
                Создать кампанию
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
