import { ID, Query, Models } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '@/config/appwrite';
import { Customer } from '@/types/database';

export const customerService = {
  async getCustomer(userId: string): Promise<Customer | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CUSTOMERS,
        [Query.equal('user_id', userId)]
      );
      
      if (response.documents.length === 0) {
        return null;
      }

      const document = response.documents[0];
      return {
        $id: document.$id,
        user_id: document.user_id,
        email: document.email,
        name: document.name,
        organisation_name: document.organisation_name,
        designation: document.designation,
        website_app_link: document.website_app_link,
        created_at: document.created_at,
        updated_at: document.updated_at
      } as Customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  },

  async upsertCustomer(data: Partial<Customer> & { user_id: string; email: string }): Promise<Customer> {
    try {
      const existing = await this.getCustomer(data.user_id);
      
      if (existing) {
        const response = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.CUSTOMERS,
          existing.$id,
          data
        );
        
        return {
          $id: response.$id,
          user_id: response.user_id,
          email: response.email,
          name: response.name,
          organisation_name: response.organisation_name,
          designation: response.designation,
          website_app_link: response.website_app_link,
          created_at: response.created_at,
          updated_at: response.updated_at
        } as Customer;
      }

      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CUSTOMERS,
        ID.unique(),
        {
          user_id: data.user_id,
          email: data.email,
          name: data.name || '',
          organisation_name: data.organisation_name || '',
          designation: data.designation || '',
          website_app_link: data.website_app_link || ''
        }
      );

      return {
        $id: response.$id,
        user_id: response.user_id,
        email: response.email,
        name: response.name,
        organisation_name: response.organisation_name,
        designation: response.designation,
        website_app_link: response.website_app_link,
        created_at: response.created_at,
        updated_at: response.updated_at
      } as Customer;
    } catch (error) {
      console.error('Error upserting customer:', error);
      throw error;
    }
  }
};