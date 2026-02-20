interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showPercentage?: boolean
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'accent'
  height?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  color = 'accent',
  height = 'md',
  className = '',
}: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  const cappedPercentage = Math.min(percentage, 100)

  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    accent: 'bg-accent',
  }

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1 text-sm">
          {label && <span className="text-zinc-600 dark:text-zinc-400">{label}</span>}
          {showPercentage && (
            <span className="text-zinc-500 font-mono">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-background-tertiary rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[height]} rounded-full transition-all duration-300`}
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>
    </div>
  )
}

