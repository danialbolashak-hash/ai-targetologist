import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Upserts the DB User row for the currently authenticated Supabase user.
 * Called right after login/register so getCurrentUser() works everywhere.
 */
export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No session" }, { status: 401 });

  const dbUser = await prisma.user.upsert({
    where: { supabaseId: user.id },
    create: {
      supabaseId: user.id,
      email: user.email!,
      name: (user.user_metadata?.name as string) || null,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      lastLoginAt: new Date(),
    },
    update: { lastLoginAt: new Date() },
  });

  return NextResponse.json({ ok: true, role: dbUser.role });
}
