import { cn } from '../../lib/utils'

export function Sidebar({ open, onClose, items = [], title = 'Menu' }){
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        aria-label="Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-white/10 shadow-lg transform transition-transform',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} aria-label="Close menu" className="text-text-secondary hover:text-text-primary">✕</button>
        </div>
        <nav className="p-2 space-y-1">
          {items.map((it) => (
            <a key={it.href} href={it.href} className="block px-3 py-2 rounded hover:bg-white/5 text-sm">
              {it.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  )
}
