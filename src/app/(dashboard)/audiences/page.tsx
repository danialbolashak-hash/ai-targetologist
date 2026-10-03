"use client";

import { useState } from "react";
import { Users, Plus, Brain, ChevronDown, Sparkles, Loader2 } from "lucide-react";

const AUDIENCES = [
  {
    id: "1",
    name: "Женщины 25-35, красота и уход",
    type: "COLD",
    estimatedSize: 180000,
    ageMin: 25,
    ageMax: 35,
    gender: "Женщины",
    locations: ["Алматы", "Астана"],
    interests: ["Уход за кожей", "Макияж", "Красота", "Бьюти-блогеры"],
    behaviors: ["Покупатели онлайн", "Подписчики beauty аккаунтов"],
    aiExplanation: "Эта аудитория выбрана из-за высокой вовлечённости в beauty контент и активных покупок в этой категории. Женщины 25-35 — пик покупательской активности в сфере красоты.",
    cpl: "$3.20",
    ctr: "3.1%",
    active: true,
  },
  {
    id: "2",
    name: "Lookalike 3% — база клиентов",
    type: "LOOKALIKE",
    estimatedSize: 95000,
    ageMin: 22,
    ageMax: 45,
    gender: "Все",
    locations: ["Казахстан"],
    interests: [],
    behaviors: ["Похожи на текущих клиентов"],
    aiExplanation: "Lookalike на основе 1200 клиентов из CRM. AI определил, что эта аудитория схожа по поведению и конвертируется в 2.3 раза лучше холодной.",
    cpl: "$2.10",
    ctr: "4.2%",
    active: true,
  },
  {
    id: "3",
    name: "Тёплая — взаимодействовали с контентом",
    type: "WARM",
    estimatedSize: 42000,
    ageMin: 20,
    ageMax: 50,
    gender: "Все",
    locations: ["Алматы"],
    interests: [],
    behaviors: ["Смотрели Reels", "Лайкали посты", "Сохраняли Stories"],
    aiExplanation: "Пользователи, которые взаимодействовали с вашим контентом за последние 60 дней. Тёплая аудитория конвертируется дешевле — CPL обычно в 2x ниже.",
    cpl: "$1.80",
    ctr: "5.8%",
    active: true,
  },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  COLD: { label: "Холодная", color: "#00D4FF" },
  WARM: { label: "Тёплая", color: "#F59E0B" },
  LOOKALIKE: { label: "Lookalike", color: "#7C3AED" },
  RETARGETING: { label: "Ретаргетинг", color: "#00FF88" },
};

export default function AudiencesPage() {
  const [expanded, setExpanded] = useState<string | null>("1");
  const [generating, setGenerating] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Аудитории</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI находит и анализирует целевые аудитории</p>
        </div>
        <button
          onClick={async () => { setGenerating(true); await new Promise(r => setTimeout(r, 2000)); setGenerating(false); }}
          disabled={generating}
          className="btn-neon flex items-center gap-2 text-sm py-2.5 disabled:opacity-70"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {generating ? "Анализ..." : "Найти новые аудитории"}
        </button>
      </div>

      <div className="space-y-3">
        {AUDIENCES.map((a) => {
          const typeInfo = TYPE_LABELS[a.type];
          return (
            <div key={a.id} className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:border-[rgba(0,212,255,0.12)]">
              <button
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${typeInfo.color}10`, border: `1px solid ${typeInfo.color}20` }}>
                    <Users className="w-4 h-4" style={{ color: typeInfo.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-white">{a.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${typeInfo.color}10`, color: typeInfo.color }}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>~{(a.estimatedSize / 1000).toFixed(0)}K чел.</span>
                      <span>CTR {a.ctr}</span>
                      <span>CPL {a.cpl}</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded === a.id ? "rotate-180" : ""}`} />
              </button>

              {expanded === a.id && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  <div className="grid md:grid-cols-4 gap-3">
                    <div className="bg-white/[0.02] rounded-lg p-3 border border-border">
                      <div className="text-[10px] text-muted-foreground mb-1">Возраст</div>
                      <div className="text-sm text-white">{a.ageMin}–{a.ageMax} лет</div>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-3 border border-border">
                      <div className="text-[10px] text-muted-foreground mb-1">Пол</div>
                      <div className="text-sm text-white">{a.gender}</div>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-3 border border-border col-span-2">
                      <div className="text-[10px] text-muted-foreground mb-1">Гео</div>
                      <div className="flex flex-wrap gap-1">
                        {a.locations.map((l, i) => (
                          <span key={i} className="text-xs text-white bg-white/[0.04] px-2 py-0.5 rounded-md">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {a.interests.length > 0 && (
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-2">Интересы</div>
                      <div className="flex flex-wrap gap-1.5">
                        {a.interests.map((interest, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-md bg-[rgba(0,212,255,0.06)] text-[#00D4FF] border border-[rgba(0,212,255,0.15)]">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-[rgba(0,212,255,0.04)] rounded-lg p-3 border border-[rgba(0,212,255,0.1)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-3.5 h-3.5 text-[#00D4FF]" />
                      <span className="text-[10px] font-semibold text-[#00D4FF] uppercase">Почему эта аудитория</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.aiExplanation}</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button className="btn-ghost-neon text-xs py-2 px-4">Редактировать</button>
                    <button className="btn-neon text-xs py-2 px-4 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Использовать
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
