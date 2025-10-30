import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Menu } from 'lucide-react'
import Logo from '../ui/Logo'

export default function StaticNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    // { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
    // { to: '/privacy', label: 'Privacy' },
    // { to: '/terms', label: 'Terms' },
    // { to: '/refund-policy', label: 'Refund Policy' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Full Static Header */}
      <header className="w-full px-6 h-14 flex items-center justify-between bg-background" style={{ position: 'relative', zIndex: 50 }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Logo className="h-6 w-6" />
          <span className="font-bold text-lg">ARYC</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                isActive(link.to)
                  ? 'text-text-primary bg-info-blue/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded text-sm bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Create Account
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded border border-white/10 hover:bg-white/5 text-text-primary"
          style={{ position: 'relative', zIndex: 10001 }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay - PORTAL-LIKE APPROACH */}
      {mobileOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }} className="md:hidden">
                  
          {/* Sidebar Panel */}
          <div
            style={{ 
              position: 'absolute', 
              right: 0, 
              top: 0, 
              bottom: 0, 
              width: '16rem',
              zIndex: 10001
            }}
            className="border-l border-white/10 shadow-2xl bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded border border-white/10 hover:bg-white/5 text-text-primary"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="px-4 py-4 bg-white">
              <nav className="flex flex-col gap-1 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded text-sm transition-colors ${
                      isActive(link.to)
                        ? 'text-text-primary bg-info-blue/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Auth Buttons (Mobile) */}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-3 rounded text-sm text-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors border border-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-3 rounded text-sm text-center bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}