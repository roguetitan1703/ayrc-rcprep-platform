import React from 'react'
import { Link } from 'react-router-dom'

export default function TestIndex(){
  const tests = [ {id:'t1', title:'Daily RC 1'}, {id:'t2', title:'Mock Test 2'} ]
  return (
    <div className="max-w-3xl mx-auto p-6 bg-card-surface rounded">
      <h1 className="h3 mb-4">Tests</h1>
      <ul className="space-y-2">
        {tests.map(t=> (
          <li key={t.id} className="p-3 rounded bg-surface-muted"><Link to={`/test/${t.id}`} className="font-medium">{t.title}</Link></li>
        ))}
      </ul>
    </div>
  )
}
