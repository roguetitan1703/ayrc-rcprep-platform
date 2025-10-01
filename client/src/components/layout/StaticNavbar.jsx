import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Menu, BookOpen } from 'lucide-react'

export default function StaticNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/home', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
    { to: '/privacy', label: 'Privacy' },
    { to: '/terms', label: 'Terms' },
    { to: '/refund-policy', label: 'Refund Policy' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Full Static Header */}
      <div className="w-full px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-accent-amber">
          <BookOpen size={20} />
          <span className="font-semibold">ARC</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                isActive(link.to)
                  ? 'text-text-primary bg-primary/20'
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
            className="px-4 py-2 rounded text-sm bg-accent-amber text-black font-medium hover:bg-accent-amber/90 transition-colors"
          >
            Create Account
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded border border-white/10 hover:bg-white/5 text-text-primary"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div>
          <div
            className="fixed right-0 top-0 bottom-0 w-64 border-l border-white/10 p-4 flex flex-col shadow-2xl bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 inline-flex items-center justify-center p-2 rounded border border-white/10 hover:bg-white/5 text-text-primary"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="bg-background mt-10 p-4">
              <nav className="flex flex-col gap-1 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded text-sm transition-colors ${
                      isActive(link.to)
                        ? 'text-text-primary bg-primary/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Auth Buttons (Mobile) */}
              <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/10">
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
                  className="w-full px-4 py-3 rounded text-sm text-center bg-accent-amber text-black font-medium hover:bg-accent-amber/90 transition-colors"
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
