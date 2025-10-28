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
  const [form, setForm] = useState({ name: '', slug: '', description: '', finalPriceCents: 0, markupPriceCents: null, billingType: 'duration_days', durationDays: 30, accessUntil: '' , active: true })
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

  function openCreate(){ setEditing(null); setForm({ name:'', slug:'', description:'', finalPriceCents:0, markupPriceCents:null, billingType:'duration_days', durationDays:30, accessUntil:'', active:true }); setOpenModal(true) }
  function openEdit(p){ setEditing(p); setForm({ name:p.name, slug:p.slug, description:p.description || '', finalPriceCents:p.finalPriceCents, markupPriceCents:p.markupPriceCents || null, billingType:p.billingType, durationDays:p.durationDays || 30, accessUntil: p.accessUntil ? new Date(p.accessUntil).toISOString().slice(0,10) : '', active: p.active }) ; setOpenModal(true) }

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
              <Input type="number" value={form.finalPriceCents} onChange={e => setForm({...form, finalPriceCents: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary">Markup Price (cents)</label>
              <Input type="number" value={form.markupPriceCents ?? ''} onChange={e => setForm({...form, markupPriceCents: e.target.value === '' ? null : Number(e.target.value)})} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary">Billing Type</label>
            <select className="w-full p-2 border border-soft rounded-md" value={form.billingType} onChange={e => setForm({...form, billingType: e.target.value})}>
              <option value="duration_days">Duration (days)</option>
              <option value="till_date">Access until date</option>
            </select>
          </div>

          {form.billingType === 'duration_days' && (
            <div>
              <label className="block text-sm text-text-secondary">Duration (days)</label>
              <Input type="number" value={form.durationDays} onChange={e => setForm({...form, durationDays: Number(e.target.value)})} />
            </div>
          )}

          {form.billingType === 'till_date' && (
            <div>
              <label className="block text-sm text-text-secondary">Access Until</label>
              <Input type="date" value={form.accessUntil} onChange={e => setForm({...form, accessUntil: e.target.value})} />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.active} onChange={e => setForm({...form, active: e.target.checked})} />
              <span className="text-sm text-text-secondary">Active</span>
            </label>
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
