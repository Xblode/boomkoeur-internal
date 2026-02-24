'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Input, Select } from '@/components/ui/atoms';
import { FormField } from '@/components/ui/molecules';
import { Card, CardContent } from '@/components/ui/molecules/Card';
import { fadeInUp } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { createOrganisation, joinByInvite } from '@/lib/supabase/organisations';
import { getErrorMessage } from '@/lib/utils';
import { Building2, Link as LinkIcon, Plus, ArrowRight } from 'lucide-react';
import type { OrgType } from '@/types/organisation';

type Mode = 'choice' | 'create' | 'join';

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteParam = searchParams.get('invite');
  const [mode, setMode] = useState<Mode>(inviteParam ? 'join' : 'choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: 'association' as OrgType,
  });
  const [inviteToken, setInviteToken] = useState(inviteParam ?? '');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await createOrganisation(createForm);
      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const rawToken = inviteToken.trim();
      const token = rawToken.includes('/') ? rawToken.split('/').pop()! : rawToken;
      await joinByInvite(token);
      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900">
      <motion.div
        className="w-full max-w-lg"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bienvenue !
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Pour commencer, rejoignez ou creez une organisation.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {mode === 'choice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              onClick={() => setMode('join')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <LinkIcon size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground">Rejoindre</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  J'ai un lien d'invitation
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              onClick={() => setMode('create')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <Plus size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground">Creer</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Demarrer une nouvelle organisation
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'join' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-foreground">Rejoindre une organisation</h2>
              </div>
              <form onSubmit={handleJoin} className="space-y-4">
                <FormField label="Lien ou code d'invitation" required>
                  <Input
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    placeholder="Collez le lien d'invitation ici"
                    required
                  />
                </FormField>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => { setMode('choice'); setError(null); }}>
                    Retour
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" loading={loading}>
                    <ArrowRight size={16} className="mr-2" />
                    Rejoindre
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {mode === 'create' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 size={20} className="text-green-600" />
                <h2 className="text-lg font-semibold text-foreground">Creer une organisation</h2>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <FormField label="Nom" required>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Mon Association"
                    required
                  />
                </FormField>
                <FormField label="Description">
                  <Input
                    value={createForm.description}
                    onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Courte description"
                  />
                </FormField>
                <FormField label="Type" required>
                  <Select
                    value={createForm.type}
                    onChange={(e) => setCreateForm((p) => ({ ...p, type: e.target.value as OrgType }))}
                    options={[
                      { value: 'association', label: 'Association' },
                      { value: 'entreprise', label: 'Entreprise' },
                      { value: 'collectif', label: 'Collectif' },
                      { value: 'autre', label: 'Autre' },
                    ]}
                    required
                  />
                </FormField>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => { setMode('choice'); setError(null); }}>
                    Retour
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" loading={loading}>
                    <Plus size={16} className="mr-2" />
                    Creer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </section>
  );
}
