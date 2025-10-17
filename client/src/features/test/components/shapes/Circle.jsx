/**
 * Circle - Purple circle (marked for review state)
 * CAT-style circle shape for marked questions
 */
export function Circle({ className = '', size = 32 }) {
  // Scale radius proportionally with size (10 radius for 32px base = 31.25% of size)
  const radius = size * 0.3125
  const center = size / 2
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="currentColor"
      />
    </svg>
  )
}
