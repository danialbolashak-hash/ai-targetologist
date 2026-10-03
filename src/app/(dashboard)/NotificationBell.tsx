"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, Sparkles, FileText, Bot, Check } from "lucide-react";

type Notif = {
  id: string; type: string; title: string; body: string;
  isRead: boolean; createdAt: string; actionUrl: string | null;
};

const ICON: Record<string, { icon: any; color: string }> = {
  CRITICAL: { icon: AlertTriangle, color: "#EF4444" },
  WARNING: { icon: AlertTriangle, color: "#F59E0B" },
  CREATIVE_READY: { icon: Sparkles, color: "#06B6D4" },
  OFFER_READY: { icon: FileText, color: "#A78BFA" },
  INFO: { icon: Bot, color: "#A78BFA" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) { const d = await res.json(); setItems(d.items); setUnread(d.unread); }
    } catch {}
  };

  // poll every 60s + on open
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);
  useEffect(() => { if (open) load(); }, [open]);

  // close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-lg glass-card border border-border flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl border border-border shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-white">Уведомления</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-[#A78BFA] hover:text-white cursor-pointer flex items-center gap-1">
                <Check className="w-3 h-3" /> Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bot className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Пока всё спокойно</p>
              </div>
            ) : (
              items.slice(0, 12).map((n) => {
                const st = ICON[n.type] || ICON.INFO;
                return (
                  <Link
                    key={n.id}
                    href={n.actionUrl || "/assistant"}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer ${!n.isRead ? "bg-[rgba(124,58,237,0.04)]" : ""}`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${st.color}15`, border: `1px solid ${st.color}30` }}>
                      <st.icon className="w-3.5 h-3.5" style={{ color: st.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate">{n.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">{n.body}</div>
                      <div className="text-[10px] text-muted-foreground/50 mt-0.5">{new Date(n.createdAt).toLocaleString("ru-RU")}</div>
                    </div>
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] flex-shrink-0 mt-1.5" />}
                  </Link>
                );
              })
            )}
          </div>

          <Link href="/assistant" onClick={() => setOpen(false)} className="block text-center py-2.5 text-xs text-[#A78BFA] hover:text-white border-t border-border transition-colors cursor-pointer">
            Открыть AI Ассистента
          </Link>
        </div>
      )}
    </div>
  );
}
