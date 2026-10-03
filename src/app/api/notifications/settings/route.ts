import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { sendTelegram } from "@/lib/notify";

// GET current channel settings
export async function GET() {
  const { error, user } = await requireApiUser();
  if (error) return error;
  return NextResponse.json({
    telegramChatId: user.telegramChatId,
    phone: user.phone,
    notifyTelegram: user.notifyTelegram,
    notifySms: user.notifySms,
  });
}

// POST update channels (and send a test Telegram message if chatId provided)
export async function POST(req: NextRequest) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const { telegramChatId, phone, notifyTelegram, notifySms } = await req.json();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramChatId: telegramChatId ?? user.telegramChatId,
      phone: phone ?? user.phone,
      notifyTelegram: notifyTelegram ?? user.notifyTelegram,
      notifySms: notifySms ?? user.notifySms,
    },
  });

  // Send a test message so the user knows it works
  let testSent = false;
  if (telegramChatId) {
    testSent = await sendTelegram(
      telegramChatId,
      "✅ *AI Таргетолог подключён!*\nТеперь я буду присылать тебе уведомления, когда с рекламой что-то не так — и сразу новые креативы/офферы."
    );
  }

  return NextResponse.json({ ok: true, testSent });
}
