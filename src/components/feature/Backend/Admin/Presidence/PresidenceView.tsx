'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/molecules';
import { Button, Badge, Textarea, Input, IconButton } from '@/components/ui/atoms';
import { useOrg } from '@/hooks';
import {
  Save,
  Gavel,
  FileEdit,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Users,
  PenTool,
  CheckCircle,
  Clock,
  ScrollText,
  RotateCcw,
  Download,
  FolderOpen,
  FileText,
} from 'lucide-react';
import {
  getStatutInForce,
  getDraftStatut,
  getStatuts,
  createStatut,
  updateStatut,
  validateStatut,
  getProposals,
  updateProposalStatus,
  getSignatures,
  createSignatureRequest,
  getSignableMembers,
} from '@/lib/supabase/associationStatuts';
import { getReglementInterieur, upsertReglementInterieur } from '@/lib/supabase/reglementInterieur';
import { createMeeting } from '@/lib/supabase/meetings';
import { updateOrganisation } from '@/lib/supabase/organisations';
import { DrivePickerModal } from '@/components/feature/Backend/Events/DrivePickerModal';
import type {
  AssociationStatut,
  StatutContent,
  StatutSection,
  StatutArticle,
  StatutProposal,
  StatutSignature,
} from '@/types/associationStatuts';
import { DEFAULT_STATUT_CONTENT } from '@/types/associationStatuts';
import type { ReglementInterieurContent, ReglementSection, ReglementArticle } from '@/types/reglementInterieur';
import { DEFAULT_REGLEMENT_CONTENT } from '@/types/reglementInterieur';
import type { AgendaItem } from '@/types/meeting';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DraftEditor({
  content,
  onChange,
}: {
  content: StatutContent;
  onChange: (content: StatutContent) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(content.sections.map((s) => s.id)),
  );

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateArticle(sectionId: string, articleId: string, body: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId
          ? { ...s, articles: s.articles.map((a) => (a.id === articleId ? { ...a, body } : a)) }
          : s,
      ),
    });
  }

  function updateArticleTitle(sectionId: string, articleId: string, title: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId
          ? { ...s, articles: s.articles.map((a) => (a.id === articleId ? { ...a, title } : a)) }
          : s,
      ),
    });
  }

  function addArticle(sectionId: string) {
    const section = content.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const newArticle: StatutArticle = {
      id: `art-${Date.now()}`,
      title: `Article ${section.articles.length + 1}`,
      body: '',
    };
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, articles: [...s.articles, newArticle] } : s,
      ),
    });
  }

  function removeArticle(sectionId: string, articleId: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, articles: s.articles.filter((a) => a.id !== articleId) } : s,
      ),
    });
  }

  function addSection() {
    const newSection: StatutSection = {
      id: `titre-${Date.now()}`,
      title: `Titre ${content.sections.length + 1}`,
      articles: [],
    };
    onChange({ ...content, sections: [...content.sections, newSection] });
    setExpandedSections((prev) => new Set([...prev, newSection.id]));
  }

  function updateSectionTitle(sectionId: string, title: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    });
  }

  function removeSection(sectionId: string) {
    onChange({
      ...content,
      sections: content.sections.filter((s) => s.id !== sectionId),
    });
  }

  return (
    <div className="space-y-4">
      {/* Legal metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Siège social</label>
          <Input
            value={content.legalSiege ?? ''}
            onChange={(e) => onChange({ ...content, legalSiege: e.target.value })}
            placeholder="Adresse du siège"
            className="text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Numéro RNA</label>
          <Input
            value={content.legalRna ?? ''}
            onChange={(e) => onChange({ ...content, legalRna: e.target.value })}
            placeholder="W..."
            className="text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">SIRET</label>
          <Input
            value={content.legalSiret ?? ''}
            onChange={(e) => onChange({ ...content, legalSiret: e.target.value })}
            placeholder="XXX XXX XXX XXXXX"
            className="text-sm"
          />
        </div>
      </div>

      {/* Sections */}
      {content.sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        return (
          <div key={section.id} className="border border-border-custom rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
              <button type="button" onClick={() => toggleSection(section.id)} className="shrink-0">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <Input
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                className="flex-1 text-sm font-semibold bg-transparent border-0 p-0 h-auto focus:ring-0"
              />
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="text-zinc-400 hover:text-red-500 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {isExpanded && (
              <div className="divide-y divide-border-custom">
                {section.articles.map((article) => (
                  <div key={article.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={article.title}
                        onChange={(e) => updateArticleTitle(section.id, article.id, e.target.value)}
                        className="flex-1 text-sm font-medium bg-transparent border-0 p-0 h-auto focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => removeArticle(section.id, article.id)}
                        className="text-zinc-400 hover:text-red-500 shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <Textarea
                      value={article.body}
                      onChange={(e) => updateArticle(section.id, article.id, e.target.value)}
                      placeholder="Rédiger le contenu de l'article..."
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                ))}
                <div className="px-4 py-2">
                  <Button variant="ghost" size="sm" onClick={() => addArticle(section.id)}>
                    <Plus size={12} className="mr-1" /> Ajouter un article
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button variant="outline" onClick={addSection} className="w-full">
        <Plus size={14} className="mr-1" /> Ajouter un titre
      </Button>
    </div>
  );
}

function ReglementEditor({
  content,
  onChange,
}: {
  content: ReglementInterieurContent;
  onChange: (content: ReglementInterieurContent) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(content.sections.map((s) => s.id)),
  );

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateArticle(sectionId: string, articleId: string, body: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId
          ? { ...s, articles: s.articles.map((a) => (a.id === articleId ? { ...a, body } : a)) }
          : s,
      ),
    });
  }

  function updateArticleTitle(sectionId: string, articleId: string, title: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId
          ? { ...s, articles: s.articles.map((a) => (a.id === articleId ? { ...a, title } : a)) }
          : s,
      ),
    });
  }

  function addArticle(sectionId: string) {
    const section = content.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const newArticle: ReglementArticle = {
      id: `art-${Date.now()}`,
      title: `Article ${section.articles.length + 1}`,
      body: '',
    };
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, articles: [...s.articles, newArticle] } : s,
      ),
    });
  }

  function removeArticle(sectionId: string, articleId: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, articles: s.articles.filter((a) => a.id !== articleId) } : s,
      ),
    });
  }

  function addSection() {
    const newSection: ReglementSection = {
      id: `titre-${Date.now()}`,
      title: `Titre ${content.sections.length + 1}`,
      articles: [],
    };
    onChange({ ...content, sections: [...content.sections, newSection] });
    setExpandedSections((prev) => new Set([...prev, newSection.id]));
  }

  function updateSectionTitle(sectionId: string, title: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    });
  }

  function removeSection(sectionId: string) {
    onChange({
      ...content,
      sections: content.sections.filter((s) => s.id !== sectionId),
    });
  }

  return (
    <div className="space-y-4">
      {content.sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        return (
          <div key={section.id} className="border border-border-custom rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
              <button type="button" onClick={() => toggleSection(section.id)} className="shrink-0">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <Input
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                className="flex-1 text-sm font-semibold bg-transparent border-0 p-0 h-auto focus:ring-0"
              />
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="text-zinc-400 hover:text-red-500 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {isExpanded && (
              <div className="divide-y divide-border-custom">
                {section.articles.map((article) => (
                  <div key={article.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={article.title}
                        onChange={(e) => updateArticleTitle(section.id, article.id, e.target.value)}
                        className="flex-1 text-sm font-medium bg-transparent border-0 p-0 h-auto focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => removeArticle(section.id, article.id)}
                        className="text-zinc-400 hover:text-red-500 shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <Textarea
                      value={article.body}
                      onChange={(e) => updateArticle(section.id, article.id, e.target.value)}
                      placeholder="Rédiger le contenu de l'article..."
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                ))}
                <div className="px-4 py-2">
                  <Button variant="ghost" size="sm" onClick={() => addArticle(section.id)}>
                    <Plus size={12} className="mr-1" /> Ajouter un article
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button variant="outline" onClick={addSection} className="w-full">
        <Plus size={14} className="mr-1" /> Ajouter un titre
      </Button>
    </div>
  );
}

function ProposalCard({
  proposal,
  onMerge,
  onReject,
}: {
  proposal: StatutProposal;
  onMerge: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border-custom">
      <FileEdit size={16} className="text-zinc-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{proposal.title}</p>
        {proposal.description && (
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{proposal.description}</p>
        )}
        <p className="text-xs text-zinc-400 mt-1">
          {new Date(proposal.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={onMerge} className="h-7 w-7 p-0">
          <Check size={14} className="text-green-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onReject} className="h-7 w-7 p-0">
          <X size={14} className="text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function SignatureTracker({
  signatures,
  totalRequired,
}: {
  signatures: StatutSignature[];
  totalRequired: number;
}) {
  const signed = signatures.filter((s) => s.signedAt);
  const pending = signatures.filter((s) => !s.signedAt);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <PenTool size={16} className="text-zinc-400" />
        <span className="text-sm font-medium">
          Signatures : {signed.length} / {totalRequired}
        </span>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${totalRequired > 0 ? (signed.length / totalRequired) * 100 : 0}%` }}
        />
      </div>
      {pending.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500">En attente :</p>
          {pending.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock size={12} />
              <span>{s.userName ?? s.userId}</span>
            </div>
          ))}
        </div>
      )}
      {signed.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500">Signés :</p>
          {signed.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle size={12} />
              <span>{s.userName ?? s.userId}</span>
              <span className="text-zinc-400">
                {s.signedAt && new Date(s.signedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Statuts detail panel (visible after clicking on the card)
// ---------------------------------------------------------------------------

function StatutsDetailPanel({
  onBack,
  activeOrg,
}: {
  onBack: () => void;
  activeOrg: NonNullable<ReturnType<typeof useOrg>['activeOrg']>;
}) {
  const { isAdmin } = useOrg();

  const [currentStatut, setCurrentStatut] = useState<AssociationStatut | null>(null);
  const [draft, setDraft] = useState<AssociationStatut | null>(null);
  const [draftContent, setDraftContent] = useState<StatutContent>(DEFAULT_STATUT_CONTENT);
  const [proposals, setProposals] = useState<StatutProposal[]>([]);
  const [signatures, setSignatures] = useState<StatutSignature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingAG, setIsCreatingAG] = useState(false);
  const [adoptionDate, setAdoptionDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const isFirstVersion = !currentStatut;
  const pendingProposals = proposals.filter((p) => p.status === 'pending');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [inForce, draftStatut, allProposals] = await Promise.all([
        getStatutInForce(),
        getDraftStatut(),
        getProposals(),
      ]);
      setCurrentStatut(inForce);
      setDraft(draftStatut);
      setDraftContent(draftStatut?.content ?? inForce?.content ?? DEFAULT_STATUT_CONTENT);
      setProposals(allProposals);

      if (draftStatut && (draftStatut.status === 'pending_signatures' || draftStatut.status === 'pending_vote')) {
        const sigs = await getSignatures(draftStatut.id);
        setSignatures(sigs);
      }
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [activeOrg.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSave() {
    setIsSaving(true);
    try {
      if (draft) {
        await updateStatut(draft.id, { content: draftContent });
        toast.success('Brouillon enregistré');
      } else {
        const newDraft = await createStatut(draftContent, 'draft');
        setDraft(newDraft);
        toast.success('Brouillon créé');
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleValidateFirstVersion() {
    setIsSaving(true);
    try {
      const dateToUse = adoptionDate ? new Date(adoptionDate) : new Date();
      if (!draft) {
        const newDraft = await createStatut(draftContent, 'draft');
        setDraft(newDraft);
        await validateStatut(newDraft.id, dateToUse);
      } else {
        await updateStatut(draft.id, { content: draftContent });
        await validateStatut(draft.id, dateToUse);
      }
      toast.success('Statuts validés et mis en vigueur');
      await loadData();
    } catch {
      toast.error('Erreur lors de la validation');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateFromZero() {
    if (!confirm('Créer une nouvelle version en partant du modèle par défaut ? Le brouillon actuel sera remplacé.')) return;
    setIsSaving(true);
    try {
      setDraftContent(JSON.parse(JSON.stringify(DEFAULT_STATUT_CONTENT)));
      if (draft) {
        await updateStatut(draft.id, { content: DEFAULT_STATUT_CONTENT });
        toast.success('Brouillon réinitialisé avec le modèle par défaut');
      } else {
        const newDraft = await createStatut(DEFAULT_STATUT_CONTENT, 'draft');
        setDraft(newDraft);
        toast.success('Nouveau brouillon créé à partir du modèle');
      }
      await loadData();
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateAG() {
    if (!draft && !draftContent) return;
    setIsCreatingAG(true);
    try {
      if (!draft) {
        const newDraft = await createStatut(draftContent, 'pending_vote');
        setDraft(newDraft);
      } else {
        await updateStatut(draft.id, { content: draftContent, status: 'pending_vote' });
      }

      const agendaItem: AgendaItem = {
        id: `agenda-statuts-${Date.now()}`,
        order: 1,
        title: 'Modification du statut de l\'association',
        description: 'Vote sur les modifications proposées aux statuts de l\'association.',
        duration: 60,
        documents: [],
        requiresVote: true,
        voteResult: 'pending',
      };

      await createMeeting({
        title: 'Assemblée Générale — Modification des statuts',
        description: 'Assemblée Générale convoquée pour voter la modification des statuts de l\'association.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: '18:00',
        endTime: '20:00',
        participants: [],
        status: 'upcoming',
        meetingType: 'assemblee_generale',
        agenda: [agendaItem],
        minutes: { freeText: '' },
      });

      toast.success('Assemblée Générale créée', {
        description: 'La réunion est planifiée dans 2 semaines.',
      });
      await loadData();
    } catch {
      toast.error('Erreur lors de la création de l\'AG');
    } finally {
      setIsCreatingAG(false);
    }
  }

  async function handleValidateAfterVote() {
    if (!draft) return;
    setIsSaving(true);
    try {
      await updateStatut(draft.id, { status: 'pending_signatures' });
      const members = await getSignableMembers(activeOrg.id);
      await createSignatureRequest(
        draft.id,
        members.map((m) => m.userId),
      );
      toast.success('Validation en cours — les membres peuvent maintenant signer');
      await loadData();
    } catch {
      toast.error('Erreur lors de la validation');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFinalValidation() {
    if (!draft) return;
    setIsSaving(true);
    try {
      await validateStatut(draft.id);
      toast.success('Statuts mis à jour ! La nouvelle version est en vigueur.');
      await loadData();
    } catch {
      toast.error('Erreur lors de la validation finale');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMergeProposal(proposalId: string) {
    try {
      await updateProposalStatus(proposalId, 'merged');
      toast.success('Proposition marquée comme intégrée');
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'merged' as const } : p)),
      );
    } catch {
      toast.error('Erreur');
    }
  }

  async function handleRejectProposal(proposalId: string) {
    try {
      await updateProposalStatus(proposalId, 'rejected');
      toast.success('Proposition rejetée');
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' as const } : p)),
      );
    } catch {
      toast.error('Erreur');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  const allSigned = signatures.length > 0 && signatures.every((s) => s.signedAt);

  return (
    <div className="space-y-6">
      {/* Sub-header with back */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-foreground transition-colors w-fit"
        >
          <ChevronRight size={14} className="rotate-180" />
          Retour aux documents
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Statuts de l&apos;association</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {currentStatut
                ? `Version ${currentStatut.versionNumber} — ${draft ? 'brouillon de modification en cours' : 'en vigueur'}`
                : 'Aucune version en vigueur'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {currentStatut && (
              <Button variant="outline" size="sm" onClick={handleCreateFromZero} disabled={isSaving}>
                <RotateCcw size={14} className="mr-1" />
                Créer en partant de zéro
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save size={14} className="mr-1" />
              {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
            {isFirstVersion ? (
              <Button variant="primary" size="sm" onClick={handleValidateFirstVersion} disabled={isSaving}>
                <Check size={14} className="mr-1" />
                Valider comme première version
              </Button>
            ) : draft?.status === 'draft' ? (
              <Button variant="primary" size="sm" onClick={handleCreateAG} disabled={isCreatingAG}>
                <Gavel size={14} className="mr-1" />
                {isCreatingAG ? 'Création...' : 'Proposer une AG'}
              </Button>
            ) : draft?.status === 'pending_vote' ? (
              <Button variant="primary" size="sm" onClick={handleValidateAfterVote} disabled={isSaving}>
                <Check size={14} className="mr-1" />
                Valider le vote
              </Button>
            ) : draft?.status === 'pending_signatures' && allSigned ? (
              <Button variant="primary" size="sm" onClick={handleFinalValidation} disabled={isSaving}>
                <CheckCircle size={14} className="mr-1" />
                Valider définitivement
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* First version warning */}
      {isFirstVersion && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Première version des statuts
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                Vous pouvez valider directement cette première version. Attention : toute modification
                ultérieure nécessitera la convocation d&apos;une Assemblée Générale.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-border-custom">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
              Date d&apos;adoption :
            </label>
            <Input
              type="date"
              value={adoptionDate}
              onChange={(e) => setAdoptionDate(e.target.value)}
              className="max-w-[180px]"
            />
            <span className="text-xs text-zinc-500">
              Généralement la date de l&apos;AG constitutive ou de signature
            </span>
          </div>
        </div>
      )}

      {/* Status bar for pending signatures */}
      {draft?.status === 'pending_signatures' && (
        <Card>
          <CardContent className="py-4">
            <SignatureTracker signatures={signatures} totalRequired={signatures.length} />
          </CardContent>
        </Card>
      )}

      {/* Pending proposals */}
      {pendingProposals.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-zinc-400" />
              <h3 className="text-sm font-medium">
                Propositions en attente ({pendingProposals.length})
              </h3>
            </div>
            <div className="space-y-2">
              {pendingProposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  onMerge={() => handleMergeProposal(p.id)}
                  onReject={() => handleRejectProposal(p.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Side by side : en vigueur | brouillon (toujours affiché quand statuts existent) */}
      {currentStatut ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Badge variant="success">En vigueur</Badge> Version {currentStatut.versionNumber}
            </h3>
            <div className="space-y-3 opacity-75">
              {currentStatut.content.sections.map((section) => (
                <div key={section.id} className="border border-border-custom rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
                  {section.articles.map((article) => (
                    <div key={article.id} className="mb-2">
                      <p className="text-xs font-medium">{article.title}</p>
                      <p className="text-xs text-zinc-500 whitespace-pre-wrap">{article.body || '—'}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Badge variant="warning">Brouillon</Badge> Modifications
            </h3>
            <DraftEditor content={draftContent} onChange={setDraftContent} />
          </div>
        </div>
      ) : (
        <DraftEditor content={draftContent} onChange={setDraftContent} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Règlement intérieur detail panel (édition directe, pas d'AG)
// ---------------------------------------------------------------------------

function ReglementDetailPanel({
  onBack,
  activeOrg,
}: {
  onBack: () => void;
  activeOrg: NonNullable<ReturnType<typeof useOrg>['activeOrg']>;
}) {
  const [reglement, setReglement] = useState<ReglementInterieurContent | null>(null);
  const [content, setContent] = useState<ReglementInterieurContent>(DEFAULT_REGLEMENT_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getReglementInterieur(activeOrg.id);
      if (data) {
        setReglement(data.content);
        setContent(data.content);
      } else {
        setReglement(null);
        setContent(JSON.parse(JSON.stringify(DEFAULT_REGLEMENT_CONTENT)));
      }
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [activeOrg.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSave() {
    setIsSaving(true);
    try {
      await upsertReglementInterieur(content, activeOrg.id);
      toast.success('Règlement intérieur enregistré');
      await loadData();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleValidate() {
    setIsSaving(true);
    try {
      await upsertReglementInterieur(content, activeOrg.id);
      toast.success('Règlement intérieur validé et mis à jour');
      await loadData();
    } catch {
      toast.error('Erreur lors de la validation');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-foreground transition-colors w-fit"
        >
          <ChevronRight size={14} className="rotate-180" />
          Retour aux documents
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Règlement intérieur</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {reglement ? 'Modification directe — pas d\'assemblée générale requise' : 'Créer le règlement intérieur'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save size={14} className="mr-1" />
              {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleValidate} disabled={isSaving}>
              <Check size={14} className="mr-1" />
              Valider et publier
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <AlertTriangle size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Le règlement intérieur est modifiable directement ici. Contrairement aux statuts, aucune assemblée générale n&apos;est requise pour le valider.
        </p>
      </div>

      <ReglementEditor content={content} onChange={setContent} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Document card for the landing grid
// ---------------------------------------------------------------------------

const STATUS_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  in_force: { label: 'En vigueur', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  draft: { label: 'Brouillon', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  pending_vote: { label: 'Vote en cours', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  pending_signatures: { label: 'Signatures', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  none: { label: 'Non créé', className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
};

function DocumentCard({
  icon,
  title,
  description,
  statusKey,
  meta,
  notificationCount,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  statusKey: string;
  meta?: string;
  notificationCount?: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  const badge = STATUS_BADGE_CONFIG[statusKey] ?? STATUS_BADGE_CONFIG.none;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left group relative rounded-xl border border-border-custom p-5 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
            {notificationCount != null && notificationCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {notificationCount}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{description}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
              {badge.label}
            </span>
            {meta && (
              <span className="text-[10px] text-zinc-400">{meta}</span>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors mt-1" />
      </div>
    </button>
  );
}

function OfficialDocCard({
  icon,
  title,
  description,
  hasDocument,
  fileName,
  downloadUrl,
  onChoose,
  onReplace,
  onRemove,
  saving,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  hasDocument: boolean;
  fileName?: string;
  downloadUrl?: string;
  onChoose: () => void;
  onReplace: () => void;
  onRemove: () => void;
  saving: boolean;
}) {
  const badge = hasDocument ? STATUS_BADGE_CONFIG.in_force : STATUS_BADGE_CONFIG.none;

  return (
    <div className="w-full text-left group relative rounded-xl border border-border-custom p-5 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate mb-1">{title}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{description}</p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
              {hasDocument ? 'Enregistré' : 'Non renseigné'}
            </span>
            {fileName && (
              <span className="text-[10px] text-zinc-400 truncate max-w-[180px]">{fileName}</span>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 mt-1">
          {hasDocument ? (
            <>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Télécharger"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Download size={16} />
                </a>
              )}
              <IconButton
                variant="outline"
                size="sm"
                icon={<FolderOpen size={16} />}
                ariaLabel="Remplacer"
                onClick={onReplace}
                disabled={saving}
              />
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Trash2 size={16} />}
                ariaLabel="Supprimer"
                onClick={onRemove}
                disabled={saving}
                className="text-zinc-500 hover:text-red-600"
              />
            </>
          ) : (
            <IconButton
              variant="outline"
              size="sm"
              icon={<FolderOpen size={16} />}
              ariaLabel="Choisir depuis Drive"
              onClick={onChoose}
              disabled={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main view (document grid + detail panel)
// ---------------------------------------------------------------------------

type ActiveDocument = 'statuts' | 'reglement' | null;

export default function PresidenceView() {
  const { activeOrg, isAdmin, refreshOrgs } = useOrg();
  const [activeDocument, setActiveDocument] = useState<ActiveDocument>(null);
  const [drivePickerDocType, setDrivePickerDocType] = useState<'joafe' | 'liste_dirigeants' | 'recepisse_cr' | null>(null);
  const [savingDoc, setSavingDoc] = useState(false);

  // Light pre-fetch for card summaries
  const [reglementSummary, setReglementSummary] = useState<{ hasContent: boolean; updatedAt?: Date }>({ hasContent: false });
  const [statutSummary, setStatutSummary] = useState<{
    statusKey: string;
    version?: number;
    adoptedAt?: Date;
    hasDraft: boolean;
    pendingProposals: number;
  }>({ statusKey: 'none', hasDraft: false, pendingProposals: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    if (!activeOrg) return;
    try {
      setSummaryLoading(true);
      const [inForce, draftStatut, allProposals, reglement] = await Promise.all([
        getStatutInForce(),
        getDraftStatut(),
        getProposals(),
        getReglementInterieur(activeOrg.id),
      ]);
      setReglementSummary({
        hasContent: !!reglement?.content?.sections?.length,
        updatedAt: reglement?.updatedAt,
      });
      const pending = allProposals.filter((p) => p.status === 'pending');

      if (draftStatut) {
        setStatutSummary({
          statusKey: draftStatut.status,
          version: inForce?.versionNumber,
          adoptedAt: inForce?.adoptedAt,
          hasDraft: true,
          pendingProposals: pending.length,
        });
      } else if (inForce) {
        setStatutSummary({
          statusKey: 'in_force',
          version: inForce.versionNumber,
          adoptedAt: inForce.adoptedAt,
          hasDraft: false,
          pendingProposals: pending.length,
        });
      } else {
        setStatutSummary({
          statusKey: 'none',
          hasDraft: false,
          pendingProposals: pending.length,
        });
      }
    } catch {
      // silent
    } finally {
      setSummaryLoading(false);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Accès réservé au Président ou à un administrateur.</p>
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Aucune organisation active.</p>
      </div>
    );
  }

  // Detail panel for statuts
  if (activeDocument === 'statuts') {
    return (
      <StatutsDetailPanel
        onBack={() => { setActiveDocument(null); loadSummary(); }}
        activeOrg={activeOrg}
      />
    );
  }

  // Detail panel for règlement intérieur
  if (activeDocument === 'reglement') {
    return (
      <ReglementDetailPanel
        onBack={() => { setActiveDocument(null); loadSummary(); }}
        activeOrg={activeOrg}
      />
    );
  }

  const getDownloadUrl = (url: string) =>
    `/api/admin/integrations/google/drive/download?org_id=${activeOrg.id}&url=${encodeURIComponent(url)}`;

  const handleDriveDocSelect = async (docType: 'joafe' | 'liste_dirigeants' | 'recepisse_cr', url: string, name?: string) => {
    if (!activeOrg) return;
    setSavingDoc(true);
    try {
      const payload =
        docType === 'joafe'
          ? { docJoafeUrl: url, docJoafeName: name ?? null }
          : docType === 'liste_dirigeants'
            ? { docListeDirigeantsUrl: url, docListeDirigeantsName: name ?? null }
            : { docRecepisseCrUrl: url, docRecepisseCrName: name ?? null };
      await updateOrganisation(activeOrg.id, payload);
      await refreshOrgs();
      toast.success('Document enregistré');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSavingDoc(false);
      setDrivePickerDocType(null);
    }
  };

  const handleRemoveDoc = async (docType: 'joafe' | 'liste_dirigeants' | 'recepisse_cr') => {
    if (!activeOrg) return;
    setSavingDoc(true);
    try {
      const payload =
        docType === 'joafe'
          ? { docJoafeUrl: null, docJoafeName: null }
          : docType === 'liste_dirigeants'
            ? { docListeDirigeantsUrl: null, docListeDirigeantsName: null }
            : { docRecepisseCrUrl: null, docRecepisseCrName: null };
      await updateOrganisation(activeOrg.id, payload);
      await refreshOrgs();
      toast.success('Document supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setSavingDoc(false);
    }
  };

  // Document grid (landing)
  const statutsMeta = statutSummary.version
    ? `v${statutSummary.version}${statutSummary.adoptedAt ? ` — ${new Date(statutSummary.adoptedAt).toLocaleDateString('fr-FR')}` : ''}`
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Espace Présidence</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Documents officiels et gestion de l&apos;association
        </p>
      </div>

      {summaryLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-xl border border-border-custom animate-pulse" />
            ))}
          </div>
          <div className="mt-8">
            <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-3" />
            <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl border border-border-custom animate-pulse" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard
              icon={<ScrollText size={20} />}
              title="Statuts de l'association"
              description="Rédaction, modification et gestion des statuts. Propositions des membres, assemblée générale et signatures."
              statusKey={statutSummary.statusKey}
              meta={statutsMeta}
              notificationCount={statutSummary.pendingProposals}
              onClick={() => setActiveDocument('statuts')}
            />

            <DocumentCard
              icon={<FileEdit size={20} />}
              title="Règlement intérieur"
              description="Rédaction et modification du règlement intérieur. Validation directe sans assemblée générale."
              statusKey={reglementSummary.hasContent ? 'in_force' : 'none'}
              meta={reglementSummary.updatedAt ? `Mis à jour le ${new Date(reglementSummary.updatedAt).toLocaleDateString('fr-FR')}` : undefined}
              onClick={() => setActiveDocument('reglement')}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3 mt-8">Documents officiels de l&apos;État</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              JOAFE, liste des dirigeants et récépissé CR. Sélectionnez les documents depuis Google Drive.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OfficialDocCard
                icon={<FileText size={20} />}
                title="JOAFE"
                description="Journal Officiel des Associations et Fondations d'Entreprise"
                hasDocument={!!activeOrg.docJoafeUrl}
                fileName={activeOrg.docJoafeName ?? undefined}
                downloadUrl={activeOrg.docJoafeUrl ? getDownloadUrl(activeOrg.docJoafeUrl) : undefined}
                onChoose={() => setDrivePickerDocType('joafe')}
                onReplace={() => setDrivePickerDocType('joafe')}
                onRemove={() => handleRemoveDoc('joafe')}
                saving={savingDoc}
              />
              <OfficialDocCard
                icon={<Users size={20} />}
                title="Liste des dirigeants"
                description="Liste officielle des dirigeants de l'association"
                hasDocument={!!activeOrg.docListeDirigeantsUrl}
                fileName={activeOrg.docListeDirigeantsName ?? undefined}
                downloadUrl={activeOrg.docListeDirigeantsUrl ? getDownloadUrl(activeOrg.docListeDirigeantsUrl) : undefined}
                onChoose={() => setDrivePickerDocType('liste_dirigeants')}
                onReplace={() => setDrivePickerDocType('liste_dirigeants')}
                onRemove={() => handleRemoveDoc('liste_dirigeants')}
                saving={savingDoc}
              />
              <OfficialDocCard
                icon={<FileText size={20} />}
                title="Récépissé CR"
                description="Récépissé de déclaration en préfecture"
                hasDocument={!!activeOrg.docRecepisseCrUrl}
                fileName={activeOrg.docRecepisseCrName ?? undefined}
                downloadUrl={activeOrg.docRecepisseCrUrl ? getDownloadUrl(activeOrg.docRecepisseCrUrl) : undefined}
                onChoose={() => setDrivePickerDocType('recepisse_cr')}
                onReplace={() => setDrivePickerDocType('recepisse_cr')}
                onRemove={() => handleRemoveDoc('recepisse_cr')}
                saving={savingDoc}
              />
            </div>
          </div>
        </>
      )}

      <DrivePickerModal
        isOpen={!!drivePickerDocType}
        onClose={() => setDrivePickerDocType(null)}
        onSelect={(url, name) => drivePickerDocType && handleDriveDocSelect(drivePickerDocType, url, name)}
        orgId={activeOrg.id}
        mode="document"
      />
    </div>
  );
}
