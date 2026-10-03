import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { getCampaignInsights } from "@/lib/meta/api";
import { analyzeAndOptimize, scaleWinningCampaign } from "@/lib/ai/optimizer";
import { runAdvisor } from "@/lib/ai/advisor";
import type { CronJobResult } from "@/types";

export async function runMonitoringJob(): Promise<CronJobResult> {
  const result: CronJobResult = {
    success: true,
    processed: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  // Get all active campaigns with Meta connection
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      fbCampaignId: { not: null },
      aiManaged: true,
    },
    include: {
      adAccount: {
        include: { facebookAccount: true },
      },
    },
  });

  for (const campaign of campaigns) {
    try {
      const accessToken = decrypt(campaign.adAccount.facebookAccount.accessToken);
      const fbCampaignId = campaign.fbCampaignId!;

      // Fetch insights from Meta API
      const insights = await getCampaignInsights(fbCampaignId, accessToken, "last_7d");

      if (!insights.length) continue;

      const latest = insights[insights.length - 1];
      const cpl = latest.leads > 0 ? latest.spend / latest.leads : null;
      const cpa = latest.purchases > 0 ? latest.spend / latest.purchases : null;

      // Save to analytics
      await prisma.analytics.create({
        data: {
          campaignId: campaign.id,
          date: new Date(),
          spend: latest.spend,
          impressions: latest.impressions,
          clicks: latest.clicks,
          reach: latest.reach,
          leads: latest.leads,
          purchases: latest.purchases,
          cpm: latest.cpm,
          ctr: latest.ctr,
          cpc: latest.cpc,
          cpl,
          cpa,
          roas: latest.purchase_roas || null,
          frequency: latest.frequency,
          conversionRate: latest.clicks > 0 ? (latest.leads / latest.clicks) * 100 : null,
        },
      });

      // AI optimization check
      const decisions = await analyzeAndOptimize(
        campaign.id,
        latest,
        accessToken,
        fbCampaignId,
        campaign.adAccount.fbAdAccountId
      );

      // Check for scaling opportunity
      await scaleWinningCampaign(campaign.id, latest, accessToken);

      // AI Advisor: diagnose problems, auto-write new creative/offer, notify user
      await runAdvisor(campaign.id, latest);

      // Save AI recommendations
      for (const decision of decisions) {
        await prisma.aiRecommendation.create({
          data: {
            campaignId: campaign.id,
            type: decision.type as "CREATIVE",
            priority: decision.severity as "HIGH",
            title: decision.action.replace(/_/g, " "),
            description: decision.reason,
            suggestedAction: decision.action,
            isAuto: decision.autoApply,
            isApplied: decision.autoApply,
            appliedAt: decision.autoApply ? new Date() : null,
          },
        });
      }

      result.processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Campaign ${campaign.id}: ${msg}`);
      console.error(`Monitor error for campaign ${campaign.id}:`, err);
    }
  }

  if (result.errors.length > 0) result.success = false;
  return result;
}

export async function runLeadSync(): Promise<CronJobResult> {
  const result: CronJobResult = {
    success: true,
    processed: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  // Sync leads from Meta Lead Ads
  const adAccounts = await prisma.adAccount.findMany({
    where: { status: "ACTIVE", pixelId: { not: null } },
    include: { facebookAccount: true },
  });

  for (const account of adAccounts) {
    try {
      // In production: fetch leads from Meta Lead Gen API
      // GET /{form_id}/leads
      result.processed++;
    } catch (err) {
      result.errors.push(`Account ${account.id}: ${String(err)}`);
    }
  }

  return result;
}
