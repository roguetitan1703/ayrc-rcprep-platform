import * as Icons from 'lucide-react'

export function Icon({ name, size=18, className }){
  const Cmp = Icons[name] || Icons.HelpCircle
  return <Cmp size={size} className={className} />
}
