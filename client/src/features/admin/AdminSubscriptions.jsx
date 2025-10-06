import React, { useEffect, useState, useMemo } from 'react'
import { Button } from '../../components/ui/Button'
import subscriptionsApi from "../../lib/subs"

// ARC badge helper
const SubscriptionBadge = ({ sub, issubexp }) => {
    const base = 'px-2 py-1 rounded-md text-xs font-medium'
    if (sub === 'none') return <span className={`${base} bg-error-red text-white`}>None</span>
    if (issubexp) return <span className={`${base} bg-accent-amber text-text-primary`}>Expired</span>
    return <span className={`${base} bg-success-green text-white`}>{sub}</span>
}

export default function AdminSubscriptions() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [extendUser, setExtendUser] = useState(null)
    const [extendDays, setExtendDays] = useState(30)
    const [actionLoading, setActionLoading] = useState(false)
    const [extendType, setExtendType] = useState('Monthly')
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
            setUsers(data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // Revoke subscription
    const handleRevoke = async (id) => {
        if (!confirm('Are you sure you want to revoke this subscription?')) return
        setActionLoading(true)
        try {
            await subscriptionsApi.revokeSubscription(id)
            fetchUsers()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to revoke')
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
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to extend')
        } finally {
            setActionLoading(false)
        }
    }

    // Filter, search, sort & paginate
    const filteredUsers = useMemo(() => {
        let filtered = [...users]
        if (searchTerm) {
            filtered = filtered.filter(
                u =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        filtered.sort((a, b) => {
            const valA = a[sortField] || ''
            const valB = b[sortField] || ''
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1
            return 0
        })
        return filtered
    }, [users, searchTerm, sortField, sortOrder])

    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage)
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    )

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

            {/* Search */}
            <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-soft rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring mb-4"
            />

            {loading ? (
                <div className="text-text-secondary">Loading...</div>
            ) : error ? (
                <div className="text-error-red">{error}</div>
            ) : (
                <>
                    <div className="overflow-x-auto bg-card-surface rounded-xl border border-soft shadow-card">
                        <table className="min-w-full divide-y divide-border-soft">
                            <thead className="bg-surface-muted">
                                <tr>
                                    {['name', 'email', 'subscription', 'subon', 'subexp', 'issubexp'].map((col) => (
                                        <th
                                            key={col}
                                            className="px-4 py-2 text-left text-text-secondary text-sm cursor-pointer select-none"
                                            onClick={() => handleSort(col)}
                                        >
                                            {col.charAt(0).toUpperCase() + col.slice(1)} {sortField === col ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                    ))}
                                    <th className="px-4 py-2 text-left text-text-secondary text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-soft">
                                {paginatedUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td className="px-4 py-2 text-text-primary">{u.name}</td>
                                        <td className="px-4 py-2 text-text-secondary">{u.email}</td>
                                        <td className="px-4 py-2">
                                            <SubscriptionBadge sub={u.subscription} issubexp={u.issubexp} />
                                        </td>
                                        <td className="px-4 py-2 text-text-secondary">
                                            {u.subon
                                                ? new Date(u.subon).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-text-secondary">
                                            {u.subexp
                                                ? new Date(u.subexp).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-text-secondary">{u.issubexp ? 'Expired' : 'Active'}</td>
                                        <td className="px-4 py-2 space-x-2">
                                            <Button
                                                onClick={() => handleRevoke(u._id)}
                                                variant="destructive"
                                                disabled={actionLoading}
                                            >
                                                Revoke
                                            </Button>
                                            <Button
                                                onClick={() => setExtendUser(u)}
                                                disabled={actionLoading}
                                            >
                                                Extend
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4 space-x-2">
                        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                    </div>
                </>
            )}

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
                        {(extendUser.subscription === 'none' || extendUser.issubexp) && (
                            <div className="space-y-2">
                                <label className="block text-text-secondary text-sm">Subscription Type</label>
                                <select
                                    value={extendType}
                                    onChange={(e) => setExtendType(e.target.value)}
                                    className="w-full p-2 border border-soft rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
                                >
                                    {['Monthly', 'Yearly'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end space-x-2">
                            <Button onClick={() => setExtendUser(null)} variant="ghost">Cancel</Button>
                            <Button onClick={handleExtend} disabled={actionLoading}>
                                {actionLoading ? 'Updating...' : 'Extend'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
