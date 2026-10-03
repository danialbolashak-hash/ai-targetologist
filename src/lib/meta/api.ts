import type {
  MetaCampaignPayload,
  MetaAdSetPayload,
  MetaAdPayload,
  MetaCreativePayload,
  MetaInsights,
} from "@/types";

const API_VERSION = "v25.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;

async function metaFetch<T>(
  path: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  accessToken?: string
): Promise<T> {
  const token = accessToken || process.env.META_SYSTEM_TOKEN!;
  const url = `${BASE}${path}`;

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body
      ? JSON.stringify({ ...body, access_token: token })
      : undefined,
  });

  if (method === "GET") {
    const finalUrl = new URL(url);
    finalUrl.searchParams.set("access_token", token);
    const getRes = await fetch(finalUrl.toString());
    if (!getRes.ok) {
      const err = await getRes.json();
      throw new Error(`Meta API error: ${err.error?.message || getRes.statusText}`);
    }
    return getRes.json() as T;
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Meta API error: ${err.error?.message || res.statusText}`);
  }
  return res.json() as T;
}

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

export async function createCampaign(
  adAccountId: string,
  payload: MetaCampaignPayload,
  accessToken: string
): Promise<{ id: string }> {
  return metaFetch<{ id: string }>(
    `/${adAccountId}/campaigns`,
    "POST",
    payload as unknown as Record<string, unknown>,
    accessToken
  );
}

export async function updateCampaignStatus(
  campaignId: string,
  status: "ACTIVE" | "PAUSED" | "DELETED",
  accessToken: string
): Promise<{ success: boolean }> {
  return metaFetch<{ success: boolean }>(
    `/${campaignId}`,
    "POST",
    { status },
    accessToken
  );
}

export async function getCampaign(
  campaignId: string,
  accessToken: string
): Promise<{ id: string; name: string; status: string; objective: string }> {
  const url = new URL(`${BASE}/${campaignId}`);
  url.searchParams.set("fields", "id,name,status,objective");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to get campaign");
  return res.json();
}

// ─── AD SETS ──────────────────────────────────────────────────────────────────

export async function createAdSet(
  adAccountId: string,
  payload: MetaAdSetPayload,
  accessToken: string
): Promise<{ id: string }> {
  return metaFetch<{ id: string }>(
    `/${adAccountId}/adsets`,
    "POST",
    payload as unknown as Record<string, unknown>,
    accessToken
  );
}

export async function updateAdSet(
  adSetId: string,
  updates: Partial<MetaAdSetPayload>,
  accessToken: string
): Promise<{ success: boolean }> {
  return metaFetch<{ success: boolean }>(
    `/${adSetId}`,
    "POST",
    updates as unknown as Record<string, unknown>,
    accessToken
  );
}

export async function duplicateAdSet(
  adSetId: string,
  campaignId: string,
  accessToken: string
): Promise<{ copied_adset_id: string }> {
  return metaFetch<{ copied_adset_id: string }>(
    `/${adSetId}/copies`,
    "POST",
    { campaign_id: campaignId, rename_options: { rename_strategy: "ONLY_NAME", rename_prefix: "Winner - " } },
    accessToken
  );
}

// ─── ADS ──────────────────────────────────────────────────────────────────────

export async function createAd(
  adAccountId: string,
  payload: MetaAdPayload,
  accessToken: string
): Promise<{ id: string }> {
  return metaFetch<{ id: string }>(
    `/${adAccountId}/ads`,
    "POST",
    payload as unknown as Record<string, unknown>,
    accessToken
  );
}

export async function updateAdStatus(
  adId: string,
  status: "ACTIVE" | "PAUSED" | "DELETED",
  accessToken: string
): Promise<{ success: boolean }> {
  return metaFetch<{ success: boolean }>(
    `/${adId}`,
    "POST",
    { status },
    accessToken
  );
}

// ─── CREATIVES ────────────────────────────────────────────────────────────────

export async function createAdCreative(
  adAccountId: string,
  payload: MetaCreativePayload,
  accessToken: string
): Promise<{ id: string }> {
  return metaFetch<{ id: string }>(
    `/${adAccountId}/adcreatives`,
    "POST",
    payload as unknown as Record<string, unknown>,
    accessToken
  );
}

export async function uploadAdImage(
  adAccountId: string,
  imageUrl: string,
  accessToken: string
): Promise<{ images: Record<string, { hash: string }> }> {
  return metaFetch<{ images: Record<string, { hash: string }> }>(
    `/${adAccountId}/adimages`,
    "POST",
    { url: imageUrl },
    accessToken
  );
}

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────

export async function getCampaignInsights(
  campaignId: string,
  accessToken: string,
  datePreset: string = "last_7d"
): Promise<MetaInsights[]> {
  const url = new URL(`${BASE}/${campaignId}/insights`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("date_preset", datePreset);
  url.searchParams.set(
    "fields",
    "spend,impressions,clicks,reach,cpm,ctr,cpc,actions,purchase_roas,frequency,date_start,date_stop"
  );

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to get insights");
  const data = await res.json();

  return (data.data || []).map((row: Record<string, unknown>) => {
    const actions = (row.actions as Array<{ action_type: string; value: string }>) || [];
    const leads = actions.find((a) => a.action_type === "lead")?.value || "0";
    const purchases = actions.find((a) => a.action_type === "purchase")?.value || "0";

    return {
      spend: parseFloat(row.spend as string || "0"),
      impressions: parseInt(row.impressions as string || "0"),
      clicks: parseInt(row.clicks as string || "0"),
      reach: parseInt(row.reach as string || "0"),
      cpm: parseFloat(row.cpm as string || "0"),
      ctr: parseFloat(row.ctr as string || "0"),
      cpc: parseFloat(row.cpc as string || "0"),
      leads: parseInt(leads),
      purchases: parseInt(purchases),
      purchase_roas: parseFloat(
        ((row.purchase_roas as Array<{ value: string }>)?.[0]?.value) || "0"
      ),
      frequency: parseFloat(row.frequency as string || "0"),
      date_start: row.date_start as string,
      date_stop: row.date_stop as string,
    } as MetaInsights;
  });
}

export async function getAdSetInsights(
  adSetId: string,
  accessToken: string,
  datePreset: string = "last_7d"
): Promise<MetaInsights[]> {
  return getCampaignInsights(adSetId, accessToken, datePreset);
}

export async function getAccountInsights(
  adAccountId: string,
  accessToken: string,
  since: string,
  until: string
): Promise<MetaInsights[]> {
  const url = new URL(`${BASE}/${adAccountId}/insights`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("time_range", JSON.stringify({ since, until }));
  url.searchParams.set("time_increment", "1");
  url.searchParams.set(
    "fields",
    "spend,impressions,clicks,reach,cpm,ctr,cpc,actions,purchase_roas,frequency,date_start,date_stop"
  );

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to get account insights");
  const data = await res.json();
  return data.data || [];
}

// ─── CUSTOM AUDIENCES ─────────────────────────────────────────────────────────

export async function createLookalikeAudience(
  adAccountId: string,
  sourceAudienceId: string,
  country: string,
  ratio: number,
  accessToken: string
): Promise<{ id: string }> {
  return metaFetch<{ id: string }>(
    `/${adAccountId}/customaudiences`,
    "POST",
    {
      name: `Lookalike ${ratio * 100}% - ${country}`,
      subtype: "LOOKALIKE",
      origin_audience_id: sourceAudienceId,
      lookalike_spec: {
        type: "similarity",
        ratio,
        country,
      },
    },
    accessToken
  );
}

// ─── BUDGET MANAGEMENT ────────────────────────────────────────────────────────

export async function updateCampaignBudget(
  campaignId: string,
  dailyBudget: number,
  accessToken: string
): Promise<{ success: boolean }> {
  // Budget in cents
  return metaFetch<{ success: boolean }>(
    `/${campaignId}`,
    "POST",
    { daily_budget: Math.round(dailyBudget * 100) },
    accessToken
  );
}

export async function updateAdSetBudget(
  adSetId: string,
  dailyBudget: number,
  accessToken: string
): Promise<{ success: boolean }> {
  return metaFetch<{ success: boolean }>(
    `/${adSetId}`,
    "POST",
    { daily_budget: Math.round(dailyBudget * 100) },
    accessToken
  );
}
