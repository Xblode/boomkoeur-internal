'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Tag } from 'lucide-react'
import { Chip } from '@/components/ui/atoms'
import { cn } from '@/lib/utils'

export interface TagMultiSelectTag {
  id: string
  name: string
  color?: string | null
}

interface TagMultiSelectProps {
  /** IDs des tags sélectionnés (mode avec availableTags) */
  selectedTagIds?: string[]
  /** Tags sélectionnés en mode simple (noms) — prioritaire si fourni */
  value?: string[]
  /** Callback quand les tags changent (IDs ou noms selon le mode) */
  onChange: (tagIds: string[]) => void
  /** Tags disponibles (mode avec IDs) */
  availableTags?: TagMultiSelectTag[]
  /** Placeholder du bouton + / zone vide */
  placeholder?: string
  className?: string
  disabled?: boolean
  /** Créer un nouveau tag (mode IDs) — retourne le tag créé avec son id */
  onCreateTag?: (name: string) => Promise<TagMultiSelectTag | void>
}

/**
 * TagMultiSelect — Étiquettes avec ajout inline (style page événement)
 *
 * Clic sur + → ajoute un chip vide immédiatement éditable.
 * Saisie directe dans le chip, Enter/blur pour valider.
 *
 * Modes :
 * - Simple (value) : tags = noms (string[])
 * - Avec IDs (selectedTagIds + availableTags) : pour transactions, etc.
 */
export function TagMultiSelect({
  selectedTagIds = [],
  value,
  onChange,
  availableTags = [],
  placeholder = 'Ajouter une étiquette...',
  className,
  disabled = false,
  onCreateTag,
}: TagMultiSelectProps) {
  const isSimpleMode = value !== undefined
  const tags = isSimpleMode ? value : selectedTagIds.map((id) => availableTags.find((t) => t.id === id)?.name ?? id)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (newTagNames: string[]) => {
    if (isSimpleMode) {
      onChange(newTagNames)
    } else {
      const newIds = newTagNames.map((name) => {
        const existing = availableTags.find((t) => t.name === name)
        return existing ? existing.id : name
      })
      onChange(newIds)
    }
  }

  const handleAddNew = () => {
    if (disabled) return
    setEditingIndex(tags.length)
    setEditingValue('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleCommitEdit = async () => {
    const trimmed = editingValue.trim()
    if (editingIndex === null) return

    if (trimmed) {
      if (editingIndex < tags.length) {
        const newTags = [...tags]
        newTags[editingIndex] = trimmed
        handleChange(newTags)
      } else {
        if (isSimpleMode) {
          if (!tags.includes(trimmed)) handleChange([...tags, trimmed])
        } else if (onCreateTag) {
          const newTag = await onCreateTag(trimmed)
          if (newTag && !selectedTagIds.includes(newTag.id)) {
            onChange([...selectedTagIds, newTag.id])
          }
        } else if (!tags.includes(trimmed)) {
          handleChange([...tags, trimmed])
        }
      }
    } else if (editingIndex < tags.length) {
      const newTags = tags.filter((_, i) => i !== editingIndex)
      handleChange(newTags)
    }

    setEditingIndex(null)
    setEditingValue('')
  }

  const handleRemove = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index)
    handleChange(newTags)
    if (editingIndex !== null && editingIndex >= index && editingIndex > 0) {
      setEditingIndex(editingIndex - 1)
    } else if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCommitEdit()
    }
    if (e.key === 'Escape') {
      setEditingIndex(null)
      setEditingValue('')
    }
    if (e.key === 'Backspace' && editingValue === '') {
      e.preventDefault()
      if (index < tags.length) {
        handleRemove(index)
        if (index > 0) {
          setEditingIndex(index - 1)
          setEditingValue(tags[index - 1] ?? '')
        } else {
          setEditingIndex(null)
        }
      } else {
        setEditingIndex(null)
      }
    }
  }

  useEffect(() => {
    if (editingIndex !== null) {
      if (editingIndex < tags.length) setEditingValue(tags[editingIndex] ?? '')
      else setEditingValue('')
    }
  }, [editingIndex])

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Tag size={14} className="text-zinc-400 shrink-0" />
      {tags.map((tag, index) => (
        <span key={index} className="inline-flex items-center">
          {editingIndex === index ? (
            <input
              ref={index === editingIndex ? inputRef : undefined}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={handleCommitEdit}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder="Nom du tag"
              className="h-6 min-w-[80px] max-w-[180px] rounded-full border border-zinc-200 dark:border-zinc-700 bg-transparent px-2.5 py-0.5 text-xs font-medium outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              autoFocus
            />
          ) : (
            <Chip
              label={tag}
              variant="default"
              onDelete={disabled ? undefined : () => handleRemove(index)}
              onClick={disabled ? undefined : () => setEditingIndex(index)}
              className="cursor-text"
            />
          )}
        </span>
      ))}
      {editingIndex === tags.length && (
        <input
          ref={inputRef}
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={handleCommitEdit}
          onKeyDown={(e) => handleKeyDown(e, tags.length)}
          placeholder="Nom du tag"
          className="h-6 min-w-[80px] max-w-[180px] rounded-full border border-zinc-200 dark:border-zinc-700 bg-transparent px-2.5 py-0.5 text-xs font-medium outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
          autoFocus
        />
      )}
      {!disabled && editingIndex === null && (
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:text-foreground hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors shrink-0"
          title={placeholder}
          aria-label={placeholder}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  )
}
