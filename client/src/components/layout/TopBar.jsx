import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronsLeft, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useMobileNav } from './MobileNavContext';
import { useBreadcrumbs, Breadcrumbs } from '../../lib/breadcrumbs.jsx';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { open, openNav, close, setToggleRef } = useMobileNav();
  const toggleRef = useRef(null)
  const { crumbs, pageTitle } = useBreadcrumbs();
  const isAdmin = user?.role === 'admin';
  // Show back only when there are nested crumbs beyond Home, but hide on the Home -> Dashboard case
  // where breadcrumbs are [Home, Dashboard] (we don't want a back affordance on top-level dashboard).
  const showBack = (() => {
    const length = crumbs?.length || 0
    if (length <= 1) return false
    // If the only extra crumb is the dashboard route, don't show back
    if (length === 2 && crumbs[1]?.href === '/dashboard') return false
    return true
  })()

  return (
    <div className="w-full px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Mobile toggle or Back button + Breadcrumb inline */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile sidebar toggle (left) - replaces hamburger on right; use chevrons icon */}
          <button
            ref={toggleRef}
            onClick={() => {
              if (open) { close(); setToggleRef(null) }
              else { openNav(); setToggleRef(toggleRef.current) }
            }}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
          >
            <ChevronsLeft size={18} />
          </button>
          {/* Desktop back button (md+). Visible on larger screens only when there is somewhere to go back to. */}
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="hidden md:inline-flex items-center justify-center p-2 rounded-lg hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <nav className="text-sm text-text-secondary md:text-sm">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1.5">/</span>}
                {c.last ? (
                  <span className="text-text-primary font-medium">{c.label}</span>
                ) : (
                  // Prevent clicking intermediate breadcrumb segments that may not have a real route.
                  // For the Home crumb, allow a direct link. For others, render inert text on mobile and
                  // a clickable back-button on md+ to keep the back behavior available on larger screens.
                  c.href === '/' ? (
                    <Link to="/" className="hover:text-text-primary transition-colors">{c.label}</Link>
                  ) : (
                    <>
                      {/* In mobile view show plain text (no back button) */}
                      <span className="md:hidden text-text-secondary">{c.label}</span>
                      {/* Show a back-button on medium+ screens */}
                      <button onClick={() => navigate(-1)} className="hidden md:inline hover:text-text-primary transition-colors no-underline">
                        {c.label}
                      </button>
                    </>
                  )
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop actions - only for regular users */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-2">
              {/* Streak indicator */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-muted rounded-lg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M12 2s-4 3.5-4 7a4 4 0 008 0c0-3.5-4-7-4-7z" fill="currentColor" />
                  <path d="M8 13.5C8 15.985 9.79 18 12 18s4-2.015 4-4.5c0-2-2-2.5-4-6-2 3.5-4 4-4 6z" fill="currentColor" opacity="0.9" />
                </svg>
                <span className="text-xs font-medium text-text-primary">3d</span>
              </div>
              
              {/* Attempt RC button */}
              <Link 
                to="/test/today" 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-primary bg-surface-muted hover:bg-surface-hover transition-colors"
              >
                <Clock size={14} />
                Attempt RC
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
