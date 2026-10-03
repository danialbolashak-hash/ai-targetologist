"use client";

import { useEffect, useState } from "react";
import { Bot, Send, Loader2, CheckCircle, AlertTriangle, Sparkles, FileText, Bell, Zap, Check } from "lucide-react";

type Notif = {
  id: string; type: string; title: string; body: string;
  payload: any; actionUrl: string | null; isRead: boolean; createdAt: string;
};

const TYPE_STYLE: Record<string, { icon: any; color: string }> = {
  CRITICAL: { icon: AlertTriangle, color: "#EF4444" },
  WARNING: { icon: AlertTriangle, color: "#F59E0B" },
  CREATIVE_READY: { icon: Sparkles, color: "#06B6D4" },
  OFFER_READY: { icon: FileText, color: "#A78BFA" },
  OPTIMIZATION: { icon: Sparkles, color: "#10B981" },
  INFO: { icon: Bell, color: "#A78BFA" },
};

export default function AssistantPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifs((await res.json()).items);
    const s = await fetch("/api/notifications/settings");
    if (s.ok) { const d = await s.json(); setChatId(d.telegramChatId || ""); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveTelegram = async () => {
    setSaving(true); setSaved("");
    const res = await fetch("/api/notifications/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramChatId: chatId, notifyTelegram: true }),
    });
    const d = await res.json();
    setSaved(d.testSent ? "✅ Подключено! Проверь Telegram — пришло тестовое сообщение." : "Сохранено. Проверь Chat ID и что бот запущен (/start).");
    setSaving(false);
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    load();
  };

  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Record<string, string>>({});

  const applySuggestion = async (id: string) => {
    setApplying(id);
    const res = await fetch(`/api/notifications/${id}/apply`, { method: "POST" });
    const d = await res.json();
    let msg = "";
    if (res.ok) {
      if (d.kind === "creative") {
        msg = d.metaPushed ? "✅ Креатив создан в Meta (на паузе — проверь и запусти)" : (d.warning || "✅ Сохранено");
      } else {
        msg = "✅ Новый оффер добавлен";
      }
    } else {
      msg = "⚠️ " + (d.error || "Ошибка");
    }
    setApplied((p) => ({ ...p, [id]: msg }));
    setApplying(null);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-display">AI Таргетолог</h1>
          <p className="text-sm text-muted-foreground">Следит за рекламой 24/7 и пишет тебе, когда нужно действовать</p>
        </div>
      </div>

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: AlertTriangle, t: "Находит проблему", d: "Низкий CTR, дорогой лид, усталость креатива" },
          { icon: Sparkles, t: "Пишет решение", d: "Сам генерирует новый креатив и оффер" },
          { icon: Send, t: "Уведомляет тебя", d: "Telegram + в приложении мгновенно" },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <s.icon className="w-5 h-5 text-[#A78BFA] mb-2" />
            <div className="text-sm font-semibold text-white">{s.t}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.d}</div>
          </div>
        ))}
      </div>

      {/* Telegram connect */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Send className="w-4 h-4 text-[#06B6D4]" /> Подключить Telegram-уведомления
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          1. Открой бота <a href="https://t.me/userinfobot" target="_blank" className="text-[#06B6D4]">@userinfobot</a> в Telegram → он пришлёт твой <b>Chat ID</b>.
          2. Найди своего бота (из TELEGRAM_BOT_TOKEN) и нажми <b>/start</b>.
          3. Вставь Chat ID ниже.
        </p>
        <div className="flex gap-2">
          <input
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Твой Telegram Chat ID (например 123456789)"
            className="flex-1 bg-white/[0.04] border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(124,58,237,0.4)]"
          />
          <button onClick={saveTelegram} disabled={saving || !chatId} className="btn-neon text-sm px-5 disabled:opacity-60 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Подключить
          </button>
        </div>
        {saved && <p className="text-xs mt-2 text-[#10B981]">{saved}</p>}
      </div>

      {/* Notifications feed */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Bell className="w-4 h-4 text-[#A78BFA]" /> Уведомления</h2>
          <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-white cursor-pointer">Прочитать все</button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6"><Loader2 className="w-4 h-4 animate-spin" /> Загрузка...</div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-10">
            <Bot className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Пока всё спокойно. Как только AI заметит проблему — напишет здесь и в Telegram.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n) => {
              const st = TYPE_STYLE[n.type] || TYPE_STYLE.INFO;
              return (
                <div key={n.id} className={`rounded-xl p-4 border transition-colors ${n.isRead ? "border-border bg-transparent" : "border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.04)]"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${st.color}15`, border: `1px solid ${st.color}30` }}>
                      <st.icon className="w-4 h-4" style={{ color: st.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{n.title}</div>
                      <div className="text-xs text-muted-foreground whitespace-pre-line mt-0.5">{n.body}</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-1">{new Date(n.createdAt).toLocaleString("ru-RU")}</div>

                      {/* Apply button for AI suggestions */}
                      {(n.type === "CREATIVE_READY" || n.type === "OFFER_READY") && (
                        <div className="mt-3">
                          {applied[n.id] ? (
                            <div className="text-xs text-[#10B981] flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> {applied[n.id]}</div>
                          ) : (
                            <button
                              onClick={() => applySuggestion(n.id)}
                              disabled={applying === n.id}
                              className="btn-neon text-xs px-4 py-2 inline-flex items-center gap-1.5 disabled:opacity-60"
                            >
                              {applying === n.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                              {n.type === "CREATIVE_READY" ? "Применить креатив" : "Применить оффер"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
