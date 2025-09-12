import { Link } from 'react-router-dom'

export default function AuthShell({ title, subtitle, children }){
  return (
    <div className="min-h-[calc(100vh-56px)] grid md:grid-cols-2">
      <div className="hidden md:flex relative items-center justify-center overflow-hidden bg-gradient-to-br from-accent-amber/10 via-transparent to-transparent">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:'radial-gradient(white 1px, transparent 1px)', backgroundSize:'16px 16px'}} />
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-semibold mb-2">ARC</h2>
          <p className="text-text-secondary">Daily RC practice with instant feedback and analysis. Build streaks, learn faster.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
          </div>
          {children}
          <div className="mt-8 text-xs text-text-secondary text-center">By continuing you agree to our <Link className="underline" to="/terms">Terms</Link>.</div>
        </div>
      </div>
    </div>
  )
}
