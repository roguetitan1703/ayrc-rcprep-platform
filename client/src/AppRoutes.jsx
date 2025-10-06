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
import Analysis from './features/analysis/Analysis'
import Feedback from './features/feedback/Feedback'
import ChangePassword from './features/profile/ChangePassword'
import Archive from './features/archive/Archive'
import Profile from './features/profile/Profile'
import Performance from './features/insights/Performance'
import Subscriptions from './features/profile/Subscriptions'
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
  { path: '/admin/schedule' },
]

export default function AppRoutes() {
  return (
    <Routes>
      {/* Static routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/refund-policy" element={<Refund />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Authenticated routes */}
      <Route path="/forgot" element={<RequireAuth><Forgot/></RequireAuth>} />
      <Route path="/reset" element={<RequireAuth><Reset/></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><Shell><Dashboard/></Shell></RequireAuth>} />
      
      <Route path="/archive" element={<RequireAuth><Shell><Archive/></Shell></RequireAuth>} />
  <Route path="/test/:id" element={<RequireAuth><Test/></RequireAuth>} />
  <Route path="/test/today" element={<RequireAuth><Shell><TestToday/></Shell></RequireAuth>} />
  <Route path="/results" element={<RequireAuth><Shell><ResultsPage/></Shell></RequireAuth>} />
  <Route path="/results/:id" element={<RequireAuth><Shell><Analysis/></Shell></RequireAuth>} />
      <Route path="/feedback" element={<RequireAuth><Shell><Feedback/></Shell></RequireAuth>} />
  <Route path="/leaderboard/global" element={<RequireAuth><Shell><Leaderboard/></Shell></RequireAuth>} />
  <Route path="/help" element={<RequireAuth><Shell><Help/></Shell></RequireAuth>} />
    <Route path="/performance" element={<RequireAuth><Shell><Performance/></Shell></RequireAuth>} />
    <Route path="/leaderboard/local" element={<RequireAuth><Shell><LeaderboardLocal/></Shell></RequireAuth>} />
    <Route path="/subscriptions" element={<RequireAuth><Shell><Subscriptions/></Shell></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Shell><Profile/></Shell></RequireAuth>} />
      <Route path="/profile/change-password" element={<RequireAuth><Shell><ChangePassword/></Shell></RequireAuth>} />

      

      {/* Admin routes */}
  <Route path="/admin" element={<RequireAdmin><Shell><AdminDashboard/></Shell></RequireAdmin>} />
      <Route path="/admin/rcs/new" element={<RequireAdmin><Shell><RcForm/></Shell></RequireAdmin>} />
  <Route path="/admin/rcs" element={<RequireAdmin><Shell><RcList/></Shell></RequireAdmin>} />
      <Route path="/admin/rcs/:id" element={<RequireAdmin><Shell><RcForm/></Shell></RequireAdmin>} />
      <Route path="/admin/schedule" element={<RequireAdmin><Shell><AdminSchedule/></Shell></RequireAdmin>} />

      <Route path="*" element={<NotFound/>} />
    </Routes>
  )
}
