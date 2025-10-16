import { QuestionPaletteButton } from './QuestionPaletteButton'
import { QUESTION_COUNT } from '../../../lib/constants'

/**
 * QuestionPalette - Grid of question navigation buttons
 * Matches CAT exam interface palette with 4-column grid layout
 */
export function QuestionPalette({
  currentIndex,
  answers,
  marked,
  visited,
  onQuestionClick,
}) {
  return (
    <div className="bg-card-surface rounded-lg p-4 border border-border-soft shadow-sm">
      <div className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 pb-2 border-b border-border-soft">
        Questions
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
          <QuestionPaletteButton
            key={i}
            index={i}
            isCurrent={i === currentIndex}
            isVisited={visited[i]}
            isAnswered={!!answers[i]}
            isMarked={marked[i]}
            onClick={() => onQuestionClick(i)}
          />
        ))}
      </div>
    </div>
  )
}
