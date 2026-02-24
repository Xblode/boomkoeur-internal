"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ComWorkflow, ComWorkflowPost, PostVisual, PostNetwork, PostType } from '@/types/event';
import { Button, Input, Textarea, Popover, PopoverContent, PopoverTrigger, Checkbox, IconButton, FileInput, Label, Badge, Chip } from '@/components/ui/atoms';
import { DatePicker, TabSwitcher, ConfirmActions, EditableCard } from '@/components/ui/molecules';
import { WorkflowStepper } from './WorkflowStepper';
import { EventShotgunStats } from './EventShotgunStats';
import { EmptyState } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui';
import {
  ArrowLeft,
  Check,
  FileImage,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Plus,
  FileText,
  Play,
  Trash2,
  Link2,
  AlertTriangle,
  Edit,
  X,
  Upload,
  Download,
  Image as ImageIcon,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useEventDetail } from './EventDetailProvider';
import { useOrg } from '@/hooks';
import { EventInstagramStats } from './EventInstagramStats';
import { ShotgunEventsResponse } from '@/types/shotgun';
import { DrivePickerModal } from './DrivePickerModal';

const PHASE_ORDER = ['preparation', 'production', 'communication', 'postEvent'] as const;

const PHASE_LABELS: Record<string, string> = {
  preparation: 'Préparation',
  production: 'Production',
  communication: 'Communication',
  postEvent: 'Post-Event',
};

const TYPE_LABELS: Record<string, string> = { post: 'Post', reel: 'Réel', story: 'Story', newsletter: 'Newsletter' };
const NETWORK_LABELS: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };

export function EventCampaignSection() {
  const { event, persistField, linkedCampaigns } = useEventDetail();
  const { activeOrg } = useOrg();

  // ── Local state ──
  const [wfSectionTab, setWfSectionTab] = useState<'campagne' | 'shotgun' | 'instagram'>('campagne');
  const [metaConnected, setMetaConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPostName, setNewPostName] = useState('');
  const [newPostDesc, setNewPostDesc] = useState('');
  const [newPostNetworks, setNewPostNetworks] = useState<PostNetwork[]>([]);
  const [newPostType, setNewPostType] = useState<PostType | undefined>(undefined);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingVisualId, setEditingVisualId] = useState<string | null>(null);
  const [editingVisualUrl, setEditingVisualUrl] = useState('');
  const [drivePickerPostId, setDrivePickerPostId] = useState<string | null>(null);
  const [drivePickerPosterType, setDrivePickerPosterType] = useState<'posterA4' | 'posterInsta' | 'posterShotgun' | null>(null);
  const [visualUrlInputs, setVisualUrlInputs] = useState<Record<string, string>>({
    posterA4: '', posterInsta: '', posterShotgun: '',
  });
  const posterA4InputRef = useRef<HTMLInputElement>(null);
  const posterInstaInputRef = useRef<HTMLInputElement>(null);
  const posterShotgunInputRef = useRef<HTMLInputElement>(null);

  // ── Workflow normalisé ──
  const VALID_PHASES = ['preparation', 'production', 'communication', 'postEvent'];
  const wf: ComWorkflow = {
    activePhase: (VALID_PHASES.includes(event.comWorkflow?.activePhase ?? '')
      ? event.comWorkflow!.activePhase
      : 'preparation') as ComWorkflow['activePhase'],
    activeStep: event.comWorkflow?.activeStep ?? 0,
    manual: {
      firstPostPublished: event.comWorkflow?.manual?.firstPostPublished ?? false,
      linktreeUpdated: event.comWorkflow?.manual?.linktreeUpdated ?? false,
      facebookEventCreated: event.comWorkflow?.manual?.facebookEventCreated ?? false,
      shotgunDone: event.comWorkflow?.manual?.shotgunDone ?? false,
      textesReady: event.comWorkflow?.manual?.textesReady ?? false,
      eventDayPassed: event.comWorkflow?.manual?.eventDayPassed ?? false,
      photosPublished: event.comWorkflow?.manual?.photosPublished ?? false,
      statsAnalyzed: event.comWorkflow?.manual?.statsAnalyzed ?? false,
    },
    shotgunUrl: event.comWorkflow?.shotgunUrl ?? '',
    posts: event.comWorkflow?.posts ?? [],
    overrides: {
      planComDone: event.comWorkflow?.overrides?.planComDone ?? false,
      editorialCalDone: event.comWorkflow?.overrides?.editorialCalDone ?? false,
      postsReady: event.comWorkflow?.overrides?.postsReady ?? false,
      visualsPrimaryReady: event.comWorkflow?.overrides?.visualsPrimaryReady ?? false,
    },
  };

  // ── Phase steps (dynamic for communication) ──
  const PHASE_STEPS: Record<string, string[]> = {
    preparation: ['Plan de Communication', 'Event Shotgun', 'Visuels primaires'],
    production: ['Calendrier éditorial', 'Posts préparés', 'Textes & captions', 'Lancement Annonce'],
    communication: ['Campagne en cours', 'Event\nJ-0'],
    postEvent: ['Publication des photos', 'Bilan & statistiques'],
  };

  const getPostDayLabel = (scheduledDate?: string): string => {
    if (!scheduledDate) return '—';
    const postDay = new Date(scheduledDate);
    postDay.setHours(0, 0, 0, 0);
    const eventDay = new Date(event.date);
    eventDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((postDay.getTime() - eventDay.getTime()) / 86400000);
    if (diffDays === 0) return 'Event\nJ-0';
    if (diffDays < 0) return `Event\nJ${diffDays}`;
    return `Event\nJ+${diffDays}`;
  };

  const sortedComPosts = [...(wf.posts ?? [])].sort((a, b) => {
    if (!a.scheduledDate && !b.scheduledDate) return 0;
    if (!a.scheduledDate) return 1;
    if (!b.scheduledDate) return -1;
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });
  if (sortedComPosts.length > 0) {
    PHASE_STEPS.communication = [...sortedComPosts.map(p => getPostDayLabel(p.scheduledDate)), 'Event\nJ-0'];
  }

  useEffect(() => {
    if (!activeOrg?.id) return;
    fetch(`/api/admin/integrations?org_id=${activeOrg.id}&provider=meta`)
      .then((res) => res.json())
      .then((data) => setMetaConnected(data.connected === true))
      .catch(() => setMetaConnected(false));
  }, [activeOrg?.id]);

  const updateWorkflow = (updates: Partial<ComWorkflow>) => {
    const newWf: ComWorkflow = {
      ...wf,
      manual: updates.manual ? { ...wf.manual, ...updates.manual } : wf.manual,
      overrides: updates.overrides ? { ...wf.overrides, ...updates.overrides } : wf.overrides,
      ...(updates.activePhase !== undefined && { activePhase: updates.activePhase }),
      ...(updates.activeStep !== undefined && { activeStep: updates.activeStep }),
      ...(updates.shotgunUrl !== undefined && { shotgunUrl: updates.shotgunUrl }),
      ...(updates.posts !== undefined && { posts: updates.posts }),
    };
    persistField({ comWorkflow: newWf });
  };

  // ── Sync Shotgun depuis URL ──
  const handleSyncShotgun = useCallback(async () => {
    const url = wf.shotgunUrl?.trim();
    if (!url) return;

    // Extraire le slug depuis l'URL : https://shotgun.live/events/mon-event-slug
    const match = url.match(/shotgun\.live\/events\/([^/?#]+)/);
    if (!match) {
      setSyncStatus('error');
      setSyncMessage('URL invalide, format attendu : https://shotgun.live/events/...');
      setTimeout(() => setSyncStatus('idle'), 4000);
      return;
    }
    const slug = match[1];

    setSyncStatus('loading');
    setSyncMessage('');
    try {
      const headers: Record<string, string> = {};
      if (activeOrg?.id) headers['X-Org-Id'] = activeOrg.id;
      const [futureRes, pastRes] = await Promise.all([
        fetch(`/api/shotgun/events?name=${encodeURIComponent(slug)}`, { headers }),
        fetch(`/api/shotgun/events?name=${encodeURIComponent(slug)}&past_events=true&limit=50`, { headers }),
      ]);
      const [futureJson, pastJson]: [ShotgunEventsResponse, ShotgunEventsResponse] = await Promise.all([
        futureRes.json(),
        pastRes.json(),
      ]);
      const all = [...(futureJson.data ?? []), ...(pastJson.data ?? [])];
      const found = all.find((e) => e.slug === slug || e.url.includes(slug));

      if (!found) {
        setSyncStatus('error');
        setSyncMessage('Aucun event Shotgun trouvé pour cette URL. Il sera lié automatiquement dès sa publication.');
        setTimeout(() => setSyncStatus('idle'), 5000);
        return;
      }

      // Lier l'event
      persistField({ shotgunEventId: found.id, shotgunEventUrl: found.url });
      setSyncStatus('success');
      setSyncMessage(`Lié à "${found.name}"`);
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch {
      setSyncStatus('error');
      setSyncMessage('Erreur lors de la synchronisation');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }
  }, [wf.shotgunUrl, event, persistField, activeOrg?.id]);

  // ── Auto-detection ──
  const autoPlanCom = linkedCampaigns.some(c => c.posts?.length > 0);
  const allVisualsReady = !!event.media?.posterA4 && !!event.media?.posterInsta && !!event.media?.posterShotgun;
  const postsCount = wf.posts?.length ?? 0;
  const allPostsHaveDate = postsCount > 0 && (wf.posts ?? []).every(p => p.scheduledDate);
  const postsAllComplete = postsCount > 0 && (wf.posts ?? []).every(p =>
    p.scheduledDate && p.bio && (p.visuals?.length ?? 0) > 0
  );
  const postsAllVerified = postsCount > 0 && (wf.posts ?? []).every(p => p.verified);
  const postsAllPublished = postsCount > 0 && (wf.posts ?? []).every(p => p.published);
  const eventDatePassed = event.date ? new Date(event.date) < new Date() : false;

  // ── Step completion ──
  const stepCompletion: Record<string, boolean[]> = {
    preparation: [
      autoPlanCom || postsCount > 0 || !!wf.overrides.planComDone,
      !!wf.manual.shotgunDone,
      allVisualsReady || !!wf.overrides.visualsPrimaryReady,
    ],
    production: [
      allPostsHaveDate || !!wf.overrides.editorialCalDone,
      postsAllComplete || !!wf.overrides.postsReady,
      postsAllVerified,
      !!wf.manual.firstPostPublished && !!wf.manual.linktreeUpdated && !!wf.manual.facebookEventCreated,
    ],
    communication: sortedComPosts.length > 0
      ? [...sortedComPosts.map(p => !!p.published), eventDatePassed || !!wf.manual.eventDayPassed]
      : [postsAllPublished, eventDatePassed || !!wf.manual.eventDayPassed],
    postEvent: [
      !!wf.manual.photosPublished,
      !!wf.manual.statsAnalyzed,
    ],
  };

  // ── Navigation ──
  const currentPhase = wf.activePhase;
  const currentStep = wf.activeStep ?? 0;
  const phaseIndex = PHASE_ORDER.indexOf(currentPhase);
  const phaseSteps = PHASE_STEPS[currentPhase];
  const isLastStep = currentStep === phaseSteps.length - 1;
  const isLastPhase = phaseIndex === PHASE_ORDER.length - 1;
  const allPhaseComplete = stepCompletion[currentPhase].every(Boolean);

  const goToStep = (i: number) => updateWorkflow({ activeStep: i });
  const goNext = () => { if (!isLastStep) updateWorkflow({ activeStep: currentStep + 1 }); };
  const goPrev = () => { if (currentStep > 0) updateWorkflow({ activeStep: currentStep - 1 }); };
  const goNextPhase = () => {
    const next = PHASE_ORDER[phaseIndex + 1];
    if (next) updateWorkflow({ activePhase: next, activeStep: 0 });
  };
  const goPhase = (p: typeof PHASE_ORDER[number]) => {
    updateWorkflow({ activePhase: p, activeStep: 0 });
  };

  const steps = phaseSteps.map((label, i) => ({
    label,
    isCompleted: stepCompletion[currentPhase][i] ?? false,
  }));

  // ── Visuals ──
  const handleUpload = (_type: 'posterA4' | 'posterInsta' | 'posterShotgun', _file: File) => {};
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const renderVisualCard = (
    title: string, description: string, fileUrl: string | undefined,
    inputRef: React.RefObject<HTMLInputElement | null>,
    type: 'posterA4' | 'posterInsta' | 'posterShotgun'
  ) => {
    const saveUrl = () => {
      const url = visualUrlInputs[type].trim();
      if (!url) return;
      persistField({ media: { ...event.media, [type]: url } });
      setVisualUrlInputs(prev => ({ ...prev, [type]: '' }));
    };
    return (
      <div className="p-4 rounded-lg border border-dashed border-border-custom flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md border border-border-custom">
              <ImageIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{title}</h4>
              <p className="text-xs text-zinc-500">{description}</p>
            </div>
          </div>
          {fileUrl && (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-auto">
          <FileInput ref={inputRef} variant="hidden" accept="image/*"
            onChange={(e) => { if (e.target.files?.[0]) handleUpload(type, e.target.files[0]); }} />
          {fileUrl ? (
            <>
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8"
                onClick={() => handleDownload(fileUrl, `${type}.png`)}>
                <Download className="h-3 w-3 mr-1.5" /> Télécharger
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8 shrink-0"
                onClick={() => setDrivePickerPosterType(type)}>
                <ImageIcon className="h-3 w-3 mr-1.5" /> Drive
              </Button>
              <IconButton icon={Upload} ariaLabel="Remplacer" variant="ghost" size="sm" className="px-2 h-8"
                onClick={() => inputRef.current?.click()} title="Remplacer" />
            </>
          ) : (
            <div className="flex flex-1 flex-wrap gap-1">
              <Input
                type="url"
                size="sm"
                value={visualUrlInputs[type]}
                onChange={(e) => setVisualUrlInputs(prev => ({ ...prev, [type]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') saveUrl(); }}
                placeholder="https://..."
                className="flex-1 min-w-0 h-8"
              />
              <IconButton icon={Check} ariaLabel="Valider l'URL" variant="outline" size="sm" className="h-8 px-2"
                onClick={saveUrl} disabled={!visualUrlInputs[type].trim()} />
              <Button variant="outline" size="sm" className="h-8 text-xs shrink-0"
                onClick={() => setDrivePickerPosterType(type)}>
                <ImageIcon className="h-3 w-3 mr-1.5" /> Depuis Drive
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Step content ──
  const renderStep = () => {
    if (currentPhase === 'preparation') {
      switch (currentStep) {
        case 0: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Liste tous les posts et stories dont tu as besoin pour communiquer sur cet événement. Utilise la section Campagne ci-dessous pour les noter.
            </p>
            <div className={cn(
              'flex items-start gap-3 p-4 rounded-lg border',
              postsCount > 0 || autoPlanCom
                ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20'
                : 'border-border-custom bg-zinc-50 dark:bg-zinc-900/40'
            )}>
              {postsCount > 0 || autoPlanCom
                ? <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
                : <div className="w-4 h-4 rounded-full border-2 border-zinc-300 shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {postsCount > 0
                    ? `${postsCount} post${postsCount > 1 ? 's' : ''} planifié${postsCount > 1 ? 's' : ''}`
                    : autoPlanCom
                    ? 'Campagne liée avec des posts'
                    : 'Aucun post planifié pour le moment'
                  }
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {postsCount > 0
                    ? 'Consultez la section Campagne ci-dessous pour les détails.'
                    : 'Ajoute tes posts dans la section Campagne ci-dessous.'}
                </p>
              </div>
              {postsCount > 0 && <Badge variant="success" className="text-[10px] shrink-0">Auto</Badge>}
            </div>
            {postsCount === 0 && !autoPlanCom && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="planComOverride"
                  checked={!!wf.overrides.planComDone}
                  onChange={(e) => updateWorkflow({ overrides: { planComDone: e.target.checked } })}
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Marquer comme fait manuellement</span>
              </label>
            )}
          </div>
        );

        case 1: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Crée l&apos;événement sur Shotgun pour activer la billetterie en ligne.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">URL Shotgun</label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="https://shotgun.live/events/..."
                    value={wf.shotgunUrl || ''}
                    onChange={(e) => {
                      updateWorkflow({ shotgunUrl: e.target.value });
                      setSyncStatus('idle');
                    }}
                    fullWidth
                  />
                  {wf.shotgunUrl && (
                    <a
                      href={wf.shotgunUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 px-3 h-10 rounded-md border border-border-custom text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {wf.shotgunUrl && (
                    <IconButton
                      icon={syncStatus === 'loading' ? Loader2 : syncStatus === 'success' ? CheckCircle2 : RefreshCw}
                      ariaLabel="Synchroniser avec Shotgun"
                      variant="outline"
                      size="md"
                      onClick={handleSyncShotgun}
                      disabled={syncStatus === 'loading'}
                      title="Synchroniser avec Shotgun"
                      className={cn('shrink-0 px-3', syncStatus === 'loading' && '[&>svg]:animate-spin', syncStatus === 'success' && '[&>svg]:text-green-500')}
                    />
                  )}
                </div>
                {/* Feedback sync */}
                {syncStatus !== 'idle' && syncMessage && (
                  <p className={cn(
                    'text-xs mt-1.5',
                    syncStatus === 'success' && 'text-green-600 dark:text-green-400',
                    syncStatus === 'error' && 'text-amber-600 dark:text-amber-400',
                  )}>
                    {syncMessage}
                  </p>
                )}
                {/* Statut de liaison actuelle */}
                {event.shotgunEventId && syncStatus === 'idle' && (
                  <p className="text-xs mt-1.5 text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Lié à l&apos;event Shotgun #{event.shotgunEventId}
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="shotgunDone"
                  checked={!!wf.manual.shotgunDone}
                  onChange={(e) => updateWorkflow({ manual: { shotgunDone: e.target.checked } })}
                />
                <span className="text-sm font-medium">Event Shotgun créé et actif</span>
              </label>
            </div>
          </div>
        );

        case 2: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Le graphiste finalise les 3 visuels principaux en parallèle. Uploade-les ici une fois prêts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {renderVisualCard('Affiche A4', 'Format impression', event.media?.posterA4, posterA4InputRef, 'posterA4')}
              {renderVisualCard('Format Insta', 'Story (1080×1440)', event.media?.posterInsta, posterInstaInputRef, 'posterInsta')}
              {renderVisualCard('Format Shotgun', 'Bannière (1920×1080)', event.media?.posterShotgun, posterShotgunInputRef, 'posterShotgun')}
            </div>
            {!allVisualsReady && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="visualsPrimaryReady"
                  checked={!!wf.overrides.visualsPrimaryReady}
                  onChange={(e) => updateWorkflow({ overrides: { visualsPrimaryReady: e.target.checked } })}
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Marquer tous les visuels comme prêts manuellement</span>
              </label>
            )}
          </div>
        );
      }
    }

    if (currentPhase === 'production') {
      switch (currentStep) {
        case 0: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Assigne une date de publication à chaque post depuis la section Campagne ci-dessous.
            </p>
            {postsCount > 0 ? (
              <div className="space-y-2">
                {wf.posts!.map(post => (
                  <div key={post.id} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex items-center gap-2 min-w-0">
                      {post.type && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {TYPE_LABELS[post.type]}
                        </Badge>
                      )}
                      <span className="text-sm font-medium truncate">{post.name}</span>
                    </div>
                    {post.scheduledDate ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Check size={13} className="text-green-600" />
                        <span className="text-xs text-zinc-500">
                          {new Date(post.scheduledDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Pas de date
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-900/40">
                <div className="w-4 h-4 rounded-full border-2 border-zinc-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Aucun post créé pour le moment</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Ajoute tes posts dans la section Campagne ci-dessous.</p>
                </div>
              </div>
            )}
            {!allPostsHaveDate && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="editorialCalOverride"
                  checked={!!wf.overrides.editorialCalDone}
                  onChange={(e) => updateWorkflow({ overrides: { editorialCalDone: e.target.checked } })}
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Marquer comme fait manuellement</span>
              </label>
            )}
          </div>
        );

        case 1: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Vérifie que chaque post a son contenu complet : date de publication, bio/caption et au moins un visuel.
            </p>
            {postsCount > 0 ? (
              <div className="space-y-2">
                {wf.posts!.map(post => {
                  const missing: string[] = [];
                  if (!post.scheduledDate) missing.push('date');
                  if (!post.bio) missing.push('bio');
                  if ((post.visuals?.length ?? 0) === 0) missing.push('visuel');
                  const isComplete = missing.length === 0;
                  return (
                    <div key={post.id} className={cn(
                      'p-3 rounded-lg border transition-colors',
                      isComplete
                        ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20'
                        : 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          {post.type && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {TYPE_LABELS[post.type]}
                            </Badge>
                          )}
                          <span className="text-sm font-medium truncate">{post.name}</span>
                          {post.networks.map(n => (
                            <Chip key={n} label={NETWORK_LABELS[n]} variant="outline" className="text-[10px]" />
                          ))}
                        </div>
                        {isComplete
                          ? <Check size={15} className="text-green-600 shrink-0 mt-0.5" />
                          : <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        }
                      </div>
                      {!isComplete && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {missing.map(item => (
                            <Badge key={item} variant="warning" className="text-[10px]">
                              Manque : {item}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-900/40">
                <div className="w-4 h-4 rounded-full border-2 border-zinc-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Aucun post créé pour le moment</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Ajoute tes posts dans la section Campagne ci-dessous.</p>
                </div>
              </div>
            )}
            {!postsAllComplete && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="postsReadyOverride"
                  checked={!!wf.overrides.postsReady}
                  onChange={(e) => updateWorkflow({ overrides: { postsReady: e.target.checked } })}
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Marquer comme fait manuellement</span>
              </label>
            )}
          </div>
        );

        case 2: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Relisez et validez le contenu de chaque post avant publication.
            </p>
            {postsCount > 0 ? (
              <div className="space-y-2">
                {wf.posts!.map(post => (
                  <div key={post.id} className={cn(
                    'p-3 rounded-lg border transition-colors',
                    post.verified
                      ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20'
                      : 'border-border-custom bg-zinc-50 dark:bg-zinc-900/40'
                  )}>
                    <label htmlFor={`verify-${post.id}`} className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        id={`verify-${post.id}`}
                        checked={!!post.verified}
                        onChange={(e) => {
                          const updated = (wf.posts ?? []).map(p =>
                            p.id === post.id ? { ...p, verified: e.target.checked } : p
                          );
                          updateWorkflow({ posts: updated });
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.type && (
                            <Badge variant="secondary" className="text-[10px]">
                              {TYPE_LABELS[post.type]}
                            </Badge>
                          )}
                          <span className="text-sm font-medium">{post.name}</span>
                          {post.networks.map(n => (
                            <Chip key={n} label={NETWORK_LABELS[n]} variant="outline" className="text-[10px]" />
                          ))}
                        </div>
                        {post.bio && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{post.bio}</p>
                        )}
                        {post.scheduledDate && (
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {new Date(post.scheduledDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      {post.verified && <Check size={14} className="text-green-600 shrink-0 mt-0.5" />}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-900/40">
                <div className="w-4 h-4 rounded-full border-2 border-zinc-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Aucun post créé pour le moment</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Ajoute tes posts dans la section Campagne ci-dessous.</p>
                </div>
              </div>
            )}
          </div>
        );

        case 3: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Lance l&apos;annonce officielle de l&apos;événement. Le premier post doit être publié et le Linktree mis à jour avec le lien de billetterie.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-custom hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <Checkbox
                  id="firstPost"
                  checked={!!wf.manual.firstPostPublished}
                  onChange={(e) => updateWorkflow({ manual: { firstPostPublished: e.target.checked } })}
                />
                <div>
                  <p className="text-sm font-medium">1er post publié</p>
                  <p className="text-xs text-zinc-500">Post d&apos;annonce de l&apos;événement sur les réseaux</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-custom hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <Checkbox
                  id="linktree"
                  checked={!!wf.manual.linktreeUpdated}
                  onChange={(e) => updateWorkflow({ manual: { linktreeUpdated: e.target.checked } })}
                />
                <div>
                  <p className="text-sm font-medium">Linktree mis à jour</p>
                  <p className="text-xs text-zinc-500">Lien Shotgun ajouté dans le Linktree</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-custom hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <Checkbox
                  id="facebookEvent"
                  checked={!!wf.manual.facebookEventCreated}
                  onChange={(e) => updateWorkflow({ manual: { facebookEventCreated: e.target.checked } })}
                />
                <div>
                  <p className="text-sm font-medium">Event Facebook créé</p>
                  <p className="text-xs text-zinc-500">Événement publié sur la page Facebook</p>
                </div>
              </label>
            </div>
          </div>
        );
      }
    }

    if (currentPhase === 'communication') {
      const isJourEventStep = sortedComPosts.length > 0
        ? currentStep === sortedComPosts.length
        : currentStep === 1;

      if (isJourEventStep || (sortedComPosts.length === 0 && currentStep === 1)) {
        const eventDate = event.date ? new Date(event.date) : null;
        const isEventPast = eventDate ? eventDate < new Date() : false;
        return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Le jalon final de la communication — la date de l&apos;événement.
            </p>
            {eventDate && (
              <div className={cn(
                'flex items-center gap-4 p-4 rounded-lg border',
                isEventPast || !!wf.manual.eventDayPassed
                  ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20'
                  : 'border-border-custom bg-zinc-50 dark:bg-zinc-900/40'
              )}>
                <div className="w-12 h-12 rounded-lg bg-zinc-900 dark:bg-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase text-white dark:text-zinc-900 tracking-wider">
                    {eventDate.toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold leading-tight text-white dark:text-zinc-900">
                    {eventDate.getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{event.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {event.location && (
                    <p className="text-xs text-zinc-400 mt-0.5">{event.location}</p>
                  )}
                </div>
                {(isEventPast || !!wf.manual.eventDayPassed) && (
                  <Badge variant="success" className="text-[10px] shrink-0">
                    {isEventPast ? 'Auto' : 'Manuel'}
                  </Badge>
                )}
              </div>
            )}
            {!isEventPast && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="eventDayPassed"
                  checked={!!wf.manual.eventDayPassed}
                  onChange={(e) => updateWorkflow({ manual: { eventDayPassed: e.target.checked } })}
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">L&apos;événement a eu lieu</span>
              </label>
            )}
          </div>
        );
      }

      if (sortedComPosts.length > 0) {
        const post = sortedComPosts[currentStep];
        if (!post) return null;
        return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Publie ce post selon le calendrier prévu et coche-le une fois mis en ligne.
            </p>
            <div className={cn(
              'p-4 rounded-lg border transition-colors',
              post.published
                ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20'
                : 'border-border-custom bg-zinc-50 dark:bg-zinc-900/40'
            )}>
              <label htmlFor={`pub-${post.id}`} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  id={`pub-${post.id}`}
                  checked={!!post.published}
                  onChange={(e) => {
                    const updated = (wf.posts ?? []).map(p =>
                      p.id === post.id ? { ...p, published: e.target.checked } : p
                    );
                    updateWorkflow({ posts: updated });
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.type && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {TYPE_LABELS[post.type]}
                      </Badge>
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      post.published && 'line-through text-zinc-400 dark:text-zinc-600'
                    )}>
                      {post.name}
                    </span>
                    {post.networks.map(n => (
<Chip key={n} label={NETWORK_LABELS[n]} variant="outline" className="text-[10px]" />
                    ))}
                  </div>
                  {post.scheduledDate ? (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(post.scheduledDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {' · '}
                      <span className="font-medium">{getPostDayLabel(post.scheduledDate).replace('\n', ' ')}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                      <AlertTriangle size={11} /> Pas de date planifiée
                    </p>
                  )}
                </div>
                {post.published && <Check size={14} className="text-green-600 shrink-0" />}
              </label>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Publie chaque post selon le calendrier prévu et coche-le une fois mis en ligne.
          </p>
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-900/40">
            <div className="w-4 h-4 rounded-full border-2 border-zinc-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Aucun post planifié</p>
              <p className="text-xs text-zinc-500 mt-0.5">Crée tes posts dans la section Campagne ci-dessous.</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentPhase === 'postEvent') {
      switch (currentStep) {
        case 0: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Publie les photos et vidéos de l&apos;événement sur les réseaux sociaux.
            </p>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-custom hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <Checkbox
                id="photosPublished"
                checked={!!wf.manual.photosPublished}
                onChange={(e) => updateWorkflow({ manual: { photosPublished: e.target.checked } })}
              />
              <div>
                <p className="text-sm font-medium">Photos & vidéos publiées</p>
                <p className="text-xs text-zinc-500">Photos de l&apos;événement partagées sur les réseaux</p>
              </div>
            </label>
          </div>
        );

        case 1: return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Analyse les performances de la campagne de communication et note les enseignements pour les prochains événements.
            </p>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border-custom hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <Checkbox
                id="statsAnalyzed"
                checked={!!wf.manual.statsAnalyzed}
                onChange={(e) => updateWorkflow({ manual: { statsAnalyzed: e.target.checked } })}
              />
              <div>
                <p className="text-sm font-medium">Bilan réalisé</p>
                <p className="text-xs text-zinc-500">Statistiques analysées — portée, engagement, billeterie</p>
              </div>
            </label>
          </div>
        );
      }
    }

    return null;
  };

  // ── Campaign tab helpers ──
  const NETWORKS: { id: PostNetwork; label: string; color: string; activeColor: string }[] = [
    { id: 'instagram', label: 'Instagram', color: 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-pink-300 hover:text-pink-600', activeColor: 'border-pink-400 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400' },
    { id: 'facebook',  label: 'Facebook',  color: 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-blue-300 hover:text-blue-600',  activeColor: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' },
    { id: 'tiktok',    label: 'TikTok',    color: 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100', activeColor: 'border-zinc-800 dark:border-zinc-200 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' },
  ];
  const POST_TYPES: { id: PostType; label: string }[] = [
    { id: 'post',       label: 'Post' },
    { id: 'reel',       label: 'Réel' },
    { id: 'story',      label: 'Story' },
    { id: 'newsletter', label: 'Newsletter' },
  ];

  const getVisualAspect = (type?: PostType) =>
    (type === 'reel' || type === 'story') ? 'aspect-[9/16]' : 'aspect-[3/4]';

  const toggleNetwork = (n: PostNetwork) =>
    setNewPostNetworks(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

  const resetForm = () => {
    setShowAddPost(false);
    setNewPostName('');
    setNewPostDesc('');
    setNewPostNetworks([]);
    setNewPostType(undefined);
  };

  const updatePost = (postId: string, updates: Partial<ComWorkflowPost>) => {
    const updatedPosts = (wf.posts ?? []).map(p =>
      p.id === postId ? { ...p, ...updates } : p
    );
    updateWorkflow({ posts: updatedPosts });
  };

  const deletePost = (postId: string) => {
    updateWorkflow({ posts: (wf.posts ?? []).filter(p => p.id !== postId) });
    if (editingPostId === postId) {
      setEditingPostId(null);
    }
  };

  const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv|ogv)(\?.*)?$/i;

  const getGoogleDriveEmbed = (url: string): string | null => {
    const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
  };

  /** URL Drive pour affichage img (export=view) */
  const getGoogleDriveViewUrl = (url: string): string => {
    const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    return m ? `https://drive.google.com/uc?export=view&id=${m[1]}` : url;
  };

  /** URL de téléchargement direct (Drive → export, autres → URL d'origine) */
  const getDownloadUrl = (url: string): string => {
    const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
    const dropbox = getDropboxDirect(url);
    return dropbox ?? url;
  };

  const getDropboxDirect = (url: string): string | null => {
    if (!url.includes('dropbox.com')) return null;
    return url.replace(/[?&]dl=0/, '').replace(/dropbox\.com/, 'dl.dropboxusercontent.com');
  };

  const detectMediaType = (url: string): 'image' | 'video' => {
    const u = url.trim();
    if (VIDEO_EXTENSIONS.test(u)) return 'video';
    if (getGoogleDriveEmbed(u)) return 'video';
    if (getDropboxDirect(u) && /\.(mp4|webm|mov)(\?|$)/i.test(u)) return 'video';
    return 'image';
  };

  const renderMedia = (v: PostVisual) => {
    const u = v.url;
    const driveEmbed = getGoogleDriveEmbed(u);
    const dropboxDirect = getDropboxDirect(u);
    const isVideoType = v.mediaType === 'video' || (!v.mediaType && detectMediaType(u) === 'video');

    if (driveEmbed) {
      return <iframe src={driveEmbed} className="w-full h-full border-0" allow="autoplay" allowFullScreen title="Visuel Google Drive" />;
    }
    if (isVideoType) {
      const src = dropboxDirect ?? u;
      return (
        <video src={src} className="w-full h-full object-cover" muted loop playsInline
          onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
          onMouseLeave={e => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
        />
      );
    }
    return <img src={u} alt="Visuel" className="w-full h-full object-cover" />;
  };

  const isVideoVisual = (v: PostVisual) =>
    v.mediaType === 'video' || (!v.mediaType && detectMediaType(v.url) === 'video') || !!getGoogleDriveEmbed(v.url);

  const addVisual = (postId: string, url: string) => {
    if (!url.trim()) return;
    const post = (wf.posts ?? []).find(p => p.id === postId);
    if (!post) return;
    const newVisual: PostVisual = {
      id: Date.now().toString(),
      url: url.trim(),
      mediaType: detectMediaType(url),
      createdAt: new Date().toISOString(),
    };
    updatePost(postId, { visuals: [...(post.visuals ?? []), newVisual] });
  };

  const removeVisual = (postId: string, visualId: string) => {
    const post = (wf.posts ?? []).find(p => p.id === postId);
    if (!post) return;
    updatePost(postId, { visuals: (post.visuals ?? []).filter(v => v.id !== visualId) });
  };

  const saveVisualUrl = (postId: string, visualId: string, url: string) => {
    if (!url.trim()) return;
    const post = (wf.posts ?? []).find(p => p.id === postId);
    if (!post) return;
    updatePost(postId, {
      visuals: (post.visuals ?? []).map(v =>
        v.id === visualId ? { ...v, url: url.trim(), mediaType: detectMediaType(url) } : v
      ),
    });
    setEditingVisualId(null);
    setEditingVisualUrl('');
  };

  const toggleEditPost = (postId: string) => {
    setEditingPostId(editingPostId === postId ? null : postId);
    setEditingVisualId(null);
    setEditingVisualUrl('');
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<FileImage size={28} />}
        title="Campagne"
        subtitle="Visuels, affiches et supports de communication."
      />

      {/* Phase indicator */}
      <div className="flex items-center gap-1">
        {PHASE_ORDER.map((p, i) => (
          <React.Fragment key={p}>
            <Button
              type="button"
              variant={p === currentPhase ? 'primary' : 'ghost'}
              size="xs"
              onClick={() => goPhase(p)}
              className={cn(
                'rounded-full',
                p !== currentPhase && 'text-zinc-500 hover:text-foreground'
              )}
            >
              {PHASE_LABELS[p]}
            </Button>
            {i < PHASE_ORDER.length - 1 && (
              <ChevronRight size={12} className="text-zinc-300 dark:text-zinc-700 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stepper */}
      <WorkflowStepper steps={steps} currentStep={currentStep} onStepChange={goToStep} />

      {/* Step content */}
      <div className="min-h-[180px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border-custom">
        {currentStep > 0 ? (
          <Button variant="ghost" size="sm" onClick={goPrev}>
            <ArrowLeft size={15} /> Précédent
          </Button>
        ) : <div />}

        {!isLastStep ? (
          <Button variant="outline" size="sm" onClick={goNext}>
            Étape suivante <ChevronRight size={15} />
          </Button>
        ) : !isLastPhase ? (
          <Button
            variant="primary"
            size="sm"
            onClick={goNextPhase}
            disabled={!allPhaseComplete}
            title={!allPhaseComplete ? 'Complète toutes les étapes pour continuer' : undefined}
          >
            Phase suivante <ChevronRight size={15} />
          </Button>
        ) : (
          <div />
        )}
      </div>

      {/* Campaign section */}
      <div className="border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 pt-8">

        <TabSwitcher<'campagne' | 'shotgun' | 'instagram'>
          options={[
            { value: 'campagne', label: 'Campagne' },
            ...(event.shotgunEventId
              ? [{ value: 'shotgun' as const, label: 'Shotgun' }]
              : []),
            ...(metaConnected ? [{ value: 'instagram' as const, label: 'Instagram' }] : []),
          ]}
          value={wfSectionTab}
          onChange={setWfSectionTab}
          className="mb-6"
        />

        {wfSectionTab === 'campagne' && (
          <div className="space-y-3">

            {/* Post list */}
            {wf.posts!.map((post) => (
              <EditableCard
                key={post.id}
                isEditing={editingPostId === post.id}
                onEdit={() => toggleEditPost(post.id)}
                onCloseEdit={() => toggleEditPost(post.id)}
                onDelete={() => deletePost(post.id)}
                headerPadding="sm"
                headerContent={
                  <>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 self-start">
                      <FileText size={20} className="text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.type && (
                          <Badge variant="default" className="text-[10px] shrink-0">
                            {TYPE_LABELS[post.type]}
                          </Badge>
                        )}
                        <p className="text-sm font-medium leading-snug">{post.name}</p>
                      </div>
                      {post.networks?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {post.networks.map(n => (
                            <span key={n} className={cn(
                              'text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
                              n === 'instagram' ? 'border-pink-300 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400' :
                              n === 'facebook'  ? 'border-blue-300 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' :
                              'border-zinc-800 dark:border-zinc-200 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                            )}>
                              {NETWORK_LABELS[n]}
                            </span>
                          ))}
                        </div>
                      )}
                      {post.description && (
                        <p className="text-xs text-zinc-500 mt-1.5 whitespace-pre-wrap leading-relaxed">{post.description}</p>
                      )}
                    </div>
                  </>
                }
                editContent={
                  <>
                    {/* Infos de base */}
                    <div className="space-y-3 pb-3 border-b border-border-custom">
                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Nom</Label>
                        <Input
                          key={`name-${post.id}`}
                          defaultValue={post.name}
                          onBlur={(e) => { if (e.target.value !== post.name) updatePost(post.id, { name: e.target.value }); }}
                          placeholder="Ex : Story annonce, Post affiche..."
                          fullWidth
                          size="sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Type</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {POST_TYPES.map(pt => (
                            <Button
                              key={pt.id}
                              type="button"
                              variant={post.type === pt.id ? 'primary' : 'outline'}
                              size="xs"
                              onClick={() => updatePost(post.id, { type: pt.id })}
                              className="rounded-full"
                            >
                              {pt.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Réseaux</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {NETWORKS.map(net => {
                            const active = (post.networks ?? []).includes(net.id);
                            return (
                              <Button
                                key={net.id}
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => updatePost(post.id, {
                                  networks: active
                                    ? (post.networks ?? []).filter(x => x !== net.id)
                                    : [...(post.networks ?? []), net.id],
                                })}
                                className={cn('rounded-full font-medium', active ? net.activeColor : net.color)}
                              >
                                {net.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Description</Label>
                        <Input
                          key={`desc-${post.id}`}
                          defaultValue={post.description ?? ''}
                          onBlur={(e) => { if (e.target.value !== (post.description ?? '')) updatePost(post.id, { description: e.target.value }); }}
                          placeholder="Notes ou description du post..."
                          fullWidth
                          size="sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Date de publication</label>
                      <DatePicker
                        date={post.scheduledDate ? new Date(post.scheduledDate) : undefined}
                        onSelect={(date) => updatePost(post.id, { scheduledDate: date?.toISOString() })}
                        placeholder="Choisir une date"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Bio / Caption</label>
                      <Textarea
                        key={`bio-${post.id}`}
                        defaultValue={post.bio ?? ''}
                        onBlur={(e) => { if (e.target.value !== (post.bio ?? '')) updatePost(post.id, { bio: e.target.value }); }}
                        rows={3}
                        placeholder="Caption, texte du post, hashtags..."
                        className="resize-none"
                      />
                    </div>

                    {/* Visuals slider */}
                    <div>
                      <label className="text-xs font-medium text-zinc-500 mb-2 block uppercase tracking-wide">
                        Visuels
                        {(post.visuals?.length ?? 0) > 0 && (
                          <span className="ml-1.5 text-zinc-400 normal-case font-normal">({post.visuals!.length})</span>
                        )}
                      </label>

                      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>

                        {(post.visuals ?? []).map(v => {
                          const isEditingThis = editingVisualId === v.id;
                          const isVideo = isVideoVisual(v);
                          return (
                            <div key={v.id} className="flex-none rounded-lg overflow-hidden border border-border-custom bg-zinc-100 dark:bg-zinc-800 relative group"
                              style={{ width: 'calc((100% - 2rem) / 5)', scrollSnapAlign: 'start' }}>
                              <div className={cn('w-full relative', getVisualAspect(post.type))}>
                                {renderMedia(v)}
                                {isVideo && !isEditingThis && (
                                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/60 rounded px-1 py-0.5 pointer-events-none">
                                    <Play size={8} className="text-white fill-white" />
                                    <span className="text-[8px] text-white font-medium">Vidéo</span>
                                  </div>
                                )}
                                {!isEditingThis && (
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                    <a
                                      href={getDownloadUrl(v.url)}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-[10px] font-medium text-white bg-white/20 hover:bg-white/30 rounded px-2 py-1 w-full justify-center border-0 no-underline"
                                    >
                                      <Download size={10} /> Télécharger
                                    </a>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => { setEditingVisualId(v.id); setEditingVisualUrl(v.url); }}
                                      className="flex items-center gap-1 text-[10px] font-medium text-white bg-white/20 hover:bg-white/30 rounded px-2 py-1 w-full justify-center border-0"
                                    >
                                      <Link2 size={10} /> Modifier URL
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="xs"
                                      onClick={() => removeVisual(post.id, v.id)}
                                      className="flex items-center gap-1 text-[10px] font-medium text-white bg-red-500/70 hover:bg-red-500/90 rounded px-2 py-1 w-full justify-center border-0"
                                    >
                                      <Trash2 size={10} /> Supprimer
                                    </Button>
                                  </div>
                                )}
                                {isEditingThis && (
                                  <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center gap-2 p-2">
                                    <Link2 size={14} className="text-zinc-400 shrink-0" />
                                    <Input
                                      type="url"
                                      size="xs"
                                      value={editingVisualUrl}
                                      onChange={(e) => setEditingVisualUrl(e.target.value)}
                                      autoFocus
                                      placeholder="Nouvelle URL..."
                                      className="w-full text-[10px] px-1.5 py-1 rounded border border-zinc-600 bg-zinc-800 text-white text-center focus:outline-none focus:border-zinc-400"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveVisualUrl(post.id, v.id, editingVisualUrl);
                                        if (e.key === 'Escape') { setEditingVisualId(null); setEditingVisualUrl(''); }
                                      }}
                                    />
                                    <ConfirmActions
                                      compact
                                      overlay
                                      onConfirm={() => saveVisualUrl(post.id, v.id, editingVisualUrl)}
                                      onCancel={() => { setEditingVisualId(null); setEditingVisualUrl(''); }}
                                      disabled={!editingVisualUrl.trim()}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Add visual card */}
                        <div className="flex-none" style={{ width: 'calc((100% - 2rem) / 5)', scrollSnapAlign: 'start' }}>
                          <div className={cn(
                            'w-full rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/40',
                            getVisualAspect(post.type)
                          )}>
                            <div className="flex items-center gap-1 text-zinc-300 dark:text-zinc-600">
                              <ImageIcon size={14} />
                              <Play size={12} className="fill-current" />
                            </div>
                            <Button
                              type="button"
                              variant="primary"
                              size="xs"
                              onClick={() => setDrivePickerPostId(post.id)}
                              className="text-[10px] font-medium px-2 py-0.5"
                            >
                              <Plus size={12} className="mr-1" />
                              Ajouter
                            </Button>
                          </div>
                        </div>

                      </div>
                    </div>

                  </>
                }
              />
            ))}

            {/* Empty state */}
            {postsCount === 0 && !showAddPost && (
              <EmptyState
                icon={FileText}
                title="Aucun post planifié"
                description="Commence par noter les posts et stories dont tu as besoin pour communiquer cet événement."
                action={
                  <Button variant="outline" size="sm" onClick={() => setShowAddPost(true)}>
                    <Plus size={14} /> Ajouter un post
                  </Button>
                }
                variant="full"
              />
            )}

            {/* Add button */}
            {postsCount > 0 && !showAddPost && (
              <Button variant="ghost" size="sm" onClick={() => setShowAddPost(true)}>
                <Plus size={14} /> Ajouter un post
              </Button>
            )}

            {/* Add post form */}
            {showAddPost && (
              <div className="p-4 rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-900/40 space-y-4">

                <div className="flex items-center gap-2.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={newPostType ? 'primary' : 'outline'}
                        size="xs"
                        className={cn(
                          'rounded-full shrink-0',
                          !newPostType && 'border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                        )}
                      >
                        {newPostType ? TYPE_LABELS[newPostType] : 'Type'}
                        <ChevronDown size={11} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-1" align="start">
                      {POST_TYPES.map(pt => (
                        <Button
                          key={pt.id}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewPostType(newPostType === pt.id ? undefined : pt.id)}
                          className={cn(
                            'w-full justify-between font-normal',
                            newPostType === pt.id && 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                          )}
                        >
                          {pt.label}
                          {newPostType === pt.id && <Check size={13} className="text-zinc-600 dark:text-zinc-400" />}
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <h4 className="text-sm font-semibold">Nouveau post</h4>
                </div>

                <div>
                  <Label className="text-xs font-medium text-zinc-500 mb-1.5 block">Nom *</Label>
                  <Input placeholder="Ex : Story annonce, Post affiche, Reel DJ..." value={newPostName} onChange={(e) => setNewPostName(e.target.value)} fullWidth autoFocus
                    onKeyDown={(e) => { if (e.key === 'Escape') resetForm(); }} />
                </div>

                <div>
                  <Label className="text-xs font-medium text-zinc-500 mb-2 block">Réseaux</Label>
                  <div className="flex flex-wrap gap-2">
                    {NETWORKS.map(net => {
                      const active = newPostNetworks.includes(net.id);
                      return (
                        <Button
                          key={net.id}
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => toggleNetwork(net.id)}
                          className={cn('rounded-full font-medium', active ? net.activeColor : net.color)}
                        >
                          {net.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-zinc-500 mb-1.5 block">Notes / idées</Label>
                  <Textarea placeholder="Format, message, tonalité, contenu visuel prévu..." value={newPostDesc} onChange={(e) => setNewPostDesc(e.target.value)} rows={3} className="resize-none" />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" disabled={!newPostName.trim()}
                    onClick={() => {
                      if (!newPostName.trim()) return;
                      const newPost: ComWorkflowPost = {
                        id: Date.now().toString(),
                        name: newPostName.trim(),
                        description: newPostDesc.trim(),
                        networks: newPostNetworks,
                        type: newPostType,
                        createdAt: new Date().toISOString(),
                      };
                      updateWorkflow({ posts: [...(wf.posts ?? []), newPost] });
                      resetForm();
                    }}>
                    Ajouter
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetForm}>Annuler</Button>
                </div>
              </div>
            )}

          </div>
        )}

        {wfSectionTab === 'shotgun' && event.shotgunEventId && (
          <EventShotgunStats />
        )}

        {wfSectionTab === 'instagram' && (
          <EventInstagramStats />
        )}

      </div>

      {activeOrg && (
        <DrivePickerModal
          isOpen={!!drivePickerPostId || !!drivePickerPosterType}
          onClose={() => { setDrivePickerPostId(null); setDrivePickerPosterType(null); }}
          onSelect={(url) => {
            if (drivePickerPostId) {
              addVisual(drivePickerPostId, url);
              setDrivePickerPostId(null);
            }
            if (drivePickerPosterType) {
              const imgUrl = url.includes('drive.google.com') ? getGoogleDriveViewUrl(url) : url;
              persistField({ media: { ...event.media, [drivePickerPosterType]: imgUrl } });
              setDrivePickerPosterType(null);
            }
          }}
          orgId={activeOrg.id}
        />
      )}

    </div>
  );
}
