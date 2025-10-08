import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { StatsPanel } from './components/StatsPanel'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ResultsPage() {
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState(null)
  const limit = 15

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const attemptsRes = await api.get(`/attempts?page=${page}&limit=${limit}`)
      setAttempts(attemptsRes.data?.attempts || [])
      setTotalPages(attemptsRes.data?.pagination?.totalPages || 1)
      setTotalCount(attemptsRes.data?.pagination?.total || 0)

      if (page === 1 && attemptsRes.data?.stats) {
        setStats(attemptsRes.data.stats)
      }
    } catch (err) {
      setError('Failed to load attempts')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAttemptClick = (attemptId) => {
    navigate(`/analysis/${attemptId}`)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 bg-[#E4572E]/10 border border-[#E4572E]/40 text-[#E4572E] rounded-xl">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#273043]">Attempt History</h1>
        <p className="text-sm text-[#5C6784] mt-1">
          Track your performance and review past attempts
        </p>
      </div>

      <StatsPanel stats={stats} loading={loading && page === 1} />
      
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[#D8DEE9] bg-[#F7F8FC]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#273043]">Recent Attempts</h2>
            <span className="text-xs text-[#5C6784]">
              {totalCount} total attempt{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loading && attempts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-[#EEF1FA] rounded w-full" />
              <div className="h-4 bg-[#EEF1FA] rounded w-full" />
              <div className="h-4 bg-[#EEF1FA] rounded w-full" />
            </div>
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#5C6784] mb-4">No attempts yet</p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Start Your First Test
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#D8DEE9]">
                <thead className="bg-[#EEF1FA]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5C6784] uppercase tracking-wider">
                      Passage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5C6784] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5C6784] uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5C6784] uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5C6784] uppercase tracking-wider">
                      Topics
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#5C6784] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#D8DEE9]">
                  {attempts.map((attempt) => {
                    const percentage = ((attempt.score / 4) * 100).toFixed(0)
                    const scoreColor = 
                      attempt.score === 4 ? 'text-[#23A094]' :
                      attempt.score >= 3 ? 'text-[#3B82F6]' :
                      attempt.score >= 2 ? 'text-[#F6B26B]' :
                      'text-[#E4572E]'
                    
                    return (
                      <tr 
                        key={attempt._id}
                        className="hover:bg-[#EEF1FA]/30 transition-colors cursor-pointer"
                        onClick={() => handleAttemptClick(attempt._id)}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#273043]">
                            {attempt.rcPassage?.title || 'Untitled Passage'}
                          </div>
                          <div className="text-xs text-[#5C6784] mt-1 line-clamp-1">
                            {attempt.rcPassage?.passage?.substring(0, 80)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C6784]">
                          {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-lg font-bold ${scoreColor}`}>
                            {attempt.score}/4
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#EEF1FA] rounded-full h-2 w-16">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  attempt.score === 4 ? 'bg-[#23A094]' :
                                  attempt.score >= 3 ? 'bg-[#3B82F6]' :
                                  attempt.score >= 2 ? 'bg-[#F6B26B]' :
                                  'bg-[#E4572E]'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-[#5C6784]">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {attempt.rcPassage?.topicTags?.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} color="neutral" size="sm">
                                {tag}
                              </Badge>
                            ))}
                            {attempt.rcPassage?.topicTags?.length > 2 && (
                              <Badge color="neutral" size="sm">
                                +{attempt.rcPassage.topicTags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAttemptClick(attempt._id)
                            }}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#D8DEE9] bg-[#F7F8FC]">
              <div className="text-sm text-[#5C6784]">
                Showing <span className="font-semibold text-[#273043]">{((page - 1) * limit) + 1}</span> to{' '}
                <span className="font-semibold text-[#273043]">{Math.min(page * limit, totalCount)}</span> of{' '}
                <span className="font-semibold text-[#273043]">{totalCount}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePageChange(page - 1)
                  }}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm text-[#273043] font-medium px-3">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePageChange(page + 1)
                  }}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
