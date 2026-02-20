'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Button, Badge, Textarea, IconButton } from '@/components/ui/atoms';
import { CommercialContact, ContactNote } from '@/types/commercial';
import { commercialService } from '@/lib/services/CommercialService';
import { 
  Mail, Phone, Globe, MapPin, User, Building2, Tag, 
  Calendar, StickyNote, Package, ShoppingCart, FileText, Plus, Trash2 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/molecules/Card';

interface ContactDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  contact: CommercialContact | null;
}

export default function ContactDetails({ isOpen, onClose, contact }: ContactDetailsProps) {
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (contact && isOpen) {
      loadNotes();
    }
  }, [contact, isOpen]);

  const loadNotes = async () => {
    if (!contact) return;
    
    setIsLoadingNotes(true);
    try {
      const data = await commercialService.getContactNotes(contact.id);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!contact || !newNote.trim()) return;

    setIsSavingNote(true);
    try {
      await commercialService.addContactNote({
        contact_id: contact.id,
        content: newNote,
        created_by: 'Admin User',
      });
      setNewNote('');
      await loadNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return;

    try {
      await commercialService.deleteContactNote(noteId);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (!contact) return null;

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: 'info' | 'default' | 'success' }> = {
      supplier: { label: 'Fournisseur', variant: 'info' },
      contact: { label: 'Contact', variant: 'default' },
      partner: { label: 'Partenaire', variant: 'success' },
    };
    const config = variants[type] || variants.contact;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'success' | 'default' | 'warning' }> = {
      active: { label: 'Actif', variant: 'success' },
      inactive: { label: 'Inactif', variant: 'default' },
      lead: { label: 'Lead', variant: 'warning' },
    };
    const config = variants[status] || variants.lead;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact.name}
      size="xl"
      scrollable
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex flex-wrap gap-2">
          {getTypeBadge(contact.type)}
          {getStatusBadge(contact.status)}
        </div>

        {/* Main Info Section */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-4">
              Informations de contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.company && (
                <div className="flex items-start gap-3">
                  <Building2 size={20} className="text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Entreprise</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{contact.company}</p>
                  </div>
                </div>
              )}

              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Email</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Téléphone</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}

              {contact.mobile && (
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Mobile</p>
                    <a
                      href={`tel:${contact.mobile}`}
                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                    >
                      {contact.mobile}
                    </a>
                  </div>
                </div>
              )}

              {contact.website && (
                <div className="flex items-start gap-3">
                  <Globe size={20} className="text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Site Web</p>
                    <a
                      href={`https://${contact.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {contact.website}
                    </a>
                  </div>
                </div>
              )}

              {contact.contact_person && (
                <div className="flex items-start gap-3">
                  <User size={20} className="text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Contact principal</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {contact.contact_person}
                      {contact.position && ` - ${contact.position}`}
                    </p>
                  </div>
                </div>
              )}

              {contact.address && (contact.address.street || contact.address.city) && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin size={20} className="text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Adresse</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {contact.address.street && <>{contact.address.street}<br /></>}
                      {contact.address.postal_code} {contact.address.city}
                      {contact.address.country && <>, {contact.address.country}</>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {contact.notes && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Notes générales</p>
                <p className="text-zinc-700 dark:text-zinc-300">{contact.notes}</p>
              </div>
            )}

            {contact.tags && contact.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Tag size={16} className="text-zinc-400" />
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Relations Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={18} className="text-blue-500" />
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Produits liés</h4>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {contact.linked_product_ids?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart size={18} className="text-green-500" />
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Commandes</h4>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {contact.linked_order_ids?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-purple-500" />
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Factures</h4>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {contact.linked_invoice_ids?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notes Section */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote size={18} className="text-orange-500" />
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                Historique des échanges
              </h3>
            </div>

            {/* Add Note */}
            <div className="space-y-2">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note sur cet échange..."
                rows={3}
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isSavingNote}
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                {isSavingNote ? 'Ajout...' : 'Ajouter une note'}
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {isLoadingNotes ? (
                <p className="text-sm text-zinc-500">Chargement des notes...</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-zinc-500">Aucune note pour le moment.</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Calendar size={14} />
                        <span>{formatDate(note.created_at)}</span>
                        <span className="text-zinc-400">•</span>
                        <span>{note.created_by}</span>
                      </div>
                      <IconButton
                        icon={Trash2}
                        ariaLabel="Supprimer"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        title="Supprimer"
                        className="text-red-500"
                      />
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <p>Créé le : {formatDate(contact.created_at)}</p>
          <p>Dernière modification : {formatDate(contact.updated_at)}</p>
          {contact.last_contact_at && (
            <p>Dernier contact : {formatDate(contact.last_contact_at)}</p>
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
