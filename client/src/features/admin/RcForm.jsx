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

const empty = {
  title: '', passageText: '', source: '', topicTags: '', status: 'draft', scheduledDate: '', questionsJson: ''
}

export default function RcForm(){
  const { id } = useParams()
  const isEdit = id && id !== 'new'
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(!!isEdit)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const nav = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  useEffect(()=>{
    if(!isEdit) return
    if(user && user.role !== 'admin') { nav('/admin/login'); return }
    (async()=>{
      try{
        const { data } = await api.get(`/admin/rcs`)
        const rc = data.find(x=>x._id===id)
        if(rc){
          setForm({
            title: rc.title,
            passageText: rc.passageText,
            source: rc.source||'',
            topicTags: (rc.topicTags||[]).join(','),
            status: rc.status,
            scheduledDate: rc.scheduledDate?.slice(0,10) || '',
            questionsJson: JSON.stringify(rc.questions, null, 2)
          })
        }
  }catch(e){ setError(extractErrorMessage(e)); toast.show(extractErrorMessage(e),{ variant:'error'}) }
      finally{ setLoading(false) }
    })()
  },[id, user])

  function setField(k,v){ setForm(f=>({ ...f, [k]: v })) }

  function validateQuestions(arr){
    if(!Array.isArray(arr) || arr.length!==4) return 'Must contain exactly 4 questions.'
    for(let i=0;i<arr.length;i++){
      const q = arr[i]
      if(!q.questionText || typeof q.questionText!=='string') return `Question ${i+1} missing questionText.`
      if(!Array.isArray(q.options) || q.options.length!==4) return `Question ${i+1} must have 4 options.`
      const ids = new Set(q.options.map(o=>o.id))
      if(['A','B','C','D'].some(x=> !ids.has(x))) return `Question ${i+1} must have option IDs A-D.`
      if(!q.correctAnswerId || !['A','B','C','D'].includes(q.correctAnswerId)) return `Question ${i+1} invalid correctAnswerId.`
      if(!q.explanation) return `Question ${i+1} missing explanation.`
    }
    return null
  }

  async function onSubmit(e){
    e.preventDefault(); setError('')
    try{
      let questions
      try{ questions = JSON.parse(form.questionsJson) }catch{ throw new Error('Questions JSON invalid.') }
      const qErr = validateQuestions(questions)
      if(qErr) throw new Error(qErr)
      const payload = {
        title: form.title.trim(),
        passageText: form.passageText.trim(),
        source: form.source.trim() || undefined,
        topicTags: form.topicTags ? form.topicTags.split(',').map(s=>s.trim()).filter(Boolean) : [],
        status: form.status,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate) : undefined,
        questions,
      }
      if(isEdit) await api.put(`/admin/rcs/${id}`, payload)
      else await api.post(`/admin/rcs`, payload)
      nav('/admin')
  }catch(e){ const msg = extractErrorMessage(e); setError(msg); toast.show(msg,{ variant:'error'}) }
  }

  // Scheduling warning: fetch today's rcs and warn if >2 including this one
  useEffect(()=>{
    (async()=>{
      try{
        setWarning('')
        if(!form.scheduledDate || (form.status!=='scheduled' && form.status!=='live')) return
        const date = new Date(form.scheduledDate)
        // crude: get today's RCs endpoint and compare dates client-side
        const { data } = await api.get('/rcs/today')
        const sameDay = data.filter(r=> new Date(r.scheduledDate).toDateString() === date.toDateString())
        if(sameDay.length >= 2) setWarning('You already have two RCs scheduled for this date (IST).')
      }catch{}
    })()
  }, [form.scheduledDate, form.status])

  if(loading) return (
    <div className="max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <h1 className="h4">{isEdit? 'Edit RC' : 'Create RC'}</h1>
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
    <div className="max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <h1 className="h4">{isEdit? 'Edit RC' : 'Create RC'}</h1>
        </CardHeader>
        <CardContent>
          {error && <div className="text-error-red text-sm mb-3">{error}</div>}
          {warning && <div className="text-accent-amber text-sm mb-3">{warning}</div>}
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm mb-1">Title</label>
              <Input value={form.title} onChange={e=>setField('title', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Source</label>
              <Input value={form.source} onChange={e=>setField('source', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Topic Tags (comma separated)</label>
              <Input value={form.topicTags} onChange={e=>setField('topicTags', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Scheduled Date</label>
              <Input type="date" value={form.scheduledDate} onChange={e=>setField('scheduledDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select className="bg-background border border-white/10 rounded-md px-3 py-2 text-sm" value={form.status} onChange={e=>setField('status', e.target.value)}>
                <option value="draft">draft</option>
                <option value="scheduled">scheduled</option>
                <option value="live">live</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Passage Text</label>
              <textarea className="w-full min-h-[160px] bg-background border border-white/10 rounded-md p-3 text-sm" value={form.passageText} onChange={e=>setField('passageText', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Questions JSON (array length 4)</label>
              <textarea className="w-full min-h-[240px] bg-background border border-white/10 rounded-md p-3 text-sm" value={form.questionsJson} onChange={e=>setField('questionsJson', e.target.value)} required />
              <p className="text-xs text-text-secondary mt-1">Each question options must be array of objects with id A-D and text fields; include correctAnswerId and explanation.</p>
            </div>
            <Button type="submit" disabled={!form.title || !form.passageText || !form.questionsJson}>{isEdit? 'Update' : 'Create'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
