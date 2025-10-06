import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function NotFound() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-3">Page Not Found</h2>
          <p className="text-text-secondary text-lg">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Home size={18} />
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Home size={18} />
              Go to Home
            </Link>
          )}
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-muted text-text-primary rounded-lg font-medium hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
