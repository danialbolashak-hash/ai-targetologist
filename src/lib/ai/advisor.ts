import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";
import { generateCreativesWithAI, generateOffersWithAI } from "@/lib/ai/analyzer";
import type { MetaInsights } from "@/types";

/**
 * AI Targetologist Advisor.
 * Diagnoses a campaign from its latest insights, and when something is wrong:
 *  - LOW CTR / high frequency  → ad fatigue → generate a NEW creative + notify
 *  - HIGH CPL / weak ROAS      → offer problem → generate a NEW offer + notify
 *  - very bad performance      → CRITICAL alert
 * Returns the list of issues found (for logging).
 */

interface Diagnosis {
  code: string;
  severity: "WARNING" | "CRITICAL";
  message: string;
  fix: "NEW_CREATIVE" | "NEW_OFFER" | "REVIEW";
}

// Thresholds — tuned defaults; campaign targets override where relevant
const RULES = {
  LOW_CTR: 1.0,        // %
  HIGH_FREQ: 3.5,
  HIGH_CPM: 200,
  CPL_MULTIPLIER: 1.5, // CPL above target * 1.5 = offer problem
  BAD_ROAS_RATIO: 0.5, // ROAS below target * 0.5 = critical
};

function diagnose(ins: MetaInsights, targetCPL: number, targetROAS: number): Diagnosis[] {
  const out: Diagnosis[] = [];
  const ctr = Number(ins.ctr ?? 0);
  const freq = Number(ins.frequency ?? 0);
  const cpm = Number(ins.cpm ?? 0);
  const roas = Number(ins.purchase_roas ?? 0);
  // derive CPL from spend / leads when present
  const spend = Number(ins.spend ?? 0);
  const leads = Number((ins as Record<string, unknown>).leads ?? 0);
  const cpl = leads > 0 ? spend / leads : 0;

  if (ctr > 0 && ctr < RULES.LOW_CTR) {
    out.push({ code: "LOW_CTR", severity: "WARNING", fix: "NEW_CREATIVE",
      message: `CTR ${ctr.toFixed(2)}% ниже нормы (${RULES.LOW_CTR}%). Креатив не цепляет — нужен новый.` });
  }
  if (freq > RULES.HIGH_FREQ) {
    out.push({ code: "AD_FATIGUE", severity: "WARNING", fix: "NEW_CREATIVE",
      message: `Частота показов ${freq.toFixed(1)} — аудитория устала от креатива. Пора сменить.` });
  }
  if (cpl > 0 && targetCPL > 0 && cpl > targetCPL * RULES.CPL_MULTIPLIER) {
    out.push({ code: "HIGH_CPL", severity: "WARNING", fix: "NEW_OFFER",
      message: `Цена лида $${cpl.toFixed(2)} выше цели $${targetCPL} в 1.5×. Оффер слабый — нужен новый.` });
  }
  if (roas > 0 && targetROAS > 0 && roas < targetROAS * RULES.BAD_ROAS_RATIO) {
    out.push({ code: "BAD_ROAS", severity: "CRITICAL", fix: "REVIEW",
      message: `ROAS ${roas.toFixed(1)}x — критически ниже цели ${targetROAS}x. Реклама убыточна, рекомендую паузу.` });
  }
  return out;
}

export async function runAdvisor(campaignId: string, insights: MetaInsights): Promise<Diagnosis[]> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      business: { include: { user: true } },
      offers: true,
      audiences: true,
    },
  });
  if (!campaign) return [];

  const userId = campaign.business.userId;
  const issues = diagnose(insights, campaign.targetCPL || 0, campaign.targetROAS || 0);
  if (issues.length === 0) return [];

  // Avoid spamming: max 1 advisor notification per campaign per 12h
  const recent = await prisma.notification.findFirst({
    where: { userId, campaignId, createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } },
  });
  if (recent) return issues;

  const primaryOffer = campaign.offers[0] as Record<string, unknown> | undefined;
  const primaryAudience = campaign.audiences[0] as Record<string, unknown> | undefined;

  for (const issue of issues) {
    // ── Generate a NEW CREATIVE automatically ──────────────────
    if (issue.fix === "NEW_CREATIVE" && primaryOffer && primaryAudience) {
      try {
        const creative = await generateCreativesWithAI(primaryOffer, primaryAudience, "META", "single_image");
        await notifyUser({
          userId,
          type: "CREATIVE_READY",
          title: `⚠️ Креатив устал — я написал новый`,
          body: `${issue.message}\n\nНовый вариант:\n«${creative.headline}»\n${creative.primaryText}`,
          campaignId,
          payload: { reason: issue.code, creative },
          actionUrl: `/campaigns/${campaignId}`,
        });
      } catch (e) {
        console.error("[advisor] creative gen failed:", e);
      }
    }

    // ── Generate a NEW OFFER automatically ─────────────────────
    if (issue.fix === "NEW_OFFER") {
      try {
        const business = campaign.business as unknown as Record<string, unknown>;
        // analysis is optional context; pass minimal shape
        const offers = await generateOffersWithAI(business, {} as never);
        const best = offers[0];
        await notifyUser({
          userId,
          type: "OFFER_READY",
          title: `⚠️ Оффер не продаёт — вот новый`,
          body: `${issue.message}\n\nНовый оффер:\n«${best.headline}»\n${best.usp}`,
          campaignId,
          payload: { reason: issue.code, offers },
          actionUrl: `/campaigns/${campaignId}`,
        });
      } catch (e) {
        console.error("[advisor] offer gen failed:", e);
      }
    }

    // ── CRITICAL alert (no auto-fix, needs human decision) ─────
    if (issue.fix === "REVIEW") {
      await notifyUser({
        userId,
        type: "CRITICAL",
        title: `🔴 Кампания «${campaign.name}» убыточна`,
        body: issue.message,
        campaignId,
        actionUrl: `/campaigns/${campaignId}`,
      });
    }
  }

  return issues;
}
