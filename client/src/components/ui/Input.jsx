import { cn } from '../../lib/utils'

export function Input({ className, ...props }){
  return (
    <input
  className={cn('w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm placeholder:text-text-secondary focus:border-accent-amber focus:ring-accent-amber disabled:bg-neutral-grey disabled:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}
