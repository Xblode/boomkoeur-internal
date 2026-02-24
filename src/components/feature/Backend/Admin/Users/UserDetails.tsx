'use client';

import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Button, Badge, Avatar } from '@/components/ui/atoms';
import { User } from '@/types/user';
import { Mail, Phone, Briefcase, Calendar, Clock, Key, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface UserDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export default function UserDetails({
  isOpen,
  onClose,
  user,
  onEdit,
  onDelete,
  onResetPassword,
}: UserDetailsProps) {
  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de l'utilisateur"
      size="lg"
    >
      <div className="space-y-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <Avatar
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            fallback={getInitials(user.firstName, user.lastName)}
            size="xl"
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.orgRole === 'admin' || user.orgRole === 'fondateur' ? 'secondary' : 'default'}>
                {user.orgRole === 'fondateur' ? 'Fondateur' : user.orgRole === 'admin' ? 'Admin' : user.orgRole === 'invite' ? 'Invite' : 'Membre'}
              </Badge>
              <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                {user.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Informations de contact
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-zinc-400 flex-shrink-0" />
              <span className="text-zinc-900 dark:text-zinc-100">{user.email}</span>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-zinc-400 flex-shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100">{user.phone}</span>
              </div>
            )}

            {user.position && (
              <div className="flex items-center gap-3">
                <Briefcase size={18} className="text-zinc-400 flex-shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100">{user.position}</span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Informations système
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-zinc-400 flex-shrink-0" />
              <div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Inscrit le </span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {format(user.registeredAt, 'd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={18} className="text-zinc-400 flex-shrink-0" />
              <div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Dernière connexion </span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {user.lastLoginAt 
                    ? format(user.lastLoginAt, 'd MMMM yyyy à HH:mm', { locale: fr })
                    : 'Jamais'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Reset */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="outline"
            onClick={() => onResetPassword(user)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Key size={18} />
            Réinitialiser le mot de passe
          </Button>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <Trash2 size={16} />
            Supprimer
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
