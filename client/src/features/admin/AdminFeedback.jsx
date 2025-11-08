import React, { useEffect, useMemo, useState } from 'react'
import {
  getAllFeedbackQuestions,
  deleteFeedbackQuestion,
  archiveFeedbackQuestion,
  republishFeedbackQuestion,
  createFeedbackQuestion,
  updateFeedbackQuestion,
} from '../../lib/feedback'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Search } from 'lucide-react'
import Table from '../../components/ui/Table'

export default function AdminFeedback() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [selectedType, setSelectedType] = useState('rating')

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const data = await getAllFeedbackQuestions()
      setQuestions(data.questions || [])
    } catch (err) {
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  // Actions
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return
    try {
      await deleteFeedbackQuestion(id)
      fetchQuestions()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete question')
    }
  }

  const archiveQuestion = async (id) => {
    if (!window.confirm('Archive this question?')) return
    try {
      await archiveFeedbackQuestion(id)
      fetchQuestions()
    } catch (err) {
      console.error('Archive failed:', err)
      alert('Failed to archive question')
    }
  }

  const republishQuestion = async (id) => {
    if (!window.confirm('Republish this question?')) return
    try {
      await republishFeedbackQuestion(id, {
        status: 'live',
        date: new Date().toISOString().slice(0, 10),
      })
      fetchQuestions()
    } catch (err) {
      console.error('Republish failed:', err)
      alert('Failed to republish question')
    }
  }

  // Filter + sort
  const filtered = useMemo(() => {
    let arr = questions.filter(
      (q) =>
        (statusFilter === 'all' || q.status === statusFilter) &&
        (!search || q.label.toLowerCase().includes(search.toLowerCase()) || q._id.includes(search))
    )

    arr.sort((a, b) => {
      let aVal = a[sortBy] || ''
      let bVal = b[sortBy] || ''
      if (sortBy === 'date') {
        aVal = aVal ? new Date(aVal) : new Date(0)
        bVal = bVal ? new Date(bVal) : new Date(0)
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return arr
  }, [questions, search, statusFilter, sortBy, sortDir])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  // Table will render skeleton rows when loading; keep showing filters/controls while loading

  return (
    <div className="w-full p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-text-primary">Feedback Questions</h1>
          <p className="text-sm text-text-secondary">
            Manage all feedback questions: view, archive, republish, and delete.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
            <div className="flex items-center bg-background border border-white/10 rounded px-3 py-2 gap-2 flex-1 sm:flex-initial min-w-0 sm:min-w-64">
              <Search size={16} className="text-text-secondary flex-shrink-0" />
              <input
                className="bg-transparent outline-none text-sm w-full"
                placeholder="Search by label or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="bg-background border border-white/10 rounded px-8 py-2 text-sm cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="live">Live</option>
              <option value="archived">Archived</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div>
            {' '}
            <Button
              onClick={() => {
                setEditingQuestion(null)
                setModalOpen(true)
              }}
            >
              + Add Question
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-lg font-medium mb-2">No questions found</div>
          <div className="text-sm text-text-secondary mb-6">
            Try adjusting your filters or add a new question to get started.
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button onClick={() => setStatusFilter('all')} variant="outline">
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <Table
          columns={[
            { header: 'Label', field: 'label', sortable: true, render: (q) => q.label },
            {
              header: 'Date',
              field: 'date',
              sortable: true,
              render: (q) => (q.date ? new Date(q.date).toLocaleDateString('en-US') : 'N/A'),
            },
            { header: 'Type', field: 'type', sortable: true, render: (q) => q.type },
            {
              header: 'Status',
              field: 'status',
              sortable: true,
              render: (q) => (
                <Badge
                  color={
                    q.status === 'archived'
                      ? 'default'
                      : q.status === 'live'
                      ? 'success'
                      : 'warning'
                  }
                >
                  {q.status}
                </Badge>
              ),
            },
            {
              header: 'Actions',
              field: 'actions',
              render: (q) => (
                <div className="inline-flex items-center justify-center gap-1">
                  {q.status === 'archived' ? (
                    <Button size="sm" variant="success" onClick={() => republishQuestion(q._id)}>
                      Republish
                    </Button>
                  ) : (
                    <Button size="sm" variant="danger" onClick={() => archiveQuestion(q._id)}>
                      Archive
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(q._id)}>
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingQuestion(q)
                      setModalOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              ),
              cellClassName: 'px-2 py-2 text-center whitespace-nowrap',
            },
          ]}
          data={paged}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={(p) => setPage(p)}
          onSort={(field) => toggleSort(field)}
          sortField={sortBy}
          sortOrder={sortDir}
        />
      )}

      {/* modal to add and edit feedback questions */}
      {modalOpen && (
        <div className="fixed h-100vh inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="bg-background p-8 rounded-xl w-full max-w-2xl shadow-2xl border border-white/10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h3>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                ✕
              </Button>
            </div>

            {/* Form */}
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const today = new Date().toISOString().split('T')[0]
                const formData = {
                  label: e.target.label.value,
                  type: e.target.type.value,
                  options:
                    e.target.options?.value
                      ?.split(',')
                      .map((o) => o.trim())
                      .filter(Boolean) || [],
                  url: e.target.url?.value || '',
                  buttonText: e.target.buttonText?.value || '',
                  minWords: parseInt(e.target.minWords?.value || 0),
                  time: parseInt(e.target.time?.value || 0),
                  date: e.target.date?.value || today, // ✅ default to today
                }

                try {
                  if (editingQuestion) {
                    await updateFeedbackQuestion(editingQuestion._id, formData)
                  } else {
                    await createFeedbackQuestion(formData)
                  }
                  setModalOpen(false)
                  fetchQuestions()
                } catch (err) {
                  console.error(err)
                  alert('Failed to save question')
                }
              }}
            >
              {/* Label */}
              <div>
                <label className="block text-sm font-medium mb-1">Question Label</label>
                <input
                  name="label"
                  defaultValue={editingQuestion?.label || ''}
                  className="w-full border border-gray-200 rounded-lg bg-background/50 px-3 py-2 text-sm  outline-none"
                  required
                />
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-1">Question Type</label>
                <select
                  name="type"
                  defaultValue={editingQuestion?.type || 'rating'}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg bg-background/50 px-3 py-2 text-sm  outline-none"
                  required
                >
                  <option value="rating">Rating</option>
                  <option value="multi">Multiple Choice</option>
                  <option value="open">Open</option>
                  <option value="redirect">Redirect</option>
                </select>
              </div>

              {/* Multi-choice options */}
              {selectedType === 'multi' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Options (comma-separated)
                  </label>
                  <input
                    name="options"
                    defaultValue={editingQuestion?.options?.join(',') || ''}
                    className="w-full border border-gray-200 rounded-lg bg-background/50 px-3 py-2 text-sm  outline-none"
                    placeholder="e.g. Good, Average, Poor"
                    required
                  />
                </div>
              )}

              {/* Redirect fields */}
              {selectedType === 'redirect' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Redirect URL</label>
                    <input
                      name="url"
                      defaultValue={editingQuestion?.url || ''}
                      className="w-full border border-gray-200 rounded-lg bg-background/50 px-3 py-2 text-sm  outline-none"
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text</label>
                    <input
                      name="buttonText"
                      defaultValue={editingQuestion?.buttonText || ''}
                      className="w-full border border-gray-200 rounded-lg bg-background/50 px-3 py-2 text-sm  outline-none"
                      placeholder="e.g. Go to Survey"
                    />
                  </div>
                </>
              )}

              {/* Open Question fields */}
              {selectedType === 'open' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Words</label>
                  <input
                    name="minWords"
                    type="number"
                    defaultValue={editingQuestion?.minWords || 0}
                    className="w-full border border-gray-200 rounded-lg bg-background/50 px-3 py-2 text-sm  outline-none"
                    placeholder="e.g. 20"
                  />
                </div>
              )}

              {/* Common field for all types */}
              <div>
                <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                <input
                  name="time"
                  type="number"
                  defaultValue={editingQuestion?.time || 0}
                  className="w-full border border-gray-200 rounded-lg bg-background/50 px-3 py-2 text-sm  outline-none"
                />
              </div>

              {/* ✅ Date Picker */}
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  name="date"
                  type="date"
                  defaultValue={
                    editingQuestion?.date
                      ? new Date(editingQuestion.date).toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0]
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-lg bg-background/50 px-3 py-2 text-sm  outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white">
                  {editingQuestion ? 'Save Changes' : 'Add Question'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
