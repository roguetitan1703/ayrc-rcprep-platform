import { useState } from 'react'

export function Tooltip({ children, content }) {
  const [show, setShow] = useState(false)
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <div className="absolute z-50 px-3 py-2 text-xs font-medium text-white bg-[#273043] rounded-lg shadow-xl whitespace-nowrap pointer-events-none -top-10 left-1/2 transform -translate-x-1/2">
          {content}
          <div className="absolute w-2 h-2 bg-[#273043] transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  )
}
