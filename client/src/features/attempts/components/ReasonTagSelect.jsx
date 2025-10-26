import React, { useState } from 'react'
import { REASON_CODES } from '../../../lib/reasonCodes'
import { api } from '../../../lib/api'

export function ReasonTagSelect({ questionIndex, attemptId, currentReason, onReasonSelected, onNext }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = async (e) => {
    const code = e.target.value
    if (!code) return

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      await api.patch(`/attempts/${attemptId}/reasons`, {
        questionIndex,
        code,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      if (onReasonSelected) onReasonSelected(code)
    } catch (err) {
      setError('Failed to save reason')
      console.error('Reason save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleNextClick = () => {
    if (onNext) onNext()
  }

  return (
    <div className="mt-4 pt-4 border-t border-soft">
      <label className="text-sm text-text-secondary mb-2 block">
        Why did you miss this? (optional, but powerful)
      </label>

      <div className="flex items-center gap-2">
        <select
          value={currentReason || ''}
          onChange={handleChange}
          disabled={saving}
          className="flex-1 px-3 py-2 border border-soft rounded-lg bg-card-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:opacity-50"
        >
          <option value="">Select reason...</option>
          {Object.entries(REASON_CODES).map(([code, { label }]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>

        {saving && <span className="text-sm text-info-blue">Saving...</span>}
        {saved && <span className="text-sm text-success-green">✓ Saved</span>}

        <button
        onClick={handleNextClick} 
        className="px-3 py-2 border border-soft rounded-lg bg-card-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:opacity-50">
          Next
        </button>
      </div>

      {error && <div className="text-sm text-error-red mt-1">{error}</div>}
    </div>
  )
}
