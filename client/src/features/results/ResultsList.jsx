import React from 'react'
import { Link } from 'react-router-dom'

export default function ResultsList(){
  // Minimal placeholder list so /results is reachable and not a 404
  const items = [ { id: 'abc123', title: 'Practice RC #1' }, { id: 'def456', title: 'Mock Test 2' } ]
  return (
    <div className="max-w-2xl mx-auto bg-card-surface rounded p-6">
      <h1 className="h3 mb-4">Results</h1>
      <ul className="space-y-3">
        {items.map(i=> (
          <li key={i.id} className="p-3 rounded bg-surface-muted">
            <Link to={`/results/${i.id}`} className="font-medium text-text-primary">{i.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

