"use client";

import { useEffect, useState } from "react";
import { Ban, ShieldCheck, ShieldOff, Loader2, CheckCircle } from "lucide-react";

type AdminUser = {
  id: string; email: string; name: string | null; role: string; plan: string;
  isBanned: boolean; lastLoginAt: string | null; createdAt: string;
  _count: { businessProfiles: number; facebookAccounts: number };
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers((await res.json()).users);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const act = async (userId: string, action: string, value: unknown) => {
    setBusy(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, value }),
    });
    if (res.ok) await load();
    else alert((await res.json()).error || "Ошибка");
    setBusy(null);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Пользователи ({users.length})</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Загрузка...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Роль</th>
                <th className="pb-2 font-medium">План</th>
                <th className="pb-2 font-medium">Бизнесы</th>
                <th className="pb-2 font-medium">Статус</th>
                <th className="pb-2 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3">
                    <div className="text-white">{u.email}</div>
                    <div className="text-[11px] text-muted-foreground">{u.name || "—"}</div>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "ADMIN" ? "bg-[rgba(124,58,237,0.15)] text-[#A78BFA]" : "bg-white/5 text-muted-foreground"}`}>{u.role}</span>
                  </td>
                  <td className="py-3 text-muted-foreground">{u.plan}</td>
                  <td className="py-3 text-muted-foreground">{u._count.businessProfiles}</td>
                  <td className="py-3">
                    {u.isBanned
                      ? <span className="text-xs text-red-400 flex items-center gap-1"><Ban className="w-3 h-3" /> Заблокирован</span>
                      : <span className="text-xs text-[#10B981] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Активен</span>}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2">
                      {busy === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <button
                            onClick={() => act(u.id, "role", u.role === "ADMIN" ? "USER" : "ADMIN")}
                            className="text-xs px-2 py-1 rounded-md border border-border text-muted-foreground hover:text-white hover:border-[rgba(124,58,237,0.4)] transition-colors cursor-pointer flex items-center gap-1"
                            title={u.role === "ADMIN" ? "Снять админа" : "Сделать админом"}
                          >
                            {u.role === "ADMIN" ? <ShieldOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => act(u.id, "ban", !u.isBanned)}
                            className={`text-xs px-2 py-1 rounded-md border transition-colors cursor-pointer flex items-center gap-1 ${u.isBanned ? "border-[rgba(16,185,129,0.4)] text-[#10B981]" : "border-[rgba(239,68,68,0.4)] text-red-400 hover:bg-[rgba(239,68,68,0.08)]"}`}
                          >
                            <Ban className="w-3 h-3" /> {u.isBanned ? "Разбан" : "Бан"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
