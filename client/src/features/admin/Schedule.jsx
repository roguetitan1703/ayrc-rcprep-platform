import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ScheduleCalendar } from './ScheduleCalendar'

function fmt(d){ return new Date(d).toDateString() }

export default function Schedule(){
  const [rcs, setRcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await api.get('/admin/rcs')
        setRcs(data)
      }catch(e){ setError(e?.response?.data?.error || e.message) }
      finally{ setLoading(false) }
    })()
  },[])

  const byDay = useMemo(()=>{
    const map = new Map()
    for(const rc of rcs){
      if(!rc.scheduledDate) continue
      const k = fmt(rc.scheduledDate)
      if(!map.has(k)) map.set(k, [])
      map.get(k).push(rc)
    }
    return Array.from(map.entries()).sort((a,b)=> new Date(a[0]) - new Date(b[0]))
  },[rcs])

  if(loading) return <div className="p-6">Loading...</div>
  if(error) return <div className="p-6 text-error-red">{error}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Schedule Overview</h1>
      <ScheduleCalendar />
      {byDay.length===0 && <div className="text-text-secondary">No scheduled RCs yet.</div>}
      <div className="grid gap-3">
        {byDay.map(([day, items])=>{
          const warn = items.length !== 2
          return (
            <Card key={day} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{day}</div>
                  {warn && <span title="Recommended: 2 RCs per day" className="text-accent-amber">⚠</span>}
                </div>
                <div className={`text-xs ${warn? 'text-accent-amber':'text-text-secondary'}`}>{items.length} scheduled {warn? '(recommended: 2)':''}</div>
              </div>
              <div className="mt-3 grid gap-2">
                {items.map(rc=> (
                  <div key={rc._id} className="flex items-center justify-between bg-card-surface rounded p-3">
                    <div className="text-sm">{rc.title}</div>
                    <div className="flex items-center gap-2">
                      <Button as="a" href={`/test/${rc._id}?preview=1`} variant="outline">Preview</Button>
                      <Button as="a" href={`/admin/rcs/${rc._id}`} variant="ghost">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
