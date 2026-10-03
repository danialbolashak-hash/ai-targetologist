import { decrypt } from "@/lib/crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCampaignInsights } from "@/lib/meta/api";
import { scaleWinningCampaign } from "@/lib/ai/optimizer";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE", fbCampaignId: { not: null }, aiManaged: true },
    include: { adAccount: { include: { facebookAccount: true } } },
  });

  const scaled = [];
  for (const campaign of campaigns) {
    try {
      const insights = await getCampaignInsights(
        campaign.fbCampaignId!,
        decrypt(campaign.adAccount.facebookAccount.accessToken),
        "last_7d"
      );
      if (!insights.length) continue;

      await scaleWinningCampaign(
        campaign.id,
        insights[0],
        decrypt(campaign.adAccount.facebookAccount.accessToken)
      );

      scaled.push(campaign.id);
    } catch (err) {
      console.error(`Scale error for ${campaign.id}:`, err);
    }
  }

  return NextResponse.json({ success: true, scaled, timestamp: new Date().toISOString() });
}
