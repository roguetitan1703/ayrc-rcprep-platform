/**
 * SectionInfo - Blue bar showing section/topic information
 * Matches CAT exam interface section indicator
 */
export function SectionInfo({ sectionName = 'Reading Comprehension', topicTags = [] }) {
  return (
    <div className="bg-info-blue/10 border border-info-blue/20 rounded-lg px-3 py-2">
      <div className="text-xs font-semibold text-info-blue uppercase tracking-wide mb-1">
        {sectionName}
      </div>
      {topicTags && topicTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topicTags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-info-blue/15 text-info-blue uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
