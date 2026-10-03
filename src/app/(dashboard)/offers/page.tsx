"use client";

import { useState } from "react";
import { Target, Sparkles, Copy, ChevronDown, Loader2, Wand2 } from "lucide-react";

const OFFERS = [
  {
    id: "1",
    headline: "Избавьтесь от акне за 30 дней — гарантия результата или деньги назад",
    usp: "Единственная студия в Алматы с письменной гарантией результата",
    hook: "Устала от акне, который не уходит несмотря на дорогую косметику?",
    cta: "Получить бесплатную консультацию сегодня",
    painPoints: ["Боль от высыпаний", "Потраченные деньги на косметику", "Закомплексованность"],
    emotionalTriggers: ["Уверенность в себе", "Красота без фильтров", "Восхищение окружающих"],
    urgencyTriggers: ["Только 5 мест на эту неделю", "Акция до конца месяца"],
    business: "Салон красоты",
    score: 9.2,
    isActive: true,
  },
  {
    id: "2",
    headline: "Выучи Python за 60 дней и получи первую работу — даже без опыта",
    usp: "Единственный курс с гарантией трудоустройства или полным возвратом денег",
    hook: "Хочешь зарабатывать в IT, но не знаешь с чего начать?",
    cta: "Записаться на бесплатный пробный урок",
    painPoints: ["Нет технического образования", "Страх начать", "Не знает с чего начать"],
    emotionalTriggers: ["Финансовая свобода", "Работа из любой точки мира", "Гордость семьи"],
    urgencyTriggers: ["Набор закрывается через 3 дня", "Осталось 12 мест"],
    business: "Онлайн-школа",
    score: 8.8,
    isActive: true,
  },
];

export default function OffersPage() {
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("1");

  const generate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Офферы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Убойные предложения, созданные AI для вашей ниши</p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="btn-neon flex items-center gap-2 text-sm py-2.5 disabled:opacity-70"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {generating ? "Генерация..." : "Создать новый оффер"}
        </button>
      </div>

      <div className="space-y-4">
        {OFFERS.map((offer) => (
          <div key={offer.id} className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${offer.isActive ? "border-[rgba(0,212,255,0.12)]" : ""}`}>
            <button
              onClick={() => setExpanded(expanded === offer.id ? null : offer.id)}
              className="w-full p-5 flex items-start justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">{offer.business}</span>
                  {offer.isActive && (
                    <span className="text-[10px] text-[#00FF88] bg-[rgba(0,255,136,0.1)] px-2 py-0.5 rounded-full">Активный</span>
                  )}
                  <span className="ml-auto text-xs font-bold text-white">{offer.score}/10</span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug">{offer.headline}</h3>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200 ${expanded === offer.id ? "rotate-180" : ""}`} />
            </button>

            {expanded === offer.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <OfferField label="УТП" value={offer.usp} />
                  <OfferField label="Хук" value={offer.hook} />
                  <OfferField label="CTA" value={offer.cta} highlight />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <TagList label="Боли клиента" items={offer.painPoints} color="#FF4444" />
                  <TagList label="Эмоц. триггеры" items={offer.emotionalTriggers} color="#7C3AED" />
                  <TagList label="Срочность" items={offer.urgencyTriggers} color="#F59E0B" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button className="btn-ghost-neon text-xs py-2 px-4 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    Копировать всё
                  </button>
                  <button className="btn-neon text-xs py-2 px-4 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Использовать в кампании
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OfferField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-3 border border-border">
      <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</div>
      <p className={`text-sm leading-relaxed ${highlight ? "text-[#00D4FF] font-medium" : "text-white"}`}>{value}</p>
    </div>
  );
}

function TagList({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
