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

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width={20} height={20}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

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
  const [googleLoading, setGoogleLoading] = useState(false);
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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(ROUTES.LOGIN)}`,
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

  const handleSignUpWithGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(ROUTES.ONBOARDING)}`,
        },
      });
      if (authError) {
        setError(getErrorMessage(authError) ?? 'Erreur lors de l\'inscription avec Google.');
      }
    } catch (err) {
      setError(getErrorMessage(err) ?? 'Erreur lors de l\'inscription avec Google.');
    } finally {
      setGoogleLoading(false);
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
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              loading={googleLoading}
              onClick={handleSignUpWithGoogle}
              disabled={loading}
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Continuer avec Google
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
