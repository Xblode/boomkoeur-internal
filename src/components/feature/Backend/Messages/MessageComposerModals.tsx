'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Plus, Trash2, ThumbsUp, Search, CalendarDays, Video, Loader2 } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Input, Button } from '@/components/ui/atoms';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RelatedEntityType } from '@/types/messages';

// ── PollModal ────────────────────────────────────────────────────────────────

export interface PollData {
  question: string;
  options: { id: string; label: string }[];
}

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poll: PollData) => void;
  /** Données initiales pour le mode édition */
  initialData?: PollData | null;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export function PollModal({ isOpen, onClose, onSubmit, initialData }: PollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<{ id: string; label: string }[]>([
    { id: 'opt_0', label: '' },
    { id: 'opt_1', label: '' },
  ]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setQuestion(initialData.question);
        setOptions(
          initialData.options.length >= MIN_OPTIONS
            ? initialData.options
            : [
                ...initialData.options,
                ...Array.from({ length: MIN_OPTIONS - initialData.options.length }, (_, i) => ({
                  id: `opt_${Date.now()}_${i}`,
                  label: '',
                })),
              ]
        );
      } else {
        setQuestion('');
        setOptions([{ id: 'opt_0', label: '' }, { id: 'opt_1', label: '' }]);
      }
    }
  }, [isOpen, initialData]);

  const reset = () => {
    setQuestion('');
    setOptions([
      { id: 'opt_0', label: '' },
      { id: 'opt_1', label: '' },
    ]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    const nextId = `opt_${Date.now()}`;
    setOptions((prev) => [...prev, { id: nextId, label: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOption = (id: string, label: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, label } : o)),
    );
  };

  const canSubmit =
    question.trim().length > 0 &&
    options.filter((o) => o.label.trim()).length >= MIN_OPTIONS;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const validOptions = options
      .filter((o) => o.label.trim())
      .map((o) => ({ id: o.id, label: o.label.trim() }));
    if (validOptions.length < MIN_OPTIONS) return;
    onSubmit({ question: question.trim(), options: validOptions });
    handleClose();
  };

  const isEdit = !!initialData;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? 'Modifier le sondage' : 'Créer un sondage'} size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Question
          </label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Quelle date pour le team building ?"
            fullWidth
            className="text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Options
            </label>
            <span className="text-xs text-zinc-500">
              {options.filter((o) => o.label.trim()).length} / {MAX_OPTIONS}
            </span>
          </div>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 w-5">{i + 1}.</span>
                <Input
                  value={opt.label}
                  onChange={(e) => updateOption(opt.id, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  fullWidth
                  size="sm"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeOption(opt.id)}
                  disabled={options.length <= MIN_OPTIONS}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    options.length <= MIN_OPTIONS
                      ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
                  )}
                  aria-label="Supprimer l'option"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
            >
              <Plus size={14} />
              Ajouter une option
            </button>
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2"
        >
          <BarChart3 size={14} />
          {isEdit ? 'Enregistrer' : 'Créer le sondage'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ── QuickVoteModal ───────────────────────────────────────────────────────────

export interface QuickVoteData {
  question?: string;
  yes: string[];
  no: string[];
}

interface QuickVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quickVote: QuickVoteData) => void;
}

export function QuickVoteModal({ isOpen, onClose, onSubmit }: QuickVoteModalProps) {
  const [question, setQuestion] = useState('');

  const handleClose = () => {
    setQuestion('');
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({
      question: question.trim() || undefined,
      yes: [],
      no: [],
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Vote rapide oui / non" size="sm">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Question (optionnelle)
          </label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: On confirme le lieu ?"
            fullWidth
            className="text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Les membres pourront voter Oui ou Non directement dans le chat.
        </p>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          className="flex items-center gap-2"
        >
          <ThumbsUp size={14} />
          Lancer le vote
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ── EntityPickerModal ────────────────────────────────────────────────────────

type Tab = 'event' | 'meeting';

interface EventRow {
  id: string;
  name: string;
  date: string;
  end_time: string | null;
  status: string;
  location: string;
  artists: { artist: { name: string } }[];
  assignees: string[] | null;
  com_workflow: { currentPhase?: string } | null;
}

interface MeetingRow {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  location: string | null;
  agenda: Array<{ title: string; duration?: number; description?: string; responsible?: string }> | null;
  minutes: { freeText?: string; free_text?: string } | null;
}

export interface PickedEntity {
  entityType: RelatedEntityType;
  entityId: string;
  metadata: Record<string, unknown>;
}

interface EntityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entity: PickedEntity) => void;
  orgId: string;
}

const STATUS_LABELS: Record<string, string> = {
  idea: 'Idée',
  preparation: 'Préparation',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  archived: 'Archivé',
  upcoming: 'À venir',
};

const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  preparation: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  confirmed: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
  completed: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
  upcoming: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
};

export function EntityPickerModal({ isOpen, onClose, onSelect, orgId }: EntityPickerModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('event');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('id, name, date, end_time, status, location, assignees, com_workflow, event_artists(artist:artists(name))')
      .eq('org_id', orgId)
      .order('date', { ascending: false })
      .limit(50);
    setEvents((data ?? []) as unknown as EventRow[]);
    setLoading(false);
  }, [orgId]);

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('meetings')
      .select('id, title, date, start_time, end_time, status, location, agenda, minutes')
      .eq('org_id', orgId)
      .order('date', { ascending: false })
      .limit(50);
    setMeetings((data ?? []) as unknown as MeetingRow[]);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'event') loadEvents();
    else loadMeetings();
  }, [isOpen, activeTab, loadEvents, loadMeetings]);

  const handleSelectEvent = (event: EventRow) => {
    const artists = event.artists?.map((ea) => ea.artist?.name).filter(Boolean) ?? [];
    const dateFormatted = event.date
      ? format(new Date(event.date), 'dd MMM yyyy', { locale: fr })
      : undefined;

    onSelect({
      entityType: 'event',
      entityId: event.id,
      metadata: {
        entityId: event.id,
        title: event.name,
        date: dateFormatted,
        status: STATUS_LABELS[event.status] ?? event.status,
        eventStatus: event.status,
        location: event.location,
        artists,
        assignees: event.assignees ?? [],
        comWorkflowPhase: event.com_workflow?.currentPhase,
      },
    });
    onClose();
  };

  const handleSelectMeeting = (meeting: MeetingRow) => {
    const dateFormatted = meeting.date
      ? format(new Date(meeting.date), 'dd MMM yyyy', { locale: fr })
      : undefined;

    let scheduledAt: string | undefined;
    if (meeting.date && meeting.start_time) {
      scheduledAt = `${meeting.date.slice(0, 10)}T${meeting.start_time}:00`;
    }

    const orderOfDay = (meeting.agenda ?? []).map((item) => ({
      title: item.title,
      duration: item.duration,
      description: item.description,
      responsible: item.responsible,
    }));

    const report = meeting.minutes?.freeText ?? meeting.minutes?.free_text;

    onSelect({
      entityType: 'meeting',
      entityId: meeting.id,
      metadata: {
        entityId: meeting.id,
        title: meeting.title,
        date: dateFormatted
          ? `${dateFormatted} · ${meeting.start_time}–${meeting.end_time}`
          : undefined,
        scheduledAt,
        status: STATUS_LABELS[meeting.status] ?? meeting.status,
        orderOfDay,
        report,
      },
    });
    onClose();
  };

  const filteredEvents = events.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredMeetings = meetings.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tagger dans le chat" size="md">
      <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('event')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            activeTab === 'event'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300',
          )}
        >
          <CalendarDays size={15} />
          Événements
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('meeting')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            activeTab === 'meeting'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300',
          )}
        >
          <Video size={15} />
          Réunions
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <Input
          placeholder={activeTab === 'event' ? 'Rechercher un événement…' : 'Rechercher une réunion…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm"
          autoFocus
        />
      </div>

      <div className="max-h-80 overflow-y-auto space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-zinc-400" />
          </div>
        ) : activeTab === 'event' ? (
          filteredEvents.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">Aucun événement trouvé</p>
          ) : (
            filteredEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => handleSelectEvent(event)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0">
                  <CalendarDays size={14} className="text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {event.name}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {event.date && format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}
                    {event.date && (event.end_time
                      ? ` · ${format(new Date(event.date), 'HH:mm', { locale: fr })}–${event.end_time}`
                      : ` · ${format(new Date(event.date), 'HH:mm', { locale: fr })}`)}
                    {event.location ? ` · ${event.location}` : ''}
                  </p>
                  {event.artists?.length > 0 && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5 truncate">
                      {event.artists.map((ea) => ea.artist?.name).filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                {event.status && (
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0', STATUS_COLORS[event.status] ?? STATUS_COLORS.idea)}>
                    {STATUS_LABELS[event.status] ?? event.status}
                  </span>
                )}
              </button>
            ))
          )
        ) : filteredMeetings.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">Aucune réunion trouvée</p>
        ) : (
          filteredMeetings.map((meeting) => (
            <button
              key={meeting.id}
              type="button"
              onClick={() => handleSelectMeeting(meeting)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
            >
              <div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                <Video size={14} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {meeting.title}
                </p>
                {meeting.date && (
                  <p className="text-xs text-zinc-400 truncate">
                    {format(new Date(meeting.date), 'dd MMM yyyy', { locale: fr })}
                    {meeting.start_time ? ` · ${meeting.start_time}` : ''}
                    {meeting.end_time ? `–${meeting.end_time}` : ''}
                  </p>
                )}
              </div>
              {meeting.status && (
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0', STATUS_COLORS[meeting.status] ?? STATUS_COLORS.upcoming)}>
                  {STATUS_LABELS[meeting.status] ?? meeting.status}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}
