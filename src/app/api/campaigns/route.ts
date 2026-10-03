import { decrypt } from "@/lib/crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCampaign, createAdSet, createAd, createAdCreative } from "@/lib/meta/api";
import { generateCreativesWithAI } from "@/lib/ai/analyzer";
import { requireApiUser, ownsResource } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import type { MetaTargeting } from "@/types";

// GET /api/campaigns — list campaigns for a business (owner only)
export async function GET(req: NextRequest) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  // Verify the business belongs to this user (prevents IDOR)
  const business = await prisma.businessProfile.findUnique({ where: { id: businessId } });
  if (!business || !ownsResource(user, business.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { businessId },
    include: {
      adSets: { include: { ads: true } },
      analytics: { orderBy: { date: "desc" }, take: 1 },
      aiRecommendations: { where: { isApplied: false }, take: 3 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

// POST /api/campaigns — create and optionally launch campaign (owner only)
export async function POST(req: NextRequest) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  // Rate limit campaign creation: 20/min per IP (each call can spend money)
  const limited = rateLimit(`campaigns:${getClientIp(req)}`, 20);
  if (limited) return limited;

  const body = await req.json();
  const {
    businessId,
    adAccountId,
    name,
    objective,
    dailyBudget,
    targetROAS,
    targetCPL,
    audienceIds,
    offerIds,
    autoLaunch = false,
  } = body;

  // Load business, adAccount, audiences, offers
  const [business, adAccount, audiences, offers] = await Promise.all([
    prisma.businessProfile.findUnique({ where: { id: businessId } }),
    prisma.adAccount.findUnique({
      where: { id: adAccountId },
      include: { facebookAccount: true },
    }),
    prisma.audience.findMany({ where: { id: { in: audienceIds } } }),
    prisma.offer.findMany({ where: { id: { in: offerIds } } }),
  ]);

  if (!business || !adAccount) {
    return NextResponse.json({ error: "Business or ad account not found" }, { status: 404 });
  }

  // SECURITY: the business must belong to the authenticated user (prevents spending on others' accounts)
  if (!ownsResource(user, business.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const accessToken = decrypt(adAccount.facebookAccount.accessToken);

  // Create campaign in DB first (DRAFT)
  const campaign = await prisma.campaign.create({
    data: {
      businessId,
      adAccountId,
      name,
      objective: objective || "OUTCOME_LEADS",
      dailyBudget,
      status: autoLaunch ? "PENDING_APPROVAL" : "DRAFT",
      targetROAS: targetROAS || 3.0,
      targetCPL: targetCPL || null,
    },
  });

  if (!autoLaunch) {
    return NextResponse.json({ campaign });
  }

  // AUTO LAUNCH: Create in Meta Ads
  try {
    // 1. Create Meta Campaign
    const fbCampaign = await createCampaign(
      adAccount.fbAdAccountId,
      {
        name,
        objective: objective || "OUTCOME_LEADS",
        status: "PAUSED", // Start paused, activate after approval
        special_ad_categories: [],
      },
      accessToken
    );

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { fbCampaignId: fbCampaign.id },
    });

    // 2. Create Ad Sets (one per audience)
    for (const audience of audiences) {
      const targeting: MetaTargeting = {
        age_min: audience.ageMin,
        age_max: audience.ageMax,
        geo_locations: (audience.locations as Record<string, unknown>[])[0]
          ? {
              countries: (audience.locations as Array<{ country: string }>)
                .map((l) => l.country)
                .filter(Boolean),
            }
          : { countries: [business.country] },
        interests: (audience.interests as Array<{ id: string; name: string }>) || [],
        behaviors: (audience.behaviors as Array<{ id: string; name: string }>) || [],
      };

      const fbAdSet = await createAdSet(
        adAccount.fbAdAccountId,
        {
          name: `${name} - ${audience.name}`,
          campaign_id: fbCampaign.id,
          daily_budget: Math.round((dailyBudget / audiences.length) * 100),
          billing_event: "IMPRESSIONS",
          optimization_goal: "LEAD_GENERATION",
          targeting,
          status: "PAUSED",
          promoted_object: adAccount.pixelId
            ? { pixel_id: adAccount.pixelId, custom_event_type: "LEAD" }
            : undefined,
        },
        accessToken
      );

      const adSet = await prisma.adSet.create({
        data: {
          campaignId: campaign.id,
          audienceId: audience.id,
          fbAdSetId: fbAdSet.id,
          name: `${name} - ${audience.name}`,
          dailyBudget: dailyBudget / audiences.length,
        },
      });

      // 3. Generate creatives with AI and create ads
      for (const offer of offers.slice(0, 2)) {
        const creativeData = await generateCreativesWithAI(
          offer as unknown as Record<string, unknown>,
          audience as unknown as Record<string, unknown>,
          "META",
          "IMAGE"
        );

        const creative = await prisma.creative.create({
          data: {
            businessId,
            type: "IMAGE",
            headline: creativeData.headline,
            primaryText: creativeData.primaryText,
            description: creativeData.description || "",
            cta: creativeData.cta,
          },
        });

        // Create Meta creative (requires page_id and image)
        if (adAccount.pageId) {
          const fbCreative = await createAdCreative(
            adAccount.fbAdAccountId,
            {
              name: `Creative - ${creative.id}`,
              object_story_spec: {
                page_id: adAccount.pageId,
                link_data: {
                  link: process.env.NEXTAUTH_URL || "https://example.com",
                  message: creativeData.primaryText,
                  name: creativeData.headline,
                  description: creativeData.description,
                  call_to_action: {
                    type: creativeData.cta || "LEARN_MORE",
                    value: { link: process.env.NEXTAUTH_URL || "https://example.com" },
                  },
                },
              },
            },
            accessToken
          );

          await prisma.creative.update({
            where: { id: creative.id },
            data: { fbCreativeId: fbCreative.id },
          });

          const fbAd = await createAd(
            adAccount.fbAdAccountId,
            {
              name: `Ad - ${creative.id}`,
              adset_id: fbAdSet.id,
              creative: { creative_id: fbCreative.id },
              status: "PAUSED",
            },
            accessToken
          );

          await prisma.ad.create({
            data: {
              adSetId: adSet.id,
              creativeId: creative.id,
              fbAdId: fbAd.id,
              name: `Ad - ${creative.id}`,
            },
          });
        }
      }
    }

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "PENDING_APPROVAL" },
    });

    return NextResponse.json({ campaign: { ...campaign, fbCampaignId: fbCampaign.id } });
  } catch (err) {
    console.error("Campaign launch error:", err);
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "ERROR" },
    });
    return NextResponse.json(
      { error: "Failed to launch campaign", campaign },
      { status: 500 }
    );
  }
}
