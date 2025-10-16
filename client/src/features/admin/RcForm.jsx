import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../components/auth/AuthContext'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'

const defaultQuestion = {
  questionText: '',
  options: [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ],
  correctAnswerId: 'A',
  explanation: '',
  questionType: 'inference',
  difficulty: 'medium',
}

const empty = {
  title: '',
  passageText: '',
  source: '',
  topicTags: '',
  status: 'draft',
  scheduledDate: '',
  questions: [],
}

export default function RcForm() {
  const { id } = useParams()
  const isEdit = id && id !== 'new'
  const [form, setForm] = useState(empty)
  const [currentQ, setCurrentQ] = useState({ ...defaultQuestion })
  const [editIndex, setEditIndex] = useState(null)
  const [loading, setLoading] = useState(!!isEdit)
  const [warning, setWarning] = useState('')
  const nav = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (!isEdit) return
    if (user && user.role !== 'admin') {
      nav('/admin/login')
      return
    }
    ;(async () => {
      try {
        const { data } = await api.get(`/admin/rcs`)
        const rc = data.find((x) => x._id === id)
        if (rc) {
          setForm({
            title: rc.title,
            passageText: rc.passageText,
            source: rc.source || '',
            topicTags: (rc.topicTags || []).join(','),
            status: rc.status,
            scheduledDate: rc.scheduledDate?.slice(0, 10) || '',
            questions: rc.questions || [],
          })
        }
      } catch (e) {
        toast.show(extractErrorMessage(e), { variant: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [id, user])

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function setQuestionField(k, v) {
    setCurrentQ((q) => ({ ...q, [k]: v }))
  }

  function setOption(id, text) {
    setCurrentQ((q) => ({
      ...q,
      options: q.options.map((o) => (o.id === id ? { ...o, text } : o)),
    }))
  }

  function addOrUpdateQuestion() {
    if (!currentQ.questionText.trim()) {
      toast.show('Enter question text', { variant: 'warning' })
      return
    }
    if (currentQ.options.some((o) => !o.text.trim())) {
      toast.show('All options must be filled', { variant: 'warning' })
      return
    }

    setForm((f) => {
      const updated = [...f.questions]
      if (editIndex !== null) updated[editIndex] = currentQ
      else updated.push(currentQ)
      return { ...f, questions: updated }
    })

    setCurrentQ({ ...defaultQuestion })
    setEditIndex(null)
  }

  function editQuestion(i) {
    setCurrentQ(form.questions[i])
    setEditIndex(i)
  }

  function deleteQuestion(i) {
    setForm((f) => ({
      ...f,
      questions: f.questions.filter((_, idx) => idx !== i),
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (form.questions.length !== 4) {
      toast.show('Exactly 4 questions are required', { variant: 'error' })
      return
    }

    try {
      const payload = {
        title: form.title.trim(),
        passageText: form.passageText.trim(),
        source: form.source.trim() || undefined,
        topicTags: form.topicTags
          ? form.topicTags.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        status: form.status,
        scheduledDate: form.scheduledDate
          ? new Date(form.scheduledDate)
          : undefined,
        questions: form.questions,
      }

      if (isEdit) await api.put(`/admin/rcs/${id}`, payload)
      else await api.post(`/admin/rcs`, payload)

      toast.show('RC saved successfully!', { variant: 'success' })
      nav('/admin')
    } catch (e) {
      toast.show(extractErrorMessage(e), { variant: 'error' })
    }
  }

  if (loading)
    return (
      <div className="max-w-4xl mx-auto py-6">
        <Card>
          <CardHeader>
            <h1 className="h4">{isEdit ? 'Edit RC' : 'Create RC'}</h1>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-1/2 mb-3" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    )

  return (
    <div className="max-w-5xl mx-auto py-6">
      <Card>
        <CardHeader>
          <h1 className="h4">{isEdit ? 'Edit RC' : 'Create RC'}</h1>
        </CardHeader>
        <CardContent>
          {warning && <div className="text-accent-amber mb-3">{warning}</div>}

          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Basic Fields */}
            <div>
              <label className="block text-sm mb-1">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Source</label>
              <Input
                value={form.source}
                onChange={(e) => setField('source', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Topic Tags (comma separated)
              </label>
              <Input
                value={form.topicTags}
                onChange={(e) => setField('topicTags', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  className="bg-background border border-white/10 rounded-md px-3 py-2 text-sm w-full"
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  <option value="draft">draft</option>
                  <option value="scheduled">scheduled</option>
                  <option value="live">live</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Scheduled Date</label>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setField('scheduledDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Passage Text</label>
              <textarea
                className="w-full min-h-[160px] bg-background border border-white/10 rounded-md p-3 text-sm"
                value={form.passageText}
                onChange={(e) => setField('passageText', e.target.value)}
                required
              />
            </div>

            {/* Question Builder */}
            <div className="border border-white/10 p-4 rounded-md bg-background/40 space-y-3">
              <h2 className="font-semibold text-lg">
                {editIndex !== null
                  ? `Edit Question ${editIndex + 1}`
                  : 'Add a Question'}
              </h2>

              <textarea
                className="w-full p-2 border border-white/10 rounded-md bg-background"
                placeholder="Question text"
                value={currentQ.questionText}
                onChange={(e) => setQuestionField('questionText', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                {currentQ.options.map((opt) => (
                  <div key={opt.id}>
                    <label className="block text-xs mb-1">Option {opt.id}</label>
                    <Input
                      value={opt.text}
                      onChange={(e) => setOption(opt.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-10">
                <div>
                  <label className="block text-sm mb-1">Correct Answer</label>
                  <select
                    className="bg-background border border-white/10 rounded-md px-8 py-2 text-sm"
                    value={currentQ.correctAnswerId}
                    onChange={(e) =>
                      setQuestionField('correctAnswerId', e.target.value)
                    }
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Question Type</label>
                  <select
                    className="bg-background border border-white/10 rounded-md px-3 py-2 text-sm"
                    value={currentQ.questionType}
                    onChange={(e) =>
                      setQuestionField('questionType', e.target.value)
                    }
                  >
                    <option value="main-idea">Main Idea</option>
                    <option value="inference">Inference</option>
                    <option value="detail">Detail</option>
                    <option value="vocabulary">Vocabulary</option>
                    <option value="tone-attitude">Tone/Attitude</option>
                    <option value="structure-function">
                      Structure/Function
                    </option>
                    <option value="application">Application</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Difficulty</label>
                  <select
                    className="bg-background border border-white/10 rounded-md px-8 py-2 text-sm"
                    value={currentQ.difficulty}
                    onChange={(e) =>
                      setQuestionField('difficulty', e.target.value)
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <textarea
                className="w-full p-2 border border-white/10 rounded-md bg-background"
                placeholder="Explanation"
                value={currentQ.explanation}
                onChange={(e) => setQuestionField('explanation', e.target.value)}
              />

              <Button
                type="button"
                onClick={addOrUpdateQuestion}
                className="mt-2"
              >
                {editIndex !== null ? 'Update Question' : 'Add Question'}
              </Button>
            </div>

            {/* Added Questions Preview */}
            {form.questions.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="font-semibold text-md">Added Questions:</h3>
                {form.questions.map((q, i) => (
                  <div
                    key={i}
                    className="border border-white/10 rounded-md p-3 bg-background/30 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">Q{i + 1}:</span>{' '}
                      {q.questionText.slice(0, 80)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => editQuestion(i)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => deleteQuestion(i)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="mt-4">
              {isEdit ? 'Update RC' : 'Create RC'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
