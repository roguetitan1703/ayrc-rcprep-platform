import { useAuth } from '../../components/auth/AuthContext'
import { Flame } from 'lucide-react'

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
}

export function DashboardGreeting({ streak }) {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const timeOfDay = getTimeOfDay()

  return (
    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          Good {timeOfDay}, {firstName}!
        </h1>
        <p className="text-base text-text-secondary">
          Ready to sharpen your skills today?
        </p>
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-[#EEF1FA] to-white rounded-xl border border-border-soft shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-[#D33F49]/10 p-2.5 rounded-lg">
            <Flame className="text-[#D33F49]" size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary">{streak}</div>
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide">day streak</div>
          </div>
        </div>
      )}
    </div>
  )
}
