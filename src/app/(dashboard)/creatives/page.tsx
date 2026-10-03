"use client";

import { useState } from "react";
import {
  Sparkles, Plus, Copy, ThumbsUp, ThumbsDown,
  Instagram, RefreshCw, Loader2, Wand2,
} from "lucide-react";

const CREATIVE_TEMPLATES = [
  {
    id: "1",
    type: "IMAGE",
    platform: "META",
    audience: "Холодная (женщины 25-35)",
    headline: "Избавьтесь от акне за 30 дней — гарантия результата",
    body: "Устали прятать кожу под тонной тонального крема? Наши клиенты видят первый результат уже через 7 дней. Без боли. Без побочек. С гарантией возврата денег.\n\n✅ 847 довольных клиентов\n✅ Натуральный состав\n✅ Работает за 30 дней",
    cta: "Записаться на бесплатную консультацию",
    score: 8.7,
    isWinner: true,
    ctr: "3.2%",
    cpl: "$2.40",
  },
  {
    id: "2",
    type: "VIDEO",
    platform: "TIKTOK",
    audience: "Холодная (18-28)",
    headline: "POV: ты нашла мастера, которому можно доверять",
    body: "Показываем процесс работы от А до Я. Никаких сюрпризов, только результат который тебе понравится.",
    cta: "Смотреть видео",
    score: 7.4,
    isWinner: false,
    ctr: "2.1%",
    cpl: "$3.80",
  },
  {
    id: "3",
    type: "STORY",
    platform: "META",
    audience: "Ретаргетинг",
    headline: "Ты смотрела нас вчера... 👀",
    body: "Мы знаем, ты интересовалась. Специально для тебя — скидка 15% только сегодня. Места ограничены!",
    cta: "Забрать скидку",
    score: 9.1,
    isWinner: true,
    ctr: "4.8%",
    cpl: "$1.90",
  },
];

const PLATFORM_COLORS: Record<string, string> = {
  META: "#00D4FF",
  TIKTOK: "#7C3AED",
  GOOGLE: "#00FF88",
};

export default function CreativesPage() {
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "winners">("all");

  const generate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setGenerating(false);
    setPrompt("");
  };

  const displayed = activeTab === "winners"
    ? CREATIVE_TEMPLATES.filter((c) => c.isWinner)
    : CREATIVE_TEMPLATES;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Креативы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI генерирует и оптимизирует рекламные объявления</p>
        </div>
      </div>

      {/* AI Generator */}
      <div className="glass-card rounded-xl p-5 border-[rgba(0,212,255,0.15)]">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-4 h-4 text-[#00D4FF]" />
          <h3 className="text-sm font-semibold text-white">AI Генератор креативов</h3>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Опишите что нужно: 'Видео-сценарий для TikTok, салон красоты, аудитория 20-30 лет, цель — запись'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
          />
          <button
            onClick={generate}
            disabled={generating || !prompt}
            className="btn-neon flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Создать
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "Рекламный текст Meta",
            "TikTok сценарий",
            "Story с оффером",
            "UGC скрипт",
            "Reels хук",
            "Carousel для е-ком",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setPrompt(t)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: "all", label: `Все (${CREATIVE_TEMPLATES.length})` },
          { key: "winners", label: `Победители (${CREATIVE_TEMPLATES.filter((c) => c.isWinner).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "all" | "winners")}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? "bg-[rgba(0,212,255,0.12)] text-[#00D4FF] border border-[rgba(0,212,255,0.25)]"
                : "text-muted-foreground hover:text-white glass-card border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Creatives Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayed.map((c) => (
          <div key={c.id} className={`glass-card rounded-xl p-5 transition-all duration-300 ${c.isWinner ? "border-[rgba(0,255,136,0.15)]" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${PLATFORM_COLORS[c.platform]}15`, color: PLATFORM_COLORS[c.platform] }}
                >
                  {c.platform}
                </span>
                <span className="text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                  {c.type === "IMAGE" ? "Изображение" : c.type === "VIDEO" ? "Видео" : "Story"}
                </span>
                {c.isWinner && (
                  <span className="text-[10px] text-[#00FF88] bg-[rgba(0,255,136,0.1)] px-2 py-0.5 rounded-full font-medium">
                    Победитель
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="text-xs font-bold text-white">{c.score}</div>
                <div className="text-xs text-muted-foreground">/10</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-3">
              Аудитория: {c.audience}
            </div>

            <h4 className="text-sm font-semibold text-white mb-2">{c.headline}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-4 whitespace-pre-line">
              {c.body}
            </p>

            <div className="text-xs font-medium text-[#00D4FF] mb-4">{c.cta} →</div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">CTR </span>
                  <span className="text-[#00FF88] font-medium">{c.ctr}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CPL </span>
                  <span className="text-[#00FF88] font-medium">{c.cpl}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-lg glass-card border border-border flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer">
                  <Copy className="w-3 h-3" />
                </button>
                <button className="w-7 h-7 rounded-lg glass-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#00D4FF] transition-colors cursor-pointer">
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button className="w-7 h-7 rounded-lg glass-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#00FF88] transition-colors cursor-pointer">
                  <ThumbsUp className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
