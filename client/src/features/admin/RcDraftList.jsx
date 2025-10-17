import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'

export default function RcDraftsList() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/rcs')
        const draftRcs = data.filter(rc => rc.status === 'draft')
        setDrafts(draftRcs)
      } catch (e) {
        const msg = extractErrorMessage(e)
        setError(msg)
        toast.show(msg, { variant: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-6">
        <Card>
          <CardHeader>
            <h1 className="h4">Draft RCs</h1>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-3/4 mb-3" />
            <Skeleton className="h-10 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-6 text-center text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="h4">Draft RCs</h1>
            <Link
              to="/admin/rcs/new"
              className="text-sm underline text-primary"
            >
              + Create New RC
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No draft RCs found. Start by creating one.
            </p>
          ) : (
            <ul className="space-y-3">
              {drafts.map(rc => (
                <li
                  key={rc._id}
                  className="p-3 rounded bg-surface-muted flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-text-primary">{rc.title}</div>
                    <div className="text-xs text-text-secondary">
                      Created on {new Date(rc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/rcs/${rc._id}`}
                      className="text-sm underline text-primary"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
