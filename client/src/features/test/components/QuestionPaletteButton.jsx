import { ShieldDown } from './shapes/ShieldDown'
import { ShieldUp } from './shapes/ShieldUp'
import { Square } from './shapes/Square'
import { Circle } from './shapes/Circle'
import { Check, AlertCircle, Flag } from 'lucide-react'

/**
 * QuestionPaletteButton - Individual question palette button with CAT-style shapes
 * Shows different shapes and colors based on question status
 * 
 * Status Logic:
 * - Not Visited (white square): Never clicked
 * - Not Answered (red shield up): Visited but no answer selected
 * - Answered (green shield down): Answer selected
 * - Marked (purple circle): Marked for review (no answer)
 * - Answered + Marked (purple circle with green dot): Both conditions
 */
export function QuestionPaletteButton({
  index,
  isCurrent,
  isVisited,
  isAnswered,
  isMarked,
  onClick,
}) {
  // Determine status
  const isAnsweredAndMarked = isAnswered && isMarked
  const isNotVisited = !isVisited
  const isNotAnswered = isVisited && !isAnswered && !isMarked

  return (
    <button
      onClick={onClick}
      aria-label={`Go to question ${index + 1}${isMarked ? ' marked for review' : ''}${isAnswered ? ' answered' : ''}`}
      className={`relative flex items-center justify-center h-14 w-14 transition-all focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1
        ${isCurrent ? 'ring-3 ring-[#FF9800] ring-offset-2 ring-offset-background' : ''}`}
    >
      {/* Shape Layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isNotVisited && (
          <Square size={46} className="text-card-surface border-2 border-border-soft" />
        )}
        {isNotAnswered && (
          <ShieldUp size={46} className="text-error-red" />
        )}
        {isAnswered && !isMarked && (
          <ShieldDown size={46} className="text-success-green" />
        )}
        {isMarked && !isAnswered && (
          <Circle size={46} className="text-[#7B68EE]" />
        )}
        {isAnsweredAndMarked && (
          <>
            <Circle size={46} className="text-[#7B68EE]" />
            <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-success-green border-2 border-card-surface" />
          </>
        )}
      </div>

      {/* Question Number & Icon Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className={`text-sm font-bold
          ${isNotVisited ? 'text-text-secondary' : 'text-white'}`}
        >
          {index + 1}
        </span>
        
       
      </div>
    </button>
  )
}
