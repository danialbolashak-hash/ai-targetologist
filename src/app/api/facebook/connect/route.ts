import { NextRequest, NextResponse } from "next/server";
import { getMetaAuthUrl } from "@/lib/meta/oauth";
import { getApiUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  // Rate limit: 10 connect attempts/min per IP
  const limited = rateLimit(`fb-connect:${getClientIp(req)}`, 10);
  if (limited) return limited;

  // SECURITY: derive userId from the authenticated session, never from the URL (prevents IDOR)
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // State carries a signed payload to verify on callback (CSRF protection)
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = JSON.stringify({ userId: user.id, nonce, ts: Date.now() });
  const sig = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET || "fallback")
    .update(payload)
    .digest("hex");
  const state = Buffer.from(JSON.stringify({ payload, sig })).toString("base64url");

  const authUrl = getMetaAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
