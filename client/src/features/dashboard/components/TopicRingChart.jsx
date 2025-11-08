import { useMemo } from 'react'
import { ResponsivePie } from '@nivo/pie'

/**
 * Separate ring charts per topic showing individual accuracies
 * Each topic gets its own small donut chart
 */
export function TopicRingChart({ topics = [] }) {
  if (!topics || topics.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary text-sm bg-surface-muted/30 rounded-xl border border-border-soft">
        No topic data available
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {topics.map((topic, idx) => (
        <TopicRing key={topic.tag} topic={topic} color={getTopicColor(idx)} />
      ))}
    </div>
  )
}

/**
 * Individual topic ring component
 */
function TopicRing({ topic, color }) {
  const chartData = useMemo(() => {
    const accuracy = topic.accuracy || 0
    return [
      { id: 'correct', value: accuracy, color: color },
      { id: 'remaining', value: 100 - accuracy, color: '#E5E7EB' },
    ]
  }, [topic.accuracy, color])

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Ring Chart */}
      <div className="relative h-28 mb-3">
        <ResponsivePie
          data={chartData}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          // Slightly larger inner radius creates breathing room for the center label
          innerRadius={0.72}
          padAngle={2}
          cornerRadius={3}
          colors={{ datum: 'data.color' }}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          isInteractive={false}
          animate={true}
          motionConfig="gentle"
        />

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xl font-bold text-text-primary" style={{ color }}>
              {topic.accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Topic Info */}
      <div className="text-center space-y-1">
        <div className="font-semibold text-text-primary text-sm truncate" title={topic.tag}>
          {topic.tag}
        </div>
        <div className="text-xs text-text-secondary">
          {topic.totalQuestions} question{topic.totalQuestions !== 1 ? 's' : ''}
        </div>

        {/* Accuracy Badge */}
        <div className="flex justify-center mt-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              topic.accuracy >= 75
                ? 'bg-[#23A094]/10 text-[#23A094]'
                : topic.accuracy >= 50
                ? 'bg-[#F6B26B]/10 text-[#F6B26B]'
                : 'bg-[#E4572E]/10 text-[#E4572E]'
            }`}
          >
            {topic.accuracy >= 75 ? 'Strong' : topic.accuracy >= 50 ? 'Good' : 'Needs Work'}
          </span>
        </div>
      </div>
    </div>
  )
}

// Generate distinct colors for topics
function getTopicColor(index) {
  const colors = [
    '#D33F49', // Crimson
    '#3B82F6', // Blue
    '#23A094', // Green
    '#F6B26B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#F59E0B', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
  ]
  return colors[index % colors.length]
}
