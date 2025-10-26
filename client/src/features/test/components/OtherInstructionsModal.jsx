import { useState } from 'react'
import { useAuth } from '../../../components/auth/AuthContext'

/**
 * OtherInstructionsModal - Second screen with detailed instructions and confirmation
 * User must check the agreement box before starting the test
 */
export function OtherInstructionsModal({ rc, onPrevious, onStartTest }) {
  const { user } = useAuth()
  const [agreed, setAgreed] = useState(false)

  const questionCount = rc?.questions?.length || 0

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="bg-card-surface rounded-xl shadow-2xl max-w-3xl w-full p-8 border border-border-soft overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-soft">
          <h1 className="text-2xl font-bold text-text-primary">Other Important Instructions</h1>
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
          {/* Intro */}
          <p className="text-text-primary font-semibold">Please note the following:</p>

          {/* Instructions List */}
          <ul className="space-y-4 text-sm text-text-primary leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                Go through the various symbols used in the test interface (e.g., in the question palette) and understand their meaning before you start.
              </span>
            </li>
            
            <li className="flex gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                In MCQ-type questions, candidates will be given <span className="font-semibold text-success-green">3 points</span> for each correct answer. <span className="font-semibold">Negative marking of 0 points</span> will apply for incorrect answers.
              </span>
            </li>
            
            <li className="flex gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                Your current response for a question will not be saved if you navigate to another question without clicking <span className="font-semibold">"Save & Next"</span> or <span className="font-semibold">"Mark for Review & Next"</span>.
              </span>
            </li>
            
            <li className="flex gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                Ensure you have a stable internet connection. In case of disconnection, your progress will be saved locally and synced once you are back online.
              </span>
            </li>
            
            <li className="flex gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                <span className="font-semibold text-error-red">This test must be taken in fullscreen mode.</span> If you exit fullscreen during the test, the test will be paused automatically. You will need to re-enter fullscreen to continue.
              </span>
            </li>
            
            <li className="flex gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                You can mark questions for review and revisit them before final submission. Use the question palette to navigate between questions.
              </span>
            </li>
          </ul>

          {/* Agreement Checkbox */}
          <div className="bg-background rounded-lg p-5 border border-border-soft">
            <label className="flex gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-info-blue rounded focus:ring-2 focus:ring-focus-ring cursor-pointer"
              />
              <span className="text-xs text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
                I have read and understood all the instructions. I declare that I am not in possession of any prohibited gadget (like mobile phone, Bluetooth devices etc.) and that I will not carry any unauthorized material into the Examination Hall. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or disciplinary action which may include ban from future tests/Examinations.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={onPrevious}
              className="px-6 py-3 bg-background text-text-primary font-semibold rounded-lg hover:bg-surface-muted transition-colors border border-border-soft text-sm"
            >
              ← Previous
            </button>
            <button
              onClick={onStartTest}
              disabled={!agreed}
              className={`px-8 py-3 font-bold rounded-lg transition-all shadow-sm text-sm ${
                agreed
                  ? 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
                  : 'bg-neutral-grey/30 text-text-secondary cursor-not-allowed opacity-50'
              }`}
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
