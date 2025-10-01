import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../components/ui/Button'

const STEPS = [
  { title: 'Build Daily Mastery', body: 'Two authentic CAT-level RCs every day. Stay consistent; progress compounds.' },
  { title: 'Learn From Explanations', body: 'Every option is intentional. Understand traps and refine your judgment.' },
  { title: 'Track Your Habit', body: 'Your streak and accuracy keep you accountable. 20 focused minutes—daily.' },
]

export function OnboardingModal({ open, onClose }){
  const [i, setI] = useState(0)
  useEffect(()=>{ if(!open) setI(0) }, [open])
  if(!open) return null
  return createPortal(
    <div className='min-h-screen'>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-card-surface rounded-lg border border-white/10 shadow-lg p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">{STEPS[i].title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{STEPS[i].body}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">{STEPS.map((_,idx)=> <span key={idx} className={`h-1.5 w-6 rounded ${idx<=i? 'bg-accent-amber':'bg-white/10'}`} />)}</div>
          {i<STEPS.length-1 ? (
            <Button onClick={()=> setI(v=> v+1)}>Next</Button>
          ) : (
            <Button onClick={onClose}>Start My First RC</Button>
          )}
        </div>
      </div>
    </div>
    </div>, document.body)
}
