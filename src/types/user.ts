// Types pour le module Utilisateurs

export type UserRole = 'admin' | 'member';
export type UserStatus = 'active' | 'inactive';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  
  // Informations complémentaires
  phone?: string;
  position?: string; // Poste dans l'association
  avatar?: string; // URL de la photo de profil
  
  // Métadonnées
  registeredAt: Date;
  lastLoginAt?: Date;
  created_at: Date;
  updated_at: Date;
};

export type UserFilters = {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
};

export type UserStats = {
  total_users: number;
  active_users: number;
  inactive_users: number;
  admin_count: number;
  member_count: number;
  new_users_this_month: number;
};

export type UserInput = Omit<User, 'id' | 'created_at' | 'updated_at'>;
