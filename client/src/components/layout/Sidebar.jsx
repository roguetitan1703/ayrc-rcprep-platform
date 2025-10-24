import {
  ChevronsLeft,
  LogOut,
  Home,
  Clock,
  Archive,
  User,
  Tag,
  BarChart2,
  Trophy,
  Grid,
  PlusCircle,
  BarChart3,
} from 'lucide-react'
import React, { useState, useEffect, useRef, useContext } from 'react'

// This prevents re-showing the skeleton and retriggering requests when the
// sidebar unmounts/remounts (mobile drawer open/close).
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Logo from '../ui/Logo'
import MobileNavContext from './MobileNavContext'

function Item({
  to,
  icon: Icon,
  children,
  expanded,
  end = false,
  compact = false,
  mobile = false,
}) {
  const iconSize = compact ? 18 : 22
  const padding = mobile ? 'px-4 py-3' : compact ? 'px-2 py-2' : 'px-3 py-2.5'
  const textClass = mobile ? 'text-base' : compact ? 'text-sm' : 'text-sm'
  const mobileNav = useContext(MobileNavContext)
  const mobileClose = mobileNav?.close
  return (
    <NavLink
      to={to}
      end={end}
      onClick={() => {
        if (mobile) mobileClose?.()
      }}
      className={({ isActive }) => {
        const base = isActive
          ? 'text-primary bg-primary/15'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
        return `group relative flex items-center gap-3 rounded-lg ${padding} ${textClass} transition-colors ${
          !expanded ? 'justify-center' : ''
        } ${base}`
      }}
      title={!expanded && typeof children === 'string' ? children : undefined}
    >
      {Icon && <Icon size={iconSize} className="shrink-0" />}
      {expanded && <span className="truncate">{children}</span>}
    </NavLink>
  )
}

function Heading({ label, top = false, expanded, compact = false }) {
  const topMargin = top ? (compact ? 'mt-1' : 'mt-2') : compact ? 'mt-3' : 'mt-6'

  // When collapsed, render a separator line that takes up the same space as the heading
  if (!expanded) {
    return (
      <div className={`${topMargin} mb-4`}>
        <hr className="mx-auto w-1/2 border-soft" />
      </div>
    )
  }

  // When expanded, render the text title
  return (
    <div
      className={`${topMargin} mb-2 px-3 text-xs font-semibold tracking-wider text-text-tertiary uppercase text-left`}
    >
      {label}
    </div>
  )
}

function SidebarContent({
  expanded,
  onLogout,
  onLock,
  onUnlock,
  user,
  isAdmin,
  isLocked,
  compact = false,
  mobile = false,
}) {
  // Mobile padding: small top padding so logo sits closer to the top edge, but keep side padding
  const padding = mobile ? 'pt-1 px-3 pb-4' : compact ? 'p-2' : 'p-4'
  return (
    <div className={`flex flex-col h-full ${padding}`}>
      {/* Header */}
      <div
        className={`flex items-center ${mobile ? 'mb-4' : 'mb-6'} ${
          expanded ? 'justify-between' : 'justify-center'
        }`}
      >
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo className="w-9 h-9 text-primary" />
          {expanded && (mobile || !compact) && <div className="text-md font-bold">ARYC</div>}
        </Link>
        {expanded && !compact && !mobile && (
          <button
            onClick={isLocked ? onUnlock : onLock}
            aria-label={isLocked ? 'Close sidebar' : 'Lock sidebar open'}
            title={isLocked ? 'Close sidebar' : 'Lock sidebar open'}
            className="p-2 rounded-lg hover:bg-surface-muted text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <ChevronsLeft size={18} className={!isLocked ? 'rotate-180' : ''} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${
          compact ? '-mr-1 pr-1' : '-mr-2 pr-2'
        }`}
      >
        {user && !isAdmin && (
          <>
            <Item to="/dashboard" icon={Home} expanded={expanded} end mobile={mobile}>
              {'Dashboard'}
            </Item>
            <Item to="/test/today" icon={Clock} expanded={expanded} mobile={mobile}>
              {"Today's RC"}
            </Item>
            <Item to="/archive" icon={Archive} expanded={expanded} mobile={mobile}>
              {'Archive'}
            </Item>

            <Heading label="Insights" expanded={expanded} />
            <Item
              to="/results"
              icon={BarChart2}
              expanded={expanded}
              end
              compact={compact}
              mobile={mobile}
            >
              {'Results'}
            </Item>
            <Item
              to="/performance"
              icon={Grid}
              expanded={expanded}
              compact={compact}
              mobile={mobile}
            >
              {'Performance Studio'}
            </Item>

            <Heading label="Leaderboard" expanded={expanded} />
            <Item
              to="/leaderboard/global"
              icon={Trophy}
              expanded={expanded}
              compact={compact}
              mobile={mobile}
            >
              {'Global'}
            </Item>
            {/* <Item
              to="/leaderboard/local"
              icon={Trophy}
              expanded={expanded}
              compact={compact}
              mobile={mobile}
            >
              {'Cohort'}
            </Item> */}
          </>
        )}
        {user && isAdmin && (
          <>
            <Heading label="Admin" top expanded={expanded} />
            <Item to="/admin" icon={BarChart2} expanded={expanded} mobile={mobile} end={true}>
              {'Admin Dashboard'}
            </Item>

            <Heading label="RC Management" expanded={expanded} compact={compact} />
            <Item
              to="/admin/rcs"
              icon={Tag}
              expanded={expanded}
              compact={compact}
              mobile={mobile}
              end={true}
            >
              {'RC Inventory'}
            </Item>
            <Item
              to="/admin/rcs/new"
              icon={PlusCircle}
              expanded={expanded}
              compact={compact}
              mobile={mobile}
              end={true}
            >
              {'Create RC'}
            </Item>
            <Item
              to="/admin/rcs/drafts"
              icon={Archive}
              expanded={expanded}
              compact={compact}
              mobile={mobile}
            >
              {'Drafts'}
            </Item>
          </>
        )}

        {/* Unified structure for all groups */}
        <Heading label="Account" expanded={expanded} compact={compact} />
        <Item
          to="/profile"
          icon={User}
          expanded={expanded}
          end={true}
          compact={compact}
          mobile={mobile}
        >
          {'Profile'}
        </Item>
        {user &&
          (isAdmin ? (
            <>
              <Item
                to="/admin/subscriptions"
                icon={Grid}
                expanded={expanded}
                compact={compact}
                mobile={mobile}
              >
                {'Subscriptions'}
              </Item>
              <Item
                to="/admin/feedback"
                icon={BarChart2}
                expanded={expanded}
                compact={compact}
                mobile={mobile}
              >
                {'Feedback'}
              </Item>

              <Item
                to="/admin/feedback/new"
                icon={BarChart3}
                expanded={expanded}
                compact={compact}
                mobile={mobile}
              >
                {'Create Feedback Q'}
              </Item>
            </>
          ) : (
            <>
              <Item
                to="/subscriptions"
                icon={Grid}
                expanded={expanded}
                compact={compact}
                mobile={mobile}
              >
                {'Subscriptions'}
              </Item>
              <Item
                to="/feedback"
                icon={BarChart2}
                expanded={expanded}
                compact={compact}
                mobile={mobile}
              >
                {'Feedback'}
              </Item>
            </>
          ))}
        <Item to="/help" icon={Archive} expanded={expanded} compact={compact} mobile={mobile}>
          {'Help'}
        </Item>
      </div>

      {/* Footer */}
      <div
        className={`mt-auto border-t border-soft flex flex-col items-stretch ${
          compact ? 'py-6 gap-4' : 'py-6 gap-2'
        }`}
      >
        {/* Logout button first */}
        {/* <div className="px-3"> */}
        <button
          onClick={onLogout}
          className={`group relative flex items-center gap-4 rounded-lg w-full px-3 py-2.5 text-sm transition-colors text-text-secondary hover:text-error hover:bg-error/10 ${
            !expanded ? 'justify-center' : ''
          }`}
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={22} className="shrink-0" />
          {expanded && <span className="truncate font-medium">Logout</span>}
        </button>
        {/* </div> */}

        {/* User card pinned at bottom */}
        <div className={`flex items-center gap-3 px-3 ${expanded ? '' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium uppercase">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
              : 'U'}
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user?.name || 'You'}</div>
              <div className="text-xs text-text-secondary truncate">{user?.email}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ bare = false, mobile = false, compact = false }) {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('arc_sidebar_mode') === 'locked' ? 'locked' : 'collapsed'
    } catch {
      return 'locked'
    }
  })
  const [hovering, setHovering] = useState(false)
  const suppressHoverRef = useRef(false)
  const [slidingBackVisible, setSlidingBackVisible] = useState(false)
  const [slidingBackOut, setSlidingBackOut] = useState(false)

  const locked = mode === 'locked'
  const railWidth = '5.5rem'
  const expandedWidth = '16rem'

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--arc-sidebar-width',
      locked ? expandedWidth : railWidth
    )
  }, [locked])

  function lockOpen() {
    setMode('locked')
    suppressHoverRef.current = true
    setHovering(false)
    localStorage.setItem('arc_sidebar_mode', 'locked')
  }
  function closeSidebar() {
    // When transitioning from locked -> collapsed via unlock button, show axc
    // sliding overlay so the rail appears immediately and the expanded panel
    // slides away, preventing mid-shrink wrapping.
    setMode('collapsed')
    localStorage.setItem('arc_sidebar_mode', 'collapsed')

    // Show overlay and animate it sliding out to the left
    setSlidingBackVisible(true)
    // Start the slide-out on the next frame to allow render
    setTimeout(() => setSlidingBackOut(true), 30)
    // Clean up after animation duration
    setTimeout(() => {
      setSlidingBackVisible(false)
      setSlidingBackOut(false)
    }, 260)
  }

  if (bare) {
    return (
      <div className="bg-card-surface" style={{ width: expandedWidth }}>
        <SidebarContent
          expanded
          user={user}
          isAdmin={isAdmin}
          onLogout={logout}
          isLocked={true}
          onUnlock={closeSidebar}
          mobile={mobile}
          compact={compact && !mobile}
        />
      </div>
    )
  }

  const showOverlay = !locked && hovering
  const railActualWidth = locked ? expandedWidth : railWidth

  const commonProps = {
    user,
    isAdmin,
    onLogout: logout,
    onLock: lockOpen,
    onUnlock: closeSidebar,
  }

  return (
    <>
      {/* Rail / locked container */}
      <aside
        onMouseEnter={() => {
          if (!locked && !suppressHoverRef.current) setHovering(true)
        }}
        onMouseLeave={() => {
          if (!locked) {
            setHovering(false)
            suppressHoverRef.current = false
          }
        }}
        className="hidden md:block bg-card-surface"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: railActualWidth,
          zIndex: 40,
          transition: 'width .2s ease-in-out',
        }}
      >
        <SidebarContent
          {...commonProps}
          expanded={locked}
          isLocked={locked}
          mobile={mobile}
          compact={compact && !mobile}
        />
      </aside>

      {/* Hover overlay (expands over content) and slide-back overlay when unlocking */}
      <div
        className={`hidden md:block bg-card-surface shadow-lg fixed top-0 bottom-0 z-50 transition-transform duration-200 ease-in-out ${
          // Determine transform based on hover or sliding-back animation state
          slidingBackVisible
            ? slidingBackOut
              ? '-translate-x-full'
              : 'translate-x-0'
            : showOverlay
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
        style={{ width: expandedWidth }}
        onMouseLeave={() => {
          setHovering(false)
          suppressHoverRef.current = false
        }}
        onMouseEnter={() => setHovering(true)}
      >
        <SidebarContent
          {...commonProps}
          expanded
          isLocked={false}
          mobile={mobile}
          compact={compact && !mobile}
        />
      </div>
    </>
  )
}
