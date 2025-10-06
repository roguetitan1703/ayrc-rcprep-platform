import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from './Sidebar'
import { useMobileNav } from './MobileNavContext'

export default function MobileSidebar(){
  const { open, close } = useMobileNav()
  const [slidIn, setSlidIn] = useState(false)
  const touchStartX = useRef(null)
  const ignorePop = useRef(false)
  const pushedHistory = useRef(false)

  // Keyboard: close on Escape (still immediate)
  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') handleClose() }
    if(open) document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  }, [open])

  // Prevent background scroll while open
  useEffect(()=>{
    if(open){
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return ()=> { document.body.style.overflow = prev }
    }
  }, [open])

  // Manage slide-in animation state when opened/closed so we can animate out
  useEffect(()=>{
    if(open){
      // mount then slide in
      requestAnimationFrame(()=> setSlidIn(true))
      // push a history entry so back button closes drawer
      try{
        if(!pushedHistory.current){
          window.history.pushState({mobileNav:true}, '')
          pushedHistory.current = true
        }
      }catch(e){}
    } else {
      setSlidIn(false)
    }
  }, [open])

  function handleClose(){
    // animate out, then call context close after transition
    setSlidIn(false)
    // remove our pushed history entry if present by going back once
    try{
      if(pushedHistory.current){
        ignorePop.current = true
        // go back to remove the pushed entry
        window.history.back()
      }
    }catch(e){}
    setTimeout(()=> close?.(), 220)
  }

  function onScrimClick(){ handleClose() }

  function onTouchStart(e){ touchStartX.current = e.touches?.[0]?.clientX }
  function onTouchEnd(e){
    const start = touchStartX.current || 0
    const end = e.changedTouches?.[0]?.clientX || 0
    const dx = end - start
    // swipe right to close
    if (dx > 50) handleClose()
    touchStartX.current = null
  }

  // Close drawer when user presses browser back (popstate). Use ignore flag when we programmatically call history.back()
  useEffect(()=>{
    function onPop(e){
      if(ignorePop.current){ ignorePop.current = false; return }
      // if drawer open, close it and clear pushed flag
      if(open){
        pushedHistory.current = false
        handleClose()
      }
    }
    window.addEventListener('popstate', onPop)
    return ()=> window.removeEventListener('popstate', onPop)
  }, [open])
  // focus first actionable item inside drawer when slid in
  useEffect(()=>{
    if(slidIn){
      requestAnimationFrame(()=>{
        const root = document.getElementById('mobile-drawer')
        const focusable = root?.querySelector('a,button,input,select,textarea')
        if(focusable) focusable.focus()
      })
    }
  }, [slidIn])

  if(typeof document === 'undefined') return null
  if(!open && !slidIn) return null

  return createPortal(
    <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Main navigation">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onScrimClick} />
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        id="mobile-drawer"
        className={`absolute inset-y-0 left-0 w-72 bg-card-surface p-2 shadow-xl flex flex-col transform transition-transform duration-200 ease-out ${slidIn ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex-1 pt-1">
          <Sidebar bare compact={false} mobile />
        </div>
      </div>
    </div>,
    document.body
  )
}
