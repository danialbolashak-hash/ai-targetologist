import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import * as MetaAPI from "@/lib/meta/api";
import type { MetaInsights } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OPTIMIZATION_RULES = {
  LOW_CTR: { metric: "ctr", threshold: 1.0, operator: "<" as const },
  HIGH_CPM: { metric: "cpm", threshold: 200, operator: ">" as const },
  HIGH_CPC: { metric: "cpc", threshold: 5.0, operator: ">" as const },
  HIGH_CPL: { metric: "cpl", threshold: 15, operator: ">" as const },
  BAD_ROAS: { metric: "purchase_roas", threshold: 2.0, operator: "<" as const },
  HIGH_FREQUENCY: { metric: "frequency", threshold: 3.5, operator: ">" as const },
  NO_CONVERSIONS: { metric: "leads", threshold: 0, operator: "<=" as const },
};

export interface OptimizationDecision {
  action: string;
  reason: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  autoApply: boolean;
}

export async function analyzeAndOptimize(
  campaignId: string,
  insights: MetaInsights,
  accessToken: string,
  fbCampaignId: string,
  adAccountId: string
): Promise<OptimizationDecision[]> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { adSets: { include: { ads: true } } },
  });

  if (!campaign || !campaign.aiManaged) return [];

  // Max 3 optimizations per day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOpts = await prisma.optimizationLog.count({
    where: { campaignId, appliedAt: { gte: today } },
  });

  if (todayOpts >= 3) return [];

  const decisions = await getAIDecisions(insights, campaign.targetROAS, campaign.targetCPL || 10);

  // Apply decisions
  for (const decision of decisions) {
    if (!decision.autoApply) continue;

    try {
      await applyDecision(decision, campaignId, fbCampaignId, adAccountId, accessToken, insights);
    } catch (err) {
      console.error(`Failed to apply optimization: ${decision.action}`, err);
    }
  }

  return decisions;
}

async function getAIDecisions(
  insights: MetaInsights,
  targetROAS: number,
  targetCPL: number
): Promise<OptimizationDecision[]> {
  const cpl = insights.leads > 0 ? insights.spend / insights.leads : 999;

  const prompt = `You are an AI optimization engine for Meta Ads.

CURRENT METRICS:
- Spend: $${insights.spend}
- Impressions: ${insights.impressions}
- Clicks: ${insights.clicks}
- CTR: ${insights.ctr}%
- CPM: $${insights.cpm}
- CPC: $${insights.cpc}
- Leads: ${insights.leads}
- CPL: $${cpl.toFixed(2)}
- ROAS: ${insights.purchase_roas}x
- Frequency: ${insights.frequency}

TARGETS:
- Target ROAS: ${targetROAS}x
- Target CPL: $${targetCPL}

RULES:
- CTR < 1% → change hook/creative (HIGH)
- CPM > $200 → expand audience (MEDIUM)
- CPC > $5 → change creative (MEDIUM)
- CPL > $${targetCPL * 2} → change offer (HIGH)
- ROAS < ${targetROAS * 0.5} → pause campaign (CRITICAL)
- Frequency > 3.5 → expand audience or refresh creative (MEDIUM)
- 0 leads after $${targetCPL * 3} spend → emergency actions (CRITICAL)
- Good ROAS > ${targetROAS * 1.5} → scale up (POSITIVE)

Return ONLY valid JSON array of decisions:
[
  {
    "action": "CHANGE_CREATIVE",
    "reason": "CTR is 0.8%, below 1% threshold. Current hook is not stopping the scroll.",
    "type": "CREATIVE",
    "severity": "HIGH",
    "autoApply": true
  }
]

Only return decisions that are actually needed based on the metrics. Return [] if everything is fine.`;

  const message = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.choices[0].message.content || "[]";
  const match = text.match(/\[[\s\S]*\]/);
  return match ? JSON.parse(match[0]) : [];
}

async function applyDecision(
  decision: OptimizationDecision,
  campaignId: string,
  fbCampaignId: string,
  adAccountId: string,
  accessToken: string,
  insights: MetaInsights
): Promise<void> {
  const before = { ...insights };
  let after: Record<string, unknown> = {};

  switch (decision.action) {
    case "PAUSE_CAMPAIGN":
    case "EMERGENCY_STOP":
      await MetaAPI.updateCampaignStatus(fbCampaignId, "PAUSED", accessToken);
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "PAUSED" },
      });
      after = { status: "PAUSED" };
      break;

    case "INCREASE_BUDGET": {
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) break;
      const newBudget = Math.min(campaign.dailyBudget * 1.2, campaign.dailyBudget * 2);
      await MetaAPI.updateCampaignBudget(fbCampaignId, newBudget, accessToken);
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { dailyBudget: newBudget },
      });
      after = { dailyBudget: newBudget };
      break;
    }

    case "CHANGE_CREATIVE":
    case "CHANGE_OFFER":
    case "EXPAND_AUDIENCE":
      // Mark as recommendation for manual review or AI-gen new creative
      after = { flaggedForCreation: true };
      break;

    default:
      after = { noted: true };
  }

  await prisma.optimizationLog.create({
    data: {
      campaignId,
      type: decision.action as "PAUSE_AD",
      trigger: decision.reason,
      action: decision.action,
      before,
      after,
    },
  });

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { optimizationCount: { increment: 1 } },
  });
}

export async function scaleWinningCampaign(
  campaignId: string,
  insights: MetaInsights,
  accessToken: string
): Promise<void> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { adSets: { include: { campaign: true } } },
  });

  if (!campaign?.fbCampaignId) return;

  const isWinning =
    insights.purchase_roas >= campaign.targetROAS * 1.5 ||
    (campaign.targetCPL && insights.leads > 0 &&
      insights.spend / insights.leads <= campaign.targetCPL * 0.7);

  if (!isWinning) return;

  // Max 20% budget increase per day
  const newBudget = campaign.dailyBudget * 1.2;
  await MetaAPI.updateCampaignBudget(campaign.fbCampaignId, newBudget, accessToken);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { dailyBudget: newBudget },
  });

  await prisma.optimizationLog.create({
    data: {
      campaignId,
      type: "SCALE_UP",
      trigger: `ROAS ${insights.purchase_roas}x exceeds target`,
      action: "INCREASE_BUDGET_20PCT",
      before: { dailyBudget: campaign.dailyBudget },
      after: { dailyBudget: newBudget },
    },
  });

  await prisma.aiRecommendation.create({
    data: {
      campaignId,
      type: "SCALING",
      priority: "HIGH",
      title: "Campaign is profitable — scaling up",
      description: `ROAS ${insights.purchase_roas}x exceeds target. Budget increased by 20%. Consider duplicating winning ad sets.`,
      suggestedAction: "Duplicate winning ad sets and test lookalike audiences",
      isAuto: true,
      isApplied: true,
      appliedAt: new Date(),
    },
  });
}
