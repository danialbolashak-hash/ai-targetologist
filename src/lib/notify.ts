import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

/**
 * Unified notification layer for the AI assistant.
 * Stores an in-app notification AND pushes to the user's channels
 * (Telegram now; SMS via Twilio when configured).
 */
export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  campaignId?: string;
  payload?: unknown;
  actionUrl?: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) return;

  // 1. In-app notification (always)
  const notif = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      campaignId: params.campaignId,
      payload: params.payload as object | undefined,
      actionUrl: params.actionUrl,
    },
  });

  const text = `🤖 *AI Таргетолог*\n\n*${params.title}*\n${params.body}` +
    (params.actionUrl ? `\n\n${process.env.NEXTAUTH_URL || ""}${params.actionUrl}` : "");

  // 2. Telegram
  if (user.notifyTelegram && user.telegramChatId) {
    const ok = await sendTelegram(user.telegramChatId, text);
    if (ok) await prisma.notification.update({ where: { id: notif.id }, data: { sentTg: true } });
  }

  // 3. SMS (Twilio) — optional, only if configured
  if (user.notifySms && user.phone) {
    const ok = await sendSms(user.phone, `${params.title}: ${params.body}`);
    if (ok) await prisma.notification.update({ where: { id: notif.id }, data: { sentSms: true } });
  }

  return notif;
}

/** Send a Telegram message via Bot API. Free. Requires TELEGRAM_BOT_TOKEN. */
export async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", disable_web_page_preview: true }),
    });
    return res.ok;
  } catch (e) {
    console.error("[telegram] send failed:", e);
    return false;
  }
}

/** Send an SMS via Twilio. Requires TWILIO_* env vars. No-op if not configured. */
export async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return false;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });
    return res.ok;
  } catch (e) {
    console.error("[sms] send failed:", e);
    return false;
  }
}
