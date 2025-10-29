import { cn } from '../../lib/utils'

export function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  ...props
}){
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2A6C] disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[#D33F49] text-white hover:bg-[#E25C62] active:bg-[#B32F3A] shadow-sm',
    outline: 'border-2 border-[#D33F49] text-[#D33F49] hover:bg-[#D33F49]/10',
    ghost: 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
    danger: 'text-error-red hover:bg-error-red/10',
    destructive: 'bg-error-red text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
    success: 'bg-success-green text-white hover:bg-green-600 active:bg-green-700 shadow-sm',
    secondary: 'bg-surface-muted text-text-primary hover:bg-[#D8DEE9] border border-border-soft',
  }
  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3.5 py-2',
    lg: 'text-base px-5 py-2.5', // replaced invalid px-4.5 with px-5
  }
  return <Comp className={cn(base, variants[variant], sizes[size], className)} disabled={disabled} {...props} />
}
