'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/molecules';
import { Button, Input, Label, Textarea } from '@/components/ui/atoms';
import { Mail, User, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/hooks';
import { getErrorMessage } from '@/lib/utils';

export default function ProfileInformationsPage() {
  const { user: authUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    website: '',
    bio: '',
  });

  useEffect(() => {
    if (authUser) {
      supabase.auth.getUser().then(({ data }) => {
        const meta = data?.user?.user_metadata as { nom?: string; prenom?: string; website?: string; bio?: string } | undefined;
        setFormData({
          nom: meta?.nom ?? '',
          prenom: meta?.prenom ?? '',
          email: data?.user?.email ?? authUser.email,
          website: meta?.website ?? '',
          bio: meta?.bio ?? '',
        });
      });
    }
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
        data: {
          nom: formData.nom,
          prenom: formData.prenom,
          website: formData.website || undefined,
          bio: formData.bio || undefined,
        },
      });

      if (error) {
        toast.error(getErrorMessage(error));
        return;
      }

      toast.success('Profil mis à jour', {
        description: 'Vos informations ont été enregistrées avec succès.',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!authUser) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Vous devez être connecté pour modifier votre profil.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Informations</h1>
        <p className="text-muted-foreground">
          Mettez à jour vos coordonnées et informations publiques.
        </p>
      </div>

      <form onSubmit={handleSubmit} suppressHydrationWarning>
        <Card
          variant="settings"
          title="Informations personnelles"
          description="Mettez à jour vos coordonnées et informations publiques."
        >
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="pl-9"
                    placeholder="Jean"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="pl-9"
                    placeholder="Dupont"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                La modification de l&apos;email peut nécessiter une confirmation.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                className="min-h-[100px]"
                placeholder="Parlez-nous de vous..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="pl-9"
                  placeholder="https://monsite.com"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border-custom bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-b-md">
            <Button type="submit" variant="primary" disabled={isLoading} size="sm">
              {isLoading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
