/**
 * ShieldUp - Red 6-sided polygon pointing up (not-answered state)
 * CAT-style shield shape flipped for not-answered questions
 */
export function ShieldUp({ className = '', size = 42 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M 16,4 L 28,14 L 28,26 L 4,26 L 4,14 Z"
        fill="currentColor"
      />
    </svg>
  )
}
