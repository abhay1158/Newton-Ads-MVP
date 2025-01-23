import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '@/config/appwrite';
import { Campaign, CampaignPerformance } from '@/types/database';
import { previewService } from '@/services/preview.service';

export const campaignService = {
  async getCampaigns(userId: string): Promise<Campaign[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CAMPAIGNS,
        [Query.equal('user_id', userId)]
      );
      return response.documents as Campaign[];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  async getCampaignPerformance(campaignIds: string | string[]): Promise<CampaignPerformance[]> {
    try {
      const ids = Array.isArray(campaignIds) ? campaignIds : [campaignIds];
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CAMPAIGN_PERFORMANCE,
        [Query.equal('campaign_id', ids)]
      );
      return response.documents as CampaignPerformance[];
    } catch (error) {
      console.error('Error fetching campaign performance:', error);
      throw error;
    }
  },

  async getAggregatedPerformance(campaignIds: string[]): Promise<{
    [key: string]: {
      impressions: number;
      clicks: number;
      conversions: number;
      conversion_rate: number;
    };
  }> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CAMPAIGN_PERFORMANCE,
        [Query.equal('campaign_id', campaignIds)]
      );

      const performanceData = response.documents as CampaignPerformance[];
      
      // Group by ad_type and calculate metrics
      const aggregated = performanceData.reduce((acc, curr) => {
        if (!acc[curr.ad_type]) {
          acc[curr.ad_type] = {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            conversion_rates: [], // Store all conversion rates for averaging
            conversion_rate: 0,
          };
        }
        
        acc[curr.ad_type].impressions += curr.impressions;
        acc[curr.ad_type].clicks += curr.clicks;
        acc[curr.ad_type].conversions += curr.conversions;
        acc[curr.ad_type].conversion_rates.push(curr.conversion_rate);
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate average conversion rate for each ad_type
      Object.keys(aggregated).forEach(adType => {
        const rates = aggregated[adType].conversion_rates;
        aggregated[adType].conversion_rate = rates.length > 0
          ? rates.reduce((sum: number, rate: number) => sum + rate, 0) / rates.length
          : 0;
        delete aggregated[adType].conversion_rates; // Remove the temporary array
      });

      return aggregated;
    } catch (error) {
      console.error('Error fetching aggregated performance:', error);
      throw error;
    }
  },

  async createCampaign(data: Omit<Campaign, '$id' | '$createdAt' | '$updatedAt'>): Promise<Campaign> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CAMPAIGNS,
        ID.unique(),
        data
      );
      return response as Campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  async updateCampaignStatus(campaignId: string, status: Campaign['status']): Promise<Campaign> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CAMPAIGNS,
        campaignId,
        { status }
      );
      return response as Campaign;
    } catch (error) {
      console.error('Error updating campaign status:', error);
      throw error;
    }
  },

  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      await previewService.deletePreviewsByCampaignId(campaignId);
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.CAMPAIGNS,
        campaignId
      );
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }
};