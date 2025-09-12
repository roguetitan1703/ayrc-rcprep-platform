import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from './Sidebar'

export default function MobileSidebar({ open, onClose }){
  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose?.() }
    if(open) document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if(typeof document === 'undefined') return null
  if(!open) return null
  return createPortal(
    <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-64 bg-background border-r border-white/10 p-3 shadow-xl">
        <button className="text-sm text-text-secondary hover:text-text-primary mb-2" onClick={onClose} aria-label="Close menu">Close</button>
        <Sidebar bare />
      </div>
    </div>,
    document.body
  )
}
