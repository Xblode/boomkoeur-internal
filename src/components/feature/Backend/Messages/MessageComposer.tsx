'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Image as ImageIcon, FileText, CalendarDays, Video, Loader2, User, BarChart3, ThumbsUp } from 'lucide-react';
import { IconButton, Textarea } from '@/components/ui/atoms';
import { MenuPicker } from '@/components/ui/molecules';
import { DrivePickerModal } from '@/components/feature/Backend/Events/DrivePickerModal';
import { EntityPickerModal, PollModal, QuickVoteModal, type PickedEntity, type PollData, type QuickVoteData } from './MessageComposerModals';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MentionResult {
  id: string;
  name: string;
  type: 'event' | 'meeting' | 'member';
  date?: string;
  status?: string;
  avatar?: string | null;
  metadata: Record<string, unknown>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  idea: 'Idée',
  preparation: 'Préparation',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  archived: 'Archivé',
  upcoming: 'À venir',
};

function buildEventMetadata(row: {
  id: string; name: string; date?: string; end_time?: string | null; status?: string;
  location?: string; assignees?: string[] | null; com_workflow?: { currentPhase?: string } | null;
  event_artists?: { artist: { name: string } | { name: string }[] }[];
}): Record<string, unknown> {
  const artists = (row.event_artists ?? []).flatMap((ea) => {
    const a = ea.artist;
    if (!a) return [];
    return Array.isArray(a) ? a.map((x) => x?.name).filter(Boolean) : [a?.name].filter(Boolean);
  }) as string[];
  const dateStr = row.date ? format(new Date(row.date), 'dd MMM yyyy', { locale: fr }) : undefined;
  const timeStr = row.date
    ? row.end_time
      ? `${format(new Date(row.date), 'HH:mm', { locale: fr })}–${row.end_time}`
      : format(new Date(row.date), 'HH:mm', { locale: fr })
    : undefined;
  return {
    entityId: row.id,
    title: row.name,
    date: dateStr,
    time: timeStr,
    status: STATUS_LABELS[row.status ?? ''] ?? row.status,
    eventStatus: row.status,
    location: row.location,
    assignees: row.assignees ?? [],
    artists,
    comWorkflowPhase: row.com_workflow?.currentPhase,
  };
}

function buildMeetingMetadata(row: {
  id: string; title: string; date?: string; start_time?: string; end_time?: string; status?: string;
}): Record<string, unknown> {
  const dateFormatted = row.date
    ? format(new Date(row.date), 'dd MMM yyyy', { locale: fr })
    : undefined;
  const scheduledAt =
    row.date && row.start_time ? `${row.date.slice(0, 10)}T${row.start_time}:00` : undefined;
  return {
    entityId: row.id,
    title: row.title,
    date: dateFormatted
      ? `${dateFormatted}${row.start_time ? ` · ${row.start_time}` : ''}${row.end_time ? `–${row.end_time}` : ''}`
      : undefined,
    scheduledAt,
    status: STATUS_LABELS[row.status ?? ''] ?? row.status,
    orderOfDay: [],
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MessageComposerProps {
  onSend: (content: string, mentions?: PickedEntity[], memberMentions?: { id: string; name: string }[]) => void;
  onSendImage?: (file: File) => void;
  onSendDriveFile?: (url: string, name?: string, mimeType?: string) => void;
  onSendEntity?: (entity: PickedEntity) => void;
  onSendPoll?: (poll: PollData) => void;
  onSendQuickVote?: (quickVote: QuickVoteData) => void;
  orgId?: string | null;
  disabled?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MessageComposer({
  onSend,
  onSendImage,
  onSendDriveFile,
  onSendEntity,
  onSendPoll,
  onSendQuickVote,
  orgId,
  disabled,
  className,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [drivePickerOpen, setDrivePickerOpen] = useState(false);
  const [drivePickerMode, setDrivePickerMode] = useState<'image' | 'document'>('image');
  const [entityPickerOpen, setEntityPickerOpen] = useState(false);
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [quickVoteModalOpen, setQuickVoteModalOpen] = useState(false);

  // @mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<MentionResult[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [pendingMentions, setPendingMentions] = useState<PickedEntity[]>([]);
  const [pendingMemberMentions, setPendingMemberMentions] = useState<{ id: string; name: string }[]>([]);
  const mentionRangeRef = useRef<{ start: number; end: number } | null>(null);
  // Cache des membres de l'org (chargé une seule fois)
  const membersRef = useRef<MentionResult[]>([]);
  const membersLoadedRef = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Chargement unique des membres (deux étapes comme getOrgUsers) ─────────
  useEffect(() => {
    if (!orgId || membersLoadedRef.current) return;
    membersLoadedRef.current = true;

    (async () => {
      const { data: members } = await supabase
        .from('organisation_members')
        .select('user_id')
        .eq('org_id', orgId);

      if (!members?.length) return;

      const userIds = members.map((m) => m.user_id as string);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar')
        .in('id', userIds);

      membersRef.current = (profiles ?? []).flatMap((p) => {
        const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
        if (!name) return [];
        return [{
          id: p.id as string,
          name,
          type: 'member' as const,
          avatar: p.avatar as string | null,
          metadata: {},
        }];
      });
    })();
  }, [orgId]);

  // ── Fetch mention results ──────────────────────────────────────────────────
  useEffect(() => {
    if (mentionQuery === null || !orgId) {
      setMentionResults([]);
      return;
    }

    setMentionLoading(true);
    const timer = setTimeout(async () => {
      const q = `%${mentionQuery}%`;
      const [evRes, mtRes] = await Promise.all([
        supabase
          .from('events')
          .select('id, name, date, end_time, status, location, assignees, com_workflow, event_artists(artist:artists(name))')
          .eq('org_id', orgId)
          .ilike('name', q)
          .order('date', { ascending: false })
          .limit(3),
        supabase
          .from('meetings')
          .select('id, title, date, start_time, end_time, status')
          .eq('org_id', orgId)
          .ilike('title', q)
          .order('date', { ascending: false })
          .limit(3),
      ]);

      const qLower = mentionQuery.toLowerCase();
      const memberResults = membersRef.current
        .filter((m) => m.name.toLowerCase().includes(qLower))
        .slice(0, 3);

      const results: MentionResult[] = [
        ...memberResults,
        ...(evRes.data ?? []).map((e) => ({
          id: e.id,
          name: e.name as string,
          type: 'event' as const,
          date: e.date as string | undefined,
          status: e.status as string | undefined,
          metadata: buildEventMetadata(e as unknown as Parameters<typeof buildEventMetadata>[0]),
        })),
        ...(mtRes.data ?? []).map((m) => ({
          id: m.id,
          name: m.title as string,
          type: 'meeting' as const,
          date: m.date as string | undefined,
          status: m.status as string | undefined,
          metadata: buildMeetingMetadata(m as unknown as Parameters<typeof buildMeetingMetadata>[0]),
        })),
      ];

      setMentionResults(results.slice(0, 7));
      setMentionIndex(0);
      setMentionLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [mentionQuery, orgId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed && pendingMentions.length === 0 && pendingMemberMentions.length === 0) return;

    if (pendingMentions.length > 0 || pendingMemberMentions.length > 0) {
      onSend(
        trimmed,
        pendingMentions.length > 0 ? pendingMentions : undefined,
        pendingMemberMentions.length > 0 ? pendingMemberMentions : undefined,
      );
      setPendingMentions([]);
      setPendingMemberMentions([]);
    } else {
      onSend(trimmed);
    }

    setContent('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Mention dropdown keyboard nav
    if (mentionQuery !== null && (mentionResults.length > 0 || mentionLoading)) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, mentionResults.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        if (mentionResults[mentionIndex]) {
          e.preventDefault();
          handleSelectMention(mentionResults[mentionIndex]);
          return;
        }
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';

    // Detect @mention at cursor
    const cursor = ta.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@([^@\s]*)$/);
    if (match) {
      mentionRangeRef.current = { start: cursor - match[0].length, end: cursor };
      setMentionQuery(match[1]);
    } else {
      mentionRangeRef.current = null;
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (result: MentionResult) => {
    const range = mentionRangeRef.current;
    if (!range) return;

    const mention = `@${result.name}`;
    const newContent =
      content.slice(0, range.start) + mention + content.slice(range.end);
    setContent(newContent);

    // Restore cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = range.start + mention.length;
        textareaRef.current.setSelectionRange(pos, pos);
        textareaRef.current.focus();
      }
    }, 0);

    // Membres = mention texte + stocker leur ID pour notification
    // Événements/réunions = entity card
    if (result.type === 'member') {
      setPendingMemberMentions((prev) =>
        prev.some((m) => m.id === result.id) ? prev : [...prev, { id: result.id, name: result.name }]
      );
    } else {
      setPendingMentions((prev) => {
        if (prev.some((m) => m.entityId === result.id && m.entityType === result.type)) return prev;
        return [...prev, {
          entityType: result.type as 'event' | 'meeting',
          entityId: result.id,
          metadata: result.metadata,
        }];
      });
    }
    setMentionQuery(null);
    mentionRangeRef.current = null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendImage) {
      onSendImage(file);
    }
    e.target.value = '';
  };

  const handleDriveSelect = (url: string, name?: string, mimeType?: string) => {
    if (onSendDriveFile) {
      onSendDriveFile(url, name, mimeType);
    }
    setDrivePickerOpen(false);
  };

  const handleEntitySelect = (entity: PickedEntity) => {
    if (onSendEntity) onSendEntity(entity);
    setEntityPickerOpen(false);
  };

  const removePendingMention = (index: number) => {
    setPendingMentions((prev) => prev.filter((_, i) => i !== index));
  };

  const showMentionDropdown =
    mentionQuery !== null && (mentionLoading || mentionResults.length > 0);

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div className={cn('border-0 sm:border-t sm:border-border-custom bg-backend px-2 sm:px-4 py-3 min-w-0', className)}>
      <div className="flex items-end gap-2 min-w-0">

        {/* Textarea + mention dropdown */}
        <div className="flex-1 min-w-0 relative">
          {/* Mention dropdown (above the textarea) */}
          {showMentionDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden z-50">
              {mentionLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-zinc-400" />
                </div>
              ) : (
                mentionResults.map((result, i) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectMention(result);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      i === mentionIndex
                        ? 'bg-zinc-100 dark:bg-zinc-800'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    )}
                  >
                    {/* Icône / avatar selon le type */}
                    {result.type === 'member' ? (
                      result.avatar ? (
                        <img
                          src={result.avatar}
                          alt={result.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                          <User size={12} className="text-blue-500" />
                        </div>
                      )
                    ) : (
                      <div
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                          result.type === 'event'
                            ? 'bg-purple-50 dark:bg-purple-950/30'
                            : 'bg-amber-50 dark:bg-amber-950/30'
                        )}
                      >
                        {result.type === 'event' ? (
                          <CalendarDays size={12} className="text-purple-500" />
                        ) : (
                          <Video size={12} className="text-amber-500" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {result.name}
                      </p>
                      {result.type === 'member' ? (
                        <p className="text-xs text-zinc-400">Membre</p>
                      ) : (
                        <p className="text-xs text-zinc-400 truncate">
                          {(result.metadata?.date as string) || (result.date ? format(new Date(result.date), 'dd MMM yyyy', { locale: fr }) : '')}
                          {result.metadata?.time ? ` · ${result.metadata.time}` : ''}
                          {((result.metadata?.artists as string[])?.length ?? 0) > 0
                            ? ` · ${(result.metadata?.artists as string[])?.join(', ') ?? ''}`
                            : ''}
                        </p>
                      )}
                    </div>
                    {result.type !== 'member' && result.status && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                        {STATUS_LABELS[result.status] ?? result.status}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl sm:rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2 transition-colors focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600">
            <Textarea
              ref={textareaRef}
              placeholder="Envoyer un message… (@ pour mentionner)"
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={disabled}
              className="flex-1 min-w-0 resize-none bg-transparent border-0 focus-visible:ring-0 shadow-none min-h-[34px] max-h-[132px] overflow-y-auto text-sm py-1.5 pl-1 pr-0 placeholder:truncate"
              style={{ minHeight: '34px', maxHeight: '132px' }}
            />
            <div className="flex items-center gap-0.5 shrink-0">
              {onSendImage && (
                <>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    aria-label="Envoyer une image"
                  />
                  <IconButton
                    icon={<ImageIcon size={18} />}
                    ariaLabel="Envoyer une image"
                    variant="ghost"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={disabled}
                    className="flex items-center justify-center w-9 h-9 rounded-full sm:rounded-lg shrink-0 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  />
                </>
              )}
              {orgId && (
                <MenuPicker
                  trigger={
                    <IconButton
                      icon={<Plus size={18} />}
                      ariaLabel="Pièces jointes"
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      className="flex items-center justify-center w-9 h-9 rounded-full sm:rounded-lg shrink-0 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    />
                  }
                  items={[
                    ...(onSendDriveFile
                      ? [
                          {
                            id: 'drive-image',
                            label: 'Image depuis Drive',
                            icon: ImageIcon,
                            onClick: () => {
                              setDrivePickerMode('image');
                              setDrivePickerOpen(true);
                            },
                          },
                          {
                            id: 'drive-doc',
                            label: 'Document depuis Drive',
                            icon: FileText,
                            onClick: () => {
                              setDrivePickerMode('document');
                              setDrivePickerOpen(true);
                            },
                          },
                        ]
                      : []),
                    ...(onSendEntity
                      ? [
                          {
                            id: 'tag-entity',
                            label: 'Tagger un événement / réunion',
                            icon: CalendarDays,
                            onClick: () => setEntityPickerOpen(true),
                          },
                        ]
                      : []),
                    ...(onSendPoll
                      ? [
                          {
                            id: 'poll',
                            label: 'Créer un sondage',
                            icon: BarChart3,
                            onClick: () => setPollModalOpen(true),
                          },
                        ]
                      : []),
                    ...(onSendQuickVote
                      ? [
                          {
                            id: 'quick-vote',
                            label: 'Vote oui / non',
                            icon: ThumbsUp,
                            onClick: () => setQuickVoteModalOpen(true),
                          },
                        ]
                      : []),
                  ]}
                  align="end"
                  side="top"
                />
              )}
              <IconButton
                icon={<Send size={16} />}
                ariaLabel="Envoyer"
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={disabled || (!content.trim() && pendingMentions.length === 0 && pendingMemberMentions.length === 0)}
                className="flex items-center justify-center w-9 h-9 rounded-full sm:rounded-lg shrink-0 disabled:opacity-30"
              />
            </div>
          </div>

          {/* Pending mentions badges */}
          {pendingMentions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 px-1">
              {pendingMentions.map((m, i) => (
                <span
                  key={`${m.entityType}-${m.entityId}`}
                  className={cn(
                    'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                    m.entityType === 'event'
                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                  )}
                >
                  {m.entityType === 'event' ? (
                    <CalendarDays size={9} />
                  ) : (
                    <Video size={9} />
                  )}
                  {m.metadata.title as string}
                  <button
                    type="button"
                    onClick={() => removePendingMention(i)}
                    className="ml-0.5 opacity-60 hover:opacity-100"
                    aria-label="Retirer le tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {orgId && onSendDriveFile && (
        <DrivePickerModal
          isOpen={drivePickerOpen}
          onClose={() => setDrivePickerOpen(false)}
          onSelect={handleDriveSelect}
          orgId={orgId}
          mode={drivePickerMode}
        />
      )}
      {orgId && onSendEntity && (
        <EntityPickerModal
          isOpen={entityPickerOpen}
          onClose={() => setEntityPickerOpen(false)}
          onSelect={handleEntitySelect}
          orgId={orgId}
        />
      )}
      {onSendPoll && (
        <PollModal
          isOpen={pollModalOpen}
          onClose={() => setPollModalOpen(false)}
          onSubmit={onSendPoll}
        />
      )}
      {onSendQuickVote && (
        <QuickVoteModal
          isOpen={quickVoteModalOpen}
          onClose={() => setQuickVoteModalOpen(false)}
          onSubmit={onSendQuickVote}
        />
      )}

      <p className="text-[10px] text-zinc-400 mt-1.5 pl-1 hidden sm:block">
        Ctrl+Enter pour envoyer · @ pour mentionner
      </p>
    </div>
  );
}
