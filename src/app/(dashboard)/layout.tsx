"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";
import {
  LayoutDashboard, Target, BarChart3, Sparkles, Users,
  Megaphone, Settings, TrendingUp, Brain, Zap,
  ChevronLeft, ChevronRight, Bell, Search, LogOut,
  Cpu, DollarSign, Facebook, CreditCard, UserCheck,
  Plus, Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/assistant", icon: Brain, label: "AI Ассистент" },
  { href: "/campaigns", icon: Megaphone, label: "Кампании" },
  { href: "/audiences", icon: Users, label: "Аудитории" },
  { href: "/creatives", icon: Sparkles, label: "Креативы" },
  { href: "/offers", icon: Target, label: "Офферы" },
  { href: "/analytics", icon: BarChart3, label: "Аналитика" },
  { href: "/optimization", icon: TrendingUp, label: "Оптимизация" },
  { href: "/leads", icon: UserCheck, label: "Лиды" },
];

const SETTINGS_ITEMS = [
  { href: "/settings/facebook", icon: Facebook, label: "Facebook" },
  { href: "/settings/billing", icon: CreditCard, label: "Подписка" },
  { href: "/settings", icon: Settings, label: "Настройки" },
  { href: "/admin", icon: Shield, label: "Админка" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-[#0B0B14] flex relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#7C3AED] opacity-[0.04] rounded-full blur-[130px] animate-aurora-slow" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#06B6D4] opacity-[0.04] rounded-full blur-[120px] animate-aurora" />
      </div>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 glass-card border-r border-border ${collapsed ? "w-16" : "w-60"}`}>
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-black" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-white">AI Targetologist</div>
              <div className="text-[10px] text-[#06B6D4]">Pro Plan</div>
            </div>
          )}
        </div>

        {/* AI Status */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs text-[#10B981] font-medium">AI активен</span>
              </div>
              <span className="text-[10px] text-muted-foreground">4 кампании</span>
            </div>
          </div>
        )}

        {/* Quick action */}
        {!collapsed && (
          <div className="px-3 mt-3">
            <Link href="/campaigns/new" className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.15)] text-[#06B6D4] text-xs font-medium hover:bg-[rgba(124,58,237,0.12)] transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Новая кампания
            </Link>
          </div>
        )}

        {/* Main Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          <div className="pt-2 mt-2 border-t border-border space-y-0.5">
            {SETTINGS_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#7C3AED] flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
              DB
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">Daniyal B.</div>
                  <div className="text-[10px] text-muted-foreground truncate">Pro Plan</div>
                </div>
                <button className="text-muted-foreground hover:text-white transition-colors cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full glass-card border border-border flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer z-50"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 relative z-10 ${collapsed ? "ml-16" : "ml-60"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 glass-card border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск..."
              className="pl-9 pr-4 py-2 text-sm bg-white/[0.04] border border-border rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(124,58,237,0.3)] w-64 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.15)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
              <span className="text-xs text-[#06B6D4] font-medium">AI мониторит</span>
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
