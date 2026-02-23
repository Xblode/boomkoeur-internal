'use client'

import { useState, useMemo } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal, ModalFooter } from '@/components/ui/organisms'
import { EmptyState, LoadingState } from '@/components/ui/molecules'
import { Button, Input, Label } from '@/components/ui/atoms'
import { Badge } from '@/components/ui/atoms'
import { Search, User, Mail, Phone } from 'lucide-react'
import { useCommercialContacts } from '@/lib/stubs/supabase-stubs'

interface LinkContactModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  onLink: (contactId: string) => Promise<void>
}

export function LinkContactModal({ isOpen, onClose, transactionId, onLink }: LinkContactModalProps) {
  const { data: allContacts = [], isLoading } = useCommercialContacts()
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les contacts
  const filteredContacts = useMemo(() => {
    let contacts = allContacts

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      contacts = contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query) ||
          c.type?.toLowerCase().includes(query)
      )
    }

    // Trier par nom
    contacts.sort((a, b) => a.name.localeCompare(b.name))

    return contacts
  }, [allContacts, searchQuery])

  const handleLink = async (contactId: string) => {
    try {
      await onLink(contactId)
    } catch (error) {
      // Erreur geree par le parent
    }
  }

  const getContactTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      sponsor: '💼 Sponsor',
      lieu: '📍 Lieu',
      fournisseur: '📦 Fournisseur',
      artiste: '🎨 Artiste',
    }
    return labels[type || 'sponsor'] || '👤 Contact'
  }

  const getContactStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      active: 'Actif',
      prospect: 'Prospect',
      inactive: 'Inactif',
    }
    return labels[status || 'prospect'] || 'Prospect'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lier a un contact"
      size="lg"
      scrollable
    >
      <div className="space-y-4">
        {/* Recherche */}
        <div>
          <Label className="block text-sm font-label uppercase mb-2">
            Rechercher
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom, email, telephone, type..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des contacts */}
        {isLoading ? (
          <LoadingState message="Chargement..." />
        ) : filteredContacts.length === 0 ? (
          <EmptyState
            title="Aucun contact trouvé"
            description={searchQuery ? 'Essayez de modifier votre recherche' : undefined}
            variant="compact"
          />
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 border border-border-custom rounded hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-heading font-bold text-sm">{contact.name}</h4>
                      <Badge
                        variant="default"
                        className={
                          contact.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : contact.status === 'inactive'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }
                      >
                        {getContactStatusLabel(contact.status)}
                      </Badge>
                      <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {getContactTypeLabel(contact.type)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-zinc-500">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLink(contact.id)}
                  >
                    Lier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Annuler
        </Button>
      </ModalFooter>
    </Modal>
  )
}

