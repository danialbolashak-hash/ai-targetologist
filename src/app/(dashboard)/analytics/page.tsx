"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
} from "recharts";
import { TrendingUp, DollarSign, Users, Target, ArrowUpRight } from "lucide-react";

const DAILY_DATA = [
  { date: "01.06", spend: 45, leads: 12, cpl: 3.75, roas: 4.2 },
  { date: "03.06", spend: 62, leads: 18, cpl: 3.44, roas: 4.8 },
  { date: "05.06", spend: 38, leads: 9, cpl: 4.22, roas: 3.6 },
  { date: "07.06", spend: 71, leads: 24, cpl: 2.96, roas: 5.4 },
  { date: "09.06", spend: 55, leads: 16, cpl: 3.44, roas: 4.1 },
  { date: "11.06", spend: 89, leads: 31, cpl: 2.87, roas: 5.9 },
  { date: "13.06", spend: 67, leads: 22, cpl: 3.05, roas: 4.7 },
  { date: "15.06", spend: 94, leads: 38, cpl: 2.47, roas: 6.2 },
  { date: "17.06", spend: 78, leads: 28, cpl: 2.79, roas: 5.1 },
  { date: "18.06", spend: 91, leads: 35, cpl: 2.60, roas: 5.8 },
];

const PLATFORM_PERF = [
  { platform: "Meta Ads", spend: 840, leads: 214, cpl: 3.93, roas: 4.8, ctr: 2.8 },
  { platform: "TikTok", spend: 280, leads: 98, cpl: 2.86, roas: 5.2, ctr: 3.4 },
  { platform: "Google", spend: 120, leads: 30, cpl: 4.00, roas: 3.9, ctr: 1.9 },
];

export default function AnalyticsPage() {
  const [metric, setMetric] = useState<"spend" | "leads" | "cpl" | "roas">("leads");

  const METRIC_LABELS = {
    spend: "Расход ($)",
    leads: "Лиды",
    cpl: "CPL ($)",
    roas: "ROAS",
  };

  const METRIC_COLORS = {
    spend: "#00D4FF",
    leads: "#7C3AED",
    cpl: "#F59E0B",
    roas: "#00FF88",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Аналитика</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Данные за июнь 2024</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Суммарный расход", value: "$1,240", change: "+12%", icon: DollarSign },
          { label: "Всего лидов", value: "342", change: "+28%", icon: Users },
          { label: "Средний CPL", value: "$3.62", change: "-18%", icon: Target },
          { label: "Средний ROAS", value: "4.8x", change: "+14%", icon: TrendingUp },
        ].map((kpi, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#00FF88]" />
              <span className="text-xs text-[#00FF88]">{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Динамика по дням</h3>
          <div className="flex items-center gap-1">
            {(Object.keys(METRIC_LABELS) as Array<keyof typeof METRIC_LABELS>).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-2.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                  metric === m
                    ? "text-white font-medium"
                    : "text-muted-foreground hover:text-white"
                }`}
                style={metric === m ? { background: `${METRIC_COLORS[m]}20`, color: METRIC_COLORS[m] } : undefined}
              >
                {METRIC_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={DAILY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={METRIC_COLORS[metric]} stopOpacity={0.25} />
                <stop offset="95%" stopColor={METRIC_COLORS[metric]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0D0D16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#999" }}
            />
            <Area type="monotone" dataKey={metric} stroke={METRIC_COLORS[metric]} strokeWidth={2} fill="url(#metricGrad)" dot={{ fill: METRIC_COLORS[metric], r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Performance */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Эффективность по платформам</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Платформа", "Расход", "Лиды", "CPL", "ROAS", "CTR"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLATFORM_PERF.map((p, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-white">{p.platform}</td>
                <td className="px-5 py-3.5 text-sm text-white">${p.spend}</td>
                <td className="px-5 py-3.5 text-sm text-white">{p.leads}</td>
                <td className="px-5 py-3.5 text-sm text-[#00FF88] font-medium">${p.cpl}</td>
                <td className="px-5 py-3.5 text-sm text-[#00FF88] font-medium">{p.roas}x</td>
                <td className="px-5 py-3.5 text-sm text-white">{p.ctr}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
