'use client';

import React, { useState } from 'react';
import { ProfileHeader } from '@/components/ui/organisms';

export default function ProfilePage() {
  const [user] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrateur',
    location: 'Paris, France',
    website: 'https://monsite.com',
    bio: 'Développeur Fullstack passionné par React et Next.js.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et préférences de compte.
        </p>
      </div>
      <ProfileHeader user={user} />
    </div>
  );
}

