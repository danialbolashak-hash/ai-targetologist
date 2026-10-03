const META_API_VERSION = "v25.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const META_DIALOG_URL = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth`;

// Minimal scopes that work in Development mode without App Review.
// Advanced scopes (instagram_basic, leads_retrieval, pages_manage_ads,
// instagram_manage_insights) require Facebook App Review — add them back
// after your app is approved.
export const META_PERMISSIONS = [
  "ads_management",
  "ads_read",
  "business_management",
  "pages_show_list",
  "pages_read_engagement",
  "public_profile",
].join(",");

export function getMetaAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope: META_PERMISSIONS,
    response_type: "code",
    state,
  });
  return `${META_DIALOG_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in?: number;
}> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    code,
  });

  const res = await fetch(`${META_GRAPH_URL}/oauth/access_token?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Meta OAuth error: ${err.error?.message || "Unknown"}`);
  }
  return res.json();
}

export async function getLongLivedToken(shortToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortToken,
  });

  const res = await fetch(`${META_GRAPH_URL}/oauth/access_token?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Long-lived token error: ${err.error?.message}`);
  }
  return res.json();
}

export async function getMetaUser(accessToken: string): Promise<{
  id: string;
  name: string;
  email?: string;
}> {
  const res = await fetch(
    `${META_GRAPH_URL}/me?fields=id,name,email&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Failed to fetch Meta user");
  return res.json();
}

export async function verifyPermissions(
  accessToken: string,
  userId: string
): Promise<Record<string, "granted" | "declined">> {
  const res = await fetch(
    `${META_GRAPH_URL}/${userId}/permissions?access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Failed to verify permissions");
  const data = await res.json();

  return data.data.reduce(
    (acc: Record<string, "granted" | "declined">, p: { permission: string; status: string }) => {
      acc[p.permission] = p.status as "granted" | "declined";
      return acc;
    },
    {}
  );
}

export async function getAdAccounts(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  business?: { id: string; name: string };
}>> {
  const res = await fetch(
    `${META_GRAPH_URL}/me/adaccounts?fields=id,name,account_status,currency,timezone_name,business&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Failed to fetch ad accounts");
  const data = await res.json();
  return data.data || [];
}

export async function getPages(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}>> {
  const res = await fetch(
    `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Failed to fetch pages");
  const data = await res.json();
  return data.data || [];
}

export async function getPixels(
  adAccountId: string,
  accessToken: string
): Promise<Array<{ id: string; name: string; code: string }>> {
  const res = await fetch(
    `${META_GRAPH_URL}/${adAccountId}/adspixels?fields=id,name,code&access_token=${accessToken}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}
