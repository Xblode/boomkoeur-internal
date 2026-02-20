'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FormField } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { CustomLink } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // TODO: Intégrer avec votre système d'authentification (NextAuth, etc.)
      console.log('Register attempt:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation
      alert('Inscription réussie ! (simulation)');
      // router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
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

            <FormField
              label="Nom complet"
              htmlFor="name"
              required
              inputProps={{
                type: 'text',
                id: 'name',
                value: formData.name,
                onChange: (e) =>
                  setFormData({ ...formData, name: e.target.value }),
                placeholder: 'Jean Dupont',
                required: true,
                autoComplete: 'name',
              }}
            />

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
                autoComplete: 'new-password',
              }}
            />

            <FormField
              label="Confirmer le mot de passe"
              htmlFor="confirmPassword"
              required
              inputProps={{
                type: 'password',
                id: 'confirmPassword',
                value: formData.confirmPassword,
                onChange: (e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value }),
                placeholder: '••••••••',
                required: true,
                autoComplete: 'new-password',
              }}
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
