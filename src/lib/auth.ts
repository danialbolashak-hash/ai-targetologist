import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Resolve the currently authenticated user from the Supabase session cookie,
 * then load the matching DB user (with role/plan). Returns null if not logged in.
 */
export async function getCurrentUser() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser || dbUser.isBanned) return null;
  return dbUser;
}

/** For Route Handlers — uses route handler client so it can read cookies in API context. */
export async function getApiUser() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser || dbUser.isBanned) return null;
  return dbUser;
}

/** Throws a 401 NextResponse-style guard for API routes. Returns the user or a Response. */
export async function requireApiUser() {
  const user = await getApiUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null as never };
  }
  return { error: null, user };
}

/** Admin-only guard for API routes. */
export async function requireApiAdmin() {
  const user = await getApiUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null as never };
  }
  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null as never };
  }
  return { error: null, user };
}

/**
 * Verify a user owns a resource (prevents IDOR). Pass the resource's userId.
 * Admins bypass ownership checks.
 */
export function ownsResource(user: { id: string; role: string }, resourceUserId: string): boolean {
  return user.role === "ADMIN" || user.id === resourceUserId;
}
