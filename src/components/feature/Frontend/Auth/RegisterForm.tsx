'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FormField } from '@/components/ui/molecules';
import { Button, PasswordInput } from '@/components/ui/atoms';
import { CustomLink } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';
import { getErrorMessage } from '@/lib/utils';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nom: formData.nom,
            prenom: formData.prenom,
          },
        },
      });

      if (authError) {
        const msg = getErrorMessage(authError);
        const isRateLimit =
          msg?.toLowerCase().includes('rate limit') ||
          msg?.toLowerCase().includes('rate_limit');
        setError(
          isRateLimit
            ? 'Limite d\'envoi d\'emails atteinte. Supabase autorise 2 emails/heure. Réessayez dans environ 1 heure, ou désactivez la confirmation email dans le dashboard Supabase (Auth > Providers > Email).'
            : msg ?? 'Une erreur est survenue. Veuillez réessayer.'
        );
        return;
      }

      if (data.user && !data.session) {
        setSuccessMessage(
          'Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.'
        );
        return;
      }

      router.push(ROUTES.ONBOARDING);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err) ?? 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

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
            Inscription
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center">
            Créez votre compte en quelques étapes
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-sm">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Prénom"
                htmlFor="prenom"
                required
                inputProps={{
                  type: 'text',
                  id: 'prenom',
                  value: formData.prenom,
                  onChange: (e) =>
                    setFormData({ ...formData, prenom: e.target.value }),
                  placeholder: 'Jean',
                  required: true,
                  autoComplete: 'given-name',
                }}
              />
              <FormField
                label="Nom"
                htmlFor="nom"
                required
                inputProps={{
                  type: 'text',
                  id: 'nom',
                  value: formData.nom,
                  onChange: (e) =>
                    setFormData({ ...formData, nom: e.target.value }),
                  placeholder: 'Dupont',
                  required: true,
                  autoComplete: 'family-name',
                }}
              />
            </div>

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
                  autoComplete="new-password"
                  fullWidth
                />
              }
            />

            <FormField
              label="Confirmer le mot de passe"
              htmlFor="confirmPassword"
              required
              children={
                <PasswordInput
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  fullWidth
                />
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              S&apos;inscrire
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Déjà un compte ?{' '}
            <CustomLink href={ROUTES.LOGIN} variant="default">
              Se connecter
            </CustomLink>
          </p>
        </div>
      </motion.div>
    </section>
  );
};
