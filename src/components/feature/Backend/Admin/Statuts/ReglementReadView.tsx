'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/molecules';
import { useOrg } from '@/hooks';
import { ChevronDown, ChevronRight, FileEdit } from 'lucide-react';
import { getReglementInterieur } from '@/lib/supabase/reglementInterieur';
import type { ReglementInterieurContent, ReglementSection } from '@/types/reglementInterieur';

function SectionAccordion({ section }: { section: ReglementSection }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-border-custom rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left font-semibold text-sm bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {section.title}
      </button>
      {isOpen && (
        <div className="divide-y divide-border-custom">
          {section.articles.map((article) => (
            <div key={article.id} className="px-4 py-3">
              <h4 className="font-medium text-sm mb-1">{article.title}</h4>
              {article.body ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{article.body}</p>
              ) : (
                <p className="text-sm text-zinc-400 italic">Aucun contenu</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReglementReadView() {
  const { activeOrg } = useOrg();
  const [content, setContent] = useState<ReglementInterieurContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeOrg) return;
    loadReglement();
  }, [activeOrg?.id]);

  async function loadReglement() {
    try {
      setIsLoading(true);
      const data = await getReglementInterieur(activeOrg!.id);
      setContent(data?.content ?? null);
    } catch {
      toast.error('Erreur lors du chargement du règlement intérieur');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement du règlement intérieur...</div>
      </div>
    );
  }

  const hasNoContent = !content?.sections?.length;

  if (hasNoContent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Règlement intérieur</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Règles de fonctionnement interne de l&apos;association
          </p>
        </div>
        <EmptyState
          icon={FileEdit}
          title="Règlement intérieur non créé"
          description="Le président ou un administrateur peut créer le règlement intérieur depuis l'espace Présidence."
          variant="compact"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Règlement intérieur</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Règles de fonctionnement interne de l&apos;association
        </p>
      </div>

      <div className="space-y-4">
        {content.sections.map((section) => (
          <SectionAccordion key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
