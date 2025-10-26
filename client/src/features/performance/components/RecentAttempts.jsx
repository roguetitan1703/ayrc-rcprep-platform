import { Card, CardHeader, CardContent } from '../../../components/ui/Card'
import { Award, ExternalLink, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export function RecentAttempts({ attempts, personalBest }) {
  return (
    <Card className="bg-white border border-[#D8DEE9] hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-6 border-b border-[#D8DEE9]">
        <h3 className="text-lg font-semibold text-[#273043]">Recent Attempts</h3>
        <p className="text-sm text-[#5C6784] mt-1">
          Last 10 attempts (most recent first)
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#D8DEE9]">
          {attempts.map((attempt) => {
            const isPersonalBest = attempt.score === personalBest
            const scorePercentage = (attempt.score / 4) * 100

            return (
              <Link
                key={attempt.rcId}
                to={`/attempts/${attempt.rcId}/analysis`}
                className="flex items-center justify-between p-6 hover:bg-[#EEF1FA]/40 transition-all duration-150 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-sm font-semibold text-[#273043] truncate group-hover:text-[#D33F49] transition-colors">
                      {attempt.rcTitle}
                    </div>
                    {isPersonalBest && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#D33F49]/10 text-[#D33F49] border border-[#D33F49]/20">
                        <Award size={12} />
                        PB
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#5C6784]">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{new Date(attempt.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                    {attempt.topicTags?.length > 0 && (
                      <>
                        <span className="text-[#D8DEE9]">•</span>
                        <div className="flex gap-1.5">
                          {attempt.topicTags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-[#EEF1FA] text-[10px] uppercase font-semibold tracking-wide border border-[#D8DEE9]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#273043]">
                      {attempt.score}/4
                    </div>
                    <div className={`text-xs font-bold ${
                      scorePercentage >= 75 ? 'text-[#23A094]' :
                      scorePercentage >= 50 ? 'text-[#F6B26B]' :
                      'text-[#E4572E]'
                    }`}>
                      {scorePercentage.toFixed(0)}%
                    </div>
                  </div>
                  <ExternalLink size={18} className="text-[#5C6784] group-hover:text-[#D33F49] transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>

        {attempts.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-[#5C6784] mb-3">No attempts yet</p>
            <Link 
              to="/test/today" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D33F49] text-white rounded-lg hover:bg-[#E25C62] transition-colors font-medium text-sm"
            >
              Start your first RC
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
