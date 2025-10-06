import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

export default function AuthShell({ title, subtitle, children, showTerms = true }){
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4 sm:p-6 lg:p-4">
      <div className="w-full max-w-[1830px] flex flex-col lg:flex-row gap-6 lg:gap-12 items-stretch relative">
        {/* Left Side - Form Area (Fixed width, centered in its space). Keep above banner with z-index */}
        <div className="w-full lg:flex-1 flex items-center justify-center px-4 py-6 sm:py-8 order-2 lg:order-1 relative z-30">
          <div className="w-full max-w-[420px] lg:max-w-[480px]">
            {/* Mobile: card background for legibility. Large screens: transparent (no extra bg) */}
            <div className="rounded-2xl p-6 sm:p-8 bg-card-surface text-text-primary shadow-lg lg:bg-transparent lg:shadow-none">
              {/* Logo at top */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <Link to="/" className="flex items-center gap-3 no-underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">
                  <Logo className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
                  <div className="text-base sm:text-lg font-bold text-text-primary">ARYC</div>
                </Link>
              </div>

              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-text-primary">{title}</h1>
                {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
              </div>

              <div className="text-base text-text-primary">
                {children}
              </div>

              {showTerms && (
                <div className="mt-6 sm:mt-8 text-xs text-text-secondary text-center">
                  By continuing you agree to our <Link className="text-primary underline-offset-2 hover:underline" to="/terms">Terms</Link> and <Link className="text-primary underline-offset-2 hover:underline" to="/privacy">Privacy</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Banner: full-bleed background on mobile, right-side panel on large screens */}
        {/* Banner only visible on large screens */}
        <div className="hidden lg:flex w-full lg:flex-1 items-center justify-center order-1 lg:order-2">
          <div className="w-full relative m-0 rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-text-primary to-secondary min-h-[700px] lg:h-[calc(100vh-5rem)] flex flex-col p-8 sm:p-10 lg:p-14">
            {/* Background Decorative Elements */}
            {/* Large Logo Watermark */}
            <div className="absolute top-[25%] left-1/2 -translate-x-1/2 opacity-[0.12]">
              <Logo className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] text-white" />
            </div>
            
            {/* Diagonal accent lines - top right */}
            <div className="absolute top-8 sm:top-12 right-6 sm:right-8 w-[200px] sm:w-[280px] h-[2px] bg-gradient-to-r from-white/20 via-white/30 to-transparent" style={{transform: 'rotate(45deg)'}} />
            <div className="absolute top-14 sm:top-20 right-10 sm:right-16 w-[150px] sm:w-[200px] h-[1.5px] bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{transform: 'rotate(45deg)'}} />
            <div className="absolute top-4 sm:top-6 right-16 sm:right-24 w-[100px] sm:w-[150px] h-[1px] bg-white/10" style={{transform: 'rotate(45deg)'}} />
            
            {/* Subtle geometric elements */}
            <div className="absolute bottom-[35%] right-8 sm:right-12 w-12 h-12 sm:w-16 sm:h-16 border border-white/8" style={{transform: 'rotate(-15deg)'}} />
            <div className="absolute top-[45%] left-8 sm:left-12 w-2 h-24 sm:h-32 bg-gradient-to-b from-white/10 to-transparent" style={{transform: 'rotate(25deg)'}} />
            <div className="absolute bottom-[25%] left-[15%] w-16 h-16 sm:w-20 sm:h-20 bg-white/3 rounded-full blur-2xl" />
            <div className="absolute top-[28%] right-[18%] w-24 h-24 sm:w-32 sm:h-32 bg-white/2 rounded-full blur-3xl" />
            <div className="absolute bottom-[15%] right-[25%] w-3 h-32 sm:h-40 bg-gradient-to-t from-white/5 to-transparent" style={{transform: 'rotate(-20deg)'}} />
            
            {/* Content Container */}
            <div className="relative z-10 text-left text-white flex flex-col h-full justify-between pointer-events-none lg:pointer-events-auto">
              {/* Welcome Text */}
              <div className="mb-auto pt-8 sm:pt-12">
                <p className="text-xs font-medium text-white/60 mb-3 sm:mb-4 tracking-wide">ARYC Platform</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 leading-tight">
                  Master Reading<br/>Comprehension
                </h2>
                <p className="text-sm text-white/70 leading-relaxed max-w-md">
                  Transform your RC skills with daily practice, expert guidance, and detailed analytics. Join students mastering reading comprehension for competitive exams.
                </p>
              </div>
              
              {/* Feature Card */}
              <div className="relative mt-auto pb-2 sm:pb-4 max-w-xl">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-5 sm:p-7 border border-white/20">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 leading-snug">
                    Start Your RC Journey Today
                  </h3>
                  <p className="text-white/75 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                    Practice daily with curated passages, track your progress, and achieve your target scores with personalized insights.
                  </p>
                  {/* Avatar circles with correct theme colors */}
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary to-[#b83742] border-3 border-white/30 shadow-lg" />
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-focus-ring to-[#132d5a] border-3 border-white/30 shadow-lg" />
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#F6B26B] to-[#d99a52] border-3 border-white/30 shadow-lg" />
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-success-green to-[#1d8077] border-3 border-white/30 shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
