import { Client, Account, Databases } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const COLLECTIONS = {
  CUSTOMERS: import.meta.env.VITE_APPWRITE_COLLECTION_CUSTOMERS,
  PREVIEWS: import.meta.env.VITE_APPWRITE_COLLECTION_PREVIEWS,
  CHAT_LOGS: import.meta.env.VITE_APPWRITE_COLLECTION_CHAT_LOGS,
  CAMPAIGN_PERFORMANCE: import.meta.env.VITE_APPWRITE_COLLECTION_CAMPAIGN_PERFORMANCE,
  CAMPAIGNS: import.meta.env.VITE_APPWRITE_COLLECTION_CAMPAIGNS
};

// Add error handling wrapper
export const handleAppwriteError = (error: any) => {
  if (error?.code === 401) {
    return 'Authentication failed. Please sign in again.';
  }
  if (error?.code === 409) {
    return 'Account already exists';
  }
  if (error?.code === 400) {
    return 'Invalid request. Please check your input.';
  }
  return 'An unexpected error occurred. Please try again.';
};

export { client };