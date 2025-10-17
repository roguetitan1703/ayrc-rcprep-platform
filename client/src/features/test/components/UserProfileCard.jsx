import { User } from 'lucide-react'
import { useAuth } from '../../../components/auth/AuthContext'

/**
 * UserProfileCard - Displays user avatar and name
 * Matches CAT exam interface profile card at top of right panel
 */
export function UserProfileCard() {
  const { user } = useAuth()

  // Generate avatar initials from name
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="bg-card-surface rounded-lg p-3 border border-border-soft flex items-center gap-3">
      {/* Avatar Circle */}
      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
        <span className="text-sm font-semibold text-primary">
          {getInitials(user?.name)}
        </span>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {user?.name || 'User'}
        </div>
        <div className="text-xs text-text-secondary truncate">
          {user?.email || ''}
        </div>
      </div>
    </div>
  )
}
