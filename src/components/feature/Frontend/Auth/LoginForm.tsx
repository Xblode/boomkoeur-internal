'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FormField } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { CustomLink } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // TODO: Intégrer avec votre système d'authentification (NextAuth, etc.)
      console.log('Login attempt:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation
      alert('Connexion réussie ! (simulation)');
      // router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError('Email ou mot de passe incorrect. Veuillez réessayer.');
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
              inputProps={{
                type: 'password',
                id: 'password',
                value: formData.password,
                onChange: (e) =>
                  setFormData({ ...formData, password: e.target.value }),
                placeholder: '••••••••',
                required: true,
                autoComplete: 'current-password',
              }}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-zinc-300 dark:border-zinc-600"
                />
                <span className="text-zinc-600 dark:text-zinc-400">
                  Se souvenir de moi
                </span>
              </label>
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
