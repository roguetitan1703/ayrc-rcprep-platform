import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
import TestToday from './features/test/Today'
import ResultsPage from './features/results/ResultsPage'
import Results from './features/results/ResultsPage'

import Analysis from './features/analysis/Analysis'
import RcAnalyticsPage from './features/admin/RcAnalyticsPage'
import Feedback from './features/feedback/Feedback'
import ChangePassword from './features/profile/ChangePassword'
import Archive from './features/archive/Archive'
import Profile from './features/profile/Profile'
import Performance from './features/insights/Performance'
import Subscriptions from './features/profile/Subscriptions'
import AdminSubscriptions from './features/admin/AdminSubscriptions'
import LeaderboardLocal from './features/community/LeaderboardLocal'
import Leaderboard from './features/community/Leaderboard'
import Help from './features/help/Help'
import RcList from './features/admin/RcList'
import { RequireAuth, RequireAdmin } from './components/auth/RequireAuth'
import About from './features/static/About'
import Terms from './features/static/Terms'
import Contact from './features/static/Contact'
import Pricing from './features/static/Pricing'
import Privacy from './features/static/Privacy'
import Refund from './features/static/Refund'
import HomePage from './features/static/Home/HomePage'
import Shell from './components/layout/Shell'
import NotFound from './components/layout/NotFound'

export const routeConfig = [
  // Static routes
  { path: '/' },
  { path: '/about' },
  { path: '/contact' },
  { path: '/pricing' },
  { path: '/privacy' },
  { path: '/terms' },
  { path: '/refund-policy' },
  { path: '/login' },
  { path: '/register' },
  { path: '/forgot' },
  { path: '/admin/login' },
  // Authenticated routes
  { path: '/reset' },
  { path: '/dashboard' },
  { path: '/archive' },
  { path: '/test/:id' },
  { path: '/test/today' },
  { path: '/results' },
  { path: '/results/:id' },
  { path: '/analysis/:id' }, // ✅ ADDED - was missing!
  { path: '/feedback' },
  { path: '/leaderboard/global' },
  { path: '/leaderboard/local' },
  { path: '/help' },
  { path: '/performance' },
  { path: '/subscriptions' },
  { path: '/profile' },
  { path: '/profile/change-password' },
  // Admin
  { path: '/admin' },
  { path: '/admin/rcs' },
  { path: '/admin/rcs/new' },
  { path: '/admin/rcs/:id' },
  { path: '/admin/rcs/:id/analytics' },
  { path: '/admin/schedule' },
  { path: '/admin/subscriptions' },
]

export default function AppRoutes() {
  return (
    <Routes>
      {/* Static routes - No auth, no Shell */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/refund-policy" element={<Refund />} />
      
      {/* Auth routes - No Shell */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset" element={<RequireAuth><Reset /></RequireAuth>} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Test routes - RequireAuth but no Shell (full-screen test experience) */}
      <Route path="/test/:id" element={<RequireAuth><Test /></RequireAuth>} />

      {/* Authenticated routes with Shell (sidebar + padding) */}
      <Route element={<RequireAuth><Shell /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/test/today" element={<TestToday />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/analysis/:id" element={<Analysis />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/leaderboard/global" element={<Leaderboard />} />
        <Route path="/leaderboard/local" element={<LeaderboardLocal />} />
        <Route path="/help" element={<Help />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />
      </Route>

      {/* Admin routes with Shell */}
      <Route element={<RequireAdmin><Shell /></RequireAdmin>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/rcs" element={<RcList />} />
        <Route path="/admin/rcs/new" element={<RcForm />} />
        <Route path="/admin/rcs/:id" element={<RcForm />} />
        <Route path="/admin/rcs/:id/analytics" element={<RcAnalyticsPage />} />
        <Route path="/admin/schedule" element={<AdminSchedule />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
