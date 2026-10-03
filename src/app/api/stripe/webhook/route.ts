import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const PLAN_MAP: Record<string, "STARTER" | "PRO" | "AGENCY"> = {
  [process.env.STRIPE_STARTER_PRICE_ID!]: "STARTER",
  [process.env.STRIPE_PRO_PRICE_ID!]: "PRO",
  [process.env.STRIPE_AGENCY_PRICE_ID!]: "AGENCY",
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as "STARTER" | "PRO" | "AGENCY";

      if (userId && plan) {
        // Update customer ID
        if (session.customer) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeId: session.customer as string, plan },
          });
        }

        // Create/update subscription
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan,
              stripeSubId: sub.id,
              stripePriceId: sub.items.data[0]?.price.id,
              status: sub.status === "active" ? "ACTIVE" : "TRIALING",
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
            update: {
              plan,
              stripeSubId: sub.id,
              status: sub.status === "active" ? "ACTIVE" : "TRIALING",
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      const plan = PLAN_MAP[priceId];

      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubId: sub.id },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            plan: plan || subscription.plan,
            status: sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : "CANCELED",
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });

        if (plan) {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { plan },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubId: sub.id },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "CANCELED" },
        });
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { plan: "FREE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
