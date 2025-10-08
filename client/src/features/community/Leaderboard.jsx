import React, { useState, useEffect, useCallback } from 'react';
import { getleaderboard } from '../../lib/aggregation';
import { Clock, TrendingUp, Tag, ChevronDown, Loader2, Trophy, Medal, Award } from 'lucide-react';

// --- HELPERS ---

// Skeleton Loader for Table
const TableSkeleton = () => (
  <div className="bg-card-surface border border-border-soft rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-surface-muted border-b border-border-soft">
          <tr>
            {['Rank', 'Name', 'Accuracy', 'Time', 'Attempts'].map((header) => (
              <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(8)].map((_, i) => (
            <tr key={i} className="border-b border-border-soft/50 animate-pulse">
              <td className="px-6 py-4"><div className="h-4 bg-surface-muted rounded w-8" /></td>
              <td className="px-6 py-4"><div className="h-4 bg-surface-muted rounded w-32" /></td>
              <td className="px-6 py-4"><div className="h-4 bg-surface-muted rounded w-16" /></td>
              <td className="px-6 py-4"><div className="h-4 bg-surface-muted rounded w-16" /></td>
              <td className="px-6 py-4"><div className="h-4 bg-surface-muted rounded w-12" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Time Formatter
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// --- Leaderboard Table Component ---

const LeaderboardTable = ({ data, timeKey, accuracyKey, countKey }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card-surface border border-border-soft rounded-xl p-12 text-center">
        <p className="text-text-secondary">No leaderboard data available yet.</p>
      </div>
    )
  }

  const getRankIcon = (rank) => {
    if (rank === 0) return <Trophy className="h-5 w-5" style={{ color: '#FFD700' }} />
    if (rank === 1) return <Medal className="h-5 w-5" style={{ color: '#C0C0C0' }} />
    if (rank === 2) return <Medal className="h-5 w-5" style={{ color: '#CD7F32' }} />
    return null
  }

  const getRankBg = (rank) => {
    if (rank === 0) return 'bg-[#FFD700]/10'
    if (rank === 1) return 'bg-[#C0C0C0]/10'
    if (rank === 2) return 'bg-[#CD7F32]/10'
    return ''
  }

  return (
    <div className="bg-card-surface border border-border-soft rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-muted border-b border-border-soft">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-20">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Accuracy
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </div>
              </th>
              {countKey && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Attempts</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => (
              <tr 
                key={user.name + index} 
                className={`border-b border-border-soft/50 hover:bg-surface-muted/30 transition-colors ${getRankBg(index)}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(index)}
                    <span className="text-sm font-semibold text-text-primary">#{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-primary">{user.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm font-semibold ${user[accuracyKey] >= 80 ? 'text-success-green' : 'text-text-primary'}`}>
                    {user[accuracyKey].toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-primary">
                    {formatTime(user[timeKey])}
                  </div>
                </td>
                {countKey && (
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-text-primary">{user[countKey]}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


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
      return <TableSkeleton />;
    }

    switch (activeTab) {
      case 'today':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Today's Top Performers</h3>
              <p className="text-sm text-text-secondary mt-1">Based on today's RC attempts</p>
            </div>
            <LeaderboardTable
              data={fullData.today || []}
              timeKey="timeTakenSeconds"
              accuracyKey="accuracy"
              countKey="rcsAttempted"
            />
          </div>
        );

      case 'monthly':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Monthly Champions</h3>
              <p className="text-sm text-text-secondary mt-1">Top performers this month</p>
            </div>
            <LeaderboardTable
              data={fullData.monthly || []}
              timeKey="totalTimeSeconds"
              accuracyKey="averageAccuracy"
              countKey="attemptsCount"
            />
          </div>
        );

      case 'tag':
        const currentTagData = fullData.tagLeaderboards?.[selectedTag] || [];
        const availableTags = fullData.tags || [];

        return (
          <>
            {/* Tag Selector Control */}
            <div className="flex items-center gap-3 mb-6">
              <Tag size={20} className="text-text-secondary" />
              <label htmlFor="tag-selector" className="text-text-primary font-medium">Topic:</label>
              <div className="relative">
                <select
                  id="tag-selector"
                  value={selectedTag || ''}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="appearance-none pr-10 py-2 pl-4 rounded-lg border border-border-soft bg-card-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition disabled:opacity-50 font-medium"
                >
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                  {availableTags.length === 0 && <option value="" disabled>No Tags Available</option>}
                </select>
                {/* Chevron icon for dropdown appearance */}
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Top Performers in: {selectedTag || '...'}</h3>
              <p className="text-sm text-text-secondary mt-1">Ranking based on cumulative performance in this topic</p>
            </div>

            {/* Tag-Wise Leaderboard Display */}
            {availableTags.length === 0 ? (
              <p className="text-text-secondary text-center py-12">No topics found for leaderboards.</p>
            ) : (
              <LeaderboardTable
                data={currentTagData}
                timeKey="totalTimeSeconds"
                accuracyKey="averageAccuracy"
                countKey="attemptsCount"
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Global Leaderboards</h2>
        <p className="text-text-secondary mt-2">
          See how you stack up against the competition across different timeframes and topics.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border-soft">
        <nav className="flex space-x-6" role="tablist">
          <TabButton id="today" label="Today's RC" />
          <TabButton id="monthly" label="Monthly" />
          <TabButton id="tag" label="Tag-Wise" />
        </nav>
      </div>

      {/* Tab Content */}
      <div role="tabpanel" id={`${activeTab}-panel`}>
        {renderActiveTabContent()}
      </div>
    </div>
  );
}