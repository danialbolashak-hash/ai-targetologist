import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getMetaUser,
  verifyPermissions,
  getAdAccounts,
  getPages,
  getPixels,
} from "@/lib/meta/oauth";
import { prisma } from "@/lib/prisma";
import { encrypt, safeEqual } from "@/lib/crypto";
import { audit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";

const REQUIRED_PERMISSIONS = [
  "ads_management",
  "ads_read",
  "business_management",
  "pages_read_engagement",
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/facebook?error=${encodeURIComponent(searchParams.get("error_description") || error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/facebook?error=missing_params`
    );
  }

  try {
    // SECURITY: verify HMAC signature of state to prevent CSRF / forged userId
    const outer = JSON.parse(Buffer.from(state, "base64url").toString());
    const expectedSig = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET || "fallback")
      .update(outer.payload)
      .digest("hex");
    if (!outer.sig || !safeEqual(outer.sig, expectedSig)) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings/facebook?error=invalid_state`);
    }
    const stateData = JSON.parse(outer.payload);
    const { userId, ts } = stateData;
    // State expires after 10 minutes
    if (!ts || Date.now() - ts > 10 * 60 * 1000) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings/facebook?error=state_expired`);
    }

    // Exchange code for short-lived token
    const shortToken = await exchangeCodeForToken(code);

    // Exchange for long-lived token (60 days)
    const longToken = await getLongLivedToken(shortToken.access_token);
    const tokenExpiresAt = new Date(Date.now() + longToken.expires_in * 1000);

    // Get Meta user info
    const fbUser = await getMetaUser(longToken.access_token);

    // Verify permissions
    const permissions = await verifyPermissions(longToken.access_token, fbUser.id);
    const missingPerms = REQUIRED_PERMISSIONS.filter(
      (p) => permissions[p] !== "granted"
    );

    if (missingPerms.length > 0) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/facebook?error=missing_permissions&missing=${missingPerms.join(",")}`
      );
    }

    // Save or update Facebook account
    const fbAccount = await prisma.facebookAccount.upsert({
      where: { fbUserId: fbUser.id },
      create: {
        userId,
        fbUserId: fbUser.id,
        name: fbUser.name,
        email: fbUser.email,
        accessToken: encrypt(longToken.access_token), // encrypted at rest (AES-256-GCM)
        tokenExpiresAt,
        isConnected: true,
      },
      update: {
        accessToken: encrypt(longToken.access_token),
        tokenExpiresAt,
        isConnected: true,
        name: fbUser.name,
      },
    });

    // Fetch and save ad accounts
    const adAccounts = await getAdAccounts(longToken.access_token);
    for (const account of adAccounts) {
      if (account.account_status !== 1) continue; // Skip disabled accounts

      // Get pages for this account
      const pages = await getPages(longToken.access_token);
      const firstPage = pages[0];

      // Get pixels
      const pixels = firstPage
        ? await getPixels(`act_${account.id.replace("act_", "")}`, longToken.access_token)
        : [];

      await prisma.adAccount.upsert({
        where: { fbAdAccountId: account.id },
        create: {
          facebookAccountId: fbAccount.id,
          fbAdAccountId: account.id,
          name: account.name,
          currency: account.currency,
          timezone: account.timezone_name,
          businessId: account.business?.id,
          pageId: firstPage?.id,
          pageAccessToken: firstPage?.access_token,
          instagramId: firstPage?.instagram_business_account?.id,
          pixelId: pixels[0]?.id,
          status: "ACTIVE",
          permissions: REQUIRED_PERMISSIONS,
        },
        update: {
          name: account.name,
          pageId: firstPage?.id,
          pageAccessToken: firstPage?.access_token,
          pixelId: pixels[0]?.id,
        },
      });
    }

    await audit({
      userId,
      action: "facebook.connect",
      resource: fbAccount.id,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      meta: { accounts: adAccounts.length },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/facebook?success=true&accounts=${adAccounts.length}`
    );
  } catch (err) {
    console.error("Meta OAuth callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/facebook?error=callback_failed`
    );
  }
}
