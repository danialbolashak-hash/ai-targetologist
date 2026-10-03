import { NextRequest, NextResponse } from "next/server";
import { runMonitoringJob } from "@/lib/cron/monitor";
import { safeEqual } from "@/lib/crypto";

// Called by Vercel Cron every 2 hours
// vercel.json: { "crons": [{ "path": "/api/cron/monitor", "schedule": "0 */2 * * *" }] }
export async function GET(req: NextRequest) {
  // Constant-time secret check to prevent timing attacks
  const authHeader = req.headers.get("authorization") || "";
  if (!safeEqual(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runMonitoringJob();
  return NextResponse.json(result);
}

// Allow POST for manual trigger
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!safeEqual(body.secret || "", process.env.CRON_SECRET || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runMonitoringJob();
  return NextResponse.json(result);
}
