import { cn } from '../../lib/utils'

export function Badge({ color = 'default', className, ...props }){
  const colors = {
    default: 'bg-white/10 text-text-primary',
    success: 'bg-success-green/15 text-success-green',
    warning: 'bg-accent-amber/15 text-accent-amber',
    error: 'bg-error-red/15 text-error-red',
  }
  return <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', colors[color], className)} {...props} />
}
