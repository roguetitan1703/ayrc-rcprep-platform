import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider, useAuth } from './components/auth/AuthContext'
import Sidebar from './components/layout/Sidebar'
import MobileSidebar from './components/layout/MobileSidebar'
import PageHeader from './components/layout/PageHeader'
import AdminLogin from './features/admin/AdminLogin'
import AdminDashboard from './features/admin/AdminDashboard'
import RcForm from './features/admin/RcForm'
import AdminSchedule from './features/admin/Schedule'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Forgot from './features/auth/Forgot'
import Reset from './features/auth/Reset'
import Dashboard from './features/dashboard/Dashboard'
import Test from './features/test/Test'
import Results from './features/results/Results'
import Analysis from './features/analysis/Analysis'
import Feedback from './features/feedback/Feedback'
import ChangePassword from './features/profile/ChangePassword'
import Archive from './features/archive/Archive'
import Profile from './features/profile/Profile'
import { RequireAuth, RequireAdmin } from './components/auth/RequireAuth'
import About from './features/static/About'
import Terms from './features/static/Terms'
import content from './content/static.json'
import HomePage from './features/static/Home/HomePage'


export default function App() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(()=>{
    const el = document.getElementById('main')
    if(el){ el.focus() }
    setMobileOpen(false) // close mobile nav on route change
  }, [location.pathname])
  return (
    <AuthProvider>
    <div className="min-h-screen bg-background text-text-primary">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-accent-amber text-black px-3 py-1 rounded">Skip to content</a>
      <header className="sticky top-0 z-10 border-b border-neutral-grey/40 bg-background/80 backdrop-blur">
        <div className="w-full px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-accent-amber">
            <BookOpen size={20} />
            <span className="font-semibold">ARC</span>
          </Link>
          <Navbar onOpenMobile={()=>setMobileOpen(true)} />
        </div>
      </header>
      <MobileSidebar open={mobileOpen} onClose={()=>setMobileOpen(false)} />
      <ToastProvider>
        <main id="main" tabIndex="-1" className="w-full px-6 py-8">
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<HomePage />} />
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />
          {/* Shell with sidebar for primary user/admin navigation */}
          <Route path="/dashboard" element={<RequireAuth><Shell><Dashboard /></Shell></RequireAuth>} />
          <Route path="/archive" element={<RequireAuth><Shell><Archive /></Shell></RequireAuth>} />
          <Route path="/test/:id" element={<RequireAuth><Test /></RequireAuth>} />
          <Route path="/results/:id" element={<RequireAuth><Results /></RequireAuth>} />
          <Route path="/analysis/:id" element={<RequireAuth><Analysis /></RequireAuth>} />
          <Route path="/feedback" element={<RequireAuth><Shell><Feedback /></Shell></RequireAuth>} />
          <Route path="/me" element={<RequireAuth><Shell><Profile /></Shell></RequireAuth>} />
          <Route path="/me/change-password" element={<RequireAuth><Shell><ChangePassword /></Shell></RequireAuth>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><Shell><AdminDashboard /></Shell></RequireAdmin>} />
          <Route path="/admin/rcs/new" element={<RequireAdmin><Shell><RcForm /></Shell></RequireAdmin>} />
          <Route path="/admin/rcs/:id" element={<RequireAdmin><Shell><RcForm /></Shell></RequireAdmin>} />
          <Route path="/admin/schedule" element={<RequireAdmin><Shell><AdminSchedule /></Shell></RequireAdmin>} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </ToastProvider>
  </div>
  </AuthProvider>
  )
}

function Landing() {
  const c = content.landing
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-semibold mb-3 tracking-tight">{c.heroTitle}</h1>
        <p className="text-text-secondary max-w-2xl mx-auto mb-10 text-lg">{c.heroSubtitle}</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/register" className="px-6 py-3.5 rounded-md bg-accent-amber text-black font-medium text-base">{c.ctaPrimary}</a>
          <a href="/admin" className="px-6 py-3.5 rounded-md border border-accent-amber text-accent-amber hover:bg-accent-amber/10 text-base">{c.ctaSecondary}</a>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 gap-4 text-left">
          <div className="bg-card-surface rounded p-5">
            <h3 className="font-medium mb-1 text-lg">Two daily RCs</h3>
            <p className="text-sm text-text-secondary">Stay consistent with a focused daily routine.</p>
          </div>
          <div className="bg-card-surface rounded p-5">
            <h3 className="font-medium mb-1 text-lg">Detailed Explanations</h3>
            <p className="text-sm text-text-secondary">Understand every choice and learn faster.</p>
          </div>
        </div>
        <div className="mt-8 text-xs text-text-secondary">By continuing you agree to our <a className="underline" href="/terms">Terms</a>.</div>
      </div>
    </section>
  )
}

function NotFound() {
  return <div>Not Found</div>
}

function Navbar({ onOpenMobile }){
  const { user, loading, logout } = useAuth()
  const [menuBtnFocus, setMenuBtnFocus] = useState(false)
  return (
    <nav className="text-sm text-text-secondary flex items-center gap-3">
      {/* Mobile menu button */}
      {!loading && user && (
        <button
          className="md:hidden inline-flex items-center px-3 py-1 rounded border border-white/10 hover:bg-white/5"
          onClick={onOpenMobile}
          aria-label="Open menu"
          onFocus={()=>setMenuBtnFocus(true)}
          onBlur={()=>setMenuBtnFocus(false)}
        >
          Menu
        </button>
      )}
  {!user && <Link to="/about" className="hover:text-text-primary">About</Link>}
      {!loading && !user && (
        <>
          <Link to="/login" className="hover:text-text-primary">Sign In</Link>
          <Link to="/register" className="hover:text-text-primary">Create Account</Link>
        </>
      )}
      {/* When logged in, keep header minimal to avoid duplication with sidebar */}
  {!loading && user && (
        <>
      <Link to="/me" className="hidden md:inline hover:text-text-primary">Profile</Link>
          <button onClick={logout} className="hover:text-text-primary">Logout</button>
        </>
      )}
    </nav>
  )
}

function Shell({ children }){
  // Sidebar shell for authenticated areas; keeps main content centered with gutter
  return (
    <div className="flex gap-6">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <PageHeader />
        {children}
      </div>
    </div>
  )
}
