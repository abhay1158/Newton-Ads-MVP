import { useState, useEffect } from 'react';
import { Preview, Campaign } from '@/types/database';
import { previewService } from '@/services/preview.service';
import { campaignService } from '@/services/campaign.service';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface PreviewSectionProps {
  selectedCampaignId?: string;
}

interface PreviewCategory {
  title: string;
  key: keyof Preview;
  description: string;
  icon: string;
}

const PREVIEW_CATEGORIES: PreviewCategory[] = [
  {
    title: 'Mobile App',
    key: 'mobile_app_preview',
    description: 'Preview how your ad will appear in mobile applications',
    icon: '📱'
  },
  {
    title: 'Website',
    key: 'website_preview',
    description: 'See how your ad looks on websites',
    icon: '🌐'
  },
  {
    title: 'Digital Outdoor',
    key: 'digital_outdoor_preview',
    description: 'View your ad on digital outdoor displays',
    icon: '🏙️'
  },
  {
    title: 'Wearables & AR/VR',
    key: 'wearables_ar_vr_preview',
    description: 'Experience your ad in augmented and virtual reality',
    icon: '🥽'
  },
];

export function PreviewSection({ selectedCampaignId }: PreviewSectionProps) {
  const { user } = useAuth();
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [orderedCategories, setOrderedCategories] = useState<PreviewCategory[]>([]);

  const minSwipeDistance = 50;

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedCampaignId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const campaignsData = await campaignService.getCampaigns(user!.$id);
      setCampaigns(campaignsData);

      const campaignIds = selectedCampaignId 
        ? [selectedCampaignId]
        : campaignsData.map(campaign => campaign.$id);
      
      const previewsData = await previewService.getPreviews(campaignIds);
      setPreviews(previewsData);
      setCurrentIndexes({});

      // Order categories based on preview availability
      const categoriesWithPreviews = PREVIEW_CATEGORIES.map(category => ({
        category,
        hasPreview: previewsData.some(preview => preview[category.key]),
      }));

      const ordered = [
        ...categoriesWithPreviews.filter(c => c.hasPreview).map(c => c.category),
        ...categoriesWithPreviews.filter(c => !c.hasPreview).map(c => c.category),
      ];

      setOrderedCategories(ordered);
    } catch (error) {
      console.error('Error loading preview data:', error);
      setError('Failed to load previews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (categoryKey: string, maxIndex: number) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext(categoryKey, maxIndex);
    }
    if (isRightSwipe) {
      handlePrevious(categoryKey);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handlePrevious = (categoryKey: string) => {
    setCurrentIndexes(prev => ({
      ...prev,
      [categoryKey]: Math.max(0, (prev[categoryKey] || 0) - 1),
    }));
  };

  const handleNext = (categoryKey: string, maxIndex: number) => {
    setCurrentIndexes(prev => ({
      ...prev,
      [categoryKey]: Math.min(maxIndex, (prev[categoryKey] || 0) + 1),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadData}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (previews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No previews available
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orderedCategories.map(({ title, key, description, icon }) => {
        const urls = previews
          .map(preview => preview[key])
          .filter(Boolean) as string[];

        const currentIndex = currentIndexes[key] || 0;

        return (
          <div 
            key={key} 
            className={`bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl ${
              urls.length === 0 ? 'opacity-50' : ''
            }`}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-xl font-semibold">{title}</h3>
              </div>
              <p className="text-gray-500">{description}</p>
            </div>

            <div className="relative group">
              {urls.length > 0 ? (
                <div 
                  className="aspect-video relative overflow-hidden bg-gray-100"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(key, urls.length - 1)}
                >
                  <img
                    src={urls[currentIndex]}
                    alt={`${title} preview`}
                    className="w-full h-full object-contain transition-transform duration-300 ease-out"
                    style={{
                      transform: touchEnd && touchStart 
                        ? `translateX(${touchEnd - touchStart}px)`
                        : undefined
                    }}
                  />
                  
                  {urls.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrevious(key)}
                        disabled={currentIndex === 0}
                        className="bg-black/50 hover:bg-black/70 text-white transform transition-transform duration-300 hover:scale-110"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNext(key, urls.length - 1)}
                        disabled={currentIndex === urls.length - 1}
                        className="bg-black/50 hover:bg-black/70 text-white transform transition-transform duration-300 hover:scale-110"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {urls.length}
                  </div>

                  {urls.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {urls.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                            index === currentIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 flex items-center justify-center text-gray-400">
                  <p>No preview available for {title.toLowerCase()}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 text-sm text-gray-600">
                {urls.length > 0 ? (
                  <p>
                    From campaign:{' '}
                    <span className="font-medium text-gray-900">
                      {campaigns.find(c => 
                        previews.find(p => p[key] === urls[currentIndex])?.campaign_id === c.$id
                      )?.campaign_name || 'Unknown Campaign'}
                    </span>
                  </p>
                ) : (
                  <p>No campaign associated with this preview type</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}