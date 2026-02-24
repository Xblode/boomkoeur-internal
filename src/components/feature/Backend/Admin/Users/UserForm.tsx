'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Button, Input, Select } from '@/components/ui/atoms';
import { FormField } from '@/components/ui/molecules';
import { User, UserInput } from '@/types/user';
import { userService } from '@/lib/services/UserService';
import type { OrgRole } from '@/types/organisation';

const ROLE_OPTIONS: { value: OrgRole; label: string }[] = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'membre', label: 'Membre' },
  { value: 'invite', label: 'Invité' },
];

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

export default function UserForm({ isOpen, onClose, onSuccess, user }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<UserInput>>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    status: user?.status || 'active',
    phone: user?.phone || '',
    position: user?.position || '',
    avatar: user?.avatar || '',
    registeredAt: user?.registeredAt || new Date(),
    lastLoginAt: user?.lastLoginAt,
  });
  const [role, setRole] = useState<OrgRole>(user?.orgRole ?? 'membre');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        phone: user.phone,
        position: user.position,
        avatar: user.avatar,
        registeredAt: user.registeredAt,
        lastLoginAt: user.lastLoginAt,
      });
      setRole(user.orgRole ?? 'membre');
    } else if (!user && isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        status: 'active',
        phone: '',
        position: '',
        avatar: '',
        registeredAt: new Date(),
      });
      setRole('membre');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user) {
        await userService.updateUser(user.id, formData);
        if (user.orgRole !== 'fondateur' && role !== user.orgRole) {
          await userService.updateMemberRole(user.id, role);
        }
      } else {
        await userService.createUser(formData as UserInput);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Prenom" required>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Ex: Jean"
                required
              />
            </FormField>

            <FormField label="Nom" required>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Ex: Dupont"
                required
              />
            </FormField>
          </div>

          <FormField label="Email" required>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="jean.dupont@example.com"
              required
            />
          </FormField>

          <FormField label="Statut" required>
            <Select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              options={[
                { value: 'active', label: 'Actif' },
                { value: 'inactive', label: 'Inactif' },
              ]}
              required
            />
          </FormField>

          {user && (
            <FormField label="Rôle dans l'organisation">
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as OrgRole)}
                options={
                  user.orgRole === 'fondateur'
                    ? [{ value: 'fondateur', label: 'Fondateur (non modifiable)' }]
                    : ROLE_OPTIONS
                }
                disabled={user.orgRole === 'fondateur'}
              />
            </FormField>
          )}

          <FormField label="Telephone">
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+33 6 12 34 56 78"
            />
          </FormField>

          <FormField label="Poste / Fonction">
            <Input
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Ex: Responsable Communication"
            />
          </FormField>

          <FormField label="Avatar (URL)">
            <Input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
            />
          </FormField>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : user ? 'Mettre a jour' : 'Creer'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
