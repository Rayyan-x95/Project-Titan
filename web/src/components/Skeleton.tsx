export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      className={`skeleton-loader ${className}`}
      aria-busy="true"
      aria-label="Loading..."
    />
  )
}
