export interface User {
  $id: string;
  email: string;
}

export interface Campaign {
  $id: string;
  user_id: string;
  customers: string[];
  campaign_name: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: 'active' | 'paused' | 'completed' | 'onboarded';
  campaign_type: string;
  ad_type: 'in-app' | 'web-contextual' | 'd-ooh' | 'ar-vr';
  ad_platform: string;
  target_type: string;
  target_kpi: string;
  target_event: string;
  targeting: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Customer {
  $id: string;
  user_id: string;
  email: string;
  name: string;
  organisation_name: string;
  designation: string;
  website_app_link: string;
}

export interface CampaignPerformance {
  $id: string;
  campaign_id: string;
  month: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_rate: number;
  spend: number;
  ad_type: 'in-app' | 'web-contextual' | 'd-ooh' | 'ar-vr';
}

export interface Preview {
  $id: string;
  campaign_id: string;
  mobile_app_preview: string;
  website_preview: string;
  digital_outdoor_preview: string;
  wearables_ar_vr_preview: string;
}