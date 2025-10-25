import React from 'react'

/**
 * Modal shown when user attempts to navigate back during test
 */
export default function PreventBackModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card-surface rounded-xl shadow-2xl max-w-md w-full p-8 border border-border-soft text-center">
        <h2 className="text-2xl font-bold text-error-red mb-4">Test In Progress</h2>
        <p className="text-text-primary mb-6">
          You cannot go back or leave this page while the test is in progress.<br />
          Please complete the test before navigating away.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm text-sm"
        >
          Return to Test
        </button>
      </div>
    </div>
  )
}
