import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useEffect, useState } from 'react'

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded px-3 py-2 text-sm ${
          isActive
            ? 'bg-white/10 text-text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Sidebar({ bare = false }) {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const location = useLocation()
  // Admin context: current pathname starts with /admin (dedicated admin shell)
  const inAdminSection = location.pathname.startsWith('/admin') && isAdmin
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    try {
      const v = localStorage.getItem('arc_sidebar')
      if (v !== null) setCollapsed(v === '1')
    } catch {}
  }, [])
  function toggle() {
    setCollapsed((c) => {
      const n = !c
      try {
        localStorage.setItem('arc_sidebar', n ? '1' : '0')
      } catch {}
      return n
    })
  }
  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-text-secondary">Navigation</div>
        {!bare && (
          <button
            onClick={toggle}
            className="text-xs text-text-secondary hover:text-text-primary border border-white/10 rounded px-2 py-0.5"
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
      </div>
      <div>
        <div className="space-y-1">
          {user && (
            <>
              {!isAdmin && (
                <>
                  <Item to="/dashboard">{collapsed ? 'Dshbd' : 'Dashboard'}</Item>
                  <Item to="/archive">{collapsed ? 'Arch' : 'Archive'}</Item>
                  <Item to="/me">{collapsed ? 'Profile' : 'Profile'}</Item>
                  <Item to="/feedback">{collapsed ? 'FB' : 'Feedback'}</Item>
                </>
              )}
              {isAdmin && (
                <>
                  <Item to="/admin">{collapsed ? 'Dash' : 'Console'}</Item>
                  <Item to="/admin/schedule">{collapsed ? 'Sched' : 'Schedule'}</Item>
                  <Item to="/admin/rcs/new">{collapsed ? 'Create' : 'Create RC'}</Item>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div>
        <button onClick={logout} className="text-sm text-text-secondary hover:text-text-primary">
          Logout
        </button>
      </div>
    </div>
  )
  if (bare) return content
  return (
    <aside
      className={`shrink-0 border-r border-white/10 hidden md:block p-3 transition-all ${
        collapsed ? 'w-40' : 'w-64'
      }`}
    >
      <div className={collapsed ? 'text-sm' : ''}>{content}</div>
    </aside>
  )
}
