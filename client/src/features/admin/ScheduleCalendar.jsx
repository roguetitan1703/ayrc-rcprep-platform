import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const statusClasses = {
  ideal: 'bg-success-green/20 text-success-green border-success-green/40',
  under: 'bg-accent-amber/20 text-accent-amber border-accent-amber/40',
  over: 'bg-error-red/20 text-error-red border-error-red/40'
}

export function ScheduleCalendar(){
  const today = new Date()
  const [year,setYear] = useState(today.getFullYear())
  const [month,setMonth] = useState(today.getMonth()) // 0-11
  const [days,setDays] = useState([])
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [activeDay,setActiveDay] = useState(null)
  const [dayRcs,setDayRcs] = useState([])
  const [loadingDay,setLoadingDay] = useState(false)

  useEffect(()=>{ (async()=>{
    setLoading(true); setError('')
    try{ const { data } = await api.get(`/admin/rcs-monthly?year=${year}&month=${month}`); setDays(data) }catch(e){ setError(e?.response?.data?.error || e.message) }finally{ setLoading(false) }
  })() },[year,month])

  function prev(){ if(month===0){ setYear(y=> y-1); setMonth(11) } else setMonth(m=> m-1) }
  function next(){ if(month===11){ setYear(y=> y+1); setMonth(0) } else setMonth(m=> m+1) }

  const first = new Date(Date.UTC(year, month,1))
  const startWeekday = first.getUTCDay() // 0 Sunday
  const cells = []
  for(let i=0;i<startWeekday;i++) cells.push(null)
  for(const d of days){ cells.push(d) }
  while(cells.length % 7 !==0) cells.push(null)

  async function openDay(dateStr){
    setActiveDay(dateStr); setLoadingDay(true); setDayRcs([])
    try{ const { data } = await api.get(`/admin/rcs`); const list = data.filter(r=> (r.scheduledDate||'').slice(0,10)===dateStr); setDayRcs(list) }catch{} finally{ setLoadingDay(false) }
  }

  return (
    <div className="border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{first.toLocaleString(undefined,{ month:'long', year:'numeric'})}</div>
        <div className="flex gap-1 text-xs">
          <button onClick={prev} className="px-2 py-1 rounded bg-white/10">Prev</button>
          <button onClick={next} className="px-2 py-1 rounded bg-white/10">Next</button>
        </div>
      </div>
      {loading && <div className="text-xs text-text-secondary">Loading...</div>}
      {error && <div className="text-xs text-error-red">{error}</div>}
      <div className="grid grid-cols-7 gap-1 text-[10px] mb-1 text-text-secondary">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c,idx)=> c? (
          <button type="button" onClick={()=> openDay(c.date)} key={idx} title={`${c.count} RCs`} className={`aspect-square rounded border flex flex-col items-center justify-center ${statusClasses[c.status]} text-[10px] focus:outline-none focus:ring-2 focus:ring-accent-amber/60`}> <span>{parseInt(c.date.slice(8,10),10)}</span><span className="font-medium">{c.count}</span></button>
        ) : <div key={idx} className="aspect-square rounded bg-white/5" />)}
      </div>
      <div className="flex gap-3 mt-3 text-[10px] text-text-secondary">
        <div className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-success-green/40 inline-block"/>2 scheduled</div>
        <div className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-accent-amber/40 inline-block"/>Under</div>
        <div className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-error-red/40 inline-block"/>Over</div>
      </div>
      {activeDay && (
        <div className="mt-4 p-3 rounded border border-white/10 bg-white/5">
          <div className="text-xs text-text-secondary mb-2 flex items-center justify-between"><span>Details for {activeDay}</span><button onClick={()=> setActiveDay(null)} className="text-[10px] underline">Close</button></div>
          {loadingDay && <div className="text-[10px] text-text-secondary">Loading…</div>}
          {!loadingDay && dayRcs.length===0 && <div className="text-[10px] text-text-secondary">No RCs scheduled.</div>}
          <ul className="space-y-1 text-[11px]">
            {dayRcs.map(rc=> <li key={rc._id} className="flex items-center justify-between"><span className="truncate max-w-[180px]">{rc.title}</span><span className="text-[10px] uppercase tracking-wide text-text-secondary">{rc.status}</span></li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
