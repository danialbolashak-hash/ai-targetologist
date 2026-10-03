import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const PRICE_IDS: Record<string, string> = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID!,
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  AGENCY: process.env.STRIPE_AGENCY_PRICE_ID!,
};

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan");
  const userId = req.nextUrl.searchParams.get("userId");

  if (!plan || !userId || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const session = await stripe.checkout.sessions.create({
    customer: user.stripeId || undefined,
    customer_email: !user.stripeId ? user.email : undefined,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings/billing?success=true&plan=${plan}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing?canceled=true`,
    metadata: { userId, plan },
    subscription_data: {
      trial_period_days: user.plan === "FREE" ? 14 : undefined,
      metadata: { userId, plan },
    },
  });

  return NextResponse.redirect(session.url!);
}
