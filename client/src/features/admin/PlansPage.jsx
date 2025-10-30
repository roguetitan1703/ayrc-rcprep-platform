import React, { useEffect, useState } from 'react'
import plansApi from '../../lib/plans'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'

export default function PlansPage(){
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState(null)
  // default billingType should match server enum: 'duration_days' or 'till_date'
  const defaultFeatures = { archive: { type: 'attempted-only', windowDays: null, includeAttempted: true }, feedbackLock: { enabled: false }, dailyLimits: { dailyRcs: null, dailyAttempts: null } }
  const [form, setForm] = useState({ name: '', slug: '', description: '', finalPriceCents: 0, markupPriceCents: null, billingType: 'duration_days', durationDays: 30, accessUntil: '' , active: true, features: defaultFeatures })
  const toast = useToast()

  async function load(){
    setLoading(true)
    try{
      const data = await plansApi.adminListPlans()
      setPlans(data)
    }catch(err){
      setError(err?.response?.data?.error || err.message || 'Failed to load plans')
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  function openCreate(){ setEditing(null); setForm({ name:'', slug:'', description:'', finalPriceCents:0, markupPriceCents:null, billingType:'duration_days', durationDays:30, accessUntil:'', active:true, features: defaultFeatures }); setOpenModal(true) }
  function openEdit(p){ setEditing(p); const features = p.features || defaultFeatures; // ensure feedbackLock exists
    if (!features.feedbackLock) features.feedbackLock = { enabled: false }
    setForm({ name:p.name, slug:p.slug, description:p.description || '', finalPriceCents:p.finalPriceCents, markupPriceCents:p.markupPriceCents || null, billingType:p.billingType, durationDays:p.durationDays || 30, accessUntil: p.accessUntil ? new Date(p.accessUntil).toISOString().slice(0,10) : '', active: p.active, features }) ; setOpenModal(true) }

  async function submit(){
    try{
      // validate required fields
      if(!form.name || !form.slug) {
        throw new Error('Name and slug are required')
      }
      // slug validation: lowercase letters, numbers, hyphens, 2-50 chars
      if(!/^[a-z0-9\-]{2,50}$/.test(String(form.slug))) throw new Error('Slug must be 2-50 characters, lowercase letters, numbers and hyphens only')
      if(form.finalPriceCents == null || isNaN(Number(form.finalPriceCents))) throw new Error('Price is required and must be a number')
      if(Number(form.finalPriceCents) < 0) throw new Error('finalPriceCents must be non-negative')
      if(form.markupPriceCents !== null && form.markupPriceCents !== '' && !isNaN(Number(form.markupPriceCents))) {
        if(Number(form.markupPriceCents) < Number(form.finalPriceCents)) throw new Error('markupPriceCents must be greater than or equal to finalPriceCents')
      }
      if(form.billingType === 'duration_days' && (!form.durationDays || Number(form.durationDays) <= 0)) throw new Error('durationDays must be a positive number')
      if(form.billingType === 'till_date' && !form.accessUntil) throw new Error('accessUntil date required for till_date billing')

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || '',
        finalPriceCents: Number(form.finalPriceCents),
        markupPriceCents: form.markupPriceCents !== null ? Number(form.markupPriceCents) : null,
        billingType: form.billingType,
        durationDays: form.billingType === 'duration_days' ? Number(form.durationDays) : null,
        accessUntil: form.billingType === 'till_date' ? (form.accessUntil ? new Date(form.accessUntil) : null) : null,
        active: !!form.active,
        features: form.features || {},
      }

      if(editing){
        await plansApi.updatePlan(editing._id, payload)
      } else {
        await plansApi.createPlan(payload)
      }
      setOpenModal(false)
      toast.show(editing ? 'Plan updated' : 'Plan created', { variant: 'success' })
      load()
    }catch(err){ toast.show(err?.response?.data?.message || err.message || 'Save failed', { variant: 'error' }) }
  }

  async function handleDelete(id, slug){
    if(String(slug).toLowerCase() === 'free'){ toast.show('Free plan cannot be deleted', { variant: 'error' }); return }
    if(!confirm('Delete this plan?')) return
    try{ await plansApi.deletePlan(id); load(); toast.show('Plan deleted', { variant: 'success' }) }catch(err){ toast.show(err?.response?.data?.message || err.message, { variant: 'error' }) }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plans</h1>
          <p className="text-sm text-text-secondary">Manage pricing plans for subscriptions</p>
        </div>
        <div>
          <Button onClick={openCreate}>Create Plan</Button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : error ? <div className="text-error-red">{error}</div> : (
      <Table
          columns={[
            { header: 'Name', field: 'name', sortable: true, render: r => r.name },
            { header: 'Slug', field: 'slug', sortable: true, render: r => r.slug },
            { header: 'Price', field: 'finalPriceCents', render: r => `₹${(r.finalPriceCents/100).toFixed(2)}` },
            { header: 'Billing', field: 'billingType', render: r => r.billingType },
            { header: 'Active', field: 'active', render: r => r.active ? 'Yes' : 'No' },
            { header: 'Features', field: 'features', render: r => (
                <div className="text-sm">
                  <div className="truncate">Archive: <strong>{(r.features && r.features.archive && r.features.archive.type) || 'attempted-only'}</strong>{r.features && r.features.archive && r.features.archive.type === 'window' && r.features.archive.windowDays ? ` (${r.features.archive.windowDays}d)` : ''}</div>
                  <div>FeedbackLock: <strong>{r.features && r.features.feedbackLock && r.features.feedbackLock.enabled ? 'On' : 'Off'}</strong></div>
                </div>
              ) },
            { header: 'Actions', field: 'actions', render: r => (
                <div className="inline-flex items-center justify-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(r._id, r.slug)}>Delete</Button>
                </div>
              ), cellClassName: 'px-2 py-2 text-center whitespace-nowrap' }
          ]}
          data={plans}
          loading={loading}
          error={error}
          page={1}
          total={plans.length}
          pageSize={plans.length}
          onPageChange={() => {}}
        />
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'Edit Plan' : 'Create Plan'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-text-secondary">Name</label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary">Slug</label>
            <Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary">Description</label>
            <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary">Price (cents)</label>
              <Input type="number" value={form.finalPriceCents} onChange={e => setForm({...form, finalPriceCents: Number(e.target.value)})} disabled={editing && String(editing.slug).toLowerCase() === 'free'} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary">Markup Price (cents)</label>
              <Input type="number" value={form.markupPriceCents ?? ''} onChange={e => setForm({...form, markupPriceCents: e.target.value === '' ? null : Number(e.target.value)})} disabled={editing && String(editing.slug).toLowerCase() === 'free'} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary">Billing Type</label>
            <select className="w-full p-2 border border-soft rounded-md" value={form.billingType} onChange={e => setForm({...form, billingType: e.target.value})} disabled={editing && String(editing.slug).toLowerCase() === 'free'}>
              <option value="duration_days">Duration (days)</option>
              <option value="till_date">Access until date</option>
            </select>
          </div>

          {form.billingType === 'duration_days' && (
            <div>
              <label className="block text-sm text-text-secondary">Duration (days)</label>
              <Input type="number" value={form.durationDays} onChange={e => setForm({...form, durationDays: Number(e.target.value)})} disabled={editing && String(editing.slug).toLowerCase() === 'free'} />
            </div>
          )}

          {form.billingType === 'till_date' && (
            <div>
              <label className="block text-sm text-text-secondary">Access Until</label>
              <Input type="date" value={form.accessUntil} onChange={e => setForm({...form, accessUntil: e.target.value})} disabled={editing && String(editing.slug).toLowerCase() === 'free'} />
            </div>
          )}

          {editing && String(editing.slug).toLowerCase() === 'free' && (
            <div className="text-sm text-text-secondary mt-1">Note: billing fields for the Free plan are protected and cannot be changed.</div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.active} onChange={e => setForm({...form, active: e.target.checked})} />
              <span className="text-sm text-text-secondary">Active</span>
            </label>
          </div>

          {/* Features panel */}
          <div className="border-t pt-3 space-y-3">
            <h3 className="text-sm font-semibold">Features</h3>

            {/* Archive controls */}
            <div>
              <label className="block text-sm text-text-secondary mb-1">Archive access</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="inline-flex items-center gap-2"><input type="radio" name="archiveType" value="attempted-only" checked={form.features?.archive?.type === 'attempted-only'} onChange={() => setForm({...form, features: {...form.features, archive: {...form.features.archive, type: 'attempted-only'}}})} /> Attempted-only</label>
                <label className="inline-flex items-center gap-2"><input type="radio" name="archiveType" value="window" checked={form.features?.archive?.type === 'window'} onChange={() => setForm({...form, features: {...form.features, archive: {...form.features.archive, type: 'window'}}})} /> Window</label>
                <label className="inline-flex items-center gap-2"><input type="radio" name="archiveType" value="all" checked={form.features?.archive?.type === 'all'} onChange={() => setForm({...form, features: {...form.features, archive: {...form.features.archive, type: 'all'}}})} /> All</label>
              </div>
              {form.features?.archive?.type === 'window' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-text-secondary">Window (days)</label>
                    <Input type="number" value={form.features.archive.windowDays ?? ''} onChange={e => setForm({...form, features: {...form.features, archive: {...form.features.archive, windowDays: e.target.value === '' ? null : Number(e.target.value)}}})} />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary">Include attempted</label>
                    <div>
                      <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.features.archive.includeAttempted} onChange={e => setForm({...form, features: {...form.features, archive: {...form.features.archive, includeAttempted: e.target.checked}}})} /> Include attempted RCs</label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback lock */}
            <div>
              <label className="block text-sm text-text-secondary mb-1">Feedback lock</label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.features?.feedbackLock?.enabled} onChange={e => setForm({...form, features: {...form.features, feedbackLock: {...form.features.feedbackLock, enabled: e.target.checked}}})} /> Enabled</label>
              </div>
            </div>

            {/* Daily limits (temporarily hidden) */}
            {/*
            <div>
              <label className="block text-sm text-text-secondary mb-1">Daily limits (optional)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary">Daily RCs</label>
                  <Input type="number" value={form.features?.dailyLimits?.dailyRcs ?? ''} onChange={e => setForm({...form, features: {...form.features, dailyLimits: {...form.features.dailyLimits, dailyRcs: e.target.value === '' ? null : Number(e.target.value)}}})} />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary">Daily Attempts</label>
                  <Input type="number" value={form.features?.dailyLimits?.dailyAttempts ?? ''} onChange={e => setForm({...form, features: {...form.features, dailyLimits: {...form.features.dailyLimits, dailyAttempts: e.target.value === '' ? null : Number(e.target.value)}}})} />
                </div>
              </div>
            </div>
            */}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
