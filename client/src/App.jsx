import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, matchRoutes } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider, useAuth } from './components/auth/AuthContext'
import { cn } from './lib/utils'
import Sidebar from './components/layout/Sidebar'
import MobileSidebar from './components/layout/MobileSidebar'
import TopBar from './components/layout/TopBar'
import { MobileNavProvider } from './components/layout/MobileNavContext'
import Footer from './components/layout/Footer'
import AppRoutes, { routeConfig } from './AppRoutes'
import StaticNavbar from './components/layout/StaticNavbar'

export default function App() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Define static routes (with header/footer)
  const staticRoutes = [
    '/',
    '/about',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms',
    '/refund-policy',
  ]

  // Define auth routes (no header/footer)
  const authRoutes = [
    '/login',
    '/register',
    '/forgot',
    '/reset',
    '/admin/login',
  ]

  // Define authenticated route prefixes
  const authenticatedPrefixes = [
    '/dashboard',
    '/archive',
    '/test',
    '/results',
    '/analysis',
    '/feedback',
    '/reports',
    '/leaderboard',
    '/profile',
    '/subscriptions',
    '/help',
    '/performance',
    '/me',
    '/admin',
  ]

  // Check route type
  const isAuthRoute = authRoutes.includes(location.pathname)
  const isStaticRoute = staticRoutes.includes(location.pathname)
  const isAuthenticatedRoute = authenticatedPrefixes.some(prefix => location.pathname.startsWith(prefix))

  // Use the routeConfig patterns to determine if current path matches any defined route.
  const matched = matchRoutes(routeConfig.map(r=>({ path: r.path })), location.pathname)
  const is404 = matched === null
  const showHeaderFooter = isStaticRoute && !isAuthRoute

  useEffect(() => {
    // Reset scroll position and focus to main on route change to avoid offset issues
    window.scrollTo(0, 0)
    const el = document.getElementById('main')
    if (el) el.focus()
    setMobileOpen(false) // Close mobile nav on route change
  }, [location.pathname])

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-accent-amber text-black px-3 py-1 rounded"
        >
          Skip to content
        </a>

        {/* Conditional Header Rendering */}
        {!isAuthRoute && !is404 && (
          showHeaderFooter ? (
            // Static navbar for public pages
            <header className="sticky top-0 z-10 border-b border-neutral-grey/40 bg-background/80 backdrop-blur">
              <StaticNavbar />
            </header>
          ) : isAuthenticatedRoute && (
            // Authenticated header -> MobileNavProvider wraps the app. On small screens the header is full width; on md+ it offsets by the sidebar width.
            <MobileNavProvider>
              <header className="fixed top-0 right-0 z-30 border-b border-neutral-grey/40 bg-background/95 backdrop-blur left-0 md:left-[var(--arc-sidebar-width,16rem)] transition-all">
                <TopBar />
              </header>
              <MobileSidebar />
              <Sidebar />
            </MobileNavProvider>
          )
        )}

        <ToastProvider>
          <main
            id="main"
            tabIndex="-1"
            className={cn('w-full', (isAuthRoute || is404) ? '' : 'px-6 py-8')}
            style={{ 
              // marginLeft: isAuthRoute ? undefined : (isAuthenticatedRoute ? 'var(--arc-sidebar-width, 16rem)' : undefined), 
              paddingTop: (isAuthRoute || is404) ? undefined : (isAuthenticatedRoute ? '5rem' : undefined),
              transition: 'margin-left .2s ease-in-out' 
            }}
          >
            <AppRoutes />
          </main>
          {/* Render Footer only on static routes (not auth routes) */}
          {showHeaderFooter && <Footer />}
        </ToastProvider>
      </div>
    </AuthProvider>
  )
}
