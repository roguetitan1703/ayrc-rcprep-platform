// FeedbackForm.jsx
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
  label: '',
  type: 'rating',
  options: [],
  url: '',
  buttonText: '',
  minWords: 0,
  time: 0,
  date: '',
  status: 'live',
}

const emptyForm = {
  title: '',
  questions: [],
}

export default function FeedbackForm() {
  const { id } = useParams()
  const isEdit = id && id !== 'new'
  const [form, setForm] = useState(emptyForm)
  const [currentQ, setCurrentQ] = useState({ ...defaultQuestion })
  const [editIndex, setEditIndex] = useState(null)
  const [loading, setLoading] = useState(!!isEdit)
  const nav = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  // Fetch existing feedback question if editing
  useEffect(() => {
    if (!isEdit) return
    if (user && user.role !== 'admin') {
      nav('/admin/login')
      return
    }
    ;(async () => {
      try {
        const { data } = await api.get(`/admin/feedback-questions`)
        const fb = data.find((x) => x._id === id)
        if (fb) {
          setForm({
            title: fb.title,
            questions: fb.questions || [],
          })
        }
      } catch (e) {
        toast.show(extractErrorMessage(e), { variant: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [id, user])

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setQuestionField = (k, v) => setCurrentQ((q) => ({ ...q, [k]: v }))

  const addOrUpdateQuestion = () => {
    if (!currentQ.label.trim()) {
      toast.show('Label is required', { variant: 'warning' })
      return
    }
    if (currentQ.type === 'multi' && currentQ.options.length === 0) {
      toast.show('Options are required for multi-choice', { variant: 'warning' })
      return
    }
    const updatedQuestions = [...form.questions]
    if (editIndex !== null) updatedQuestions[editIndex] = currentQ
    else updatedQuestions.push(currentQ)
    setForm({ ...form, questions: updatedQuestions })
    setCurrentQ({ ...defaultQuestion })
    setEditIndex(null)
  }

  const editQuestion = (i) => {
    setCurrentQ(form.questions[i])
    setEditIndex(i)
  }

  const deleteQuestion = (i) => {
    setForm({
      ...form,
      questions: form.questions.filter((_, idx) => idx !== i),
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.show('Title is required', { variant: 'warning' })
      return
    }
    try {
      if (isEdit) await api.put(`/feedback/questions/${id}`, form)
      else await api.post('/feedback/questions', form)
      toast.show('Feedback saved successfully', { variant: 'success' })
      nav('/admin/feedback')
    } catch (e) {
      toast.show(extractErrorMessage(e), { variant: 'error' })
    }
  }

  if (loading)
    return (
      <div className="max-w-4xl mx-auto py-6">
        <Card>
          <CardHeader>
            <h1 className="h4">{isEdit ? 'Edit Feedback' : 'Create Feedback'}</h1>
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
          <h1 className="h4">{isEdit ? 'Edit Feedback' : 'Create Feedback'}</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Question Builder */}
            <div className="border border-white/10 p-4 rounded-md bg-background/40 space-y-3">
              <h2 className="font-semibold text-lg">
                {editIndex !== null ? `Edit Question ${editIndex + 1}` : 'Add a Question'}
              </h2>

              <div className="space-y-1">
                <label className="block text-sm mb-1">Label</label>
                <Input
                  value={currentQ.label}
                  onChange={(e) => setQuestionField('label', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm mb-1">Type</label>
                <select
                  value={currentQ.type}
                  onChange={(e) => setQuestionField('type', e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="rating">Rating</option>
                  <option value="multi">Multi</option>
                  <option value="open">Open</option>
                  <option value="redirect">Redirect</option>
                </select>
              </div>

              {/* Options for multi-choice */}
              {currentQ.type === 'multi' && (
                <div className="space-y-1">
                  <label className="block text-sm mb-1">Options (comma separated)</label>
                  <Input
                    value={currentQ.options.join(',')}
                    onChange={(e) =>
                      setQuestionField(
                        'options',
                        e.target.value.split(',').map((s) => s.trim())
                      )
                    }
                  />
                </div>
              )}

              {['redirect', 'open'].includes(currentQ.type) && (
                <>
                  {currentQ.type === 'redirect' && (
                    <>
                      <div className="space-y-1">
                        <label className="block text-sm mb-1">URL</label>
                        <Input
                          value={currentQ.url}
                          onChange={(e) => setQuestionField('url', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm mb-1">Button Text</label>
                        <Input
                          value={currentQ.buttonText}
                          onChange={(e) => setQuestionField('buttonText', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1">
                    <label className="block text-sm mb-1">Min Words</label>
                    <Input
                      type="number"
                      value={currentQ.minWords}
                      onChange={(e) => setQuestionField('minWords', Number(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-sm mb-1">Time in seconds</label>
                <Input
                  type="number"
                  value={currentQ.time}
                  onChange={(e) => setQuestionField('time', Number(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm mb-1">Date</label>
                <Input
                  type="date"
                  value={currentQ.date}
                  onChange={(e) => setQuestionField('date', e.target.value)}
                />
              </div>

              <Button type="button" onClick={addOrUpdateQuestion}>
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
                      <span className="font-medium">Q{i + 1}:</span> {q.label.slice(0, 80)}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => editQuestion(i)}>
                        Edit
                      </Button>
                      <Button type="button" variant="danger" onClick={() => deleteQuestion(i)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="mt-4">
              {isEdit ? 'Update Feedback' : 'Create Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
