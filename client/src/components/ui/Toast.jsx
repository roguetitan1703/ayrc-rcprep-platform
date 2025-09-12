import { createContext, useContext, useMemo, useState } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])
  const api = useMemo(()=> ({
    show: (title, opts={})=>{
      const id = Math.random().toString(36).slice(2)
      const t = { id, title, variant: opts.variant || 'default', timeout: opts.timeout ?? 2500 }
      setToasts(s=> [...s, t])
      if(t.timeout>0){ setTimeout(()=> dismiss(id), t.timeout) }
      return id
    },
    dismiss: (id)=> setToasts(s=> s.filter(t=> t.id!==id))
  }), [])
  const dismiss = api.dismiss
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div role="region" aria-live="polite" aria-label="Notifications" className="fixed z-[60] top-4 right-4 flex flex-col gap-2">
        {toasts.map(t=> (
          <div key={t.id} className={`min-w-[220px] max-w-xs rounded-md px-3 py-2 text-sm shadow border ${t.variant==='success'?'bg-green-500/10 border-green-500/50 text-green-200': t.variant==='error'?'bg-red-500/10 border-red-500/50 text-red-200':'bg-white/10 border-white/20 text-white'}`}>
            {t.title}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastCtx)
  if(!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
