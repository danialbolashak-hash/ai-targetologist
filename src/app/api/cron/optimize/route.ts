import { decrypt } from "@/lib/crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCampaignInsights } from "@/lib/meta/api";
import { analyzeAndOptimize } from "@/lib/ai/optimizer";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE", fbCampaignId: { not: null }, aiManaged: true },
    include: { adAccount: { include: { facebookAccount: true } } },
  });

  const results = [];
  for (const campaign of campaigns) {
    try {
      const insights = await getCampaignInsights(
        campaign.fbCampaignId!,
        decrypt(campaign.adAccount.facebookAccount.accessToken),
        "last_3d"
      );
      if (!insights.length) continue;

      const decisions = await analyzeAndOptimize(
        campaign.id,
        insights[0],
        decrypt(campaign.adAccount.facebookAccount.accessToken),
        campaign.fbCampaignId!,
        campaign.adAccount.fbAdAccountId
      );

      results.push({ campaignId: campaign.id, decisions: decisions.length });
    } catch (err) {
      results.push({ campaignId: campaign.id, error: String(err) });
    }
  }

  return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() });
}
