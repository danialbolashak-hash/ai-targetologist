"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, DollarSign, Users, Target, Brain, Zap,
  ArrowUpRight, ArrowDownRight, Sparkles, ChevronRight,
  AlertTriangle, CheckCircle, BarChart3, Megaphone,
} from "lucide-react";

const AREA_DATA = [
  { date: "Янв", spend: 800, leads: 120, roas: 3.2 },
  { date: "Фев", spend: 1200, leads: 180, roas: 3.8 },
  { date: "Мар", spend: 950, leads: 145, roas: 3.5 },
  { date: "Апр", spend: 1800, leads: 290, roas: 4.1 },
  { date: "Май", spend: 2200, leads: 380, roas: 4.6 },
  { date: "Июн", spend: 1900, leads: 342, roas: 4.8 },
];

const PLATFORM_DATA = [
  { name: "Meta", value: 58, color: "#00D4FF" },
  { name: "TikTok", value: 28, color: "#7C3AED" },
  { name: "Google", value: 14, color: "#00FF88" },
];

const CAMPAIGNS = [
  {
    name: "Салон красоты — Холодная",
    platform: "META",
    status: "ACTIVE",
    spend: 420,
    leads: 89,
    cpl: 4.72,
    roas: 5.1,
    trend: "up",
  },
  {
    name: "Онлайн-школа — Ретаргетинг",
    platform: "META",
    status: "ACTIVE",
    spend: 280,
    leads: 134,
    cpl: 2.09,
    roas: 6.8,
    trend: "up",
  },
  {
    name: "E-commerce — TikTok",
    platform: "TIKTOK",
    status: "ACTIVE",
    spend: 190,
    leads: 67,
    cpl: 2.84,
    roas: 4.2,
    trend: "down",
  },
  {
    name: "Стоматология — Lookalike",
    platform: "META",
    status: "PAUSED",
    spend: 350,
    leads: 52,
    cpl: 6.73,
    roas: 3.1,
    trend: "down",
  },
];

const AI_RECOMMENDATIONS = [
  {
    type: "warning",
    campaign: "E-commerce — TikTok",
    message: "CTR снизился до 0.8%. Рекомендую сменить hook. Новый вариант сгенерирован.",
    action: "Применить",
    priority: "HIGH",
  },
  {
    type: "success",
    campaign: "Онлайн-школа — Ретаргетинг",
    message: "Связка работает отлично. Увеличьте бюджет на 30% для масштабирования.",
    action: "Масштабировать",
    priority: "MEDIUM",
  },
  {
    type: "warning",
    campaign: "Стоматология — Lookalike",
    message: "CPL дорогой ($6.73). Нужно расширить аудиторию и сменить оффер.",
    action: "Оптимизировать",
    priority: "HIGH",
  },
];

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  META: { label: "Meta", color: "#00D4FF" },
  TIKTOK: { label: "TikTok", color: "#7C3AED" },
  GOOGLE: { label: "Google", color: "#00FF88" },
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Добро пожаловать, Daniyal 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI анализирует ваши кампании в реальном времени</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 cursor-pointer ${
                period === p
                  ? "bg-[rgba(0,212,255,0.15)] text-[#00D4FF] border border-[rgba(0,212,255,0.3)]"
                  : "text-muted-foreground hover:text-white glass-card border border-transparent"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Общий расход",
            value: "$1,240",
            change: "+12%",
            icon: DollarSign,
            up: true,
            sub: "этот месяц",
          },
          {
            label: "Лиды",
            value: "342",
            change: "+28%",
            icon: Users,
            up: true,
            sub: "этот месяц",
          },
          {
            label: "ROAS",
            value: "4.8x",
            change: "+0.6x",
            icon: TrendingUp,
            up: true,
            sub: "средний",
          },
          {
            label: "CPL",
            value: "$3.62",
            change: "-18%",
            icon: Target,
            up: true,
            sub: "средний",
          },
        ].map((kpi, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
              <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,255,0.08)] flex items-center justify-center">
                <kpi.icon className="w-4 h-4 text-[#00D4FF]" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="flex items-center gap-1.5">
              {kpi.up ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00FF88]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className={`text-xs font-medium ${kpi.up ? "text-[#00FF88]" : "text-red-400"}`}>
                {kpi.change}
              </span>
              <span className="text-xs text-muted-foreground">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Динамика расхода и лидов</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00D4FF]" />
                <span className="text-muted-foreground">Расход</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                <span className="text-muted-foreground">Лиды</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={AREA_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0D0D16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#999" }}
              />
              <Area type="monotone" dataKey="spend" stroke="#00D4FF" strokeWidth={2} fill="url(#spendGrad)" />
              <Area type="monotone" dataKey="leads" stroke="#7C3AED" strokeWidth={2} fill="url(#leadsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Расход по платформам</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PLATFORM_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {PLATFORM_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0D0D16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {PLATFORM_DATA.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-muted-foreground">{p.name}</span>
                </div>
                <span className="text-white font-medium">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#00D4FF]" />
            <h3 className="text-sm font-semibold text-white">AI Рекомендации</h3>
          </div>
          <span className="text-xs text-muted-foreground">{AI_RECOMMENDATIONS.length} активных</span>
        </div>
        <div className="space-y-3">
          {AI_RECOMMENDATIONS.map((rec, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                rec.type === "warning"
                  ? "bg-[rgba(251,191,36,0.04)] border-[rgba(251,191,36,0.1)]"
                  : "bg-[rgba(0,255,136,0.04)] border-[rgba(0,255,136,0.1)]"
              }`}
            >
              {rec.type === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white mb-0.5">{rec.campaign}</div>
                <div className="text-xs text-muted-foreground">{rec.message}</div>
              </div>
              <button className="flex-shrink-0 text-xs text-[#00D4FF] hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-[rgba(0,212,255,0.2)] hover:bg-[rgba(0,212,255,0.08)]">
                {rec.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#00D4FF]" />
            <h3 className="text-sm font-semibold text-white">Активные кампании</h3>
          </div>
          <button className="text-xs text-[#00D4FF] hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            Все кампании <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Кампания", "Платформа", "Статус", "Расход", "Лиды", "CPL", "ROAS"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c, i) => {
                const pl = PLATFORM_LABELS[c.platform];
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-5 py-3.5 text-sm text-white font-medium">{c.name}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="badge-platform text-[10px]"
                        style={{ background: `${pl.color}15`, color: pl.color, border: `1px solid ${pl.color}30` }}
                      >
                        {pl.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`badge-platform text-[10px] ${
                          c.status === "ACTIVE"
                            ? "bg-[rgba(0,255,136,0.1)] text-[#00FF88] border-[rgba(0,255,136,0.2)]"
                            : "bg-[rgba(255,255,255,0.05)] text-muted-foreground border-border"
                        }`}
                      >
                        {c.status === "ACTIVE" ? "Активна" : "Пауза"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white">${c.spend}</td>
                    <td className="px-5 py-3.5 text-sm text-white">{c.leads}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm ${c.trend === "up" ? "text-[#00FF88]" : "text-red-400"}`}>
                        ${c.cpl}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-medium ${c.roas >= 4 ? "text-[#00FF88]" : "text-amber-400"}`}>
                        {c.roas}x
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
