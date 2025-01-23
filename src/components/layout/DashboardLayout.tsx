import { useLocation } from 'react-router-dom';
import { NewtonAgent } from '@/components/dashboard/NewtonAgent';
import { CampaignMetrics } from '@/components/dashboard/CampaignMetrics';
import { PreviewSection } from '@/components/preview/PreviewSection';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { CampaignList } from '@/components/dashboard/CampaignList';
import { Loader2 } from 'lucide-react';
import { Campaign } from '@/types/database';
import { campaignService } from '@/services/campaign.service';

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const selectedCampaignId = location.state?.campaignId;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  useEffect(() => {
    if (user && location.pathname === '/analytics') {
      loadCampaigns();
    }
  }, [user, location.pathname]);

  const loadCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const campaignsData = await campaignService.getCampaigns(user!.$id);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (location.pathname) {
      case '/newton-ai-agent':
        return <NewtonAgent />;
      
      case '/analytics':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Campaign Metrics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Campaign Analytics</h2>
              {loadingCampaigns ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : campaigns.length > 0 ? (
                <CampaignMetrics campaigns={campaigns} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No campaigns available to analyze</p>
                </div>
              )}
            </div>

            {/* Campaign List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">All Campaigns</h2>
              <CampaignList
                userId={user.$id}
                onSelect={() => {}}
                view="table"
              />
            </div>
          </div>
        );
      
      case '/preview':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Campaigns</h2>
                  <CampaignList
                    userId={user.$id}
                    onSelect={() => {}}
                    view="cards"
                    selectedId={selectedCampaignId}
                  />
                </div>
              </div>
              <div className="lg:col-span-3">
                <PreviewSection selectedCampaignId={selectedCampaignId} />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderContent();
}