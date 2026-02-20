'use client'

import { useState, useRef, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/atoms'
import { TagMultiSelect } from '@/components/ui/molecules'
import { Button } from '@/components/ui/atoms'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types/finance'
import { useUpdateTransactionTags } from '@/lib/stubs/supabase-stubs'

interface TransactionTagsCellProps {
  transaction: Transaction
  tags: Array<{ id: string; name: string; slug: string; color: string | null }>
  onUpdate?: () => void
}

export function TransactionTagsCell({ transaction, tags: initialTags, onUpdate }: TransactionTagsCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTags.map((t) => t.id))
  const cellRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const updateTags = useUpdateTransactionTags()

  // Synchroniser avec les tags initiaux
  useEffect(() => {
    setSelectedTagIds(initialTags.map((t) => t.id))
  }, [initialTags])

  // Fermer le popover quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        cellRef.current &&
        !cellRef.current.contains(event.target as Node)
      ) {
        handleCancel()
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing])

  const handleSave = async () => {
    try {
      await updateTags.mutateAsync({
        transactionId: transaction.id,
        tagIds: selectedTagIds,
      })
      setIsEditing(false)
      onUpdate?.()
    } catch (error) {
      // Erreur geree par le hook
    }
  }

  const handleCancel = () => {
    setSelectedTagIds(initialTags.map((t) => t.id))
    setIsEditing(false)
  }

  // Calculer la position du popover
  const getPopoverPosition = () => {
    if (!cellRef.current) return { top: 0, left: 0 }
    const rect = cellRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + 8,
      left: rect.left,
    }
  }

  return (
    <div ref={cellRef} className="relative">
      <div
        className="flex flex-wrap gap-1 cursor-pointer hover:opacity-80 transition-opacity min-h-[24px] items-center"
        onClick={(e) => {
          e.stopPropagation()
          setIsEditing(true)
        }}
      >
        {initialTags.length > 0 ? (
          initialTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="default"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                borderColor: tag.color || undefined,
                color: tag.color || undefined,
              }}
            >
              {tag.name}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-zinc-500 italic px-2 py-1 border border-dashed border-border-custom rounded">
            + Ajouter
          </span>
        )}
      </div>

      {isEditing && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[90] bg-black/20"
            onClick={handleCancel}
          />
          {/* Popover */}
          <div
            ref={popoverRef}
            className="fixed z-[100] bg-card-bg border-2 border-accent rounded shadow-lg p-4 min-w-[320px] max-w-[400px]"
            style={getPopoverPosition()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-label text-xs uppercase tracking-wider text-foreground">
                Modifier les tags
              </h4>
              <button
                onClick={handleCancel}
                className="text-zinc-500 hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <TagMultiSelect
                selectedTagIds={selectedTagIds}
                onChange={setSelectedTagIds}
                placeholder="Rechercher ou creer un tag..."
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={updateTags.isLoading}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={updateTags.isLoading}
              >
                {updateTags.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

