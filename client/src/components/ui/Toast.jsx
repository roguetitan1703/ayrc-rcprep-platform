import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])
  const api = useMemo(()=> ({
    show: (title, opts={})=>{
      const id = Math.random().toString(36).slice(2)
      const t = { id, title, variant: opts.variant || 'default', timeout: opts.timeout ?? 3500 }
      console.debug('[Toast] show', t)
      setToasts(s=> [...s, t])
      if(t.timeout>0){ setTimeout(()=> dismiss(id), t.timeout) }
      return id
    },
    dismiss: (id)=> {
      console.debug('[Toast] dismiss', id)
      setToasts(s=> s.filter(t=> t.id!==id))
    }
  }), [])
  const dismiss = api.dismiss
  useEffect(()=>{ console.debug('[Toast] provider mounted') }, [])
  return (
    <ToastCtx.Provider value={api}>
      {children}
      {createPortal(
        <div data-portal="toast" role="region" aria-live="polite" aria-label="Notifications" className="fixed z-[9999] top-4 right-4 flex flex-col gap-3 pointer-events-none">
          {toasts.map(t=> (
            <div key={t.id} className="pointer-events-auto">
              <div className={`flex items-center gap-3 min-w-[220px] max-w-xs rounded-full px-4 py-3 shadow-md transition-transform transform translate-y-0 bg-white`}>
                <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${t.variant==='success'?'bg-green-50 text-green-600': t.variant==='error'?'bg-red-50 text-red-600': t.variant==='warning'?'bg-amber-50 text-amber-600':'bg-surface-muted text-text-primary'}`}>
                  {t.variant==='success' ? <CheckCircle size={18} /> : t.variant==='error' ? <XCircle size={18} /> : t.variant==='warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
                </div>
                <div className="flex-1 text-sm text-text-primary">{t.title}</div>
                <button onClick={()=>dismiss(t.id)} aria-label="Dismiss" className="ml-2 text-text-secondary hover:text-text-primary p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastCtx)
  if(!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
