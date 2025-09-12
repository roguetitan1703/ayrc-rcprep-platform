export function Skeleton({ className = '' }){
  return <div className={`animate-pulse bg-white/10 rounded ${className}`} />
}

export function SkeletonText({ lines = 3 }){
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 ${i===lines-1 ? 'w-3/5' : 'w-full'} animate-pulse bg-white/10 rounded`} />
      ))}
    </div>
  )
}
