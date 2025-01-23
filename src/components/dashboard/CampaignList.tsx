import { useState, useEffect } from 'react';
import { Campaign, CampaignPerformance } from '@/types/database';
import { campaignService } from '@/services/campaign.service';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CampaignListProps {
  userId: string;
  onSelect: (campaign: Campaign | null) => void;
  view?: 'cards' | 'table';
  selectedId?: string;
}

export function CampaignList({ userId, onSelect, view = 'cards', selectedId }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [performance, setPerformance] = useState<Record<string, CampaignPerformance[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignsData = await campaignService.getCampaigns(userId);
      setCampaigns(campaignsData);

      // Load performance data for each campaign
      const performanceData: Record<string, CampaignPerformance[]> = {};
      await Promise.all(
        campaignsData.map(async (campaign) => {
          const data = await campaignService.getCampaignPerformance(campaign.$id);
          performanceData[campaign.$id] = data;
        })
      );
      setPerformance(performanceData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (campaignId: string) => {
    navigate(`/preview`, { state: { campaignId } });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyles = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'onboarded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
        {error}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={loadData}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No campaigns yet
        </h3>
        <p className="text-gray-500 mb-4">
          Create your first campaign to get started
        </p>
      </div>
    );
  }

  if (view === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Campaign Name & Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Campaign Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Total Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Target Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Target KPI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Target Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Targeting
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Deployed On
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campaigns.map((campaign) => {
              const campaignPerformance = performance[campaign.$id]?.[0] || null;
              return (
                <tr
                  key={campaign.$id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 whitespace-nowrap">{campaign.campaign_name}</span>
                      <span className="text-sm text-gray-500">{campaign.ad_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{campaign.campaign_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{formatDate(campaign.start_date)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{formatDate(campaign.end_date)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ${campaign.budget.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{campaign.target_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{campaign.target_kpi}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{campaign.target_event}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{campaign.targeting}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{campaign.ad_platform}</span>
                  </td>
                  <td className="px-6 py-4">
                    {campaignPerformance ? (
                      <div className="text-sm space-y-1">
                        <div className="text-gray-700 whitespace-nowrap">
                          Impressions: <span className="font-medium">{campaignPerformance.impressions.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-700 whitespace-nowrap">
                          Clicks: <span className="font-medium">{campaignPerformance.clicks.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-700 whitespace-nowrap">
                          CR: <span className="font-medium">{campaignPerformance.conversion_rate.toFixed(2)}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No data</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      
                      {campaign.status === 'paused' && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          Insufficient wallet fund, Please Add Fund
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePreview(campaign.$id)}
                      className="group relative"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Preview Ad
                      </span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <div
          key={campaign.$id}
          className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-300 cursor-pointer ${
            selectedId === campaign.$id ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
          onClick={() => onSelect(campaign)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{campaign.campaign_name}</h3>
              <p className="text-sm text-gray-500">
                Budget: ${campaign.budget.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Deployed On: {campaign.ad_platform}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <span className={`px-2 py-1 rounded text-sm ${getStatusStyles(campaign.status)}`}>
                  {campaign.status}
                </span>
                
                {campaign.status === 'paused' && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Insufficient wallet fund, Please Add Fund
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}