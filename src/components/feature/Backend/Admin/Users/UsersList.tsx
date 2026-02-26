'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/lib/services/UserService';
import { User, UserStatus } from '@/types/user';
import type { OrgRole } from '@/types/organisation';
import { Plus, Search, Mail, Users, Trash2, Key, LinkIcon } from 'lucide-react';
import {
  Button,
  Badge,
  Input,
  Select,
  Skeleton,
  Avatar,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/atoms';
import { EmptyState, TablePagination, FormField } from '@/components/ui/molecules';
import InviteModal from './InviteModal';
import { useAlert } from '@/components/providers/AlertProvider';
import { useOrg } from '@/hooks';
import { cn, getErrorMessage } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface UsersListProps {
  onDeleteUser: (user: User) => void;
  onCreateUser: () => void;
  onResetPassword: (user: User) => void;
  refreshTrigger?: number;
  /** ID utilisateur à déplier au chargement (ex: depuis ?userId=xxx) */
  initialExpandedUserId?: string;
}

const ITEMS_PER_PAGE = 30;

const ROLE_OPTIONS: { value: OrgRole; label: string }[] = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'membre', label: 'Membre' },
  { value: 'invite', label: 'Invité' },
];

interface UserEditExpandContentProps {
  user: User;
  roleOptions: { value: OrgRole; label: string }[];
  onSave: (formData: Partial<{ firstName: string; lastName: string; email: string; status: UserStatus; phone?: string; position?: string }>, role: OrgRole) => Promise<void>;
}

function UserEditExpandContent({ user, roleOptions, onSave }: UserEditExpandContentProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.status,
    phone: user.phone ?? '',
    position: user.position ?? '',
  });
  const [role, setRole] = useState<OrgRole>(user.orgRole ?? 'membre');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData, role);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField label="Prénom" required>
          <Input
            value={formData.firstName}
            onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
            placeholder="Prénom"
            required
          />
        </FormField>
        <FormField label="Nom" required>
          <Input
            value={formData.lastName}
            onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
            placeholder="Nom"
            required
          />
        </FormField>
        <FormField label="Email" required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            placeholder="email@example.com"
            required
          />
        </FormField>
        <FormField label="Statut">
          <Select
            value={formData.status}
            onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as UserStatus }))}
            options={[
              { value: 'active', label: 'Actif' },
              { value: 'inactive', label: 'Inactif' },
            ]}
          />
        </FormField>
        <FormField label="Rôle">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as OrgRole)}
            options={
              user.orgRole === 'fondateur'
                ? [{ value: 'fondateur', label: 'Fondateur (non modifiable)' }]
                : roleOptions
            }
            disabled={user.orgRole === 'fondateur'}
          />
        </FormField>
        <FormField label="Téléphone">
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+33 6 12 34 56 78"
          />
        </FormField>
        <FormField label="Poste">
          <Input
            value={formData.position}
            onChange={(e) => setFormData((p) => ({ ...p, position: e.target.value }))}
            placeholder="Ex: Responsable Communication"
          />
        </FormField>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}

const ROLE_CONFIG: Record<OrgRole, { label: string; className: string }> = {
  fondateur: { label: 'Fondateur', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  admin: { label: 'Admin', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  membre: { label: 'Membre', className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' },
  invite: { label: 'Invite', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
};

export default function UsersList({
  onDeleteUser,
  onCreateUser,
  onResetPassword,
  refreshTrigger,
  initialExpandedUserId,
}: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<OrgRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(initialExpandedUserId ?? null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (initialExpandedUserId) {
      setExpandedUserId(initialExpandedUserId);
    }
  }, [initialExpandedUserId]);

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

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  };

  const renderUserEditExpand = (user: User) => (
    <UserEditExpandContent
      key={user.id}
      user={user}
      roleOptions={ROLE_OPTIONS}
      onSave={async (formData, role) => {
        try {
          await userService.updateUser(user.id, formData);
          if (user.orgRole !== 'fondateur' && role !== user.orgRole) {
            await userService.updateMemberRole(user.id, role);
          }
          loadUsers();
          setExpandedUserId(null);
          toast.success('Utilisateur mis à jour');
        } catch (error) {
          toast.error(getErrorMessage(error));
        }
      }}
    />
  );

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
        <div className="rounded-xl overflow-x-auto flex flex-col">
          <Table
            variant="default"
            resizable={false}
            statusColumn={false}
            selectionColumn={false}
            fillColumn={false}
          >
            <TableHeader>
              <TableRow hoverCellOnly>
                <TableHead minWidth={180} defaultWidth={220} className="px-2">Utilisateur</TableHead>
                <TableHead minWidth={180} defaultWidth={240}>Email</TableHead>
                <TableHead minWidth={100} defaultWidth={120} className="px-2">Role</TableHead>
                <TableHead minWidth={90} defaultWidth={100} className="px-2">Statut</TableHead>
                <TableHead minWidth={140} defaultWidth={160} align="right">Dernière connexion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell noHoverBorder className="px-2">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell noHoverBorder><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell noHoverBorder className="px-2"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell noHoverBorder className="px-2"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell noHoverBorder align="right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(true)}>
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
            <Button onClick={() => setIsInviteModalOpen(true)} variant="outline">
              Inviter un membre
            </Button>
          }
          variant="compact"
        />
      ) : (
        <div className="rounded-xl overflow-x-auto flex flex-col">
          <Table
            variant="default"
            resizable={false}
            statusColumn={false}
            selectionColumn={false}
            fillColumn={false}
            expandable
          >
            <TableHeader>
              <TableRow hoverCellOnly>
                <TableHead minWidth={180} defaultWidth={220} className="px-2">Utilisateur</TableHead>
                <TableHead minWidth={180} defaultWidth={240}>Email</TableHead>
                <TableHead minWidth={100} defaultWidth={120} className="px-2">Role</TableHead>
                <TableHead minWidth={90} defaultWidth={100} className="px-2">Statut</TableHead>
                <TableHead minWidth={140} defaultWidth={160} align="right">Dernière connexion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers
                .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
                .map((user) => (
                  <TableRow
                    key={user.id}
                    clickable
                    onClick={() => setExpandedUserId((p) => (p === user.id ? null : user.id))}
                    expanded={expandedUserId === user.id}
                    onExpandToggle={() => setExpandedUserId((p) => (p === user.id ? null : user.id))}
                    expandContent={renderUserEditExpand(user)}
                    rowActions={[
                      { icon: <Key size={14} />, label: 'Réinitialiser le mot de passe', onClick: () => onResetPassword(user) },
                      { icon: <Trash2 size={14} />, label: 'Supprimer', onClick: () => onDeleteUser(user) },
                    ]}
                  >
                    <TableCell noHoverBorder className="px-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          fallback={getInitials(user.firstName, user.lastName)}
                          size="sm"
                        />
                        <span className="font-medium text-sm text-foreground truncate">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell noHoverBorder className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-zinc-400 shrink-0" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell noHoverBorder className="px-2">
                      {getRoleBadge(user.orgRole)}
                    </TableCell>
                    <TableCell noHoverBorder className="px-2">
                      {getStatusBadge(user.status, (e) => handleToggleStatus(user, e))}
                    </TableCell>
                    <TableCell noHoverBorder className="text-muted-foreground text-sm" align="right">
                      {user.lastLoginAt ? format(user.lastLoginAt, 'd MMM yyyy', { locale: fr }) : 'Jamais'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) > 1 && (
            <div className="px-4 pb-4">
              <TablePagination
                currentPage={page}
                totalPages={Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}
                totalItems={filteredUsers.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
      {isAdmin && activeOrg && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          orgId={activeOrg.id}
        />
      )}
    </div>
  );
}
