'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { Button, Badge, Textarea } from '@/components/ui/atoms';
import { Input } from '@/components/ui/atoms';
import { useOrg } from '@/hooks';
import {
  Download,
  FileEdit,
  Clock,
  ScrollText,
  ChevronDown,
  ChevronRight,
  History,
  AlertTriangle,
  Send,
  X,
} from 'lucide-react';
import {
  getStatutInForce,
  getStatuts,
  createProposal,
} from '@/lib/supabase/associationStatuts';
import type { AssociationStatut, StatutSection, StatutContent } from '@/types/associationStatuts';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';

const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  in_force: { label: 'En vigueur', variant: 'success' },
  draft: { label: 'Brouillon', variant: 'warning' },
  pending_vote: { label: 'En attente de vote', variant: 'info' },
  pending_signatures: { label: 'En attente de signatures', variant: 'info' },
  archived: { label: 'Archivé', variant: 'secondary' },
};

function SectionAccordion({ section }: { section: StatutSection }) {
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

export default function StatutsReadView() {
  const { activeOrg } = useOrg();
  const [currentStatut, setCurrentStatut] = useState<AssociationStatut | null>(null);
  const [allVersions, setAllVersions] = useState<AssociationStatut[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<AssociationStatut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  useEffect(() => {
    if (!activeOrg) return;
    loadStatuts();
  }, [activeOrg?.id]);

  async function loadStatuts() {
    try {
      setIsLoading(true);
      const [inForce, all] = await Promise.all([
        getStatutInForce(),
        getStatuts(),
      ]);
      setCurrentStatut(inForce);
      setSelectedVersion(inForce);
      setAllVersions(all);
    } catch {
      toast.error('Erreur lors du chargement des statuts');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitProposal() {
    if (!proposalTitle.trim()) {
      toast.error('Veuillez indiquer un titre');
      return;
    }
    setIsSubmittingProposal(true);
    try {
      await createProposal(proposalTitle.trim(), proposalDescription.trim(), {});
      toast.success('Proposition envoyée', {
        description: 'Le président pourra la consulter dans son espace.',
      });
      setShowProposalModal(false);
      setProposalTitle('');
      setProposalDescription('');
    } catch {
      toast.error('Erreur lors de l\'envoi de la proposition');
    } finally {
      setIsSubmittingProposal(false);
    }
  }

  const displayedStatut = selectedVersion ?? currentStatut;
  const isFirstVersion = allVersions.length === 0;
  const hasNoStatuts = !currentStatut && !isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement des statuts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statuts de l&apos;association</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {activeOrg?.name ? `${activeOrg.name} — ` : ''}
            Document officiel régi par la loi du 1er juillet 1901
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProposalModal(true)}
          >
            <FileEdit size={14} className="mr-1" />
            Proposer une modification
          </Button>
          {displayedStatut && activeOrg && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                window.open(
                  `/api/admin/statuts/export-pdf?statut_id=${displayedStatut.id}&org_id=${activeOrg.id}`,
                  '_blank',
                );
              }}
            >
              <Download size={14} className="mr-1" />
              Télécharger en PDF
            </Button>
          )}
        </div>
      </div>

      {/* First version warning */}
      {isFirstVersion && hasNoStatuts && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Aucun statut n&apos;a encore été enregistré
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Le président peut créer la première version des statuts depuis l&apos;espace Présidence.
              Attention : une fois validés, toute modification nécessitera une Assemblée Générale.
            </p>
          </div>
        </div>
      )}

      {/* Metadata bar */}
      {displayedStatut && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <ScrollText size={16} className="text-zinc-400" />
                <span className="font-medium">Version {displayedStatut.versionNumber}</span>
                <Badge variant={STATUS_LABELS[displayedStatut.status]?.variant as 'success' | 'warning' | 'info' | 'secondary' ?? 'secondary'}>
                  {STATUS_LABELS[displayedStatut.status]?.label ?? displayedStatut.status}
                </Badge>
              </div>
              {displayedStatut.adoptedAt && (
                <div className="flex items-center gap-1 text-zinc-500">
                  <Clock size={14} />
                  Adopté le {new Date(displayedStatut.adoptedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {allVersions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1 text-zinc-500 hover:text-foreground transition-colors"
                >
                  <History size={14} />
                  {showHistory ? 'Masquer l\'historique' : 'Voir l\'historique'}
                </button>
              )}
            </div>

            {/* Version history */}
            {showHistory && allVersions.length > 1 && (
              <div className="mt-4 pt-4 border-t border-border-custom">
                <h3 className="text-sm font-medium mb-2">Historique des versions</h3>
                <div className="space-y-1">
                  {allVersions.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVersion(v)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedVersion?.id === v.id
                          ? 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <span>Version {v.versionNumber}</span>
                      <span className="text-zinc-400 ml-2">
                        {v.adoptedAt
                          ? new Date(v.adoptedAt).toLocaleDateString('fr-FR')
                          : 'Non adopté'}
                      </span>
                      <Badge
                        variant={STATUS_LABELS[v.status]?.variant as 'success' | 'warning' | 'info' | 'secondary' ?? 'secondary'}
                        className="ml-2"
                      >
                        {STATUS_LABELS[v.status]?.label ?? v.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statut content */}
      {displayedStatut && (
        <div className="space-y-3">
          {displayedStatut.content.sections.map((section) => (
            <SectionAccordion key={section.id} section={section} />
          ))}
        </div>
      )}

      {/* Proposal modal */}
      <Modal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        title="Proposer une modification"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Décrivez la modification que vous souhaitez apporter aux statuts.
            Le président sera notifié et pourra intégrer votre proposition au brouillon.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Titre de la proposition *</label>
            <Input
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              placeholder="Ex: Modification de l'article 3 - Siège social"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder="Décrivez les modifications souhaitées..."
              rows={5}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setShowProposalModal(false)}>
            <X size={14} className="mr-1" /> Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitProposal}
            disabled={isSubmittingProposal || !proposalTitle.trim()}
          >
            <Send size={14} className="mr-1" />
            {isSubmittingProposal ? 'Envoi...' : 'Envoyer la proposition'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
