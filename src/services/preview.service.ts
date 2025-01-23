import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '@/config/appwrite';
import { Preview } from '@/types/database';

export const previewService = {
  async getPreviews(campaignIds: string[]): Promise<Preview[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PREVIEWS,
        [Query.equal('campaign_id', campaignIds)]
      );
      return response.documents as Preview[];
    } catch (error) {
      console.error('Error fetching previews:', error);
      throw error;
    }
  },

  async deletePreviewsByCampaignId(campaignId: string): Promise<void> {
    try {
      const previews = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PREVIEWS,
        [Query.equal('campaign_id', campaignId)]
      );

      await Promise.all(
        previews.documents.map((preview) =>
          databases.deleteDocument(DATABASE_ID, COLLECTIONS.PREVIEWS, preview.$id)
        )
      );
    } catch (error) {
      console.error('Error deleting previews:', error);
      throw error;
    }
  }
};