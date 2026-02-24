import { User, UserInput, UserStats, UserFilters } from '@/types/user';
import {
  getOrgUsers,
  getUserById,
  updateProfile,
  getOrgStats,
  createUserApi,
  deleteUserApi,
} from '@/lib/supabase/users';
import { updateMemberRole, removeMember } from '@/lib/supabase/organisations';
import { supabase } from '@/lib/supabase/client';
import type { OrgRole } from '@/types/organisation';

/**
 * Service de gestion des utilisateurs.
 * Toutes les lectures sont scopees par organisation.
 */
class UserService {
  private orgId: string | null = null;

  setOrgId(orgId: string | null) {
    this.orgId = orgId;
  }

  private requireOrgId(): string {
    if (!this.orgId) throw new Error('Aucune organisation active');
    return this.orgId;
  }

  async getUsers(): Promise<User[]> {
    return getOrgUsers(this.requireOrgId());
  }

  async getUserById(id: string): Promise<User | null> {
    return getUserById(id, this.orgId);
  }

  async getFilteredUsers(filters: UserFilters): Promise<User[]> {
    const users = await this.getUsers();

    return users.filter((user) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.position?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      if (filters.role !== 'all' && user.orgRole !== filters.role) return false;
      if (filters.status !== 'all' && user.status !== filters.status) return false;
      return true;
    });
  }

  async createUser(input: UserInput): Promise<User> {
    return createUserApi(input);
  }

  async updateUser(id: string, input: Partial<UserInput>): Promise<User | null> {
    return updateProfile(id, input);
  }

  async deleteUser(id: string): Promise<boolean> {
    return deleteUserApi(id);
  }

  async toggleUserStatus(id: string): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    return this.updateUser(id, { status: newStatus });
  }

  async updateMemberRole(userId: string, role: OrgRole): Promise<void> {
    return updateMemberRole(this.requireOrgId(), userId, role);
  }

  async removeMember(userId: string): Promise<void> {
    return removeMember(this.requireOrgId(), userId);
  }

  async resetPassword(id: string): Promise<{ success: boolean; token?: string }> {
    const user = await this.getUserById(id);
    if (!user) return { success: false };

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      console.error('Reset password error:', error);
      return { success: false };
    }
    return { success: true };
  }

  async getStats(): Promise<UserStats> {
    return getOrgStats(this.requireOrgId());
  }
}

export const userService = new UserService();
