'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/molecules';
import { Button, Label } from '@/components/ui/atoms';
import { PasswordInput } from '@/components/ui/atoms';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/hooks';
import { getErrorMessage } from '@/lib/utils';

export default function ProfileSecuritePage() {
  const { user } = useUser();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(getErrorMessage(error));
        return;
      }

      toast.success('Mot de passe mis à jour');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Vous devez être connecté pour modifier votre mot de passe.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Sécurité</h1>
        <p className="text-muted-foreground">
          Gérez votre mot de passe et la sécurité de votre compte.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card
          variant="settings"
          title="Changer le mot de passe"
          description="Choisissez un nouveau mot de passe sécurisé."
        >
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <PasswordInput
                id="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                fullWidth
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                fullWidth
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border-custom bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-b-md">
            <Button type="submit" variant="primary" disabled={loading} size="sm">
              {loading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
