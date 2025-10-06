import React from 'react'
import { Link } from 'react-router-dom'

export default function RcList(){
  // Minimal admin RC list placeholder
  const items = [ { id: 'r1', title: 'RC #1' }, { id: 'r2', title: 'RC #2' } ]
  return (
    <div className="max-w-3xl mx-auto bg-card-surface rounded p-6">
      <h1 className="h3 mb-4">RC Inventory</h1>
      <ul className="space-y-3">
        {items.map(i=> (
          <li key={i.id} className="p-3 rounded bg-surface-muted flex items-center justify-between">
            <div className="font-medium text-text-primary">{i.title}</div>
            <div className="flex gap-2">
              <Link to={`/admin/rcs/${i.id}`} className="text-sm text-text-secondary underline">Edit</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
