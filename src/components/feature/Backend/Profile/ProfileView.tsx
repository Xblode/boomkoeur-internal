'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/molecules';
import { Button, Input, Label } from '@/components/ui/atoms';
import { Mail, User, Globe } from 'lucide-react';
import { ProfileHeader } from '@/components/ui/organisms';

export const ProfileView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrateur',
    location: 'Paris, France',
    website: 'https://monsite.com',
    bio: 'Développeur Fullstack passionné par React et Next.js.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast.success('Profil mis à jour', {
      description: 'Vos informations ont été enregistrées avec succès.'
    });
  };

  return (
    <div className="w-full space-y-6">

      {/* Header profil */}
      <div id="profil" className="scroll-mt-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et préférences de compte.
          </p>
        </div>
        <ProfileHeader user={user} />
      </div>

      {/* Formulaire */}
      <div id="informations" className="scroll-mt-8">
      <form onSubmit={handleSubmit}>
        <Card 
          title="Informations personnelles" 
          description="Mettez à jour vos coordonnées et informations publiques."
        >
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="name" 
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea 
                id="bio"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Parlez-nous de vous..."
                value={user.bio}
                onChange={(e) => setUser({...user, bio: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Cette description sera visible sur votre profil public.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input 
                  id="website" 
                  value={user.website}
                  onChange={(e) => setUser({...user, website: e.target.value})}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border-custom bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-b-md">
            <Button type="button" variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} size="sm">
              {isLoading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </Button>
          </CardFooter>
        </Card>
      </form>
      </div>

      {/* Sécurité (placeholder) */}
      <div id="securite" className="scroll-mt-8">
        <Card
          title="Sécurité"
          description="Gérez votre mot de passe et la sécurité de votre compte."
        >
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              La gestion du mot de passe sera disponible prochainement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
