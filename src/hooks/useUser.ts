'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

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

export function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(mapSupabaseUser(u));
      setLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
