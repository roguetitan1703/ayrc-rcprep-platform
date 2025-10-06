import { useState } from 'react'
import { cn } from '../../lib/utils'
import { Eye, EyeOff, Lock } from 'lucide-react'

// Input supports:
// - icon: Icon component shown inside input (left)
// - label: floating label text (optional)
// - addonLeft: React node rendered as a compact left addon (e.g. country select)
export function Input({ className, icon: Icon, label, addonLeft, ...props }){
  // ensure we always have a placeholder so the floating label logic (peer-placeholder-shown) works
  const placeholder = props.placeholder ?? ' '

  const leftPadding = addonLeft ? 'pl-28 sm:pl-32' : Icon ? 'pl-12' : 'px-4'

  // compute label left offset
  const labelLeft = addonLeft ? 'left-28 sm:left-32' : Icon ? 'left-12' : 'left-4'

  return (
    <div className="relative">
      {addonLeft && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {addonLeft}
        </div>
      )}

      {!addonLeft && Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-grey">
          <Icon className="w-5 h-5" />
        </div>
      )}

      <input
        placeholder={placeholder}
        className={cn(
          'peer w-full rounded-xl border border-neutral-grey/30 bg-card-surface py-3 text-base placeholder:text-neutral-grey focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none focus-visible:ring-primary/30 focus-visible:outline-none disabled:bg-neutral-grey/10 disabled:text-neutral-grey disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          leftPadding,
          className
        )}
        {...props}
      />

      {label && (
        <label className={cn(`${labelLeft} absolute text-neutral-grey pointer-events-none transition-all`,
          'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base',
          'peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs')}
        >
          {label}
        </label>
      )}
    </div>
  )
}

export function PasswordInput({ className, ...props }){
  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-grey">
        <Lock className="w-5 h-5" />
      </div>
      <input
        type={showPassword ? 'text' : 'password'}
        className={cn('w-full rounded-xl border border-neutral-grey/30 bg-card-surface pl-12 pr-12 py-3 text-base placeholder:text-neutral-grey focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:bg-neutral-grey/10 disabled:text-neutral-grey disabled:opacity-50 disabled:cursor-not-allowed transition-colors', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-grey hover:text-text-primary transition-colors p-1"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  )
}
