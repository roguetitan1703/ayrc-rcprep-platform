import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export function useFeedbackStatus(){
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState({ submitted: false, lockStatus: { lock: false, reason: null } })

  useEffect(()=>{
    let mounted = true
    ;(async()=>{
      try{
        const { data } = await api.get('/feedback/today')
        if(!mounted) return
        setStatus(data)
      }catch(err){
        // default: no feedback submitted
      }finally{ if(mounted) setLoading(false) }
    })()
    return ()=> { mounted = false }
  },[])

  return { loading, status }
}
