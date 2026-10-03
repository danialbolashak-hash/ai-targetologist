"use client";

import { useState } from "react";
import {
  Plus, Megaphone, Play, Pause, BarChart3,
  Sparkles, Brain, ChevronRight, Filter, Search,
} from "lucide-react";

const CAMPAIGNS = [
  {
    id: "1",
    name: "Салон красоты — Холодная аудитория",
    business: "Beauty Studio",
    platform: "META",
    objective: "LEADS",
    status: "ACTIVE",
    budget: 500,
    spend: 420,
    leads: 89,
    cpl: 4.72,
    roas: 5.1,
    ctr: 2.4,
    cpm: 180,
    adsets: 3,
    creatives: 9,
    startDate: "01.06.2024",
  },
  {
    id: "2",
    name: "Онлайн-школа — Ретаргетинг",
    business: "EduPro",
    platform: "META",
    objective: "SALES",
    status: "ACTIVE",
    budget: 300,
    spend: 280,
    leads: 134,
    cpl: 2.09,
    roas: 6.8,
    ctr: 3.8,
    cpm: 150,
    adsets: 2,
    creatives: 6,
    startDate: "05.06.2024",
  },
  {
    id: "3",
    name: "E-commerce — TikTok Ads",
    business: "ShopKZ",
    platform: "TIKTOK",
    objective: "SALES",
    status: "ACTIVE",
    budget: 200,
    spend: 190,
    leads: 67,
    cpl: 2.84,
    roas: 4.2,
    ctr: 1.8,
    cpm: 120,
    adsets: 2,
    creatives: 4,
    startDate: "10.06.2024",
  },
  {
    id: "4",
    name: "Стоматология — Lookalike 3%",
    business: "DentaClinic",
    platform: "META",
    objective: "LEADS",
    status: "PAUSED",
    budget: 400,
    spend: 350,
    leads: 52,
    cpl: 6.73,
    roas: 3.1,
    ctr: 1.2,
    cpm: 220,
    adsets: 2,
    creatives: 5,
    startDate: "08.06.2024",
  },
];

const PLATFORM_COLORS: Record<string, string> = {
  META: "#00D4FF",
  TIKTOK: "#7C3AED",
  GOOGLE: "#00FF88",
};

export default function CampaignsPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = CAMPAIGNS.filter((c) => {
    const matchFilter = filter === "ALL" || c.status === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Кампании</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{CAMPAIGNS.length} кампаний · {CAMPAIGNS.filter((c) => c.status === "ACTIVE").length} активных</p>
        </div>
        <button className="btn-neon flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" />
          Создать с AI
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск кампаний..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/[0.04] border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.3)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          {["ALL", "ACTIVE", "PAUSED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 cursor-pointer ${
                filter === f
                  ? "bg-[rgba(0,212,255,0.12)] text-[#00D4FF] border border-[rgba(0,212,255,0.25)]"
                  : "text-muted-foreground hover:text-white glass-card border border-transparent"
              }`}
            >
              {f === "ALL" ? "Все" : f === "ACTIVE" ? "Активные" : "На паузе"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="glass-card rounded-xl p-5 hover:border-[rgba(0,212,255,0.15)] transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PLATFORM_COLORS[c.platform]}15`, border: `1px solid ${PLATFORM_COLORS[c.platform]}30` }}>
                  <Megaphone className="w-4 h-4" style={{ color: PLATFORM_COLORS[c.platform] }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{c.business}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${PLATFORM_COLORS[c.platform]}15`, color: PLATFORM_COLORS[c.platform] }}>
                      {c.platform}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === "ACTIVE"
                        ? "bg-[rgba(0,255,136,0.1)] text-[#00FF88]"
                        : "bg-white/[0.04] text-muted-foreground"
                    }`}>
                      {c.status === "ACTIVE" ? "Активна" : "Пауза"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg glass-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#00D4FF] hover:border-[rgba(0,212,255,0.3)] transition-all cursor-pointer">
                  {c.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button className="w-8 h-8 rounded-lg glass-card border border-border flex items-center justify-center text-muted-foreground hover:text-white transition-all cursor-pointer">
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded-lg glass-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#00D4FF] hover:border-[rgba(0,212,255,0.3)] transition-all cursor-pointer">
                  <Brain className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: "Бюджет", value: `$${c.budget}` },
                { label: "Расход", value: `$${c.spend}` },
                { label: "Лиды", value: c.leads },
                { label: "CPL", value: `$${c.cpl}`, highlight: c.cpl < 5 ? "good" : "bad" },
                { label: "ROAS", value: `${c.roas}x`, highlight: c.roas >= 4 ? "good" : "warn" },
                { label: "CTR", value: `${c.ctr}%`, highlight: c.ctr >= 2 ? "good" : "warn" },
                { label: "CPM", value: `$${c.cpm}` },
                { label: "Объявлений", value: c.creatives },
              ].map((m, i) => (
                <div key={i}>
                  <div className="text-[10px] text-muted-foreground mb-0.5">{m.label}</div>
                  <div className={`text-sm font-semibold ${
                    m.highlight === "good" ? "text-[#00FF88]"
                    : m.highlight === "bad" ? "text-red-400"
                    : m.highlight === "warn" ? "text-amber-400"
                    : "text-white"
                  }`}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Budget bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Использовано бюджета</span>
                <span>{Math.round((c.spend / c.budget) * 100)}%</span>
              </div>
              <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (c.spend / c.budget) * 100)}%`,
                    background: c.spend / c.budget > 0.9 ? "#FF4444" : "#00D4FF",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
