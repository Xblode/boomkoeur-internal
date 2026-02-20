'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { X, Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/atoms'
import { Input } from '@/components/ui/atoms'
import { cn } from '@/lib/utils'

export interface TagMultiSelectTag {
  id: string
  name: string
  color?: string | null
}

interface TagMultiSelectProps {
  /** IDs des tags sélectionnés */
  selectedTagIds: string[]
  /** Callback appelé quand les tags changent */
  onChange: (tagIds: string[]) => void
  /** Tous les tags disponibles */
  availableTags?: TagMultiSelectTag[]
  /** Placeholder de l'input */
  placeholder?: string
  /** Classe CSS personnalisée */
  className?: string
  /** Désactiver le composant */
  disabled?: boolean
  /** Permettre la création de nouveaux tags */
  allowCreate?: boolean
  /** Callback appelé quand on crée un nouveau tag */
  onCreateTag?: (name: string) => Promise<TagMultiSelectTag | void>
}

/**
 * TagMultiSelect - Sélecteur de tags avec recherche et création
 * 
 * Composant permettant de sélectionner plusieurs tags avec recherche et possibilité
 * de créer de nouveaux tags à la volée.
 * 
 * @example
 * ```tsx
 * <TagMultiSelect
 *   selectedTagIds={selectedIds}
 *   onChange={setSelectedIds}
 *   availableTags={tags}
 *   allowCreate={true}
 *   onCreateTag={async (name) => {
 *     const newTag = await api.createTag(name)
 *     return newTag
 *   }}
 * />
 * ```
 */
export function TagMultiSelect({
  selectedTagIds,
  onChange,
  availableTags = [],
  placeholder = 'Rechercher ou créer un tag...',
  className,
  disabled = false,
  allowCreate = false,
  onCreateTag,
}: TagMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Tags sélectionnés
  const selectedTags = useMemo(() => {
    return availableTags.filter((tag) => selectedTagIds.includes(tag.id))
  }, [availableTags, selectedTagIds])

  // Tags filtrés (excluant ceux déjà sélectionnés)
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableTags.filter((tag) => !selectedTagIds.includes(tag.id))
    }

    const query = searchQuery.toLowerCase()
    return availableTags.filter(
      (tag) =>
        !selectedTagIds.includes(tag.id) &&
        tag.name.toLowerCase().includes(query)
    )
  }, [availableTags, selectedTagIds, searchQuery])

  // Vérifier si le tag existe déjà
  const canCreateTag = useMemo(() => {
    if (!searchQuery.trim() || !allowCreate) return false
    const query = searchQuery.toLowerCase().trim()
    return !availableTags.some((tag) => tag.name.toLowerCase() === query)
  }, [searchQuery, availableTags, allowCreate])

  const handleSelectTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) return
    onChange([...selectedTagIds, tagId])
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId))
  }

  const handleCreateTag = async () => {
    if (!canCreateTag || !searchQuery.trim() || !onCreateTag) return

    const name = searchQuery.trim()
    setIsCreating(true)

    try {
      const newTag = await onCreateTag(name)
      if (newTag) {
        handleSelectTag(newTag.id)
      }
      setSearchQuery('')
    } catch (error) {
      console.error('Error creating tag:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="default"
              className="flex items-center gap-1.5 pr-1"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                borderColor: tag.color || undefined,
                color: tag.color || undefined,
              }}
            >
              <span>{tag.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label={`Retirer le tag ${tag.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Input de recherche */}
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-card-bg border border-border-custom rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredTags.length > 0 || canCreateTag ? (
              <div className="p-1">
                {/* Option de création */}
                {canCreateTag && (
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={isCreating}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isCreating ? (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Création...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
                        <span className="text-sm text-foreground">
                          Créer "<strong>{searchQuery.trim()}</strong>"
                        </span>
                      </>
                    )}
                  </button>
                )}

                {/* Liste des tags */}
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleSelectTag(tag.id)}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {tag.color && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      <span className="text-sm text-foreground">{tag.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-zinc-500 text-sm">
                {searchQuery.trim() ? 'Aucun tag trouvé' : 'Commencez à taper pour rechercher'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
