import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

function titleForPath(pathname, params){
  // Basic map of static segments to human labels
  const map = {
    'dashboard': 'Dashboard',
    'archive': 'Archive',
    'feedback': 'Feedback',
    'me': 'Profile',
    'change-password': 'Change Password',
    'admin': 'Admin',
    'schedule': 'Schedule',
    'rcs': 'RCs',
    'new': 'Create RC',
    'test': 'Test',
    'results': 'Results',
    'analysis': 'Analysis',
    'about': 'About',
    'login': 'Sign In',
    'register': 'Create Account'
  }
  const parts = pathname.replace(/^\/+|\/+$/g,'').split('/').filter(Boolean)
  if(parts.length===0) return 'Home'
  // handle parameterized segments generically
  return parts.map((seg)=> map[seg] || (seg.match(/^[0-9a-f]{6,}$/i)? 'ID' : seg)).join(' / ')
}

export default function PageHeader(){
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const { user } = useAuth()

  const title = useMemo(()=> titleForPath(location.pathname, params), [location.pathname])
  const crumbs = useMemo(()=>{
    const parts = location.pathname.split('/').filter(Boolean)
    let acc = ''
    return parts.map((p, idx)=>{
      acc += '/' + p
      const label = titleForPath('/'+p)
      return { href: acc, label, last: idx===parts.length-1 }
    })
  }, [location.pathname])

  function goBack(){
    if(window.history.length > 1){
      navigate(-1)
    } else {
      navigate(user? '/dashboard':'/')
    }
  }

  return (
    <div className="mb-4 border-b border-white/10 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={goBack} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-white/10 hover:bg-white/5">
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </button>
        <div className="min-w-0">
          <div className="text-base font-medium truncate">{title}</div>
          <nav className="text-xs text-text-secondary truncate">
            <Link to={user? '/dashboard':'/'} className="hover:text-text-primary">Home</Link>
            {crumbs.map((c,i)=> (
              <span key={i}>
                <span className="mx-1">/</span>
                {c.last ? (
                  <span className="text-text-primary/80">{c.label}</span>
                ) : (
                  <Link to={c.href} className="hover:text-text-primary">{c.label}</Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
