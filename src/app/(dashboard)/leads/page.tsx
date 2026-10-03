"use client";

import { useState } from "react";
import {
  Users, Phone, Mail, MessageCircle, CheckCircle,
  Clock, XCircle, TrendingUp, DollarSign, Filter,
} from "lucide-react";

const LEADS = [
  { id: "1", name: "Айгерим Сатова", phone: "+7 777 123 45 67", email: "ai@mail.ru", source: "Facebook Leads", campaign: "Салон красоты — Холодная", status: "NEW", value: 12000, createdAt: "19.06.2024 14:23" },
  { id: "2", name: "Мария Иванова", phone: "+7 701 987 65 43", email: "maria@gmail.com", source: "Instagram Story", campaign: "Салон красоты — Холодная", status: "CONTACTED", value: 8500, createdAt: "19.06.2024 12:01" },
  { id: "3", name: "Диас Касымов", phone: "+7 747 456 78 90", email: null, source: "Facebook Leads", campaign: "Онлайн-школа — Ретаргетинг", status: "CONVERTED", value: 45000, createdAt: "18.06.2024 18:45" },
  { id: "4", name: "Алия Нурланова", phone: "+7 705 234 56 78", email: "aliya@mail.kz", source: "Instagram DM", campaign: "Стоматология — Lookalike", status: "QUALIFIED", value: 25000, createdAt: "18.06.2024 10:30" },
  { id: "5", name: "Артём Белов", phone: "+7 776 345 67 89", email: null, source: "Facebook Leads", campaign: "E-commerce — TikTok", status: "LOST", value: 3500, createdAt: "17.06.2024 16:15" },
];

const STATUS_CONFIG = {
  NEW: { label: "Новый", color: "#00D4FF", icon: Clock },
  CONTACTED: { label: "Связались", color: "#F59E0B", icon: Phone },
  QUALIFIED: { label: "Квалифицирован", color: "#7C3AED", icon: CheckCircle },
  CONVERTED: { label: "Продажа", color: "#00FF88", icon: DollarSign },
  LOST: { label: "Потерян", color: "#FF4444", icon: XCircle },
};

export default function LeadsPage() {
  const [filter, setFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const filtered = LEADS.filter((l) => filter === "ALL" || l.status === filter);

  const totalRevenue = LEADS.filter((l) => l.status === "CONVERTED").reduce((s, l) => s + l.value, 0);
  const convRate = Math.round((LEADS.filter((l) => l.status === "CONVERTED").length / LEADS.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Лиды</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{LEADS.length} лидов · CR {convRate}%</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Всего лидов", value: LEADS.length, icon: Users, color: "#00D4FF" },
          { label: "Новых", value: LEADS.filter((l) => l.status === "NEW").length, icon: Clock, color: "#F59E0B" },
          { label: "Конверсий", value: LEADS.filter((l) => l.status === "CONVERTED").length, icon: CheckCircle, color: "#00FF88" },
          { label: "Выручка", value: `₸${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "#7C3AED" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["ALL", ...Object.keys(STATUS_CONFIG)].map((f) => {
          const cfg = STATUS_CONFIG[f as keyof typeof STATUS_CONFIG];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 cursor-pointer ${
                filter === f
                  ? "text-white font-medium"
                  : "text-muted-foreground hover:text-white glass-card border border-transparent"
              }`}
              style={filter === f && cfg ? { background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` } : filter === f ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" } : undefined}
            >
              {f === "ALL" ? `Все (${LEADS.length})` : cfg?.label}
            </button>
          );
        })}
      </div>

      {/* Leads table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Имя", "Контакт", "Кампания", "Статус", "Ценность", "Дата"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const cfg = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG];
              return (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead.id === selectedLead ? null : lead.id)}
                  className="border-b border-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-white">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">{lead.source}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs text-white font-mono">{lead.phone}</div>
                    {lead.email && <div className="text-xs text-muted-foreground">{lead.email}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-[180px] truncate">{lead.campaign}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${cfg.color}12`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-white">
                    ₸{lead.value.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{lead.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
