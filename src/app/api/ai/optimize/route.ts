import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireApiUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { error } = await requireApiUser();
  if (error) return error;
  const limited = rateLimit(`ai-optimize:${getClientIp(req)}`, 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { campaigns } = body;

    const prompt = `
Ты — senior media buyer. Проанализируй показатели рекламных кампаний и дай конкретные рекомендации.

КАМПАНИИ:
${JSON.stringify(campaigns, null, 2)}

Бенчмарки (средние по рынку):
- CTR хороший: > 2%, плохой: < 1%
- CPM нормальный: < $150, высокий: > $200
- Frequency: нормальная < 2.5, высокая > 3.5
- ROAS хороший: > 4x, плохой: < 2x

Для каждой кампании определи проблемы и дай рекомендации.

Верни JSON:
{
  "recommendations": [
    {
      "campaignId": "id",
      "campaignName": "название",
      "type": "CREATIVE|AUDIENCE|BUDGET|OFFER|SCALING",
      "priority": "HIGH|MEDIUM|LOW",
      "title": "краткий заголовок проблемы/возможности",
      "description": "детальное объяснение",
      "action": "конкретное действие",
      "projectedImprovement": "прогноз улучшения"
    }
  ],
  "summary": "общий вывод по всем кампаниям"
}`;

    const message = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.choices[0].message.content;
    if (!content) throw new Error("Unexpected response type");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Optimization error:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка оптимизации" },
      { status: 500 }
    );
  }
}
