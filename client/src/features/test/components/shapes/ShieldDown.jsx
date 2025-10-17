/**
 * ShieldDown - Green 6-sided polygon pointing down (answered state)
 * CAT-style shield shape for answered questions
 */
export function ShieldDown({ className = '', size = 42 }) {
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
        d="M 4,6 L 28,6 L 28,18 L 16,28 L 4,18 Z"
        fill="currentColor"
      />
    </svg>
  )
}
