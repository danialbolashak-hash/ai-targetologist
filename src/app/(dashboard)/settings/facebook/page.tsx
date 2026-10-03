"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Facebook, CheckCircle, XCircle, AlertTriangle,
  Link, Shield, Zap, RefreshCw, ExternalLink,
  Instagram, Globe, Cpu, ChevronRight, Loader2,
} from "lucide-react";

const REQUIRED_PERMISSIONS = [
  { key: "ads_management", label: "Управление рекламой", desc: "Создание и управление кампаниями" },
  { key: "ads_read", label: "Чтение данных рекламы", desc: "Получение статистики и инсайтов" },
  { key: "business_management", label: "Управление бизнесом", desc: "Доступ к Business Manager" },
  { key: "pages_read_engagement", label: "Страницы Facebook", desc: "Использование страницы для рекламы" },
  { key: "pages_manage_ads", label: "Реклама страниц", desc: "Публикация рекламы от имени страницы" },
];

interface AdAccount {
  id: string;
  fbAdAccountId: string;
  name: string;
  currency: string;
  status: string;
  pageId?: string;
  pixelId?: string;
  instagramId?: string;
}

interface FbConnection {
  id: string;
  name: string;
  email?: string;
  isConnected: boolean;
  adAccounts: AdAccount[];
}

export default function FacebookSettingsPage() {
  const searchParams = useSearchParams();
  const [connection, setConnection] = useState<FbConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [userId] = useState("user_demo_id"); // In production: from Supabase auth

  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");
  const accountsParam = searchParams.get("accounts");

  useEffect(() => {
    loadConnection();
  }, []);

  async function loadConnection() {
    setLoading(true);
    try {
      // In production: fetch from /api/facebook/accounts?userId=...
      // Demo data
      if (successParam) {
        setConnection({
          id: "conn_1",
          name: "Daniyal Bolashakuly",
          email: "d.bolashakuly@aues.kz",
          isConnected: true,
          adAccounts: [
            {
              id: "acc_1",
              fbAdAccountId: "act_1234567890",
              name: "My Business Account",
              currency: "USD",
              status: "ACTIVE",
              pageId: "page_123",
              pixelId: "pixel_456",
              instagramId: "ig_789",
            },
          ],
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleConnect = () => {
    setConnecting(true);
    window.location.href = `/api/facebook/connect?userId=${userId}`;
  };

  const handleDisconnect = async () => {
    setConnection(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Подключение Facebook</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Подключите Meta Business Manager для автоматического запуска рекламы
        </p>
      </div>

      {/* Success/Error notifications */}
      {successParam && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(0,255,136,0.06)] border border-[rgba(0,255,136,0.15)]">
          <CheckCircle className="w-5 h-5 text-[#00FF88]" />
          <div>
            <div className="text-sm font-semibold text-[#00FF88]">Успешно подключено!</div>
            <div className="text-xs text-muted-foreground">
              {accountsParam} рекламных аккаунтов синхронизировано
            </div>
          </div>
        </div>
      )}

      {errorParam && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(255,68,68,0.06)] border border-[rgba(255,68,68,0.15)]">
          <XCircle className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-sm font-semibold text-red-400">Ошибка подключения</div>
            <div className="text-xs text-muted-foreground">{decodeURIComponent(errorParam)}</div>
          </div>
        </div>
      )}

      {/* Connection status */}
      {!connection ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center mx-auto mb-6">
            <Facebook className="w-8 h-8 text-[#1877F2]" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Подключить Meta Business</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            AI получит доступ к вашим рекламным аккаунтам и сможет создавать, запускать
            и оптимизировать кампании автоматически
          </p>

          <div className="space-y-2 mb-8 text-left">
            {REQUIRED_PERMISSIONS.map((p) => (
              <div key={p.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
                <CheckCircle className="w-4 h-4 text-[#00FF88] flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-white">{p.label}</div>
                  <div className="text-[10px] text-muted-foreground">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="btn-neon flex items-center gap-2 mx-auto disabled:opacity-70"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Facebook className="w-4 h-4" />
            )}
            {connecting ? "Перенаправление..." : "Подключить через Facebook"}
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Безопасное подключение через официальный Meta OAuth 2.0
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected account */}
          <div className="glass-card rounded-xl p-5 border-[rgba(0,255,136,0.15)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-[#1877F2]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{connection.name}</div>
                  <div className="text-xs text-muted-foreground">{connection.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                <span className="text-xs text-[#00FF88]">Подключено</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {REQUIRED_PERMISSIONS.slice(0, 4).map((p) => (
                <div key={p.key} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-[#00FF88]" />
                  <span className="text-muted-foreground">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Accounts */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-white">Рекламные аккаунты</h3>
            </div>
            {connection.adAccounts.map((acc) => (
              <div key={acc.id} className="p-5 border-b border-border/50 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-white">{acc.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{acc.fbAdAccountId}</div>
                  </div>
                  <span className="text-xs text-[#00FF88] bg-[rgba(0,255,136,0.1)] px-2 py-1 rounded-full">
                    {acc.currency} · {acc.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Globe, label: "Facebook Page", value: acc.pageId ? "✓ Подключена" : "Не найдена", ok: !!acc.pageId },
                    { icon: Cpu, label: "Meta Pixel", value: acc.pixelId ? "✓ Установлен" : "Не найден", ok: !!acc.pixelId },
                    { icon: Instagram, label: "Instagram", value: acc.instagramId ? "✓ Подключён" : "Не подключён", ok: !!acc.instagramId },
                  ].map((item, i) => (
                    <div key={i} className={`p-2.5 rounded-lg border text-xs ${item.ok ? "bg-[rgba(0,255,136,0.04)] border-[rgba(0,255,136,0.1)]" : "bg-white/[0.02] border-border"}`}>
                      <item.icon className={`w-3.5 h-3.5 mb-1 ${item.ok ? "text-[#00FF88]" : "text-muted-foreground"}`} />
                      <div className="text-muted-foreground mb-0.5">{item.label}</div>
                      <div className={item.ok ? "text-[#00FF88]" : "text-red-400"}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadConnection}
              className="btn-ghost-neon flex items-center gap-2 text-sm py-2.5"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить данные
            </button>
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer px-4 py-2.5"
            >
              Отключить аккаунт
            </button>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-border">
        <Shield className="w-4 h-4 text-[#00D4FF] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          Мы используем официальный Meta Marketing API и OAuth 2.0. Ваши токены хранятся
          в зашифрованном виде. Мы никогда не получаем доступ к личным данным ваших подписчиков.
        </div>
      </div>
    </div>
  );
}
