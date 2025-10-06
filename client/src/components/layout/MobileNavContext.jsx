import React, { createContext, useContext, useState, useRef } from 'react'

const MobileNavContext = createContext(null)

export function MobileNavProvider({ children }){
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)

  function openNav(){ setOpen(true) }
  function close(){
    setOpen(false)
    // restore focus to toggle button if available
    try{ if(toggleRef.current) toggleRef.current.focus() } catch(e){}
  }

  const value = { open, setOpen, close, openNav, setToggleRef: (el) => (toggleRef.current = el) }
  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
}

export function useMobileNav(){
  const ctx = useContext(MobileNavContext)
  if(!ctx) throw new Error('useMobileNav must be used within MobileNavProvider')
  return ctx
}

export default MobileNavContext
