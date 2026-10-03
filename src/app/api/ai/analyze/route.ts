import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  analyzeBusinessWithAI,
  generateAudiencesWithAI,
  generateOffersWithAI,
} from "@/lib/ai/analyzer";
import { requireApiUser, ownsResource } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  // AI analysis is expensive — limit 10/min per IP
  const limited = rateLimit(`ai-analyze:${getClientIp(req)}`, 10);
  if (limited) return limited;

  const body = await req.json();
  const { businessId } = body;

  const business = await prisma.businessProfile.findUnique({
    where: { id: businessId },
  });

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (!ownsResource(user, business.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Step 1: AI market analysis
  const analysis = await analyzeBusinessWithAI({
    name: business.name,
    niche: business.niche,
    product: business.product,
    price: business.price,
    avgCheck: business.avgCheck,
    budget: business.budget,
    location: business.location,
    country: business.country,
    competitors: business.competitors,
    goals: business.goals,
    painPoints: business.painPoints,
    customerType: business.customerType,
  });

  // Step 2: Generate audiences
  const audiences = await generateAudiencesWithAI(
    business as unknown as Record<string, unknown>,
    analysis
  );

  // Step 3: Generate offers
  const offers = await generateOffersWithAI(
    business as unknown as Record<string, unknown>,
    analysis
  );

  // Save analysis to business
  await prisma.businessProfile.update({
    where: { id: businessId },
    data: {
      aiAnalysis: analysis as unknown as Record<string, unknown>,
      strategy: analysis.strategy as unknown as Record<string, unknown>,
    },
  });

  // Save audiences to DB
  const savedAudiences = await Promise.all(
    audiences.map((a) =>
      prisma.audience.create({
        data: {
          businessId,
          name: a.name,
          type: a.type as "COLD",
          ageMin: a.ageMin,
          ageMax: a.ageMax,
          gender: a.gender,
          locations: a.locations,
          interests: a.interests,
          behaviors: a.behaviors,
          estimatedSize: a.estimatedSize,
          aiExplanation: a.aiExplanation,
        },
      })
    )
  );

  // Save offers to DB
  const savedOffers = await Promise.all(
    offers.map((o) =>
      prisma.offer.create({
        data: {
          businessId,
          headline: o.headline,
          subheadline: o.subheadline,
          usp: o.usp,
          hook: o.hook,
          body: o.body,
          cta: o.cta,
          painPoints: o.painPoints,
          emotionalTriggers: o.emotionalTriggers,
          urgencyTriggers: o.urgencyTriggers,
          scarcityTriggers: o.scarcityTriggers,
          score: o.score,
        },
      })
    )
  );

  return NextResponse.json({
    success: true,
    analysis,
    audiences: savedAudiences,
    offers: savedOffers,
  });
}
