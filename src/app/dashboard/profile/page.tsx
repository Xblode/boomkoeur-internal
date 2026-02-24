'use client';

import React from 'react';
import { ProfileHeader } from '@/components/ui/organisms';
import { useUser } from '@/hooks';

export default function ProfilePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Vous devez être connecté pour voir votre profil.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et préférences de compte.
        </p>
      </div>
      <ProfileHeader
        user={{
          name: user.name,
          email: user.email,
          role: 'Utilisateur',
          avatar: user.avatar,
        }}
      />
    </div>
  );
}

