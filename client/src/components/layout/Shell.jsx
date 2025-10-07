import React from 'react'
import { Outlet } from 'react-router-dom'

export default function Shell({ children }) {
  return (
    <div className="min-h-screen">
      <div className="flex-1 min-w-0 md:pl-[var(--arc-sidebar-width,16rem)]">
        <div className="px-6 py-6">
          {/* Support both nested routes (Outlet) and direct children */}
          {children || <Outlet />}
        </div>
      </div>
    </div>
  )
}
