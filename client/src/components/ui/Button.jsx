import { cn } from '../../lib/utils'

export function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  ...props
}){
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:bg-neutral-grey disabled:text-text-secondary disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-accent-amber text-black hover:brightness-110 focus:ring-accent-amber',
    outline: 'border border-accent-amber text-accent-amber hover:bg-accent-amber/10 focus:ring-accent-amber',
    ghost: 'text-text-primary hover:bg-white/5',
  }
  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3.5 py-2',
    lg: 'text-base px-5 py-2.5', // replaced invalid px-4.5 with px-5
  }
  return <Comp className={cn(base, variants[variant], sizes[size], className)} disabled={disabled} {...props} />
}
