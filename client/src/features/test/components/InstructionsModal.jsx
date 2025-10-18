import { useAuth } from '../../../components/auth/AuthContext'
import { TEST_DURATION_SECONDS } from '../../../lib/constants'

/**
 * InstructionsModal - First screen showing general test instructions
 * Displays before test begins (General Instructions step)
 */
export function InstructionsModal({ rc, onNext }) {
  const { user } = useAuth()
  
  const questionCount = rc?.questions?.length || 0
  const durationMinutes = Math.floor(TEST_DURATION_SECONDS / 60) // Use actual test duration

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card-surface rounded-xl shadow-2xl max-w-3xl w-full p-8 border border-border-soft">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-soft">
          <h1 className="text-2xl font-bold text-text-primary">General Instructions</h1>
          {user && (
            <div className="flex items-center gap-3 px-4 py-2 bg-background rounded-lg border border-border-soft">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-text-primary">{user.name}</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Welcome Text */}
          <p className="text-text-primary leading-relaxed">
            Welcome to the test! Please read the following instructions carefully before proceeding.
          </p>

          {/* Test Details Box */}
          <div className="bg-info-blue/5 border border-info-blue/20 rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-bold text-text-primary mb-4">Test Details:</h2>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-text-primary">Test Title: </span>
                <span className="text-text-secondary">{rc?.title || 'Reading Comprehension Test'}</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">Total Duration: </span>
                <span className="text-text-secondary">{durationMinutes} minutes</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">Number of Sections: </span>
                <span className="text-text-secondary">1</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">Total Questions: </span>
                <span className="text-text-secondary">{questionCount}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-info-blue/20">
              <p className="text-sm text-text-primary">This test consists of the following sections:</p>
              <ul className="mt-2 ml-6 text-sm text-text-secondary list-disc">
                <li>Reading Comprehension ({durationMinutes} minutes)</li>
              </ul>
            </div>
          </div>

          {/* Instructions List */}
          <div className="space-y-3 text-sm text-text-primary leading-relaxed">
            <p>
              <span className="font-semibold">1.</span> The clock will be set at the server and will count down. When the timer reaches zero, the test will end by itself.
            </p>
            <p>
              <span className="font-semibold">2.</span> You can navigate between questions using the "Save & Next" button or by clicking on question numbers in the palette.
            </p>
            <p>
              <span className="font-semibold">3.</span> The passage will be displayed on the left side of the screen for your reference throughout the test.
            </p>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-info-blue text-white font-bold rounded-lg hover:bg-info-blue/90 transition-colors shadow-sm text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
