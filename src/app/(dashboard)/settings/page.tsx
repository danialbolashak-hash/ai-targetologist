"use client";

import Link from "next/link";
import { Facebook, CreditCard, Bell, Shield, Globe, ChevronRight } from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    title: "Интеграции",
    items: [
      { href: "/settings/facebook", icon: Facebook, label: "Facebook / Meta Ads", desc: "Подключить рекламный аккаунт", status: "Подключено", ok: true },
    ],
  },
  {
    title: "Подписка",
    items: [
      { href: "/settings/billing", icon: CreditCard, label: "Тарифный план", desc: "Pro — $99/мес", status: "Активна", ok: true },
    ],
  },
  {
    title: "Уведомления",
    items: [
      { href: "/settings/notifications", icon: Bell, label: "Email уведомления", desc: "Алерты по кампаниям", status: "Включено", ok: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Управление аккаунтом и интеграциями</p>
      </div>

      {SETTINGS_SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{section.title}</h2>
          <div className="glass-card rounded-xl overflow-hidden">
            {section.items.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${i < section.items.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-border flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${item.ok ? "text-[#00FF88]" : "text-muted-foreground"}`}>{item.status}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
