import { useEffect, useState } from 'react';
import { Campaign, CampaignPerformance } from '@/types/database';
import { campaignService } from '@/services/campaign.service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Surface,
  Symbols,
} from 'recharts';
import { Loader2, Smartphone, Globe2, Glasses, MapPin } from 'lucide-react';

interface CampaignMetricsProps {
  campaigns: Campaign[];
}

const AD_TYPES = {
  'in-app': {
    color: '#4F46E5',
    name: 'In-App Advertising',
    icon: Smartphone,
    bgColor: 'bg-[#4F46E5]'
  },
  'web-contextual': {
    color: '#9333EA',
    name: 'Web-Contextual Ads',
    icon: Globe2,
    bgColor: 'bg-[#9333EA]'
  },
  'ar-vr': {
    color: '#10B981',
    name: 'Wearables & AR/VR',
    icon: Glasses,
    bgColor: 'bg-[#10B981]'
  },
  'd-ooh': {
    color: '#F97316',
    name: 'D-OOH',
    icon: MapPin,
    bgColor: 'bg-[#F97316]'
  }
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-6 justify-center mt-4">
      {payload.map((entry: any, index: number) => (
        <div
          key={`item-${index}`}
          className="flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-110"
        >
          <Surface width={16} height={16}>
            <Symbols
              cx={8}
              cy={8}
              type="circle"
              size={50}
              fill={entry.color}
            />
          </Surface>
          <span className="text-sm font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 animate-fadeIn">
        <p className="text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Helper function to parse and sort months
const sortMonths = (data: any[]) => {
  return data.sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });
};

// Helper function to format month for display
const formatMonth = (month: string) => {
  const date = new Date(month);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export function CampaignMetrics({ campaigns }: CampaignMetricsProps) {
  const [performance, setPerformance] = useState<CampaignPerformance[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaigns.length > 0) {
      loadData();
    }
  }, [campaigns]);

  const loadData = async () => {
    try {
      const campaignIds = campaigns.map(c => c.$id);
      const [performanceData, aggregated] = await Promise.all([
        campaignService.getCampaignPerformance(campaignIds),
        campaignService.getAggregatedPerformance(campaignIds)
      ]);
      
      // Group and sort the data
      const groupedData = performanceData.reduce((acc: any[], curr) => {
        const monthData = acc.find(item => item.month === curr.month);
        if (monthData) {
          monthData[`${curr.ad_type}_impressions`] = curr.impressions;
        } else {
          acc.push({
            month: curr.month,
            [`${curr.ad_type}_impressions`]: curr.impressions
          });
        }
        return acc;
      }, []);

      // Sort the data by month
      const sortedData = sortMonths(groupedData);
      
      setPerformance(sortedData);
      setAggregatedData(aggregated);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(AD_TYPES).map(([type, { name, color, icon: Icon, bgColor }]) => {
          const data = aggregatedData?.[type];
          return (
            <div
              key={type}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className={`${bgColor} p-4 text-white flex items-center gap-2`}>
                <Icon className="h-5 w-5" />
                <span className="font-medium">{name}</span>
              </div>
              <div className="p-6">
                {data ? (
                  <div className="grid grid-cols-2 gap-4">
                    <MetricItem
                      label="Impressions"
                      value={data.impressions >= 1000000 
                        ? `${(data.impressions / 1000000).toFixed(1)}M`
                        : data.impressions >= 1000
                        ? `${(data.impressions / 1000).toFixed(1)}K`
                        : data.impressions.toString()
                      }
                    />
                    <MetricItem
                      label="Clicks"
                      value={data.clicks >= 1000
                        ? `${(data.clicks / 1000).toFixed(1)}K`
                        : data.clicks.toString()
                      }
                    />
                    <MetricItem
                      label="CR"
                      value={`${data.conversion_rate.toFixed(1)}%`}
                    />
                    <MetricItem
                      label="Conversions"
                      value={data.conversions >= 1000
                        ? `${(data.conversions / 1000).toFixed(1)}K`
                        : data.conversions.toString()
                      }
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No data available
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Performance Across Platform</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performance}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={formatMonth}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => value >= 1000000
                  ? `${(value / 1000000).toFixed(1)}M`
                  : value >= 1000
                  ? `${(value / 1000).toFixed(1)}K`
                  : value
                }
              />
              <Tooltip 
                content={<CustomTooltip />}
                animationDuration={200}
              />
              <Legend content={<CustomLegend />} />
              {Object.entries(AD_TYPES).map(([type, { name, color }]) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={`${type}_impressions`}
                  name={name}
                  stroke={color}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: color,
                    fill: 'white',
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: color,
                    fill: color,
                  }}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationBegin={0}
                  animationEasing="ease-in-out"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        {label}
      </p>
      <p className="text-xl font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}