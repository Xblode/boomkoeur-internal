'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Button, Input } from '@/components/ui/atoms';
import { FormField } from '@/components/ui/molecules';
import { User, UserInput } from '@/types/user';
import { userService } from '@/lib/services/UserService';

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
    role: user?.role || 'member',
    status: user?.status || 'active',
    phone: user?.phone || '',
    position: user?.position || '',
    avatar: user?.avatar || '',
    registeredAt: user?.registeredAt || new Date(),
    lastLoginAt: user?.lastLoginAt,
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        position: user.position,
        avatar: user.avatar,
        registeredAt: user.registeredAt,
        lastLoginAt: user.lastLoginAt,
      });
    } else if (!user && isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'member',
        status: 'active',
        phone: '',
        position: '',
        avatar: '',
        registeredAt: new Date(),
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user) {
        await userService.updateUser(user.id, formData);
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
            <FormField label="Prénom" required>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Rôle" required>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
                className="w-full h-10 px-3 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="member">Membre</option>
                <option value="admin">Administrateur</option>
              </select>
            </FormField>

            <FormField label="Statut" required>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full h-10 px-3 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </FormField>
          </div>

          <FormField label="Téléphone">
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : user ? 'Mettre à jour' : 'Créer'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
