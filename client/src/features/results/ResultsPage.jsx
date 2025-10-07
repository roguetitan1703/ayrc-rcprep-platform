import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { AttemptScoreCard } from './components/AttemptScoreCard'
import { StatsPanel } from './components/StatsPanel'

export default function ResultsPage() {
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch attempts list (now includes stats on page 1)
      const attemptsRes = await api.get(`/attempts?page=${page}&limit=10`)
      setAttempts(attemptsRes.data?.attempts || [])
      setTotalPages(attemptsRes.data?.pagination?.totalPages || 1)

      // Stats are included in the response for page 1
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
    // Navigate to analysis details for the selected attempt
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
      <div className="flex items-center justify-center p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-10">
      <StatsPanel stats={stats} loading={loading && page === 1} />
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Recent Attempts</h2>
          <span className="text-xs uppercase tracking-wide text-text-secondary">Showing {attempts.length} / page {page}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading && attempts.length === 0 ? (
            <>
              <div className="bg-card-surface border border-soft rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-surface-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-surface-muted rounded w-1/2" />
              </div>
              <div className="bg-card-surface border border-soft rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-surface-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-surface-muted rounded w-1/2" />
              </div>
            </>
          ) : attempts.length === 0 ? (
            <div className="col-span-full bg-card-surface border border-soft rounded-xl p-12 text-center">
              <p className="text-text-secondary mb-4">No attempts yet</p>
              <a
                href="/dashboard"
                className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Start Your First Test
              </a>
            </div>
          ) : (
            attempts.map((attempt) => (
              <div key={attempt._id} className="relative group">
                <AttemptScoreCard
                  attemptId={attempt._id}
                  rcTitle={attempt.rcPassage?.title || 'Untitled'}
                  score={attempt.score}
                  correctCount={attempt.correctCount}
                  totalQuestions={attempt.totalQuestions}
                  duration={attempt.durationSeconds}
                  attemptedAt={attempt.attemptedAt}
                  isPersonalBest={attempt.isPersonalBest}
                  onClick={() => handleAttemptClick(attempt._id)}
                  variant="compact"
                />
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-text-secondary">
                  <div className="flex flex-col bg-surface-muted/60 rounded p-2">
                    <span className="font-medium text-text-primary">{attempt.avgTimePerQuestion || 0}s</span>
                    <span>Avg Time</span>
                  </div>
                  <div className="flex flex-col bg-surface-muted/60 rounded p-2">
                    <span className="font-medium text-text-primary">{attempt.wrongCount}</span>
                    <span>Wrong</span>
                  </div>
                  <div className="flex flex-col bg-surface-muted/60 rounded p-2">
                    <span className="font-medium text-text-primary">{attempt.taggedWrong || 0}</span>
                    <span>Tagged</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-soft rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-text-secondary">Page {page} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border border-soft rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
