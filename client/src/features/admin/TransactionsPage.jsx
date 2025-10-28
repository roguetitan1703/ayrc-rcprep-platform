import React, { useEffect, useState } from 'react'
import transactionsApi from '../../lib/transactions'
import { Button } from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'

function TransactionsPage(){
  const [txs, setTxs] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load(page = 1){
    setLoading(true)
    setError('')
    try{
      const res = await transactionsApi.listTransactions({ page })
      // res = { rows, meta }
      setTxs(res.rows || [])
      setMeta(res.meta || { total: 0, page: 1, limit: 10 })
    }catch(err){ setError(err?.response?.data?.message || err.message || 'Failed to load transactions') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load(1) }, [])

  const columns = [
    { header: 'Order ID', field: 'orderId', render: (r) => r.razorpay_order_id || r.provider_order_id || r._id },
    { header: 'User', field: 'user', render: (r) => r.user?.name || r.user?.email || '-' },
    { header: 'Plan', field: 'plan', render: (r) => r.plan?.slug || '-' },
    { header: 'Amount', field: 'amount', render: (r) => `₹${((r.amount_cents||0)/100).toFixed(2)}` },
    { header: 'Status', field: 'status', render: (r) => r.status },
    { header: 'Flags', field: 'flags', render: (r) => `${r.metadata?.orphan ? 'orphan ' : ''}${r.is_discrepant ? 'discrepant' : ''}` },
    { header: 'Actions', field: 'actions', render: (r) => null },
  ]

  const navigate = useNavigate()
  const toast = useToast()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-text-secondary">Audit and reconcile payments</p>
        </div>
        <div>
          <Button onClick={() => load(meta.page)}>Refresh</Button>
        </div>
      </div>

      <Table
        columns={columns.map(c => {
          if (c.field !== 'actions') return c
          return {
            ...c,
            render: (r) => (
              <div className="inline-flex items-center justify-center gap-1">
                {r.user ? (
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/subscriptions?userId=${r.user._id}&transactionId=${r._id}${r.plan?`&planId=${r.plan._id}`:''}`)}>Assign</Button>
                  ) : (
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(r._id); toast.show('Transaction ID copied to clipboard', { variant: 'success' }) }}>Copy ID</Button>
                )}
              </div>
            ),
            cellClassName: 'px-2 py-2 text-center whitespace-nowrap',
          }
        })}
        data={txs}
        loading={loading}
        error={error}
        page={meta.page}
        total={meta.total}
        pageSize={meta.limit}
        onPageChange={(p) => load(p)}
      />
    </div>
  )
}

export default TransactionsPage
