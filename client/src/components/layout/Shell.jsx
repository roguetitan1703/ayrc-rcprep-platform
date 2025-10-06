        import React from 'react'
import Sidebar from './Sidebar'

export default function Shell({ children }) {
  return (
    <div className="min-h-screen">
      <div className="flex-1 min-w-0 md:pl-[var(--arc-sidebar-width,16rem)]">
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
