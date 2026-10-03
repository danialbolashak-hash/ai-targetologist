import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

// GET /api/admin/users — list users (admin only)
export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, email: true, name: true, role: true, plan: true,
      isBanned: true, lastLoginAt: true, createdAt: true,
      _count: { select: { businessProfiles: true, facebookAccounts: true } },
    },
  });
  return NextResponse.json({ users });
}

// PATCH /api/admin/users — ban/unban or change role (admin only)
export async function PATCH(req: NextRequest) {
  const { error, user: admin } = await requireApiAdmin();
  if (error) return error;

  const { userId, action, value } = await req.json();
  if (!userId || !action) return NextResponse.json({ error: "userId and action required" }, { status: 400 });

  // Prevent admins from locking themselves out
  if (userId === admin.id && (action === "ban" || action === "role")) {
    return NextResponse.json({ error: "Cannot modify your own admin account" }, { status: 400 });
  }

  let data: Record<string, unknown> = {};
  if (action === "ban") data = { isBanned: Boolean(value) };
  else if (action === "role") data = { role: value === "ADMIN" ? "ADMIN" : "USER" };
  else if (action === "plan") data = { plan: value };
  else return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const updated = await prisma.user.update({ where: { id: userId }, data });

  await audit({
    userId: admin.id,
    action: `admin.${action}`,
    resource: userId,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent") || undefined,
    meta: { value },
  });

  return NextResponse.json({ ok: true, user: { id: updated.id, role: updated.role, isBanned: updated.isBanned, plan: updated.plan } });
}
