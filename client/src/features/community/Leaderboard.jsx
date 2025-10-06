import React, { useState, useEffect, useCallback } from 'react';
import { getleaderboard } from '../../lib/aggregation'; // Fetches all data now
import { Clock, TrendingUp, Tag, ChevronDown, Loader2 } from 'lucide-react';

// --- MOCK DATA & HELPERS ---

// Reusable Card Component (Simulated based on §12.3)
const Card = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-card-surface border border-soft rounded-xl shadow-card p-6 ${className}`}>
    <div className="mb-4">
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
    </div>
    {children}
  </div>
);

// Skeleton Loader
const TableSkeleton = () => (
  <div className="space-y-3 p-2">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-5 w-full bg-surface-muted animate-pulse rounded" />
    ))}
  </div>
);

// Time Formatter
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// --- Leaderboard Table Component (Unchanged) ---

const LeaderboardTable = ({ title, data, timeUnit, timeKey, accuracyKey, countKey }) => {
  const timeLabel = timeUnit || 'Total Time';
  const accuracyLabel = 'Avg. Accuracy';

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border-soft">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-text-secondary uppercase text-xs tracking-wide bg-surface-muted rounded-tl-lg">#</th>
            <th className="px-4 py-3 text-left text-text-secondary uppercase text-xs tracking-wide bg-surface-muted">Name</th>
            <th className="px-4 py-3 text-left text-text-secondary uppercase text-xs tracking-wide bg-surface-muted flex items-center gap-1">
              <TrendingUp size={14} /> {accuracyLabel}
            </th>
            <th className="px-4 py-3 text-left text-text-secondary uppercase text-xs tracking-wide bg-surface-muted flex items-center gap-1">
              <Clock size={14} /> {timeLabel}
            </th>
            {countKey && (
              <th className="px-4 py-3 text-left text-text-secondary uppercase text-xs tracking-wide bg-surface-muted rounded-tr-lg">
                Attempts
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-soft">
          {data.map((user, index) => (
            <tr key={user.name} className="hover:bg-surface-muted transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary font-medium">{index + 1}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary font-medium">{user.name}</td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${user[accuracyKey] >= 80 ? 'text-success-green' : 'text-text-primary'}`}>
                {user[accuracyKey].toFixed(2)}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                {formatTime(user[timeKey])}
              </td>
              {countKey && (
                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                  {user[countKey]}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


// --- Main Leaderboard Component ---

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('today');
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for dynamic Tag-Wise selection
  const [selectedTag, setSelectedTag] = useState(null);

  // 1. Initial fetch for ALL data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getleaderboard();
      setFullData(data);
      // Set the initial tag to the first available tag from the response
      if (data.tags && data.tags.length > 0) {
        setSelectedTag(data.tags[0]);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Could not load leaderboards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-error-red">Error</h2>
        <p className="text-error-red-dark mt-2">{error}</p>
      </div>
    );
  }

  const TabButton = ({ id, label }) => {
    const isActive = activeTab === id;
    const activeClasses = 'text-primary border-b-2 border-primary font-semibold';
    const inactiveClasses = 'text-text-secondary hover:text-text-primary hover:border-b-2 hover:border-border-soft transition-colors';

    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`pb-2 px-4 text-center text-base ${isActive ? activeClasses : inactiveClasses}`}
        aria-selected={isActive}
        role="tab"
      >
        {label}
      </button>
    );
  };

  // --- Tab Content Rendering ---

  const renderActiveTabContent = () => {
    if (loading || !fullData) {
      return (
        <Card title="Loading..." subtitle="Fetching top users..." className="w-full">
          <TableSkeleton />
        </Card>
      );
    }

    switch (activeTab) {
      case 'today':
        return (
          <LeaderboardTable
            title="Today's Top Performers"
            data={fullData.today || []}
            timeUnit="Total Time (Today)"
            timeKey="timeTakenSeconds"
            accuracyKey="accuracy"
            countKey="rcsAttempted"
          />
        );

      case 'monthly':
        return (
          <LeaderboardTable
            title="Monthly Champions"
            data={fullData.monthly || []}
            timeUnit="Total Time (Month)"
            timeKey="totalTimeSeconds"
            accuracyKey="averageAccuracy"
            countKey="attemptsCount"
          />
        );

      case 'tag':
        const currentTagData = fullData.tagLeaderboards?.[selectedTag] || [];
        const availableTags = fullData.tags || [];

        return (
          <>
            {/* Tag Selector Control */}
            <div className="flex items-center gap-3 mb-6">
              <Tag size={20} className="text-text-secondary" />
              <label htmlFor="tag-selector" className="text-text-primary font-medium sr-only">Select Topic:</label>
              <div className="relative">
                <select
                  id="tag-selector"
                  value={selectedTag || ''}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  // Input styling based on §12.6
                  className="appearance-none pr-8 py-2 pl-3 rounded-lg border border-soft bg-card-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-focus-ring transition disabled:opacity-50"
                >
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                  {availableTags.length === 0 && <option value="" disabled>No Tags Available</option>}
                </select>
                {/* Chevron icon for dropdown appearance */}
                <ChevronDown size={18} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-neutral-grey pointer-events-none" />
              </div>
            </div>

            {/* Tag-Wise Leaderboard Display */}
            <Card title={`Top Performers in: ${selectedTag || '...'}`} subtitle="Ranking based on cumulative performance in this topic.">
              {availableTags.length === 0 ? (
                <p className="text-text-secondary text-center py-4">No topics found for leaderboards.</p>
              ) : (
                <LeaderboardTable
                  data={currentTagData}
                  timeUnit="Total Time (Tag)"
                  timeKey="totalTimeSeconds"
                  accuracyKey="averageAccuracy"
                  countKey="attemptsCount"
                />
              )}
            </Card>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold text-text-primary">Global Leaderboards</h2>
      <p className="text-text-secondary mt-2 mb-8">
        See how you stack up against the competition across different timeframes and topics.
      </p>

      {/* Tabs Navigation */}
      <div className="border-b border-border-soft mb-8">
        <nav className="flex space-x-4" role="tablist">
          <TabButton id="today" label="Today's RC" />
          <TabButton id="monthly" label="Monthly" />
          <TabButton id="tag" label="Tag-Wise" />
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex justify-center lg:justify-start">
        <div className="w-full lg:max-w-4xl" role="tabpanel" id={`${activeTab}-panel`}>
          {renderActiveTabContent()}
        </div>
      </div>
    </div>
  );
}