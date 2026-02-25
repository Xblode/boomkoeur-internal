'use client'

import { useState, useMemo } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms'
import { Button, Input } from '@/components/ui/atoms'
import { Search, Link2Off } from 'lucide-react'
import { useCommercialContacts } from '@/hooks/useCommercialContacts'
import { cn } from '@/lib/utils'

const DEFAULT_CONTACTS_COUNT = 8

export interface ContactPickerProps {
  /** ID du contact actuellement lié */
  value?: string
  /** Callback quand un contact est sélectionné */
  onSelect: (contactId: string) => void
  /** Callback pour délier le contact */
  onUnlink: () => void
  /** Contenu du trigger (affichage dans la cellule) */
  children: React.ReactNode
  className?: string
}

export function ContactPicker({ value, onSelect, onUnlink, children, className }: ContactPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { contacts: allContacts, isLoading } = useCommercialContacts()

  // Premiers contacts (triés par nom)
  const defaultContacts = useMemo(() => {
    return [...allContacts]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, DEFAULT_CONTACTS_COUNT)
  }, [allContacts])

  // Contacts filtrés par recherche
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return allContacts
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.email?.toLowerCase().includes(query)) ||
          (c.phone?.toLowerCase().includes(query)) ||
          (c.company?.toLowerCase().includes(query))
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allContacts, searchQuery])

  const displayContacts = searchQuery.trim() ? filteredContacts : defaultContacts

  const handleSelect = (contactId: string) => {
    onSelect(contactId)
    setOpen(false)
    setSearchQuery('')
  }

  const handleUnlink = () => {
    onUnlink()
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full h-full min-h-8 text-left text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded flex items-center',
            className
          )}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex flex-col">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-border-custom">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Rechercher un contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Bouton délier */}
          {value && (
            <div className="p-2 border-b border-border-custom">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnlink}
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Link2Off className="w-4 h-4 mr-2" />
                Délier le contact
              </Button>
            </div>
          )}

          {/* Liste des contacts */}
          <div className="max-h-[280px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-zinc-500">Chargement...</div>
            ) : displayContacts.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500">
                {searchQuery ? 'Aucun contact trouvé' : 'Aucun contact'}
              </div>
            ) : (
              <div className="space-y-1">
                {displayContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleSelect(contact.id)}
                    className={cn(
                      'w-full text-left p-2 rounded text-sm transition-colors',
                      'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                      value === contact.id && 'bg-zinc-100 dark:bg-zinc-800'
                    )}
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {contact.name}
                    </div>
                    {contact.company && (
                      <div className="text-xs text-zinc-500 truncate mt-0.5">{contact.company}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
