import { decrypt } from "@/lib/crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCampaignStatus } from "@/lib/meta/api";

// POST /api/campaigns/[id] — approve & launch OR pause/resume
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { action } = body; // "approve", "pause", "resume", "delete"

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      adAccount: { include: { facebookAccount: true } },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const accessToken = decrypt(campaign.adAccount.facebookAccount.accessToken);

  if (action === "approve" && campaign.fbCampaignId) {
    // Activate the campaign in Meta
    await updateCampaignStatus(campaign.fbCampaignId, "ACTIVE", accessToken);
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: "ACTIVE", approvedAt: new Date(), launchedAt: new Date() },
    });
    return NextResponse.json({ success: true, status: "ACTIVE" });
  }

  if (action === "pause" && campaign.fbCampaignId) {
    await updateCampaignStatus(campaign.fbCampaignId, "PAUSED", accessToken);
    await prisma.campaign.update({ where: { id: params.id }, data: { status: "PAUSED" } });
    return NextResponse.json({ success: true, status: "PAUSED" });
  }

  if (action === "resume" && campaign.fbCampaignId) {
    await updateCampaignStatus(campaign.fbCampaignId, "ACTIVE", accessToken);
    await prisma.campaign.update({ where: { id: params.id }, data: { status: "ACTIVE" } });
    return NextResponse.json({ success: true, status: "ACTIVE" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// GET /api/campaigns/[id] — get campaign details with analytics
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      adSets: {
        include: {
          ads: { include: { creative: true } },
          audience: true,
        },
      },
      analytics: { orderBy: { date: "desc" }, take: 30 },
      optimizationLogs: { orderBy: { appliedAt: "desc" }, take: 10 },
      aiRecommendations: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ campaign });
}
