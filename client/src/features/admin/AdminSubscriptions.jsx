import React, { useEffect, useState, useMemo } from 'react'
import { Button } from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import subscriptionsApi from '../../lib/subs'
import plansApi from '../../lib/plans'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../components/auth/AuthContext'
import { useLocation } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'

// AYRC badge helper
const SubscriptionBadge = ({ sub, issubexp }) => {
  // Render as a pill with colored text and subtle border — no background fill
  const base = 'px-3 py-1 rounded-full text-xs font-medium border'
  if (!sub) return <span className={`${base} border-error-red text-error-red`}>None</span>
  const label = typeof sub === 'string' ? sub : sub.name || sub.slug || 'Plan'
  if (issubexp)
    return <span className={`${base} border-accent-amber text-accent-amber`}>Expired</span>
  return <span className={`${base} border-success-green text-success-green`}>{label}</span>
}

export default function AdminSubscriptions() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [extendUser, setExtendUser] = useState(null)
  const [extendDays, setExtendDays] = useState(30)
  const [actionLoading, setActionLoading] = useState(false)
  const [extendType, setExtendType] = useState('Weekly')
  // Pagination & sorting & search
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const [sortField, setSortField] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch all subscriptions
  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await subscriptionsApi.listAllSubscriptions()
      // normalize date fields to ISO strings so sorting is consistent
      const norm = (data || []).map((u) => ({
        ...u,
        subon: u.subon ? new Date(u.subon).toISOString() : null,
        subexp: u.subexp ? new Date(u.subexp).toISOString() : null,
      }))
      setUsers(norm)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Assign modal state
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignForm, setAssignForm] = useState({
    userIdentifier: '',
    userId: '',
    planId: '',
    startDate: '',
    endDate: '',
    transactionId: '',
  })
  const [plans, setPlans] = useState([])

  const toast = useToast()

  useEffect(() => {
    ;(async () => {
      try {
        const p = await (await import('../../lib/plans')).default.adminListPlans()
        setPlans(p)
      } catch (e) {
        console.error('Failed to load plans', e)
      }
    })()
  }, [])

  // check query params to open Assign modal from Transaction
  const location = useLocation()
  useEffect(() => {
    try {
      const qp = new URLSearchParams(location.search)
      const qUser = qp.get('userId')
      const qTx = qp.get('transactionId')
      const qPlan = qp.get('planId')
      if (qUser) {
        setAssignForm({
          userIdentifier: '',
          userId: qUser,
          planId: qPlan || '',
          startDate: '',
          endDate: '',
          transactionId: qTx || '',
        })
        setAssignOpen(true)
      }
    } catch (e) {
      // ignore
    }
  }, [location.search])

  // Revoke subscription
  const handleRevoke = async (id) => {
    if (!confirm('Are you sure you want to revoke this subscription?')) return
    setActionLoading(true)
    try {
      await subscriptionsApi.revokeSubscription(id)
      fetchUsers()
      toast.show('Subscription revoked', { variant: 'success' })
    } catch (err) {
      toast.show(err.response?.data?.message || 'Failed to revoke', { variant: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  // Extend subscription
  const handleExtend = async () => {
    if (!extendUser || extendDays <= 0) return
    setActionLoading(true)
    try {
      await subscriptionsApi.extendSubscription(extendUser._id, extendDays, extendType)
      setExtendUser(null)
      setExtendDays(30)
      fetchUsers()
      toast.show('Subscription extended', { variant: 'success' })
    } catch (err) {
      toast.show(err.response?.data?.message || 'Failed to extend', { variant: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  // Filter, search, sort & paginate
  // helper: robustly parse various date formats to timestamp (ms)
  const parseDateVal = (v) => {
    if (!v && v !== 0) return null
    if (typeof v === 'number') return v
    if (v instanceof Date) return v.getTime()
    if (typeof v === 'string') {
      const s = v.trim()
      // try native parse (handles ISO)
      const t = Date.parse(s)
      if (!isNaN(t)) return t
      // try pattern like '6 October 2025' or '06 October 2025'
      const m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
      if (m) {
        const day = m[1].padStart(2, '0')
        const monthName = m[2].toLowerCase()
        const year = m[3]
        const months = {
          january: '01',
          february: '02',
          march: '03',
          april: '04',
          may: '05',
          june: '06',
          july: '07',
          august: '08',
          september: '09',
          october: '10',
          november: '11',
          december: '12',
        }
        const mm = months[monthName]
        if (mm) return Date.parse(`${year}-${mm}-${day}`)
      }
    }
    return null
  }

  const filteredUsers = useMemo(() => {
    let filtered = [...users]
    const q = (searchTerm || '').trim().toLowerCase()
    if (q) {
      filtered = filtered.filter(
        (u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
      )
    }

    filtered.sort((a, b) => {
      const field = sortField

      // Date fields - compare timestamps, nulls treated as 'last'
      if (field === 'subon' || field === 'subexp') {
        const ta = parseDateVal(a[field])
        const tb = parseDateVal(b[field])
        if (ta === tb) return 0
        if (ta === null) return sortOrder === 'asc' ? 1 : -1
        if (tb === null) return sortOrder === 'asc' ? -1 : 1
        return sortOrder === 'asc' ? ta - tb : tb - ta
      }

      // Boolean state
      if (field === 'issubexp') {
        const va = !!a.issubexp
        const vb = !!b.issubexp
        if (va === vb) return 0
        return sortOrder === 'asc' ? (va ? 1 : -1) : va ? -1 : 1
      }

      // Fallback: string compare
      const va = a[field] === undefined || a[field] === null ? '' : String(a[field])
      const vb = b[field] === undefined || b[field] === null ? '' : String(b[field])
      const sa = va.toLowerCase()
      const sb = vb.toLowerCase()
      if (sa < sb) return sortOrder === 'asc' ? -1 : 1
      if (sa > sb) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [users, searchTerm, sortField, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  // reset to first page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortField, sortOrder, users])

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">User Subscriptions</h2>

      {/* Removed top-level Assign CTA; per-row Assign button available in actions */}

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-soft rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring mb-4"
      />

      <Table
        columns={[
          { header: 'Name', field: 'name', sortable: true, render: (r) => r.name },
          { header: 'Email', field: 'email', sortable: true, render: (r) => r.email },
          {
            header: 'Subscription',
            field: 'subscriptionPlan',
            render: (r) => (
              <SubscriptionBadge sub={r.subscriptionPlan || r.subscription} issubexp={r.issubexp} />
            ),
          },
          {
            header: 'Subscribed On',
            field: 'subon',
            sortable: true,
            render: (r) =>
              r.subon
                ? new Date(r.subon).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-',
          },
          {
            header: 'Expires',
            field: 'subexp',
            sortable: true,
            render: (r) =>
              r.subexp
                ? new Date(r.subexp).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-',
          },
          {
            header: 'State',
            field: 'issubexp',
            sortable: true,
            render: (r) => (r.issubexp ? 'Expired' : 'Active'),
          },
          {
            header: 'Actions',
            field: 'actions',
            render: (r) => (
              <div className="inline-flex items-center justify-center gap-1">
                <Button
                  size="sm"
                  onClick={() => handleRevoke(r._id)}
                  variant="danger"
                  disabled={actionLoading}
                >
                  Revoke
                </Button>
                {/* Only show Extend when user has an active Subscription doc and is not on the free plan */}
                {r.hasSubscriptionDoc &&
                  !(r.subscriptionPlan && r.subscriptionPlan.slug === 'free') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExtendUser(r)}
                      disabled={actionLoading}
                    >
                      Extend
                    </Button>
                  )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAssignForm({
                      userIdentifier: r.email || r._id,
                      userId: r._id,
                      planId: '',
                      startDate: '',
                      endDate: '',
                      transactionId: '',
                    })
                    setAssignOpen(true)
                  }}
                  disabled={actionLoading}
                >
                  Assign
                </Button>
              </div>
            ),
            cellClassName: 'px-2 py-2 text-center whitespace-nowrap',
          },
        ]}
        data={paginatedUsers}
        loading={loading}
        error={error}
        page={currentPage}
        total={filteredUsers.length}
        pageSize={rowsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      />

      {/* Extend Modal */}
      {extendUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-50">
          <div className="bg-card-surface border border-soft rounded-2xl shadow-card p-6 w-80 space-y-4">
            <h3 className="text-lg font-semibold">Extend Subscription for {extendUser.name}</h3>
            <div className="space-y-2">
              <label className="block text-text-secondary text-sm">Days to extend</label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                className="w-full p-2 border border-soft rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
            </div>
            {(!extendUser.subscriptionPlan || extendUser.issubexp) && (
              <div className="space-y-2">
                <label className="block text-text-secondary text-sm">Subscription Type</label>
                <select
                  value={extendType}
                  onChange={(e) => setExtendType(e.target.value)}
                  className="w-full p-2 border border-soft rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
                >
                  {['Weekly', 'Cat 2025'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => setExtendUser(null)} variant="ghost">
                Cancel
              </Button>
              <Button size="sm" onClick={handleExtend} disabled={actionLoading}>
                {actionLoading ? 'Updating...' : 'Extend'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false)
          setAssignForm({
            userIdentifier: '',
            planId: '',
            startDate: '',
            endDate: '',
            transactionId: '',
          })
        }}
        title="Assign Subscription"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-text-secondary text-sm">User ID or Email</label>
            <Input
              value={assignForm.userIdentifier}
              onChange={(e) => setAssignForm({ ...assignForm, userIdentifier: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm">Plan</label>
            <select
              className="w-full p-2 border border-soft rounded-md"
              value={assignForm.planId}
              onChange={(e) => setAssignForm({ ...assignForm, planId: e.target.value })}
            >
              <option value="">-- Select Plan --</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — ₹{(p.finalPriceCents / 100).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-text-secondary text-sm">Start Date (optional)</label>
            <Input
              type="date"
              value={assignForm.startDate}
              onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm">Transaction ID (optional)</label>
            <Input
              value={assignForm.transactionId}
              onChange={(e) => setAssignForm({ ...assignForm, transactionId: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAssignOpen(false)
                setAssignForm({
                  userIdentifier: '',
                  userId: '',
                  planId: '',
                  startDate: '',
                  endDate: '',
                  transactionId: '',
                })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // prefer explicit userId (set when opening from a row). If not present, only accept raw 24-char id input.
                if (
                  !assignForm.userId &&
                  !/^[a-fA-F0-9]{24}$/.test((assignForm.userIdentifier || '').trim())
                ) {
                  toast.show('Please select a user from the table or enter a valid user id', {
                    variant: 'error',
                  })
                  return
                }
                if (!assignForm.planId) {
                  toast.show('Please choose a plan', { variant: 'error' })
                  return
                }
                try {
                  const payload = { planId: assignForm.planId }
                  payload.userId = assignForm.userId || assignForm.userIdentifier.trim()
                  if (assignForm.startDate) payload.startDate = assignForm.startDate
                  if (assignForm.transactionId) payload.transactionId = assignForm.transactionId
                  const resp = await subscriptionsApi.adminAssignSubscription(payload)
                  setAssignOpen(false)
                  setAssignForm({
                    userIdentifier: '',
                    userId: '',
                    planId: '',
                    startDate: '',
                    endDate: '',
                    transactionId: '',
                  })
                  fetchUsers()
                  toast.show('Subscription assigned', { variant: 'success' })
                } catch (err) {
                  toast.show(err?.response?.data?.message || err.message || 'Assign failed', {
                    variant: 'error',
                  })
                }
              }}
              disabled={!assignForm.planId}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
