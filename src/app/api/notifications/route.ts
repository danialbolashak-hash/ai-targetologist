import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

// GET /api/notifications — list current user's notifications
export async function GET() {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return NextResponse.json({ items, unread });
}

// PATCH /api/notifications — mark read (one or all)
export async function PATCH(req: NextRequest) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const { id, all } = await req.json();
  if (all) {
    await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  } else if (id) {
    await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
  }
  return NextResponse.json({ ok: true });
}
