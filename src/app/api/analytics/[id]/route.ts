import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = req.nextUrl;
  const days = parseInt(searchParams.get("days") || "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const analytics = await prisma.analytics.findMany({
    where: {
      campaignId: params.id,
      date: { gte: since },
    },
    orderBy: { date: "asc" },
  });

  // Aggregate totals
  const totals = analytics.reduce(
    (acc, row) => ({
      spend: acc.spend + row.spend,
      impressions: acc.impressions + row.impressions,
      clicks: acc.clicks + row.clicks,
      leads: acc.leads + row.leads,
      purchases: acc.purchases + row.purchases,
      revenue: acc.revenue + row.revenue,
    }),
    { spend: 0, impressions: 0, clicks: 0, leads: 0, purchases: 0, revenue: 0 }
  );

  const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCPL = totals.leads > 0 ? totals.spend / totals.leads : null;
  const avgROAS = totals.spend > 0 ? totals.revenue / totals.spend : null;

  return NextResponse.json({
    analytics,
    totals: { ...totals, avgCTR, avgCPL, avgROAS },
  });
}
