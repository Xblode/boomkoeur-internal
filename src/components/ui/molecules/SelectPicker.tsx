'use client'

import React, { useState, useMemo } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms'
import { Input } from '@/components/ui/atoms'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectPickerOption {
  value: string
  label: string
}

export interface SelectPickerProps {
  /** Valeur sélectionnée */
  value?: string
  /** Callback au changement de valeur */
  onChange?: (value: string) => void
  /** Options disponibles */
  options?: SelectPickerOption[]
  /** Texte affiché quand aucune sélection */
  placeholder?: string
  /** Afficher une barre de recherche (utile pour beaucoup d'options) */
  searchable?: boolean
  /** Placeholder de la recherche */
  searchPlaceholder?: string
  /** default = standard, sm = compact, xs = toolbar */
  size?: 'default' | 'sm' | 'xs'
  /** borderless = sans bordure, table = cellule de tableau */
  variant?: 'default' | 'borderless' | 'table'
  /** Erreur de validation */
  error?: boolean
  /** Label au-dessus du champ */
  label?: string
  /** Texte d'aide sous le champ */
  helperText?: string
  /** Désactivé */
  disabled?: boolean
  /** Classe CSS */
  className?: string
}

export function SelectPicker({
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner...',
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  size = 'default',
  variant = 'default',
  error = false,
  label,
  helperText,
  disabled = false,
  className,
}: SelectPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedOption = options.find((o) => o.value === value)
  const displayLabel = selectedOption?.label ?? placeholder

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(query))
  }, [options, searchQuery])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setOpen(false)
    setSearchQuery('')
  }

  const isXs = size === 'xs'
  const isSm = size === 'sm'
  const isBorderless = variant === 'borderless' || variant === 'table'

  const triggerStyles = cn(
    'w-full flex items-center justify-between rounded-md transition-colors text-left',
    'focus-visible:outline-none focus-visible:ring-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
    isBorderless
      ? 'border-0 border-transparent focus:ring-0'
      : error
        ? 'border border-red-500 focus:ring-red-500'
        : 'border border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300',
    isXs && 'h-6 text-xs px-2 py-0.5',
    isXs && variant === 'table' && 'min-h-8 h-full py-1 text-sm font-semibold',
    isSm && 'h-8 text-xs px-2.5 py-1',
    isXs === false && isSm === false && 'h-10 text-sm px-3 py-2',
    !selectedOption && 'text-zinc-500 dark:text-zinc-400'
  )

  const showSearch = searchable || options.length > 8

  return (
    <div className={cn('w-full', (isSm || isXs) && 'min-w-0')}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(triggerStyles, className)}
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronDown
              className={cn(
                'shrink-0 opacity-50 transition-transform',
                open && 'rotate-180',
                isXs ? 'ml-1 h-3.5 w-3.5' : 'ml-2 h-4 w-4'
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[160px] p-0" align="start">
          <div className="flex flex-col max-h-[280px]">
            {showSearch && (
              <div className="p-2 border-b border-border-custom">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
            )}
            <div className="overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-sm text-zinc-500">
                  {searchQuery ? 'Aucun résultat' : 'Aucune option'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded text-sm transition-colors',
                      'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                      value === option.value && 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                    )}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {helperText && (
        <p
          className={cn(
            'mt-1.5 text-sm',
            error ? 'text-red-500' : 'text-zinc-500'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
