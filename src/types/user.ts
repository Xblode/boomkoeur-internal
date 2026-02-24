import type { OrgRole } from './organisation';

export type UserStatus = 'active' | 'inactive';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  isSuperAdmin: boolean;

  /** Role contextuel dans l'org active (rempli par le service) */
  orgRole?: OrgRole;

  phone?: string;
  position?: string;
  avatar?: string;

  registeredAt: Date;
  lastLoginAt?: Date;
  created_at: Date;
  updated_at: Date;
};

export type UserFilters = {
  search: string;
  role: OrgRole | 'all';
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

export type UserInput = Omit<User, 'id' | 'created_at' | 'updated_at' | 'isSuperAdmin' | 'orgRole'>;
