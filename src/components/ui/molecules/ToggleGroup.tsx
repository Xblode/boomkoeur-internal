'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleGroupOption {
  value: string
  label: string
  /** Couleur optionnelle pour un indicateur (dot) avant le label, ex: #6366f1 */
  dot?: string
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[]
  /** Pour single-select : valeur active. Pour multi-select : ignoré. */
  value?: string
  /** Pour multi-select : valeurs actives. Pour single-select : ignoré. */
  values?: string[]
  /** Single-select : (value) => void. Multi-select : (values) => void. */
  onChange: (valueOrValues: string | string[]) => void
  /** true = multi-select (plusieurs actifs), false = single-select (un seul actif) */
  multiple?: boolean
  className?: string
}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ options, value, values = [], onChange, multiple = false, className }, ref) => {
    const isActive = (optValue: string) =>
      multiple ? values.includes(optValue) : value === optValue

    const handleClick = (optValue: string) => {
      if (multiple) {
        const newValues = isActive(optValue)
          ? values.filter((v) => v !== optValue)
          : [...values, optValue]
        onChange(newValues)
      } else {
        onChange(optValue)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex rounded-md border border-border-custom bg-zinc-50 dark:bg-zinc-900/40 p-0.5',
          className
        )}
        role={multiple ? 'group' : 'radiogroup'}
      >
        {options.map((opt, index) => {
          const active = isActive(opt.value)
          const prevActive = index > 0 && isActive(options[index - 1].value)
          const nextActive = index < options.length - 1 && isActive(options[index + 1].value)

          const activeBorderClasses = active
            ? cn(
                'bg-white dark:bg-zinc-800 text-foreground border border-border-custom',
                prevActive && 'rounded-l-none border-l-0 -ml-px',
                nextActive && 'rounded-r-none border-r-0 -mr-px',
                !prevActive && 'rounded-l',
                !nextActive && 'rounded-r'
              )
            : 'text-zinc-500 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md'

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleClick(opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium uppercase tracking-wide transition-colors',
                activeBorderClasses
              )}
            >
              {opt.dot && (
                <span
                  className="w-2 h-2 shrink-0 rounded-full"
                  style={{ backgroundColor: opt.dot }}
                />
              )}
              {opt.label}
            </button>
          )
        })}
      </div>
    )
  }
)
ToggleGroup.displayName = 'ToggleGroup'
