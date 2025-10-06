import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/auth/AuthContext'

const TITLE_MAP = {
  dashboard: 'Dashboard',
  archive: 'Archive',
  feedback: 'Feedback',
  me: 'Profile',
  'change-password': 'Change Password',
  admin: 'Admin Dashboard',
  schedule: 'Schedule',
  rcs: 'RC Inventory',
  new: 'Create RC',
  drafts: 'Drafts',
  test: 'Test',
  today: "Today's RC",
  results: 'Results',
  performance: 'Performance Studio',
  about: 'About',
  login: 'Sign In',
  register: 'Create Account',
  leaderboard: 'Leaderboard',
  global: 'Global',
  local: 'Cohort',
  subscriptions: 'Subscriptions',
  help: 'Help',
}

function generateTitle(pathSegment) {
  if (TITLE_MAP[pathSegment]) {
    return TITLE_MAP[pathSegment]
  }
  // Handle UUIDs or other dynamic segments
  if (
    pathSegment.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i) ||
    pathSegment.match(/^[0-9a-f]{24}$/i)
  ) {
    return 'Details'
  }
  return pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1)
}

export function useBreadcrumbs() {
  const location = useLocation()
  const { user } = useAuth()

  const crumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    // No special-case now: /results/:id will show 'Details'
    let acc = ''
    const breadcrumbs = parts.map((p, idx) => {
      acc += '/' + p
      const label = generateTitle(p)
      return { href: acc, label, last: idx === parts.length - 1 }
    })
    return [
      { href: user ? '/dashboard' : '/', label: 'Home', last: parts.length === 0 },
      ...breadcrumbs,
    ]
  }, [location.pathname, user])

  const pageTitle = useMemo(() => {
    if (location.pathname === '/dashboard' && user) {
      return `Welcome back, ${user.name.split(' ')[0]}`
    }
    if (crumbs.length > 1) {
      return crumbs[crumbs.length - 1].label
    }
    return 'Dashboard'
  }, [location.pathname, user, crumbs])

  return { crumbs, pageTitle }
}

export function Breadcrumbs() {
  const { crumbs } = useBreadcrumbs()
  const navigate = useNavigate()

  return (
    <nav className="text-sm text-text-secondary">
      {crumbs.map((c, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1">/</span>}
          {c.last ? (
            <span className="text-text-primary/80">{c.label}</span>
          ) : (
            // Render intermediate breadcrumb segments as plain text to avoid navigation to synthetic/non-existent parents.
            // Only keep Home as a real link.
            c.href === '/' ? (
              <Link to="/" className="hover:text-text-primary no-underline">{c.label}</Link>
            ) : (
              <span className="text-text-secondary">{c.label}</span>
            )
          )}
        </span>
      ))}
    </nav>
  )
}
