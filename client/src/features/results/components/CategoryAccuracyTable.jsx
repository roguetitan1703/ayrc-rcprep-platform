import React, { useState, useMemo } from 'react'

export function CategoryAccuracyTable({ categoryStats }) {
  const [sortColumn, setSortColumn] = useState('attempts')
  const [sortDirection, setSortDirection] = useState('desc')

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const sortedStats = useMemo(() => {
    if (!categoryStats || categoryStats.length === 0) return []

    return [...categoryStats].sort((a, b) => {
      let aVal = a[sortColumn]
      let bVal = b[sortColumn]

      if (sortColumn === 'accuracy') {
        aVal = a.correct / (a.attempts || 1)
        bVal = b.correct / (b.attempts || 1)
      }

      if (sortDirection === 'asc') {
        return aVal - bVal
      } else {
        return bVal - aVal
      }
    })
  }, [categoryStats, sortColumn, sortDirection])

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.75) return 'text-success-green'
    if (accuracy >= 0.6) return 'text-accent-amber'
    return 'text-error-red'
  }

  if (!categoryStats || categoryStats.length === 0) {
    return (
      <div className="bg-card-surface border border-soft rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Performance by Category</h3>
        <p className="text-text-secondary text-sm">
          Complete more attempts to see category breakdown
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card-surface border border-soft rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Performance by Category</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-text-secondary border-b border-soft">
              <th
                className="pb-3 cursor-pointer hover:text-text-primary"
                onClick={() => handleSort('category')}
              >
                Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="pb-3 cursor-pointer hover:text-text-primary"
                onClick={() => handleSort('attempts')}
              >
                Attempts {sortColumn === 'attempts' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="pb-3 cursor-pointer hover:text-text-primary"
                onClick={() => handleSort('correct')}
              >
                Correct {sortColumn === 'correct' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="pb-3 cursor-pointer hover:text-text-primary"
                onClick={() => handleSort('accuracy')}
              >
                Accuracy {sortColumn === 'accuracy' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((cat) => {
              const accuracy = cat.attempts > 0 ? cat.correct / cat.attempts : 0
              return (
                <tr key={cat.category} className="border-b border-soft last:border-0">
                  <td className="py-3 font-medium text-text-primary">{cat.category}</td>
                  <td className="py-3 text-text-secondary">{cat.attempts}</td>
                  <td className="py-3 text-text-secondary">{cat.correct}</td>
                  <td className={`py-3 font-semibold ${getAccuracyColor(accuracy)}`}>
                    {Math.round(accuracy * 100)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
