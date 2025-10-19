/**
 * FullscreenExitedModal - Modal shown when user exits fullscreen during test
 * Timer is paused, test is paused until fullscreen is re-entered
 */
export function FullscreenExitedModal({ onEnterFullscreen, windowTooSmall }) {
  return (
    <div className="fixed inset-0 bg-text-primary/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-card-surface rounded-xl shadow-2xl max-w-lg w-full p-8 border-2 border-error-red">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-error-red/10 rounded-full flex items-center justify-center mx-auto border-2 border-error-red/20">
            <svg
              className="w-8 h-8 text-error-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Test Paused</h1>
            {windowTooSmall ? (
              <p className="text-error-red font-semibold">
                Your window is too small for the test experience.
                <br />
                Please resize your window to at least 1024px wide and 600px tall.
              </p>
            ) : (
              <p className="text-text-secondary leading-relaxed">
                Please enter fullscreen mode to continue the test.
              </p>
            )}
          </div>

          {!windowTooSmall && (
            <button
              onClick={onEnterFullscreen}
              className="w-full px-8 py-4 bg-info-blue text-white font-bold rounded-lg hover:bg-info-blue/90 transition-colors shadow-lg text-base"
            >
              Enter Fullscreen
            </button>
          )}

          <p className="text-xs text-text-secondary">
            ⏸️ Your progress has been saved. The timer is paused until you re-enter fullscreen and
            resize your window.
          </p>
        </div>
      </div>
    </div>
  )
}
