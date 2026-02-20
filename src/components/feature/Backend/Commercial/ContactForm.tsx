'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Button, Input, Select, Textarea } from '@/components/ui/atoms';
import { FormField } from '@/components/ui/molecules';
import { CommercialContact, CommercialContactInput, ContactType, ContactStatus } from '@/types/commercial';
import { commercialService } from '@/lib/services/CommercialService';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact?: CommercialContact | null;
}

export default function ContactForm({ isOpen, onClose, onSuccess, contact }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CommercialContactInput>>({
    type: contact?.type || 'contact',
    status: contact?.status || 'lead',
    name: contact?.name || '',
    company: contact?.company || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    mobile: contact?.mobile || '',
    website: contact?.website || '',
    contact_person: contact?.contact_person || '',
    position: contact?.position || '',
    notes: contact?.notes || '',
    tags: contact?.tags || [],
    linked_product_ids: contact?.linked_product_ids || [],
    linked_order_ids: contact?.linked_order_ids || [],
    linked_invoice_ids: contact?.linked_invoice_ids || [],
    address: contact?.address || {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (contact) {
        await commercialService.updateContact(contact.id, formData);
      } else {
        await commercialService.createContact(formData as CommercialContactInput);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact ? 'Modifier le contact' : 'Nouveau contact'}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Type et Statut */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" required>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as ContactType)}
                required
              >
                <option value="contact">Contact</option>
                <option value="supplier">Fournisseur</option>
                <option value="partner">Partenaire</option>
              </Select>
            </FormField>

            <FormField label="Statut" required>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as ContactStatus)}
                required
              >
                <option value="lead">Lead</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </Select>
            </FormField>
          </div>

          {/* Nom et Entreprise */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nom" required>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nom du contact ou de l'entreprise"
                required
              />
            </FormField>

            <FormField label="Entreprise">
              <Input
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Nom de l'entreprise"
              />
            </FormField>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Email">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemple.com"
              />
            </FormField>

            <FormField label="Téléphone">
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </FormField>

            <FormField label="Mobile">
              <Input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </FormField>
          </div>

          {/* Website */}
          <FormField label="Site Web">
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="www.exemple.com"
            />
          </FormField>

          {/* Personne de contact et Poste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Personne de contact">
              <Input
                value={formData.contact_person}
                onChange={(e) => handleChange('contact_person', e.target.value)}
                placeholder="Nom du contact principal"
              />
            </FormField>

            <FormField label="Poste / Fonction">
              <Input
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Directeur, Responsable..."
              />
            </FormField>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Adresse</h3>
            
            <FormField label="Rue">
              <Input
                value={formData.address?.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Rue, numéro"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Code Postal">
                <Input
                  value={formData.address?.postal_code || ''}
                  onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                  placeholder="75001"
                />
              </FormField>

              <FormField label="Ville">
                <Input
                  value={formData.address?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="Paris"
                />
              </FormField>

              <FormField label="Pays">
                <Input
                  value={formData.address?.country || ''}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  placeholder="France"
                />
              </FormField>
            </div>
          </div>

          {/* Notes */}
          <FormField label="Notes">
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notes, remarques, informations supplémentaires..."
              rows={4}
            />
          </FormField>

          {/* Tags */}
          <FormField label="Tags (séparés par des virgules)">
            <Input
              value={formData.tags?.join(', ')}
              onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              placeholder="client, bio, prioritaire"
            />
          </FormField>
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : contact ? 'Mettre à jour' : 'Créer'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
