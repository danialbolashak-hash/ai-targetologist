import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser, ownsResource } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { createAdCreative, createAd } from "@/lib/meta/api";
import { audit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

/**
 * Apply an AI suggestion (new creative / offer) from a notification.
 * - CREATIVE_READY → save Creative to DB and push a new Meta ad creative + paused ad
 * - OFFER_READY    → save the new Offer to the business
 * The new ad is created PAUSED so the user reviews before spend.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const notif = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notif || notif.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payload = notif.payload as Record<string, any> | null;
  if (!payload) return NextResponse.json({ error: "Nothing to apply" }, { status: 400 });

  // Load campaign + its business + ad account (with token) for ownership + Meta push
  const campaign = notif.campaignId
    ? await prisma.campaign.findUnique({
        where: { id: notif.campaignId },
        include: { business: true, adSets: true, adAccount: { include: { facebookAccount: true } } },
      })
    : null;

  if (campaign && !ownsResource(user, campaign.business.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── OFFER ──────────────────────────────────────────────────
  if (notif.type === "OFFER_READY" && payload.offers?.length) {
    const o = payload.offers[0];
    const offer = await prisma.offer.create({
      data: {
        businessId: campaign?.businessId || (await firstBusinessId(user.id)),
        headline: o.headline, subheadline: o.subheadline || null,
        usp: o.usp, hook: o.hook || "", body: o.body || o.usp, cta: o.cta || "Узнать больше",
        painPoints: o.painPoints || [], emotionalTriggers: o.emotionalTriggers || [],
        urgencyTriggers: o.urgencyTriggers || [], scarcityTriggers: o.scarcityTriggers || [],
      },
    });
    await prisma.notification.update({ where: { id: notif.id }, data: { isRead: true } });
    await audit({ userId: user.id, action: "ai.apply_offer", resource: offer.id, ip: getClientIp(req) });
    return NextResponse.json({ ok: true, kind: "offer", offerId: offer.id });
  }

  // ── CREATIVE ───────────────────────────────────────────────
  if (notif.type === "CREATIVE_READY" && payload.creative) {
    const c = payload.creative;

    // Save in DB
    const creative = await prisma.creative.create({
      data: {
        businessId: campaign?.businessId || null,
        type: "IMAGE",
        headline: c.headline, primaryText: c.primaryText,
        description: c.description || null, cta: c.cta || "LEARN_MORE",
        platform: "META",
      },
    });

    // Push to Meta as a paused ad (if campaign is connected)
    let metaAdId: string | null = null;
    if (campaign?.adAccount?.facebookAccount && campaign.adAccount.pageId && campaign.adSets[0]) {
      try {
        const token = decrypt(campaign.adAccount.facebookAccount.accessToken);
        const acct = campaign.adAccount.fbAdAccountId;

        const fbCreative = await createAdCreative(acct, {
          name: `AI: ${c.headline}`.slice(0, 60),
          object_story_spec: {
            page_id: campaign.adAccount.pageId,
            link_data: {
              message: c.primaryText,
              link: campaign.business ? "https://example.com" : "https://example.com",
              name: c.headline,
              description: c.description || "",
              call_to_action: { type: (c.cta || "LEARN_MORE").toUpperCase().replace(/\s/g, "_") },
            },
          },
        } as any, token);

        const ad = await createAd(acct, {
          name: `AI Ad: ${c.headline}`.slice(0, 60),
          adset_id: campaign.adSets[0].fbAdSetId!,
          creative: { creative_id: fbCreative.id },
          status: "PAUSED", // review before spend
        } as any, token);

        metaAdId = ad.id;
        await prisma.creative.update({ where: { id: creative.id }, data: { fbCreativeId: fbCreative.id } });
      } catch (e) {
        console.error("[apply] meta push failed:", e);
        // Creative still saved in DB; report partial success
        await prisma.notification.update({ where: { id: notif.id }, data: { isRead: true } });
        return NextResponse.json({ ok: true, kind: "creative", creativeId: creative.id, metaPushed: false, warning: "Сохранено в системе, но не залилось в Meta (проверь подключение аккаунта)." });
      }
    }

    await prisma.notification.update({ where: { id: notif.id }, data: { isRead: true } });
    await audit({ userId: user.id, action: "ai.apply_creative", resource: creative.id, ip: getClientIp(req) });
    return NextResponse.json({ ok: true, kind: "creative", creativeId: creative.id, metaPushed: !!metaAdId, metaAdId });
  }

  return NextResponse.json({ error: "Unsupported notification type" }, { status: 400 });
}

async function firstBusinessId(userId: string): Promise<string> {
  const b = await prisma.businessProfile.findFirst({ where: { userId } });
  if (!b) throw new Error("No business profile");
  return b.id;
}
