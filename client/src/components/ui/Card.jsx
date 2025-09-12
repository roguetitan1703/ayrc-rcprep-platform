import { cn } from '../../lib/utils'

export function Card({ className, ...props }){
  return <div className={cn('bg-card-surface border border-white/5 rounded-lg shadow', className)} {...props} />
}

export function CardHeader({ className, ...props }){
  return <div className={cn('p-4 border-b border-white/5', className)} {...props} />
}
export function CardContent({ className, ...props }){
  return <div className={cn('p-4', className)} {...props} />
}
export function CardFooter({ className, ...props }){
  return <div className={cn('p-4 border-t border-white/5', className)} {...props} />
}
