import OpenAI from "openai";
import type { AIAnalysis } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeBusinessWithAI(business: {
  name: string;
  niche: string;
  product: string;
  price: number;
  avgCheck: number;
  budget: number;
  location: string;
  country: string;
  competitors: string[];
  goals: string[];
  painPoints: string[];
  customerType: string;
}): Promise<AIAnalysis> {
  const prompt = `You are a world-class performance marketing strategist with 15+ years experience in Meta Ads.

Analyze this business and create a complete marketing strategy:

BUSINESS DATA:
- Business: ${business.name}
- Niche: ${business.niche}
- Product/Service: ${business.product}
- Price: $${business.price}
- Average check: $${business.avgCheck}
- Monthly ad budget: $${business.budget}
- Location: ${business.location}, ${business.country}
- Main competitors: ${business.competitors.join(", ")}
- Goals: ${business.goals.join(", ")}
- Customer pain points: ${business.painPoints.join(", ")}
- Customer type: ${business.customerType}

Return ONLY valid JSON (no markdown, no explanation):
{
  "marketAnalysis": {
    "marketSize": "estimated market size and description",
    "demand": "high/medium/low with reasoning",
    "competition": "analysis of competitive landscape",
    "opportunity": "main market opportunity",
    "trends": ["trend1", "trend2", "trend3"]
  },
  "customerPsychology": {
    "emotions": ["fear", "desire", "frustration", "aspiration"],
    "objections": ["objection1", "objection2", "objection3"],
    "triggers": ["trigger1", "trigger2", "trigger3"],
    "journey": "description of customer decision journey"
  },
  "positioning": {
    "usp": "unique selling proposition",
    "differentiation": "how to stand out from competitors",
    "pricePositioning": "premium/value/economy with reasoning"
  },
  "strategy": {
    "funnel": "recommended funnel description",
    "channels": ["META", "GOOGLE"],
    "budgetDistribution": {"META": 70, "GOOGLE": 30},
    "timeline": "30 days to see results",
    "estimatedLeads": 85,
    "estimatedCPL": 4.50,
    "estimatedROI": 320
  },
  "risks": ["risk1", "risk2"]
}`;

  const message = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.choices[0].message.content || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned invalid response");
  return JSON.parse(jsonMatch[0]) as AIAnalysis;
}

export async function generateAudiencesWithAI(
  business: Record<string, unknown>,
  analysis: AIAnalysis
): Promise<Array<{
  name: string;
  type: string;
  ageMin: number;
  ageMax: number;
  gender: string;
  locations: Array<{ country: string; city?: string }>;
  interests: Array<{ id: string; name: string }>;
  behaviors: Array<{ id: string; name: string }>;
  estimatedSize: number;
  aiExplanation: string;
}>> {
  const prompt = `You are a Meta Ads targeting expert.

Based on this business analysis, create 4 precise audience segments for Meta Ads:

BUSINESS: ${JSON.stringify(business)}
ANALYSIS: ${JSON.stringify(analysis)}

Return ONLY valid JSON array:
[
  {
    "name": "Cold - [description]",
    "type": "COLD",
    "ageMin": 25,
    "ageMax": 45,
    "gender": "ALL",
    "locations": [{"country": "KZ"}, {"country": "RU"}],
    "interests": [
      {"id": "6003107902433", "name": "Beauty"},
      {"id": "6003200145551", "name": "Skincare"}
    ],
    "behaviors": [
      {"id": "6002714895372", "name": "Online shoppers"}
    ],
    "estimatedSize": 180000,
    "aiExplanation": "Why this audience works: ..."
  },
  {
    "name": "Warm - Engaged",
    "type": "WARM",
    "ageMin": 22,
    "ageMax": 50,
    "gender": "ALL",
    "locations": [{"country": "KZ"}],
    "interests": [],
    "behaviors": [],
    "estimatedSize": 45000,
    "aiExplanation": "Users who engaged with content..."
  },
  {
    "name": "Lookalike 3% - Customers",
    "type": "LOOKALIKE",
    "ageMin": 18,
    "ageMax": 65,
    "gender": "ALL",
    "locations": [{"country": "KZ"}],
    "interests": [],
    "behaviors": [],
    "estimatedSize": 95000,
    "aiExplanation": "3% lookalike based on existing customers..."
  },
  {
    "name": "Retargeting - Website Visitors",
    "type": "RETARGETING",
    "ageMin": 18,
    "ageMax": 65,
    "gender": "ALL",
    "locations": [{"country": "KZ"}],
    "interests": [],
    "behaviors": [],
    "estimatedSize": 12000,
    "aiExplanation": "People who visited website but didn't convert..."
  }
]`;

  const message = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.choices[0].message.content || "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
}

export async function generateOffersWithAI(
  business: Record<string, unknown>,
  analysis: AIAnalysis
): Promise<Array<{
  headline: string;
  subheadline: string;
  usp: string;
  hook: string;
  body: string;
  cta: string;
  painPoints: string[];
  emotionalTriggers: string[];
  urgencyTriggers: string[];
  scarcityTriggers: string[];
  score: number;
}>> {
  const prompt = `You are a world-class direct response copywriter.

Create 3 powerful offers for this business:

BUSINESS: ${JSON.stringify(business)}
CUSTOMER PSYCHOLOGY: ${JSON.stringify(analysis.customerPsychology)}
POSITIONING: ${JSON.stringify(analysis.positioning)}

Return ONLY valid JSON array. Each offer must be emotional, specific, and include urgency:
[
  {
    "headline": "Get [specific result] in [timeframe] — [guarantee]",
    "subheadline": "Supporting statement",
    "usp": "What makes this unique",
    "hook": "Opening line that stops the scroll",
    "body": "Full ad copy (3-5 sentences)",
    "cta": "Book free consultation today",
    "painPoints": ["pain1", "pain2"],
    "emotionalTriggers": ["trigger1", "trigger2"],
    "urgencyTriggers": ["Only 5 spots left this week"],
    "scarcityTriggers": ["Price increases on Monday"],
    "score": 8.5
  }
]`;

  const message = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.choices[0].message.content || "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
}

export async function generateCreativesWithAI(
  offer: Record<string, unknown>,
  audience: Record<string, unknown>,
  platform: string,
  format: string
): Promise<{
  headline: string;
  primaryText: string;
  description: string;
  cta: string;
  hook: string;
  script?: string;
  bannerIdeas?: string[];
  hashtags?: string[];
}> {
  const formatGuides: Record<string, string> = {
    IMAGE: "Static image ad. Primary text 125 chars. Headline 40 chars. Hook stops scroll instantly.",
    VIDEO: "15-30 second video. Script with hook (0-3s), problem (3-8s), solution (8-20s), CTA (20-30s).",
    STORY: "Vertical 9:16 format. 15 seconds. Fast-paced. Strong visual hook first frame.",
    REEL: "TikTok-style vertical video. Trending format. Hook in first 1 second. Natural UGC feel.",
    CAROUSEL: "3-5 cards. Each card has its own benefit. Last card is CTA.",
    UGC: "User-generated content style. Authentic. First person. Relatable problem→solution.",
  };

  const prompt = `Create a ${platform} ${format} ad creative.

FORMAT GUIDE: ${formatGuides[format] || format}
OFFER: ${JSON.stringify(offer)}
AUDIENCE: ${JSON.stringify(audience)}

Return ONLY valid JSON:
{
  "headline": "40 char max headline",
  "primaryText": "Main ad copy (125 chars for feed, longer for stories)",
  "description": "Supporting description",
  "cta": "LEARN_MORE",
  "hook": "First words/visual that stops scroll",
  "script": "Full video/story/reel script with timestamps",
  "bannerIdeas": ["Visual idea 1", "Visual idea 2"],
  "hashtags": ["#hashtag1", "#hashtag2"]
}`;

  const message = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.choices[0].message.content || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI creative generation failed");
  return JSON.parse(jsonMatch[0]);
}
