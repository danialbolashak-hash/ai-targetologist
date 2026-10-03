import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const PLANS = {
  STARTER: {
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: ["1 бизнес", "3 кампании", "AI анализ", "Базовая аналитика"],
  },
  PRO: {
    name: "Pro",
    price: 99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: ["10 бизнесов", "Неограниченные кампании", "Auto Launcher", "Smart Optimization"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 299,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: ["Неограниченно", "White-label", "API доступ", "Dedicated manager"],
  },
};
