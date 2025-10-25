/**
 * FullscreenRequired - Initial modal requiring fullscreen entry
 * Shown before test begins (before instructions)
 */
export function FullscreenRequired({ onEnterFullscreen }) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="bg-card-surface rounded-xl shadow-2xl max-w-lg w-full p-8 border border-border-soft overflow-y-auto max-h-[90vh]">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold text-text-primary">Fullscreen Required</h1>
          <p className="text-text-secondary leading-relaxed">
            This test must be taken in fullscreen. Please enter fullscreen to view the instructions and begin.
          </p>
          <button
            onClick={onEnterFullscreen}
            className="w-full px-8 py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-lg text-base"
          >
            Enter Fullscreen & View Instructions
          </button>
        </div>
      </div>
    </div>
  )
}
