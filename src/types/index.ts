export interface MetaInsights {
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  cpm: number;
  ctr: number;
  cpc: number;
  leads: number;
  purchases: number;
  purchase_roas: number;
  frequency: number;
  date_start: string;
  date_stop: string;
}

export interface MetaCampaignPayload {
  name: string;
  objective: string;
  status: "ACTIVE" | "PAUSED";
  special_ad_categories: string[];
}

export interface MetaAdSetPayload {
  name: string;
  campaign_id: string;
  daily_budget: number;
  billing_event: string;
  optimization_goal: string;
  targeting: MetaTargeting;
  status: "ACTIVE" | "PAUSED";
  promoted_object?: Record<string, string>;
}

export interface MetaTargeting {
  age_min: number;
  age_max: number;
  genders?: number[];
  geo_locations: {
    countries?: string[];
    cities?: Array<{ key: string; radius: number; distance_unit: string }>;
  };
  interests?: Array<{ id: string; name: string }>;
  behaviors?: Array<{ id: string; name: string }>;
  custom_audiences?: Array<{ id: string }>;
  excluded_custom_audiences?: Array<{ id: string }>;
  publisher_platforms?: string[];
  facebook_positions?: string[];
  instagram_positions?: string[];
}

export interface MetaAdPayload {
  name: string;
  adset_id: string;
  creative: { creative_id: string };
  status: "ACTIVE" | "PAUSED";
}

export interface MetaCreativePayload {
  name: string;
  object_story_spec: {
    page_id: string;
    link_data?: {
      link: string;
      message: string;
      name: string;
      description?: string;
      call_to_action: { type: string; value?: { link: string } };
      image_hash?: string;
    };
    video_data?: {
      video_id: string;
      title: string;
      message: string;
      call_to_action: { type: string; value?: { link: string } };
    };
  };
}

export interface OptimizationRule {
  metric: keyof MetaInsights;
  operator: ">" | "<" | ">=" | "<=";
  threshold: number;
  action: string;
  description: string;
}

export interface AIAnalysis {
  marketAnalysis: {
    marketSize: string;
    demand: string;
    competition: string;
    opportunity: string;
    trends: string[];
  };
  customerPsychology: {
    emotions: string[];
    objections: string[];
    triggers: string[];
    journey: string;
  };
  positioning: {
    usp: string;
    differentiation: string;
    pricePositioning: string;
  };
  strategy: {
    funnel: string;
    channels: string[];
    budgetDistribution: Record<string, number>;
    timeline: string;
    estimatedLeads: number;
    estimatedCPL: number;
    estimatedROI: number;
  };
  risks: string[];
}

export interface CronJobResult {
  success: boolean;
  processed: number;
  errors: string[];
  timestamp: string;
}
