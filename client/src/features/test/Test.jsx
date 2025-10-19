import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../lib/api'
import { QUESTION_COUNT, TEST_DURATION_SECONDS, LOCAL_PROGRESS_KEY } from '../../lib/constants'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { UserProfileCard } from './components/UserProfileCard'
import { QuestionStatusLegend } from './components/QuestionStatusLegend'
import { SectionInfo } from './components/SectionInfo'
import { QuestionPalette } from './components/QuestionPalette'
import { FullscreenRequired } from './components/FullscreenRequired'
import { InstructionsModal } from './components/InstructionsModal'
import { OtherInstructionsModal } from './components/OtherInstructionsModal'
import { FullscreenExitedModal } from './components/FullscreenExitedModal'

export default function Test() {
  const { id } = useParams()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const mode = params.get('mode')
  const isPractice = mode === 'practice' || params.get('practice') === '1'
  const isPreview = mode === 'preview' || params.get('preview') === '1'
  const [rc, setRc] = useState(null)
  const [answers, setAnswers] = useState(Array.from({ length: QUESTION_COUNT }, () => ''))
  const [marked, setMarked] = useState(Array.from({ length: QUESTION_COUNT }, () => false))
  const [visited, setVisited] = useState(Array.from({ length: QUESTION_COUNT }, () => false))
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS)
  const [startedAt, setStartedAt] = useState(null)
  const [questionTimers, setQuestionTimers] = useState(
    Array.from({ length: QUESTION_COUNT }, () => 0)
  ) // seconds per question
  const questionStartRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revealAnswers, setRevealAnswers] = useState(false)
  const nav = useNavigate()
  const toast = useToast()
  const intervalRef = useRef(null)
  const autosaveRef = useRef(null)

  // Fullscreen and Instructions State
  const [showFullscreenRequired, setShowFullscreenRequired] = useState(!isPractice && !isPreview)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showOtherInstructions, setShowOtherInstructions] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenExited, setShowFullscreenExited] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)
  // Window size check state
  const [windowTooSmall, setWindowTooSmall] = useState(false)

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get(`/rcs/${id}${isPractice ? '?practice=1' : ''}`)
        // Debug: log RC and user info
        console.log('RC fetch:', { rc: data, user: window.arcUser })
        setRc(data)
        // restore any local progress
        const key = LOCAL_PROGRESS_KEY(id, isPractice ? 'practice' : isPreview ? 'preview' : 'test')
        const saved = localStorage.getItem(key)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed.answers) && parsed.answers.length === QUESTION_COUNT)
              setAnswers(parsed.answers)
            if (Array.isArray(parsed.marked) && parsed.marked.length === QUESTION_COUNT)
              setMarked(parsed.marked)
            if (Array.isArray(parsed.visited) && parsed.visited.length === QUESTION_COUNT)
              setVisited(parsed.visited)
            if (typeof parsed.qIndex === 'number')
              setQIndex(Math.min(QUESTION_COUNT - 1, Math.max(0, parsed.qIndex)))
            if (typeof parsed.questionTimers !== 'undefined')
              setQuestionTimers(parsed.questionTimers)
            // Restore time-related state
            if (typeof parsed.timeLeft === 'number' && !isPractice && !isPreview)
              setTimeLeft(parsed.timeLeft)
            if (typeof parsed.startedAt === 'number') setStartedAt(parsed.startedAt)
          } catch {}
        } else {
          // Only mark first question as visited if no saved state
          setVisited((v) => {
            const b = [...v]
            b[0] = true
            return b
          })
        }
      } catch (e) {
        setError(e?.response?.data?.error || e.message)
        // Debug: log error
        console.error('RC fetch error:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isPractice, isPreview])

  // Timer effect - only run when not paused
  useEffect(() => {
    if (isPractice || isPreview || !testStarted || timerPaused) return
    intervalRef.current = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(intervalRef.current)
  }, [isPractice, isPreview, testStarted, timerPaused])

  useEffect(() => {
    if (!(isPractice || isPreview) && timeLeft === 0) submit()
  }, [timeLeft, isPractice, isPreview])

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )

      setIsFullscreen(isCurrentlyFullscreen)

      // If test has started and user exits fullscreen, pause the test
      if (testStarted && !isCurrentlyFullscreen && !(isPractice || isPreview)) {
        setTimerPaused(true)
        setShowFullscreenExited(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [testStarted, isPractice, isPreview])

  // Fullscreen handlers
  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        await elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen()
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen()
      }
      setIsFullscreen(true)
      setShowFullscreenExited(false)
      if (testStarted) setTimerPaused(false) // Resume timer when re-entering fullscreen
    } catch (err) {
      console.error('Error entering fullscreen:', err)
      toast.show('Unable to enter fullscreen mode', { variant: 'error' })
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }
      setIsFullscreen(false)
    } catch (err) {
      console.error('Error exiting fullscreen:', err)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  // Handler for entering fullscreen from initial screen
  const handleEnterFullscreenFromRequired = async () => {
    await enterFullscreen()
    setShowFullscreenRequired(false)
    setShowInstructions(true)
  }

  // Handler for moving from instructions to other instructions
  const handleInstructionsNext = () => {
    setShowInstructions(false)
    setShowOtherInstructions(true)
  }

  // Handler for going back from other instructions to instructions
  const handleOtherInstructionsPrevious = () => {
    setShowOtherInstructions(false)
    setShowInstructions(true)
  }

  // Handler for starting the test
  const handleStartTest = () => {
    setShowOtherInstructions(false)
    setTestStarted(true)
    setTimerPaused(false)
  }

  // Helper function to save progress
  const saveProgress = () => {
    const key = LOCAL_PROGRESS_KEY(id, isPractice ? 'practice' : isPreview ? 'preview' : 'test')
    const payload = {
      answers,
      marked,
      visited,
      qIndex,
      questionTimers,
      timeLeft, // Save timer state
      startedAt, // Save start time
    }
    try {
      localStorage.setItem(key, JSON.stringify(payload))
    } catch {}
  }

  // autosave to localStorage every 30s
  useEffect(() => {
    autosaveRef.current = setInterval(saveProgress, 30000)
    return () => clearInterval(autosaveRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, answers, marked, visited, qIndex, questionTimers, timeLeft, startedAt])

  // Save immediately when answers, marked, or visited changes
  useEffect(() => {
    if (!loading && rc) {
      saveProgress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, marked, visited])

  // Save on page unload/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, answers, marked, visited, qIndex, questionTimers, timeLeft, startedAt])

  // Initialize start time and per-question timer start when component mounts / rc loaded
  useEffect(() => {
    if (loading) return
    setStartedAt((prev) => prev || Date.now())
    // start timing for current question
    questionStartRef.current = Date.now()
    return () => {
      // on unmount, record the in-progress question time
      if (questionStartRef.current != null) {
        const delta = Math.floor((Date.now() - questionStartRef.current) / 1000)
        setQuestionTimers((t) => {
          const a = [...t]
          a[qIndex] = (a[qIndex] || 0) + delta
          return a
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  function selectAnswer(i, val) {
    setAnswers((a) => {
      const b = [...a]
      b[i] = val
      return b
    })
  }

  function goToQuestion(newIndex) {
    setQIndex(newIndex)
    // Mark as visited when navigating to a question
    setVisited((v) => {
      const b = [...v]
      b[newIndex] = true
      return b
    })
  }

  const prevIndexRef = useRef(qIndex)

  // record time when moving between questions
  useEffect(() => {
    // whenever qIndex changes, close previous timer and start new
    const now = Date.now()
    if (questionStartRef.current != null) {
      const delta = Math.floor((now - questionStartRef.current) / 1000)
      setQuestionTimers((t) => {
        const a = [...t]
        const idx = prevIndexRef.current ?? 0
        a[idx] = (a[idx] || 0) + delta
        return a
      })
    }
    // start new timer for current
    questionStartRef.current = now
    prevIndexRef.current = qIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex])

  async function submit() {
    try {
      if (isPreview) {
        nav('/dashboard')
        return
      }
      // For practice mode, compute score locally and show results without POSTing
      if (isPractice) {
        // finalize timers
        const nowP = Date.now()
        const finalTimersP = [...questionTimers]
        if (questionStartRef.current != null) {
          const delta = Math.floor((nowP - questionStartRef.current) / 1000)
          finalTimersP[qIndex] = (finalTimersP[qIndex] || 0) + delta
        }
        const normalizedP = answers.map((a) => (a === null ? '' : a))
        let scoreP = 0
        rc.questions.forEach((q, i) => {
          if (normalizedP[i] && normalizedP[i] === q.correctAnswerId) scoreP += 1
        })
        const totalDurationP = Math.floor((nowP - (startedAt || nowP)) / 1000)
        try {
          localStorage.removeItem(LOCAL_PROGRESS_KEY(id))
        } catch {}
        nav(`/results/${id}?practice=1&score=${scoreP}&time=${totalDurationP}`)
        return
      }
      // finalize timers (compute synchronously so we can send correct payload)
      const now = Date.now()
      const finalTimers = [...questionTimers]
      if (questionStartRef.current != null) {
        const delta = Math.floor((now - questionStartRef.current) / 1000)
        finalTimers[qIndex] = (finalTimers[qIndex] || 0) + delta
      }
      setQuestionTimers(finalTimers)
      const totalDuration = Math.floor((now - (startedAt || now)) / 1000)
      // derive device type
      const ua = navigator.userAgent || ''
      const deviceType = /Mobi|Android|iPhone|iPad/.test(ua)
        ? /iPad|Tablet/.test(ua)
          ? 'tablet'
          : 'mobile'
        : 'desktop'

      // Build q_details from finalized timers
      const q_details = finalTimers.map((sec, idx) => ({
        questionIndex: idx,
        timeSpent: sec || 0,
        wasReviewed: !!marked[idx],
      }))

      const payload = {
        rcPassageId: id,
        answers,
        durationSeconds: totalDuration,
        timeTaken: TEST_DURATION_SECONDS - timeLeft,
        deviceType,
        q_details,
        attemptType: 'official',
      }
      const { data } = await api.post('/attempts', payload)
      try {
        localStorage.removeItem(LOCAL_PROGRESS_KEY(id))
      } catch {}
      nav(`/results/${id}?score=${data.score}&time=${TEST_DURATION_SECONDS - timeLeft}`)
    } catch (e) {
      const msg = extractErrorMessage(e, 'Submit failed')
      setError(msg)
      toast.show(msg, { variant: 'error' })
    }
  }

  if (loading)
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Top bar skeleton */}
        <div className="bg-card-surface border border-border-soft rounded-lg mb-3 px-5 py-3">
          <Skeleton className="h-6 w-full" />
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4">
          <div className="col-span-5 bg-card-surface rounded p-4 overflow-hidden border border-border-soft">
            <Skeleton className="h-6 w-2/5 mb-4" />
            <SkeletonText lines={6} />
          </div>
          <div className="col-span-4 space-y-3">
            <div className="bg-card-surface rounded p-3 border border-border-soft">
              <Skeleton className="h-5 w-1/3" />
            </div>
            <div className="bg-card-surface rounded p-4 space-y-2 border border-border-soft">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
          <div className="col-span-3 space-y-3">
            <Skeleton className="h-16 rounded" />
            <Skeleton className="h-48 rounded" />
            <Skeleton className="h-16 rounded" />
            <Skeleton className="h-48 rounded" />
          </div>
        </div>
        <div className="mt-4 bg-card-surface rounded flex items-center justify-between px-5 py-3 border border-border-soft">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    )

  // If error, show error message
  if (error)
    return (
      <div className="p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">
        {error}
      </div>
    )

  // If RC not loaded yet
  if (!rc) return null

  // Subscription/join date access control: block content if not allowed
  if (rc && rc.allowedForUser === false) {
    return (
      <div className="p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded text-center max-w-xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="mb-4">
          This Reading Comprehension is not available under your current subscription plan or join
          date.
        </p>
        <p className="mb-4">Upgrade your plan or check your eligibility to access this content.</p>
        <Link to="/dashboard" className="inline-block mt-2 text-info-blue underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const q = rc.questions[qIndex]

  // Handler functions for footer actions
  const handleMarkAndNext = () => {
    setMarked((m) => {
      const c = [...m]
      c[qIndex] = true
      return c
    })
    if (qIndex < QUESTION_COUNT - 1) goToQuestion(qIndex + 1)
  }

  const handleClearResponse = () => {
    selectAnswer(qIndex, '')
  }

  const handleSaveAndNext = () => {
    if (qIndex < QUESTION_COUNT - 1) goToQuestion(qIndex + 1)
  }

  // Show fullscreen required screen
  if (showFullscreenRequired && !isPractice && !isPreview) {
    return <FullscreenRequired onEnterFullscreen={handleEnterFullscreenFromRequired} />
  }

  // Show instructions screen
  if (showInstructions && !isPractice && !isPreview) {
    return <InstructionsModal rc={rc} onNext={handleInstructionsNext} />
  }

  // Show other instructions screen
  if (showOtherInstructions && !isPractice && !isPreview) {
    return (
      <OtherInstructionsModal
        rc={rc}
        onPrevious={handleOtherInstructionsPrevious}
        onStartTest={handleStartTest}
      />
    )
  }

  return (
    <>
      {/* Fullscreen exited modal overlay */}
      {showFullscreenExited && !isPractice && !isPreview && (
        <FullscreenExitedModal
          onEnterFullscreen={enterFullscreen}
          windowTooSmall={windowTooSmall}
        />
      )}

      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Top Section Bar - CAT Style */}
        {!(isPractice || isPreview) && (
          <div className="bg-card-surface border border-border-soft rounded-lg mb-3 px-5 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-8">
              <div className="text-sm">
                <span className="text-text-secondary">Section: </span>
                <span className="font-semibold text-info-blue">
                  Data Interpretation & Reading Comprehension
                </span>
              </div>
              <div className="text-sm">
                <span className="text-text-secondary">Question No. </span>
                <span className="font-bold text-text-primary">{qIndex + 1}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-text-secondary">Marks for correct answer </span>
                <span className="font-bold text-success-green">3</span>
                <span className="text-text-secondary"> | Negative Marks </span>
                <span className="font-bold text-error-red">0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-secondary">Time Left :</span>
                <div
                  className={`text-2xl font-bold ${
                    timeLeft <= 60 ? 'text-error-red' : 'text-text-primary'
                  } ${timerPaused ? 'opacity-50' : ''}`}
                >
                  {Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(timeLeft % 60).toString().padStart(2, '0')}
                  {timerPaused && <span className="text-xs ml-2 text-accent-amber">(Paused)</span>}
                </div>
              </div>
              {/* Fullscreen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded hover:bg-surface-muted transition-colors text-text-secondary hover:text-text-primary"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
          </div>
        )}

        <div
          className={`flex-1 gap-4 overflow-hidden relative transition-all duration-300 ${
            sidebarCollapsed ? 'grid grid-cols-2' : 'grid grid-cols-12'
          }`}
        >
          {/* Passage Column */}
          <div
            className={`bg-card-surface rounded flex flex-col border border-border-soft shadow-sm ${
              sidebarCollapsed ? 'col-span-1' : 'col-span-5'
            }`}
          >
            <div className="px-5 pt-4 pb-3 border-b border-border-soft flex items-center justify-between">
              <h2 className="text-lg font-semibold truncate pr-4">{rc.title}</h2>
              {(isPractice || isPreview) && (
                <Badge color="default">{isPractice ? 'Practice Mode' : 'Preview'}</Badge>
              )}
            </div>
            <div className="px-5 py-4 overflow-auto font-serif whitespace-pre-wrap leading-relaxed text-text-primary/90">
              {rc.passageText}
            </div>
          </div>

          {/* Question Column */}
          <div
            className={`bg-card-surface rounded flex flex-col border border-border-soft shadow-sm ${
              sidebarCollapsed ? 'col-span-1' : 'col-span-4'
            }`}
          >
            <div className="px-5 pt-4 pb-3 border-b border-border-soft flex items-center justify-between text-sm">
              <div className="font-semibold text-text-primary">Question {qIndex + 1}</div>
              <div className="flex items-center gap-3">
                {isPractice && (
                  <>
                    <span className="text-text-secondary">Practice Mode</span>
                    <button
                      type="button"
                      onClick={() => setRevealAnswers((r) => !r)}
                      className="text-xs px-2 py-1 rounded border bg-background hover:bg-background/95"
                    >
                      {revealAnswers ? 'Hide Answers' : 'Reveal Answers'}
                    </button>
                  </>
                )}
                {isPreview && <span className="text-accent-amber">Preview</span>}
              </div>
            </div>
            <div className="p-5 flex-1 overflow-auto">
              <div className="mb-4 text-sm leading-relaxed">{q.questionText}</div>
              <fieldset className="space-y-2.5">
                <legend className="sr-only">Answer choices</legend>
                {q.options.map((op) => (
                  <label
                    key={op.id}
                    className="flex items-start gap-2.5 cursor-pointer text-sm hover:bg-surface-muted/50 p-2 rounded transition-colors"
                  >
                    <input
                      type="radio"
                      className="mt-0.5"
                      name={`q${qIndex}`}
                      checked={answers[qIndex] === op.id}
                      onChange={() => selectAnswer(qIndex, op.id)}
                    />
                    <span className="leading-snug">
                      <span className="font-medium mr-1">{op.id}.</span>
                      {op.text}
                      {isPractice && revealAnswers && answers[qIndex] === op.id && (
                        <span
                          className={`ml-2 text-xs ${
                            answers[qIndex] === rc.questions[qIndex].correctAnswerId
                              ? 'text-success-green'
                              : 'text-error-red'
                          }`}
                        >
                          {op.id === rc.questions[qIndex].correctAnswerId
                            ? '✓ Correct'
                            : '✕ Incorrect'}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </fieldset>
              {isPractice && revealAnswers && (
                <div className="mt-4 text-sm text-text-secondary bg-surface-muted p-3 rounded">
                  <span className="font-semibold">Explanation: </span>
                  {rc.questions[qIndex].explanation}
                </div>
              )}
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={marked[qIndex]}
                    onChange={() =>
                      setMarked((m) => {
                        const c = [...m]
                        c[qIndex] = !c[qIndex]
                        return c
                      })
                    }
                  />
                  <span>Mark for review</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Panel - CAT Style with Collapse */}
          <div
            className={`transition-all duration-300 flex flex-col gap-3 overflow-auto relative ${
              sidebarCollapsed ? 'col-span-0 w-0 opacity-0 pointer-events-none' : 'col-span-3'
            }`}
          >
            <UserProfileCard />
            <QuestionStatusLegend />
            <SectionInfo sectionName="Reading Comprehension" topicTags={rc.topicTags || []} />
            <QuestionPalette
              currentIndex={qIndex}
              answers={answers}
              marked={marked}
              visited={visited}
              onQuestionClick={goToQuestion}
            />
          </div>

          {/* Sidebar Toggle Button - Positioned on border */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card-surface border-2 border-border-soft rounded-l-lg shadow-lg hover:bg-surface-muted transition-all p-2"
            style={{
              right: sidebarCollapsed ? '0' : 'calc(25% - 1rem)',
            }}
            title={sidebarCollapsed ? 'Show Question Palette' : 'Hide Question Palette'}
          >
            {sidebarCollapsed ? (
              <ChevronLeft size={20} className="text-text-primary" />
            ) : (
              <ChevronRight size={20} className="text-text-primary" />
            )}
          </button>
        </div>

        {/* Footer - CAT Style with 4 Buttons */}
        <div className="mt-4 bg-card-surface rounded flex items-center justify-between px-5 py-3 border border-border-soft shadow-sm">
          <Link
            to="/dashboard"
            className="text-text-secondary hover:text-primary transition-colors text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            {/* Mark for Review & Next */}
            <button
              onClick={handleMarkAndNext}
              className="px-4 py-2.5 text-sm font-semibold text-text-primary bg-surface-muted border border-border-soft rounded hover:bg-neutral-grey/20 transition-colors"
            >
              Mark for Review & Next
            </button>

            {/* Clear Response */}
            {answers[qIndex] && (
              <button
                onClick={handleClearResponse}
                className="px-4 py-2.5 text-sm font-semibold text-text-primary bg-surface-muted border border-border-soft rounded hover:bg-neutral-grey/20 transition-colors"
              >
                Clear Response
              </button>
            )}

            {/* Save & Next OR Submit */}
            {qIndex < QUESTION_COUNT - 1 ? (
              <button
                onClick={handleSaveAndNext}
                className="px-5 py-2.5 bg-info-blue text-white font-bold text-sm rounded hover:bg-info-blue/90 transition-colors shadow-sm"
              >
                {isPractice || isPreview ? 'Next' : 'Save & Next'}
              </button>
            ) : (
              <button
                onClick={submit}
                className="px-5 py-2.5 bg-info-blue text-white font-bold text-sm rounded hover:bg-info-blue/90 transition-colors shadow-sm"
              >
                {isPractice || isPreview ? 'Done' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
