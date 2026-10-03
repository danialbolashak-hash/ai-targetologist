import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shield, Users, Megaphone, DollarSign, Activity } from "lucide-react";
import AdminUsers from "./AdminUsers";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // HARD GATE: only ADMIN role reaches this. Non-admins are bounced to dashboard.
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [userCount, campaignCount, activeCampaigns, subsCount, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15, include: { user: { select: { email: true } } } }),
  ]);

  const stats = [
    { label: "Пользователей", value: userCount, icon: Users },
    { label: "Кампаний всего", value: campaignCount, icon: Megaphone },
    { label: "Активных кампаний", value: activeCampaigns, icon: Activity },
    { label: "Платных подписок", value: subsCount, icon: DollarSign },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.25)] flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#A78BFA]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-display">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">Только для администраторов · {user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card spotlight-card">
            <s.icon className="w-5 h-5 text-[#A78BFA] mb-2" />
            <div className="text-3xl font-black text-white font-display">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Users management (client) */}
      <AdminUsers />

      {/* Audit log */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#A78BFA]" /> Журнал безопасности
        </h2>
        <div className="space-y-2">
          {recentLogs.length === 0 && <p className="text-xs text-muted-foreground">Событий пока нет.</p>}
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 text-xs py-2 border-b border-border last:border-0">
              <span className="font-mono text-[#06B6D4] w-40 flex-shrink-0">{log.action}</span>
              <span className="text-muted-foreground flex-1 truncate">{log.user?.email || "—"} · {log.ip || "no-ip"}</span>
              <span className="text-muted-foreground/60 flex-shrink-0">{new Date(log.createdAt).toLocaleString("ru-RU")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
