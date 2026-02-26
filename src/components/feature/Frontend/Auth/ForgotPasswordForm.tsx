'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FormField } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { CustomLink } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';
import { getErrorMessage } from '@/lib/utils';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=password`,
      });

      if (authError) {
        setError(getErrorMessage(authError) ?? 'Une erreur est survenue.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err) ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="w-full min-h-[80vh] flex items-center justify-center py-20 px-4 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900">
        <motion.div
          className="w-full max-w-md"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous
              recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <CustomLink href={ROUTES.LOGIN} variant="default">
              Retour à la connexion
            </CustomLink>
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
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            Mot de passe oublié
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center">
            Entrez votre email pour recevoir un lien de réinitialisation
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
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: 'votre@email.com',
                required: true,
                autoComplete: 'email',
              }}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Envoyer le lien
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
};
