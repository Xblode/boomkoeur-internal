'use client';

import { useState } from 'react';
import UsersList from '@/components/feature/Backend/Admin/Users/UsersList';
import UserForm from '@/components/feature/Backend/Admin/Users/UserForm';
import UserDetails from '@/components/feature/Backend/Admin/Users/UserDetails';
import { User } from '@/types/user';
import { userService } from '@/lib/services/UserService';

export default function AdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Supprimer l'utilisateur "${user.firstName} ${user.lastName}" ?`)) return;

    try {
      await userService.deleteUser(user.id);
      setIsDetailsOpen(false);
      handleRefresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Réinitialiser le mot de passe de "${user.firstName} ${user.lastName}" ?`)) return;

    try {
      const result = await userService.resetPassword(user.id);
      if (result.success) {
        alert(
          `Mot de passe réinitialisé avec succès.\n\n` +
          `Un email a été envoyé à ${user.email} avec les instructions.\n\n` +
          `Token: ${result.token}\n\n` +
          `(Simulation - Dans un vrai système, l'email serait envoyé automatiquement)`
        );
      } else {
        alert('Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Erreur lors de la réinitialisation');
    }
  };

  const handleFormSuccess = () => {
    handleRefresh();
  };

  return (
    <div key={refreshKey}>
      <UsersList
        onCreateUser={handleCreateUser}
        onEditUser={handleEditUser}
        onViewUser={handleViewUser}
        onDeleteUser={handleDeleteUser}
        onResetPassword={handleResetPassword}
        refreshTrigger={refreshKey}
      />

      {/* User Form Modal */}
      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        user={editingUser}
      />

      {/* User Details Modal */}
      <UserDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
}
