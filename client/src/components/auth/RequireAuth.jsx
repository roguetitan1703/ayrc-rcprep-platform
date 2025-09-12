import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth({ children }){
  const { user, loading } = useAuth()
  const location = useLocation()
  if(loading) return null
  if(!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

export function RequireAdmin({ children }){
  const { user, loading } = useAuth()
  const location = useLocation()
  if(loading) return null
  if(!user) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  if(user.role !== 'admin') return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  return children
}
