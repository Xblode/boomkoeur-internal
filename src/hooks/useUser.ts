'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const AUTH_USER_QUERY_KEY = ['auth', 'user'] as const;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

function mapSupabaseUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const meta = user.user_metadata as { nom?: string; prenom?: string } | undefined;
  const nom = meta?.nom ?? '';
  const prenom = meta?.prenom ?? '';
  const fullName = [prenom, nom].filter(Boolean).join(' ');
  const name = fullName || user.email?.split('@')[0] || 'Utilisateur';
  return {
    id: user.id,
    email: user.email || '',
    name,
    avatar: user.user_metadata?.avatar_url,
  };
}

async function fetchAuthUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return mapSupabaseUser(user);
}

export function useUser() {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading: loading } = useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: fetchAuthUser,
    staleTime: 5 * 60 * 1000, // 5 min - auth ne change pas souvent
    gcTime: 10 * 60 * 1000, // 10 min
    retry: false,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, mapSupabaseUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return { user, loading };
}
