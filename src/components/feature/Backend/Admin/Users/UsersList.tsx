'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/lib/services/UserService';
import { User, UserRole, UserStatus } from '@/types/user';
import { Plus, Search, Mail, Phone, Briefcase, Eye, Edit, Trash2, Key } from 'lucide-react';
import { Button, Badge, Input, Select, Skeleton, Avatar } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules/Card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UsersListProps {
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onCreateUser: () => void;
  onResetPassword: (user: User) => void;
  refreshTrigger?: number;
}

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
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
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

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const getRoleBadge = (role: UserRole) => {
    const variants = {
      admin: { label: 'Admin', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
      member: { label: 'Membre', className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' },
    };
    const config = variants[role];
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
      console.error('Error toggling status:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filters & Toolbar Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-64 rounded-full" />
            <Skeleton className="h-9 w-40 rounded-full" />
            <Skeleton className="h-9 w-40 rounded-full" />
          </div>
          {/* Create Button */}
          <Skeleton className="h-9 w-44 rounded-full" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#1f1f1f]">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-zinc-50 dark:bg-[#1f1f1f] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Dernière connexion
                </th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {/* User Column */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  {/* Email Column */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-3.5 rounded" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </td>
                  {/* Role Column */}
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  {/* Status Column */}
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  {/* Last Login Column */}
                  <td className="px-4 py-2.5 text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </td>
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

      {/* Header — même mise en page que Events */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes et les accès</p>
        </div>
        <Button variant="primary" size="sm" onClick={onCreateUser}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres — grille 3 colonnes avec labels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Recherche</label>
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
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Rôle</label>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            options={[
              { value: 'all', label: 'Tous les rôles' },
              { value: 'admin', label: 'Admin' },
              { value: 'member', label: 'Membre' },
            ]}
          />
        </div>
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Statut</label>
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

      {/* Compteur */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
        {filteredUsers.length !== users.length && ` sur ${users.length}`}
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-12 text-center">
            <Search size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-center max-w-sm mx-auto">
              Créez votre premier utilisateur pour commencer.
            </p>
            <Button onClick={onCreateUser} variant="outline">
              Créer un utilisateur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#1f1f1f]">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-[#1f1f1f] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-right px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Dernière connexion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-zinc-50 dark:hover:bg-[#272727] transition-colors group/row"
                >
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewUser(user)}
                          className="h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditUser(user)}
                          className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-400 hover:text-blue-500"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onResetPassword(user)}
                          className="h-6 w-6 p-0 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-zinc-400 hover:text-amber-500"
                          title="Réinitialiser le mot de passe"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteUser(user)}
                          className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500"
                          title="Supprimer"
                        >
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
                    {getRoleBadge(user.role)}
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
