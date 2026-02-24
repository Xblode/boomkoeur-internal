'use client';

import { useState, useEffect, useCallback } from 'react';
import { Meeting, AgendaDocument } from '@/types/meeting';
import { Button, IconButton, Input, Label, Textarea } from '@/components/ui/atoms';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Plus, Trash2, CheckCircle2, Vote, FileText, Eye, ArrowLeft, ChevronDown, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useOrg } from '@/hooks';
import { isGoogleDocUrl, isGoogleSheetUrl } from '@/lib/integrations/google-utils';

interface PresentationModeProps {
  meeting: Meeting;
}

interface VoteOption {
  id: string;
  label: string;
  voters: string[];
}

interface VoteState {
  question: string;
  options: VoteOption[];
}

export default function PresentationMode({ meeting }: PresentationModeProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [liveNotes, setLiveNotes] = useState('');
  
  // Vote management
  const [voteState, setVoteState] = useState<VoteState>({
    question: '',
    options: [
      { id: 'approve', label: 'Approuvé', voters: [] },
      { id: 'reject', label: 'Rejeté', voters: [] },
      { id: 'abstain', label: 'Abstention', voters: [] },
    ],
  });
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [activeTab, setActiveTab] = useState<'vote' | 'notes'>('notes'); // Tab pour basculer entre vote et notes (par défaut notes)
  
  // Document viewer: { doc, type, content?, values?, loading, error }
  type DocViewState = {
    doc: AgendaDocument;
    type: 'doc' | 'sheet' | 'pdf' | 'external';
    content?: string;
    values?: string[][];
    loading: boolean;
    error?: string;
  } | null;
  const [selectedDocument, setSelectedDocument] = useState<DocViewState | null>(null);
  const { activeOrg } = useOrg();

  const fetchDocContent = useCallback(
    async (doc: AgendaDocument): Promise<DocViewState> => {
      const url = doc.url || '';
      if (!activeOrg) {
        return { doc, type: 'external', loading: false, error: 'Organisation non disponible' };
      }
      if (isGoogleDocUrl(url)) {
        try {
          const res = await fetch(
            `/api/admin/integrations/google/docs/content?org_id=${encodeURIComponent(activeOrg.id)}&url=${encodeURIComponent(url)}`
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? 'Erreur chargement');
          return { doc, type: 'doc', content: data.content ?? '', loading: false };
        } catch (err) {
          return {
            doc,
            type: 'doc',
            loading: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue',
          };
        }
      }
      if (isGoogleSheetUrl(url)) {
        try {
          const res = await fetch(
            `/api/admin/integrations/google/sheets/content?org_id=${encodeURIComponent(activeOrg.id)}&url=${encodeURIComponent(url)}`
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? 'Erreur chargement');
          return { doc, type: 'sheet', values: data.values ?? [], loading: false };
        } catch (err) {
          return {
            doc,
            type: 'sheet',
            loading: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue',
          };
        }
      }
      if (url.toLowerCase().endsWith('.pdf') || url.includes('drive.google.com') && url.includes('/file/d/')) {
        return { doc, type: 'pdf', loading: false };
      }
      return { doc, type: 'external', loading: false };
    },
    [activeOrg]
  );

  const openDocument = useCallback(
    (doc: AgendaDocument) => {
      const url = doc.url || '';
      if (isGoogleDocUrl(url) || isGoogleSheetUrl(url)) {
        setSelectedDocument({ doc, type: url.includes('spreadsheets') ? 'sheet' : 'doc', loading: true });
      } else if (url.toLowerCase().endsWith('.pdf') || (url.includes('drive.google.com') && url.includes('/file/d/'))) {
        setSelectedDocument({ doc, type: 'pdf', loading: false });
      } else {
        setSelectedDocument({ doc, type: 'external', loading: false });
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedDocument || !selectedDocument.loading || !activeOrg) return;
    let cancelled = false;
    fetchDocContent(selectedDocument.doc).then((result) => {
      if (!cancelled) setSelectedDocument(result);
    });
    return () => { cancelled = true; };
  }, [selectedDocument?.doc.id, selectedDocument?.loading, activeOrg?.id, fetchDocContent]);
  
  // Accordion pour les descriptions
  const [expandedAgendaItem, setExpandedAgendaItem] = useState<number>(0); // Par défaut, le premier item est ouvert

  const currentItem = meeting.agenda[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setExpandedAgendaItem(newIndex); // Ouvrir l'accordéon du nouveau point
      resetTimer();
      resetVote();
      setSelectedDocument(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < meeting.agenda.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setExpandedAgendaItem(newIndex); // Ouvrir l'accordéon du nouveau point
      resetTimer();
      resetVote();
      setSelectedDocument(null);
    }
  };

  const closeDocument = () => {
    setSelectedDocument(null);
  };

  const resetVote = () => {
    setVoteState({
      question: '',
      options: [
        { id: 'approve', label: 'Approuvé', voters: [] },
        { id: 'reject', label: 'Rejeté', voters: [] },
        { id: 'abstain', label: 'Abstention', voters: [] },
      ],
    });
    setActiveTab('notes'); // Revenir sur notes par défaut
  };

  const addVoteOption = () => {
    if (!newOptionLabel.trim()) return;
    
    const newOption: VoteOption = {
      id: `option-${Date.now()}`,
      label: newOptionLabel.trim(),
      voters: [],
    };
    
    setVoteState(prev => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
    setNewOptionLabel('');
  };

  const removeVoteOption = (optionId: string) => {
    setVoteState(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== optionId),
    }));
  };

  const toggleVoter = (optionId: string, voter: string) => {
    setVoteState(prev => {
      const options = prev.options.map(opt => {
        if (opt.id === optionId) {
          const hasVoter = opt.voters.includes(voter);
          return {
            ...opt,
            voters: hasVoter 
              ? opt.voters.filter(v => v !== voter)
              : [...opt.voters, voter],
          };
        }
        // Retirer le votant des autres options
        return {
          ...opt,
          voters: opt.voters.filter(v => v !== voter),
        };
      });
      
      return { ...prev, options };
    });
  };

  const getVoteSummary = () => {
    const total = meeting.participants.length;
    const voted = new Set<string>();
    
    voteState.options.forEach(opt => {
      opt.voters.forEach(voter => voted.add(voter));
    });
    
    return {
      total,
      voted: voted.size,
      notVoted: total - voted.size,
    };
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };

  const handleExit = () => {
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useState(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  });

  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center text-foreground">
        <div className="text-center">
          <p className="text-xl mb-4">Aucun point à l'ordre du jour</p>
          <Button onClick={handleExit} variant="outline">
            Quitter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col text-foreground overflow-hidden">
      {/* Main Content - Prend toute la hauteur moins la toolbar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Point actuel & Documents */}
        <div className={cn(
          "p-6 overflow-y-auto border-r border-border-custom transition-all duration-300 order-1",
          selectedDocument ? "w-1/4" : "w-3/5"
        )}>
          {/* Current Item */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-bold dark:bg-white dark:text-zinc-900">
                {currentIndex + 1}
              </div>
              <h2 className="text-3xl font-bold">{currentItem.title}</h2>
            </div>

            {currentItem.responsible && (
              <p className="text-lg text-muted-foreground mb-2 ml-[52px]">
                Responsable: <span className="text-foreground font-semibold">{currentItem.responsible}</span>
              </p>
            )}

            {currentItem.description && (
              <p className="text-base text-muted-foreground mb-3 ml-[52px] leading-relaxed">
                {currentItem.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm text-muted-foreground ml-[52px]">
              <span>Durée: {currentItem.duration} min</span>
              {currentItem.requiresVote && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium dark:bg-amber-900/30 dark:text-amber-400">
                  Point de décision
                </span>
              )}
            </div>
          </div>

          {/* All Agenda Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Ordre du jour complet</h3>
            <div className="space-y-1.5">
              {meeting.agenda.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-lg transition-all border text-sm overflow-hidden",
                    idx === currentIndex
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                      : "bg-card text-muted-foreground border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (idx !== currentIndex) {
                        // Si on clique sur un point différent, changer le point actif
                        setCurrentIndex(idx);
                        setExpandedAgendaItem(idx);
                        resetTimer();
                        resetVote();
                        setSelectedDocument(null);
                      } else {
                        // Si on clique sur le point actuel, juste toggle l'accordéon
                        setExpandedAgendaItem(expandedAgendaItem === idx ? -1 : idx);
                      }
                    }}
                    className="w-full p-2.5 flex items-center justify-between cursor-pointer rounded-none h-auto"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform",
                          expandedAgendaItem === idx ? "rotate-180" : ""
                        )}
                      />
                      <span className="font-medium">{idx + 1}. {item.title}</span>
                    </div>
                    <span className="text-xs opacity-80">{item.duration}min</span>
                  </Button>
                  
                  {/* Accordéon - Description */}
                  {expandedAgendaItem === idx && item.description && (
                    <div className={cn(
                      "px-4 pb-3 text-xs leading-relaxed",
                      idx === currentIndex 
                        ? "text-white/90 dark:text-zinc-900/90" 
                        : "text-muted-foreground"
                    )}>
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          {currentItem.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Documents</h3>
              <div className="grid gap-2">
                {currentItem.documents.map((doc) => (
                  <Button
                    key={doc.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => openDocument(doc)}
                    className="p-3 bg-card rounded-lg border border-border-custom flex items-center gap-2 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left w-full h-auto justify-start"
                  >
                    <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
                      <span className="text-xs font-bold text-zinc-500">DOC</span>
                    </div>
                    <p className="text-sm font-medium flex-1">{doc.name}</p>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Document Viewer Sidebar */}
        {selectedDocument && (
          <div className="w-1/2 flex flex-col overflow-hidden bg-card order-3">
            {/* Header du document */}
            <div className="border-b border-border-custom p-4 flex items-center gap-3 shrink-0">
              <IconButton
                icon={<ArrowLeft size={18} />}
                ariaLabel="Retour"
                variant="ghost"
                size="sm"
                onClick={closeDocument}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center dark:bg-zinc-800 shrink-0">
                  <span className="text-xs font-bold text-zinc-500">DOC</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{selectedDocument.doc.name}</h3>
                  <p className="text-xs text-muted-foreground">Lecture seule</p>
                </div>
              </div>
              {selectedDocument.doc.url && (
                <a
                  href={selectedDocument.doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-foreground"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedDocument.loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={32} className="animate-spin text-zinc-400" />
                  <p className="text-sm text-muted-foreground">Chargement du document...</p>
                </div>
              ) : selectedDocument.error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400">{selectedDocument.error}</p>
                  {selectedDocument.doc.url && (
                    <a
                      href={selectedDocument.doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} /> Ouvrir dans un nouvel onglet
                    </a>
                  )}
                </div>
              ) : selectedDocument.type === 'pdf' ? (
                <iframe
                  src={
                    selectedDocument.doc.url.includes('drive.google.com')
                      ? selectedDocument.doc.url.replace(/\/view.*$/, '/preview')
                      : selectedDocument.doc.url
                  }
                  className="w-full h-full min-h-[400px] rounded-lg border border-border-custom"
                  title={selectedDocument.doc.name}
                />
              ) : selectedDocument.type === 'doc' && selectedDocument.content !== undefined ? (
                <div className="bg-background rounded-lg border border-border-custom p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                    {selectedDocument.content || 'Document vide'}
                  </pre>
                </div>
              ) : selectedDocument.type === 'sheet' && selectedDocument.values && selectedDocument.values.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {selectedDocument.values.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className={cn(
                                'border border-border-custom px-3 py-2',
                                i === 0 && 'font-semibold bg-zinc-50 dark:bg-zinc-800/80'
                              )}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedDocument.type === 'sheet' ? (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-sm">Tableur vide ou inaccessible</p>
                  {selectedDocument.doc.url && (
                    <a
                      href={selectedDocument.doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} /> Ouvrir dans Google Sheets
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-background rounded-lg border border-border-custom p-6">
                  <div className="text-center text-muted-foreground py-12">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm mb-2">Prévisualisation non disponible</p>
                    <p className="text-lg font-semibold mb-4">{selectedDocument.doc.name}</p>
                    {selectedDocument.doc.url && (
                      <a
                        href={selectedDocument.doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 justify-center"
                      >
                        <ExternalLink size={14} /> Ouvrir le document
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Middle Column: Timer & Notes/Vote */}
        <div className={cn(
          "p-6 flex flex-col overflow-hidden transition-all duration-300 order-2",
          selectedDocument ? "w-1/4 border-r border-border-custom" : "w-2/5"
        )}>
          {/* Timer */}
          <div className="mb-5 bg-card p-5 rounded-xl border border-border-custom text-center">
            <div className="mb-3">
              <div className={cn(
                "text-5xl font-bold mb-2 tabular-nums",
                timer > currentItem.duration * 60 ? "text-red-500" : "text-foreground"
              )}>
                {formatTime(timer)}
              </div>
              <p className="text-sm text-muted-foreground">
                Durée prévue: {currentItem.duration} min
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={toggleTimer}
                variant={isTimerRunning ? "secondary" : "primary"}
                size="sm"
              >
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              </Button>
              <Button onClick={resetTimer} variant="ghost" size="sm">
                <RotateCcw size={14} />
              </Button>
            </div>
          </div>

          {/* Vote et Notes - Toujours affichés */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Toggle entre Vote et Notes */}
            <div className="flex gap-2 mb-3">
              <Button
                onClick={() => setActiveTab('notes')}
                variant={activeTab === 'notes' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
              >
                <FileText size={14} className="mr-1" />
                Notes
              </Button>
              <Button
                onClick={() => setActiveTab('vote')}
                variant={activeTab === 'vote' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
              >
                <Vote size={14} className="mr-1" />
                Vote
              </Button>
            </div>

            {/* Contenu selon l'onglet actif */}
            {activeTab === 'notes' ? (
              <Textarea
                value={liveNotes}
                onChange={(e) => setLiveNotes(e.target.value)}
                placeholder="Saisissez vos notes pendant la réunion..."
                className="flex-1 bg-card text-foreground border border-border-custom rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
              />
            ) : (
              <div className="flex-1 overflow-y-auto bg-card rounded-lg border border-border-custom p-4 space-y-4">
                {/* Question */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Question du vote
                  </Label>
                  <Input
                    type="text"
                    value={voteState.question}
                    onChange={(e) => setVoteState(prev => ({ ...prev, question: e.target.value }))}
                    placeholder={currentItem.title}
                    className="bg-surface-subtle w-full text-foreground border border-border-custom rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                {/* Add Option */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Ajouter une option
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newOptionLabel}
                      onChange={(e) => setNewOptionLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addVoteOption()}
                      placeholder="Nom de l'option..."
                      className="bg-surface-subtle flex-1 text-foreground border border-border-custom rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                    />
                    <Button onClick={addVoteOption} variant="secondary" size="sm">
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                {/* Vote Options */}
                <div className="space-y-3">
                  {voteState.options.map((option) => (
                    <div key={option.id} className="rounded-lg p-3 border border-border-custom bg-surface-subtle">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{option.label}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {option.voters.length} vote{option.voters.length > 1 ? 's' : ''}
                          </span>
                          {option.id.startsWith('option-') && (
                            <IconButton
                              icon={<Trash2 size={14} />}
                              ariaLabel="Supprimer l'option"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVoteOption(option.id)}
                              className="text-red-500 hover:text-red-600"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {meeting.participants.map((participant) => (
                          <Button
                            key={participant}
                            variant={option.voters.includes(participant) ? 'primary' : 'outline'}
                            size="xs"
                            onClick={() => toggleVoter(option.id, participant)}
                            className={cn(
                              "px-2 py-1 rounded-md text-xs transition-colors border",
                              option.voters.includes(participant)
                                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                                : "text-muted-foreground border-border-custom hover:border-zinc-900 dark:hover:border-white bg-surface-subtle"
                            )}
                          >
                            {option.voters.includes(participant) && (
                              <CheckCircle2 size={10} className="inline mr-1" />
                            )}
                            {participant.split(' ')[0]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vote Summary */}
                <div className="rounded-lg p-3 border border-border-custom bg-surface-subtle">
                  <h4 className="font-semibold text-sm mb-2">Résumé</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Total participants:</span>
                      <span className="font-medium text-foreground">{getVoteSummary().total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ont voté:</span>
                      <span className="font-medium text-green-600">{getVoteSummary().voted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>N'ont pas voté:</span>
                      <span className="font-medium text-amber-600">{getVoteSummary().notVoted}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-card border-t border-border-custom p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="secondary"
            size="sm"
          >
            <ChevronLeft size={16} />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === meeting.agenda.length - 1}
            variant="secondary"
            size="sm"
          >
            Suivant
            <ChevronRight size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">
            Point {currentIndex + 1} / {meeting.agenda.length}
          </span>
          <span className="text-sm font-semibold">
            {meeting.title}
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={handleExit}>
          <X size={16} />
          Quitter
        </Button>
      </div>
    </div>
  );
}
