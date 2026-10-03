import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireApiUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { error } = await requireApiUser();
  if (error) return error;
  const limited = rateLimit(`ai-creative:${getClientIp(req)}`, 15);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { type, platform, audience, offer, niche, product } = body;

    const platformGuide: Record<string, string> = {
      META: "Facebook/Instagram Ads. Текст до 125 символов для primary text, headline до 40 символов.",
      TIKTOK: "TikTok Ads. Хук в первые 3 секунды. Неформальный тон. Тренды. UGC стиль.",
      GOOGLE: "Google Ads. Keywords в заголовке. Benefit-oriented. CTA в описании.",
    };

    const typeGuide: Record<string, string> = {
      IMAGE: "Рекламный текст для статичного изображения",
      VIDEO: "Сценарий для видеорекламы с хуком, телом и призывом",
      STORY: "Контент для Stories — вертикальный формат, 15 секунд",
      REEL: "Сценарий для Reels/TikTok — трендовый формат",
      UGC: "Скрипт для UGC контента — естественный, от первого лица",
    };

    const prompt = `
Ты — топовый рекламный копирайтер.

Создай рекламный креатив:

Тип: ${typeGuide[type] || type}
Платформа: ${platformGuide[platform] || platform}
Аудитория: ${audience}
Ниша: ${niche}
Продукт: ${product}
Оффер: ${offer}

Верни JSON:
{
  "headline": "заголовок (до 40 символов)",
  "body": "основной текст рекламы",
  "cta": "призыв к действию",
  "hook": "хук (первые 3 секунды / первые слова)",
  "script": "полный сценарий (для видео/reels/ugc)",
  "hashtags": ["хештег1", "хештег2"],
  "notes": "советы по визуалу"
}`;

    const message = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.choices[0].message.content;
    if (!content) throw new Error("Unexpected response type");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const creative = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: creative });
  } catch (error) {
    console.error("Creative generation error:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка генерации" },
      { status: 500 }
    );
  }
}
