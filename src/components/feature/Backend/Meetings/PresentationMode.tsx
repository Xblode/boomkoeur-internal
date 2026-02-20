'use client';

import { useState } from 'react';
import { Meeting } from '@/types/meeting';
import { Button } from '@/components/ui/atoms';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Plus, Trash2, CheckCircle2, Vote, FileText, Eye, ArrowLeft, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  
  // Document viewer
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  
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

  const openDocument = (doc: string) => {
    setSelectedDocument(doc);
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
                  <button
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
                    className="w-full p-2.5 flex items-center justify-between cursor-pointer"
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
                  </button>
                  
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
                  <button
                    key={doc.id}
                    onClick={() => openDocument(doc.url)}
                    className="p-3 bg-card rounded-lg border border-border-custom flex items-center gap-2 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left w-full"
                  >
                    <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
                      <span className="text-xs font-bold text-zinc-500">DOC</span>
                    </div>
                    <p className="text-sm font-medium flex-1">{doc.name}</p>
                  </button>
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
              <button
                onClick={closeDocument}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
                  <span className="text-xs font-bold text-zinc-500">DOC</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedDocument}</h3>
                  <p className="text-xs text-muted-foreground">Lecture seule</p>
                </div>
              </div>
            </div>
            
            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedDocument?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`/documents/${selectedDocument.toLowerCase().replace(/\s+/g, '_')}`}
                  className="w-full h-full rounded-lg border border-border-custom"
                  title={selectedDocument}
                />
              ) : selectedDocument?.toLowerCase().endsWith('.xlsx') || selectedDocument?.toLowerCase().endsWith('.xls') ? (
                <div className="bg-background rounded-lg border border-border-custom p-6 h-full overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <h2 className="text-xl font-bold mb-4">Analytics Communication 2025 - Boom Koeur</h2>
                    
                    <div className="space-y-6">
                      <section>
                        <h3 className="text-lg font-semibold mb-3">📱 RÉSEAUX SOCIAUX</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-card p-4 rounded-lg border border-border-custom">
                            <h4 className="font-semibold mb-2">Instagram</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>Abonnés: 1,632 → 2,482 (+52%)</li>
                              <li>Publications: 156 | Stories: 428</li>
                              <li>Taux engagement: 7.2%</li>
                              <li>Reach moyen: 1,245</li>
                            </ul>
                          </div>
                          <div className="bg-card p-4 rounded-lg border border-border-custom">
                            <h4 className="font-semibold mb-2">Facebook</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>Abonnés: 1,142 → 1,462 (+28%)</li>
                              <li>Publications: 98 | Partages: 234</li>
                              <li>Taux engagement: 5.8%</li>
                              <li>Reach moyen: 892</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3">📧 NEWSLETTER</h3>
                        <div className="bg-card p-4 rounded-lg border border-border-custom">
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>Inscrits: 1,815 → 2,450 (+35%)</li>
                            <li>Emails envoyés: 24</li>
                            <li>Taux d'ouverture: 42.3%</li>
                            <li>Taux de clic: 8.7%</li>
                          </ul>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3">🌐 SITE WEB</h3>
                        <div className="bg-card p-4 rounded-lg border border-border-custom">
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>Visiteurs uniques: 28,450</li>
                            <li>Pages vues: 76,234</li>
                            <li>Temps moyen: 3min 24s</li>
                            <li>Taux de rebond: 48.2%</li>
                          </ul>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3">💰 BUDGET</h3>
                        <div className="bg-card p-4 rounded-lg border border-border-custom">
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>Budget: 12,000€ | Dépensé: 11,450€</li>
                            <li>Publicité digitale: 4,850€ (42%)</li>
                            <li>Création contenu: 2,800€ (24%)</li>
                            <li>ROI moyen: 340%</li>
                          </ul>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3">✅ CONCLUSIONS</h3>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm font-medium mb-2">Points forts:</p>
                          <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                            <li>Tous les KPIs dépassent les objectifs</li>
                            <li>Forte croissance sur tous les canaux</li>
                            <li>Excellent ROI des campagnes</li>
                            <li>Budget maîtrisé (-4.6%)</li>
                          </ul>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-background rounded-lg border border-border-custom p-6">
                  <div className="text-center text-muted-foreground py-12">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm mb-2">Prévisualisation du document</p>
                    <p className="text-lg font-semibold mb-4">{selectedDocument}</p>
                    <p className="text-xs">
                      Le contenu du document s'affichera ici.<br />
                      (Images, Documents texte, etc.)
                    </p>
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
              <textarea
                value={liveNotes}
                onChange={(e) => setLiveNotes(e.target.value)}
                placeholder="Saisissez vos notes pendant la réunion..."
                className="flex-1 bg-card text-foreground border border-border-custom rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
              />
            ) : (
              <div className="flex-1 overflow-y-auto bg-card rounded-lg border border-border-custom p-4 space-y-4">
                {/* Question */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Question du vote
                  </label>
                  <input
                    type="text"
                    value={voteState.question}
                    onChange={(e) => setVoteState(prev => ({ ...prev, question: e.target.value }))}
                    placeholder={currentItem.title}
                    style={{ backgroundColor: '#272729' }}
                    className="w-full text-foreground border border-border-custom rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                {/* Add Option */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Ajouter une option
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOptionLabel}
                      onChange={(e) => setNewOptionLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addVoteOption()}
                      placeholder="Nom de l'option..."
                      style={{ backgroundColor: '#272729' }}
                      className="flex-1 text-foreground border border-border-custom rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                    />
                    <Button onClick={addVoteOption} variant="secondary" size="sm">
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                {/* Vote Options */}
                <div className="space-y-3">
                  {voteState.options.map((option) => (
                    <div key={option.id} className="rounded-lg p-3 border border-border-custom" style={{ backgroundColor: '#272729' }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{option.label}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {option.voters.length} vote{option.voters.length > 1 ? 's' : ''}
                          </span>
                          {option.id.startsWith('option-') && (
                            <button
                              onClick={() => removeVoteOption(option.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {meeting.participants.map((participant) => (
                          <button
                            key={participant}
                            onClick={() => toggleVoter(option.id, participant)}
                            className={cn(
                              "px-2 py-1 rounded-md text-xs transition-colors border",
                              option.voters.includes(participant)
                                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                                : "text-muted-foreground border-border-custom hover:border-zinc-900 dark:hover:border-white"
                            )}
                            style={!option.voters.includes(participant) ? { backgroundColor: '#272729' } : undefined}
                          >
                            {option.voters.includes(participant) && (
                              <CheckCircle2 size={10} className="inline mr-1" />
                            )}
                            {participant.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vote Summary */}
                <div className="rounded-lg p-3 border border-border-custom" style={{ backgroundColor: '#272729' }}>
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
