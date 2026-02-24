'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FormField } from '@/components/ui/molecules';
import { Button, Label, Checkbox, PasswordInput } from '@/components/ui/atoms';
import { CustomLink } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { supabase, resetSupabaseClient } from '@/lib/supabase/client';
import { getErrorMessage } from '@/lib/utils';
import { getRememberMe, setRememberMe } from '@/lib/auth-storage';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? ROUTES.DASHBOARD;
  const isResetMode = searchParams.get('reset') === 'password';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [rememberPassword, setRememberPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRememberPassword(getRememberMe());
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password: formData.newPassword });
      if (authError) {
        setError(getErrorMessage(authError));
        return;
      }
      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      setRememberMe(rememberPassword);
      resetSupabaseClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setError(
          getErrorMessage(authError) ??
            'Email ou mot de passe incorrect. Veuillez réessayer.'
        );
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        getErrorMessage(err) ?? 'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (isResetMode) {
    return (
      <section className="w-full min-h-[80vh] flex items-center justify-center py-20 px-4 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900">
        <motion.div className="w-full max-w-md" variants={fadeInUp} initial="hidden" animate="visible">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
              Nouveau mot de passe
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center">
              Choisissez un nouveau mot de passe sécurisé
            </p>
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <FormField
                label="Nouveau mot de passe"
                htmlFor="new-password"
                required
                children={
                  <PasswordInput
                    id="new-password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    fullWidth
                  />
                }
              />
              <FormField
                label="Confirmer le mot de passe"
                htmlFor="confirm-password"
                required
                children={
                  <PasswordInput
                    id="confirm-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    fullWidth
                  />
                }
              />
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                Réinitialiser le mot de passe
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              <CustomLink href={ROUTES.LOGIN} variant="default">
                Retour à la connexion
              </CustomLink>
            </p>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center py-20 px-4 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900">
      <motion.div
        className="w-full max-w-md"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            Connexion
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center">
            Accédez à votre espace personnel
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <FormField
              label="Email"
              htmlFor="email"
              required
              inputProps={{
                type: 'email',
                id: 'email',
                value: formData.email,
                onChange: (e) =>
                  setFormData({ ...formData, email: e.target.value }),
                placeholder: 'votre@email.com',
                required: true,
                autoComplete: 'email',
              }}
            />

            <FormField
              label="Mot de passe"
              htmlFor="password"
              required
              children={
                <PasswordInput
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  fullWidth
                />
              }
            />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="remember"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-600"
                />
                <Label
                  htmlFor="remember"
                  className="text-zinc-600 dark:text-zinc-400 font-normal cursor-pointer"
                >
                  Enregistrer le mot de passe
                </Label>
              </div>
              <CustomLink href="/login/forgot-password" variant="muted">
                Mot de passe oublié ?
              </CustomLink>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Pas encore de compte ?{' '}
            <CustomLink href={ROUTES.REGISTER} variant="default">
              S&apos;inscrire
            </CustomLink>
          </p>
        </div>
      </motion.div>
    </section>
  );
};
