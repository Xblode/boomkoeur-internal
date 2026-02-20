import { User, UserInput, UserStats, UserFilters } from '@/types/user';
import { mockUsers } from '@/lib/mocks/users';

/**
 * Service de gestion des utilisateurs
 * Simule des appels API avec localStorage
 */
class UserService {
  private readonly USERS_KEY = 'users';

  /**
   * Récupère tous les utilisateurs
   */
  async getUsers(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(this.USERS_KEY);
        if (stored) {
          const users = JSON.parse(stored);
          // Convert date strings back to Date objects
          const parsed = users.map((u: any) => ({
            ...u,
            registeredAt: new Date(u.registeredAt),
            lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : undefined,
            created_at: new Date(u.created_at),
            updated_at: new Date(u.updated_at),
          }));
          resolve(parsed);
        } else {
          localStorage.setItem(this.USERS_KEY, JSON.stringify(mockUsers));
          resolve(mockUsers);
        }
      }, 300);
    });
  }

  /**
   * Récupère un utilisateur par ID
   */
  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  /**
   * Filtre les utilisateurs
   */
  async getFilteredUsers(filters: UserFilters): Promise<User[]> {
    const users = await this.getUsers();
    
    return users.filter(user => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.position?.toLowerCase().includes(search);
        
        if (!matchesSearch) return false;
      }

      // Role filter
      if (filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && user.status !== filters.status) {
        return false;
      }

      return true;
    });
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(input: UserInput): Promise<User> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const users = await this.getUsers();
        const newUser: User = {
          ...input,
          id: `user-${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        const updated = [...users, newUser];
        localStorage.setItem(this.USERS_KEY, JSON.stringify(updated));
        resolve(newUser);
      }, 300);
    });
  }

  /**
   * Met à jour un utilisateur
   */
  async updateUser(id: string, input: Partial<UserInput>): Promise<User | null> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const users = await this.getUsers();
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) {
          resolve(null);
          return;
        }

        const updated = users.map(user => 
          user.id === id
            ? { ...user, ...input, updated_at: new Date() }
            : user
        );

        localStorage.setItem(this.USERS_KEY, JSON.stringify(updated));
        resolve(updated[index]);
      }, 300);
    });
  }

  /**
   * Supprime un utilisateur
   */
  async deleteUser(id: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const users = await this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        
        if (filtered.length === users.length) {
          resolve(false);
          return;
        }

        localStorage.setItem(this.USERS_KEY, JSON.stringify(filtered));
        resolve(true);
      }, 300);
    });
  }

  /**
   * Toggle le statut d'un utilisateur
   */
  async toggleUserStatus(id: string): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    return this.updateUser(id, { status: newStatus });
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  async resetPassword(id: string): Promise<{ success: boolean; token?: string }> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const user = await this.getUserById(id);
        if (!user) {
          resolve({ success: false });
          return;
        }

        // Simuler la génération d'un token de réinitialisation
        const token = `reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        resolve({ 
          success: true, 
          token 
        });
      }, 300);
    });
  }

  /**
   * Calcule les statistiques
   */
  async getStats(): Promise<UserStats> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const users = await this.getUsers();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const activeUsers = users.filter(u => u.status === 'active');
        const inactiveUsers = users.filter(u => u.status === 'inactive');
        const adminUsers = users.filter(u => u.role === 'admin');
        const memberUsers = users.filter(u => u.role === 'member');
        const newUsersThisMonth = users.filter(u => u.registeredAt >= startOfMonth);

        const stats: UserStats = {
          total_users: users.length,
          active_users: activeUsers.length,
          inactive_users: inactiveUsers.length,
          admin_count: adminUsers.length,
          member_count: memberUsers.length,
          new_users_this_month: newUsersThisMonth.length,
        };

        resolve(stats);
      }, 200);
    });
  }
}

export const userService = new UserService();
