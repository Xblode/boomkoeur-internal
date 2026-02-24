/**
 * Service Users - Supabase
 * Lecture depuis profiles + organisation_members, ecriture via API admin
 */

import { supabase } from './client';
import type { User, UserInput, UserStats } from '@/types/user';
import type { OrgRole } from '@/types/organisation';

// --- Types DB (snake_case) ---
interface DbProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  is_super_admin: boolean;
  phone: string | null;
  position: string | null;
  avatar: string | null;
  registered_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToUser(row: DbProfile, orgRole?: OrgRole): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    status: row.status as User['status'],
    isSuperAdmin: row.is_super_admin,
    orgRole,
    phone: row.phone ?? undefined,
    position: row.position ?? undefined,
    avatar: row.avatar ?? undefined,
    registeredAt: row.registered_at ? new Date(row.registered_at) : new Date(row.created_at),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

/** Tous les profils (sans filtre org) */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: DbProfile) => mapDbToUser(row));
}

/** Membres d'une org avec leur role */
export async function getOrgUsers(orgId: string): Promise<User[]> {
  const { data: members, error: membersErr } = await supabase
    .from('organisation_members')
    .select('user_id, role')
    .eq('org_id', orgId);

  if (membersErr) throw membersErr;
  if (!members?.length) return [];

  const userIds = members.map((m) => m.user_id);
  const roleMap = new Map(members.map((m) => [m.user_id, m.role as OrgRole]));

  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds)
    .order('created_at', { ascending: false });

  if (profilesErr) throw profilesErr;
  return (profiles ?? []).map((row: DbProfile) => mapDbToUser(row, roleMap.get(row.id)));
}

export async function getUserById(id: string, orgId?: string | null): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  if (!data) return null;

  let orgRole: OrgRole | undefined;
  if (orgId) {
    const { data: member } = await supabase
      .from('organisation_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', id)
      .maybeSingle();
    orgRole = member?.role as OrgRole | undefined;
  }
  return mapDbToUser(data, orgRole);
}

export async function updateProfile(
  id: string,
  input: Partial<Pick<UserInput, 'firstName' | 'lastName' | 'status' | 'phone' | 'position' | 'avatar'>>
): Promise<User | null> {
  const payload: Record<string, unknown> = {};
  if (input.firstName !== undefined) payload.first_name = input.firstName;
  if (input.lastName !== undefined) payload.last_name = input.lastName;
  if (input.status !== undefined) payload.status = input.status;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.position !== undefined) payload.position = input.position;
  if (input.avatar !== undefined) payload.avatar = input.avatar;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data ? mapDbToUser(data) : null;
}

export async function getOrgStats(orgId: string): Promise<UserStats> {
  const users = await getOrgUsers(orgId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeUsers = users.filter((u) => u.status === 'active');
  const inactiveUsers = users.filter((u) => u.status === 'inactive');
  const adminUsers = users.filter((u) => u.orgRole === 'admin' || u.orgRole === 'fondateur');
  const memberUsers = users.filter((u) => u.orgRole === 'membre' || u.orgRole === 'invite');
  const newUsersThisMonth = users.filter((u) => u.registeredAt >= startOfMonth);

  return {
    total_users: users.length,
    active_users: activeUsers.length,
    inactive_users: inactiveUsers.length,
    admin_count: adminUsers.length,
    member_count: memberUsers.length,
    new_users_this_month: newUsersThisMonth.length,
  };
}

// --- Appels API admin ---

async function apiAdmin<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Erreur ${res.status}`);
  }
  return json as T;
}

export async function createUserApi(input: UserInput): Promise<User> {
  return apiAdmin<User>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteUserApi(id: string): Promise<boolean> {
  const result = await apiAdmin<{ success: boolean }>(`/api/admin/users/${id}`, {
    method: 'DELETE',
  });
  return result.success;
}
