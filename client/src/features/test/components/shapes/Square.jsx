/**
 * Square - White/light gray square (not-visited state)
 * CAT-style square shape for unvisited questions
 */
export function Square({ className = '', size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="6"
        y="6"
        width="20"
        height="20"
        fill="currentColor"
      />
    </svg>
  )
}
