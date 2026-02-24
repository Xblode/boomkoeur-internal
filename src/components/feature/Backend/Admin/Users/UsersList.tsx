'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/lib/services/UserService';
import { User, UserStatus } from '@/types/user';
import type { OrgRole } from '@/types/organisation';
import { Plus, Search, Mail, Users, Eye, Edit, Trash2, Key, LinkIcon } from 'lucide-react';
import { Button, Badge, Input, Select, Skeleton, Avatar, Label } from '@/components/ui/atoms';
import { EmptyState } from '@/components/ui/molecules';
import { useAlert } from '@/components/providers/AlertProvider';
import { useOrg } from '@/hooks';
import { cn, getErrorMessage } from '@/lib/utils';
import { createInviteLink } from '@/lib/supabase/organisations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface UsersListProps {
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onCreateUser: () => void;
  onResetPassword: (user: User) => void;
  refreshTrigger?: number;
}

const ROLE_CONFIG: Record<OrgRole, { label: string; className: string }> = {
  fondateur: { label: 'Fondateur', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  admin: { label: 'Admin', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  membre: { label: 'Membre', className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' },
  invite: { label: 'Invite', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
};

export default function UsersList({
  onViewUser,
  onEditUser,
  onDeleteUser,
  onCreateUser,
  onResetPassword,
  refreshTrigger,
}: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<OrgRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  const { setAlert } = useAlert();
  const { activeOrg, isAdmin } = useOrg();

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger, activeOrg?.id]);

  useEffect(() => {
    return () => setAlert(null);
  }, [setAlert]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    if (!activeOrg) return;
    setIsLoading(true);
    setAlert(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      const message = getErrorMessage(error);
      setAlert({
        variant: 'error',
        message: `Impossible de charger les utilisateurs : ${message || 'Erreur inconnue'}`,
        onDismiss: () => {
          setAlert(null);
          loadUsers();
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.position?.toLowerCase().includes(search)
      );
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.orgRole === roleFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }
    setFilteredUsers(filtered);
  };

  const getRoleBadge = (role?: OrgRole) => {
    if (!role) return null;
    const config = ROLE_CONFIG[role];
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className)}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: UserStatus, onClick?: React.MouseEventHandler<HTMLSpanElement>) => {
    const variants = {
      active: { label: 'Actif', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' },
      inactive: { label: 'Inactif', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800' },
    };
    const config = variants[status];
    return (
      <span 
        className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-medium border",
          config.className,
          onClick && "cursor-pointer hover:opacity-80 transition-opacity"
        )}
        onClick={onClick}
        title={onClick ? "Cliquer pour changer le statut" : undefined}
      >
        {config.label}
      </span>
    );
  };

  const handleToggleStatus = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await userService.toggleUserStatus(user.id);
      loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleGenerateInvite = async () => {
    if (!activeOrg) return;
    try {
      const invite = await createInviteLink(activeOrg.id);
      const link = `${window.location.origin}/onboarding?invite=${invite.token}`;
      await navigator.clipboard.writeText(link);
      toast.success('Lien d\'invitation copie !', {
        description: `Valable 72h. Lien : ${link}`,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-64 rounded-full" />
            <Skeleton className="h-9 w-40 rounded-full" />
            <Skeleton className="h-9 w-40 rounded-full" />
          </div>
          <Skeleton className="h-9 w-44 rounded-full" />
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-card-bg">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-card-bg border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Statut</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Derniere connexion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></td>
                  <td className="px-4 py-2.5"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-2.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-2.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-2.5 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Utilisateurs</h1>
          <p className="text-muted-foreground">Gerez les membres de l'organisation</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={handleGenerateInvite}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Inviter
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, email, poste..."
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Role</Label>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as OrgRole | 'all')}
            options={[
              { value: 'all', label: 'Tous les roles' },
              { value: 'fondateur', label: 'Fondateur' },
              { value: 'admin', label: 'Admin' },
              { value: 'membre', label: 'Membre' },
              { value: 'invite', label: 'Invite' },
            ]}
          />
        </div>
        <div>
          <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Statut</Label>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'active', label: 'Actif' },
              { value: 'inactive', label: 'Inactif' },
            ]}
          />
        </div>
      </div>

      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
        {filteredUsers.length !== users.length && ` sur ${users.length}`}
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur trouve"
          description="Invitez des membres pour commencer."
          action={
            <Button onClick={handleGenerateInvite} variant="outline">
              Generer un lien d'invitation
            </Button>
          }
          variant="compact"
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-card-bg">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-card-bg border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Statut</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Derniere connexion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-surface-subtle transition-colors group/row">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-between gap-2 h-full">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          fallback={getInitials(user.firstName, user.lastName)}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => onViewUser(user)} className="h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600" title="Voir details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEditUser(user)} className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-400 hover:text-blue-500" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onResetPassword(user)} className="h-6 w-6 p-0 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-zinc-400 hover:text-amber-500" title="Reinitialiser le mot de passe">
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteUser(user)} className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Mail size={14} className="text-zinc-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {getRoleBadge(user.orgRole)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {getStatusBadge(user.status, (e) => handleToggleStatus(user, e))}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 text-right">
                    {user.lastLoginAt ? format(user.lastLoginAt, 'd MMM yyyy', { locale: fr }) : 'Jamais'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
