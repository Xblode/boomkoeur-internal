'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SectionHeader } from '@/components/ui';
import { useEventDetail } from './EventDetailProvider';
import { Card, CardContent, EmptyState, KPICard } from '@/components/ui/molecules';
import { Button, Input, Badge, IconButton, Textarea } from '@/components/ui/atoms';
import { Modal, ModalFooter, ModalThreeColumnLayout } from '@/components/ui/organisms';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  AlertTriangle,
  CalendarClock,
  ArrowRight,
  ArrowLeft,
  X,
  UserPlus,
  Star,
  Check,
  CirclePlus,
  Users,
  User as UserIcon,
  Phone,
  Mail,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

import {
  Volunteer,
  VolunteerKind,
  PLANNING_POSTS,
  POST_LABELS,
  PostId,
  EventPlanning,
  ShiftKey,
} from '@/types/planning';
import { volunteerService, eventPlanningService } from '@/lib/services/PlanningService';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar, PageToolbarFilters, PageToolbarActions } from '@/components/ui/organisms';
import { Share2 } from 'lucide-react';

// ── Helpers ──

function generateShiftKeys(startDate: Date, endTime?: string): ShiftKey[] {
  const startH = startDate.getHours();
  const startM = startDate.getMinutes();

  let endH = 23;
  let endM = 0;
  if (endTime) {
    const [h, m] = endTime.split(':').map(Number);
    endH = h;
    endM = m;
  }

  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const keys: ShiftKey[] = [];
  let cursor = startMinutes;
  while (cursor < endMinutes) {
    const h = Math.floor(cursor / 60) % 24;
    const m = cursor % 60;
    keys.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    cursor += 60;
  }

  return keys;
}

function shiftLabel(key: ShiftKey): string {
  const [h, m] = key.split(':').map(Number);
  const endTotal = h * 60 + m + 60;
  const eh = Math.floor(endTotal / 60) % 24;
  const em = endTotal % 60;
  return `${key}–${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

const KIND_LABELS: Record<VolunteerKind, string> = {
  benevole: 'Bénévole',
  membre: 'Membre',
};

const KIND_BADGE_VARIANT: Record<VolunteerKind, 'default' | 'secondary'> = {
  benevole: 'secondary',
  membre: 'default',
};

const POST_COLORS: Record<PostId, string> = {
  entree:    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  merch_rdr: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
  vestiaire: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  safer:     'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  dj:        'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300',
  photo:     'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300',
  pause:     'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const POST_ACTIVE_COLORS: Record<PostId, string> = {
  entree:    'bg-blue-600 border-blue-600 text-white',
  merch_rdr: 'bg-violet-600 border-violet-600 text-white',
  vestiaire: 'bg-amber-500 border-amber-500 text-white',
  safer:     'bg-red-600 border-red-600 text-white',
  dj:        'bg-pink-600 border-pink-600 text-white',
  photo:     'bg-teal-600 border-teal-600 text-white',
  pause:     'bg-zinc-600 border-zinc-600 text-white',
};

type AssignPostTarget = { volunteerId: string; shift: ShiftKey };
type ModalTab = 'benevoles' | 'membres';

// ── Component ──

export const EventPlanningSection: React.FC = () => {
  const { event } = useEventDetail();

  // Data
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [planning, setPlanning] = useState<EventPlanning | null>(null);

  // Post assignment modal
  const [postModalTarget, setPostModalTarget] = useState<AssignPostTarget | null>(null);

  // Add volunteer modal
  const [addVolOpen, setAddVolOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('benevoles');
  const [volSearch, setVolSearch] = useState('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  // Detail panel editable fields
  const [detailPhone, setDetailPhone] = useState('');
  const [detailEmail, setDetailEmail] = useState('');
  const [detailNotes, setDetailNotes] = useState('');

  // ── Toolbar ──

  const { setToolbar } = useToolbar();

  useEffect(() => {
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/planning/${event.id}`
      : '';

    setToolbar(
      <PageToolbar
        filters={<PageToolbarFilters><span className="text-xs text-zinc-400 hidden sm:block">Planning bénévoles</span></PageToolbarFilters>}
        actions={
          <PageToolbarActions>
            <Button onClick={() => setAddVolOpen(true)}>
              <Users size={13} className="mr-1.5" />
              Gérer les bénévoles
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl).then(() => {
                  toast.success('Lien copié dans le presse-papier !');
                });
              }}
            >
              <Share2 size={13} className="mr-1.5" />
              Partager
            </Button>
          </PageToolbarActions>
        }
      />
    );
    return () => setToolbar(null);
  }, [event.id, setToolbar]);

  // ── Load ──

  const loadData = useCallback(async () => {
    const [vols, plan] = await Promise.all([
      volunteerService.getAll(),
      eventPlanningService.getByEventId(event.id),
    ]);
    setVolunteers(vols);
    setPlanning(
      plan ?? { eventId: event.id, volunteerIds: [], assignments: {}, updatedAt: new Date() }
    );
  }, [event.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync detail fields when selected volunteer changes
  useEffect(() => {
    if (selectedVolunteerId) {
      const vol = volunteers.find((v) => v.id === selectedVolunteerId);
      if (vol) {
        setDetailPhone(vol.phone ?? '');
        setDetailEmail(vol.email ?? '');
        setDetailNotes(vol.notes ?? '');
      }
    }
  }, [selectedVolunteerId, volunteers]);

  // ── Shift keys ──

  const shiftKeys = useMemo(
    () => generateShiftKeys(new Date(event.date), event.endTime),
    [event.date, event.endTime]
  );

  // ── Derived ──

  const planningVolunteers = useMemo<Volunteer[]>(() => {
    if (!planning) return [];
    return (planning.volunteerIds ?? [])
      .map((id) => volunteers.find((v) => v.id === id))
      .filter(Boolean) as Volunteer[];
  }, [planning, volunteers]);

  const getPostsForCell = useCallback(
    (volunteerId: string, shift: ShiftKey): PostId[] => {
      if (!planning) return [];
      const shiftData = planning.assignments[shift] ?? {};
      return PLANNING_POSTS.filter((post) => shiftData[post]?.includes(volunteerId));
    },
    [planning]
  );

  const isInPlanning = (id: string) => planning?.volunteerIds?.includes(id) ?? false;

  const sortedVolunteers = useMemo(() => {
    const q = volSearch.trim().toLowerCase();
    const filtered = q
      ? volunteers.filter((v) => v.name.toLowerCase().includes(q))
      : volunteers;

    const sortGroup = (arr: Volunteer[]) => [
      ...arr.filter((v) => v.isFavorite).sort((a, b) => a.name.localeCompare(b.name)),
      ...arr.filter((v) => !v.isFavorite).sort((a, b) => a.name.localeCompare(b.name)),
    ];

    return {
      membres: sortGroup(filtered.filter((v) => v.kind === 'membre')),
      benevoles: sortGroup(filtered.filter((v) => v.kind === 'benevole')),
    };
  }, [volunteers, volSearch]);

  const postModalVolunteer = postModalTarget
    ? volunteers.find((v) => v.id === postModalTarget.volunteerId)
    : null;

  // ── Actions ──

  const handleAssignPost = async (volunteerId: string, shift: ShiftKey, postId: PostId) => {
    const currentPosts = getPostsForCell(volunteerId, shift);
    for (const existing of currentPosts) {
      if (existing !== postId) {
        await eventPlanningService.unassign(event.id, shift, existing, volunteerId);
      }
    }
    const updated = await eventPlanningService.assign(event.id, shift, postId, volunteerId);
    setPlanning(updated);
  };

  const handleUnassignPost = async (volunteerId: string, shift: ShiftKey, postId: PostId) => {
    const updated = await eventPlanningService.unassign(event.id, shift, postId, volunteerId);
    setPlanning(updated);
  };

  const handleToggleVolunteerInPlanning = async (volunteerId: string) => {
    const isIn = planning?.volunteerIds?.includes(volunteerId) ?? false;
    if (isIn) {
      const updated = await eventPlanningService.removeVolunteerFromPlanning(event.id, volunteerId);
      setPlanning(updated);
    } else {
      const updated = await eventPlanningService.addVolunteerToPlanning(event.id, volunteerId);
      setPlanning(updated);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, volunteerId: string) => {
    e.stopPropagation();
    await volunteerService.toggleFavorite(volunteerId);
    await loadData();
  };

  const handleCreateVolunteer = async () => {
    if (!newName.trim()) { setIsCreating(false); return; }
    const vol = await volunteerService.create({ name: newName.trim(), kind: 'benevole' });
    const updated = await eventPlanningService.addVolunteerToPlanning(event.id, vol.id);
    setPlanning(updated);
    setNewName('');
    setIsCreating(false);
    await loadData();
    toast.success(`${vol.name} ajouté au planning`);
  };

  const handleSaveVolunteerField = async (field: 'phone' | 'email' | 'notes', value: string) => {
    if (!selectedVolunteerId) return;
    await volunteerService.update(selectedVolunteerId, { [field]: value });
    await loadData();
  };

  const closeAddModal = () => {
    setAddVolOpen(false);
    setIsCreating(false);
    setNewName('');
    setSelectedVolunteerId(null);
  };

  // ── No endTime → empty state ──

  if (!event.endTime) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Heure de fin manquante"
        description="Pour générer le planning par créneaux, renseignez l'heure de fin de la soirée dans la section Informations de cet événement."
        action={
          <Link href={`/dashboard/events/${event.id}`}>
            <Button variant="primary" size="sm">
              Aller aux Informations
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        }
        variant="compact"
      />
    );
  }

  // ── Render ──

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<CalendarClock size={28} />}
        title="Planning"
        subtitle="Timeline et planning détaillé de l'événement."
      />
      {/* Info bar */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {format(new Date(event.date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
        {event.endTime && ` — ${event.endTime}`}
        {' · '}
        {shiftKeys.length} créneau{shiftKeys.length > 1 ? 'x' : ''} d&apos;1h
        {planningVolunteers.length > 0 &&
          ` · ${planningVolunteers.length} bénévole${planningVolunteers.length > 1 ? 's' : ''}`}
      </p>

      {/* ── Planning table ── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs" style={{ minWidth: '100%' }}>
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="sticky left-0 z-10 bg-card-bg px-4 py-3 text-left font-semibold text-zinc-500 dark:text-zinc-400 min-w-[160px] border-r border-zinc-200 dark:border-zinc-800">
                    Bénévole
                  </th>
                  {shiftKeys.map((shift) => (
                    <th
                      key={shift}
                      className="px-2 py-3 text-center font-semibold text-zinc-600 dark:text-zinc-300 min-w-[70px] whitespace-nowrap border-r last:border-r-0 border-zinc-100 dark:border-zinc-800/50"
                    >
                      {shiftLabel(shift)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {planningVolunteers.map((vol, idx) => (
                  <tr
                    key={vol.id}
                    className={cn(
                      'border-b border-zinc-100 dark:border-zinc-800/50',
                      idx % 2 === 0 && 'bg-zinc-50/40 dark:bg-zinc-900/10'
                    )}
                  >
                    <td className="sticky left-0 z-10 bg-card-bg px-3 py-2 border-r border-zinc-200 dark:border-zinc-800 group/row">
                      <div className="flex items-center justify-between gap-2 min-w-[140px]">
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate">
                            {vol.name}
                          </div>
                          <Badge
                            variant={KIND_BADGE_VARIANT[vol.kind]}
                            className="text-[9px] px-1.5 py-0 mt-0.5"
                          >
                            {KIND_LABELS[vol.kind]}
                          </Badge>
                        </div>
                        <IconButton
                          icon={<X size={12} />}
                          ariaLabel="Retirer du planning"
                          variant="ghost"
                          size="xs"
                          onClick={() => handleToggleVolunteerInPlanning(vol.id)}
                          className="opacity-0 group-hover/row:opacity-100 p-1 text-zinc-400 hover:text-red-500 shrink-0"
                        />
                      </div>
                    </td>

                    {shiftKeys.map((shift) => {
                      const posts = getPostsForCell(vol.id, shift);
                      return (
                        <td
                          key={shift}
                          className="p-1 border-r last:border-r-0 border-zinc-100 dark:border-zinc-800/50"
                        >
                          <div className="flex flex-col min-h-[52px] h-full">
                            {posts.length > 0 ? (
                              <div
                                className={cn(
                                  'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium group/chip cursor-pointer h-full relative',
                                  POST_COLORS[posts[0]]
                                )}
                                onClick={() =>
                                  setPostModalTarget({ volunteerId: vol.id, shift })
                                }
                                title="Changer le poste"
                              >
                                <span className="truncate">{POST_LABELS[posts[0]]}</span>
                                <IconButton
                                  icon={<X size={10} />}
                                  ariaLabel="Retirer ce poste"
                                  variant="ghost"
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnassignPost(vol.id, shift, posts[0]);
                                  }}
                                  className="absolute top-1 right-1 opacity-0 group-hover/chip:opacity-100 hover:opacity-70 h-5 w-5"
                                />
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setPostModalTarget({ volunteerId: vol.id, shift })
                                }
                                className={cn(
                                  'flex-1 w-full flex items-center justify-center rounded-md min-h-[52px] border-dashed',
                                  'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
                                  'hover:border-zinc-400 dark:hover:border-zinc-500'
                                )}
                              >
                                <Plus size={12} />
                              </Button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Empty-state row */}
                <tr>
                  <td colSpan={shiftKeys.length + 1} className="p-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVolSearch('');
                        setIsCreating(false);
                        setNewName('');
                        setAddVolOpen(true);
                      }}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed',
                        'text-zinc-400 dark:text-zinc-500',
                        'hover:text-zinc-600 dark:hover:text-zinc-300',
                        'hover:border-zinc-400 dark:hover:border-zinc-600',
                        'hover:bg-zinc-50 dark:hover:bg-zinc-900/30 group/add'
                      )}
                    >
                      <UserPlus
                        size={18}
                        className="group-hover/add:scale-110 transition-transform"
                      />
                      <span className="text-sm font-medium">
                        {planningVolunteers.length === 0
                          ? 'Ajouter un premier bénévole au planning'
                          : 'Ajouter un bénévole au planning'}
                      </span>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Modal: assign post ── */}
      <Modal
        isOpen={!!postModalTarget}
        onClose={() => setPostModalTarget(null)}
        title={
          postModalTarget
            ? `${postModalVolunteer?.name ?? '—'} · ${shiftLabel(postModalTarget.shift)}`
            : 'Poste'
        }
        size="sm"
      >
        <div className="grid grid-cols-2 gap-2">
          {PLANNING_POSTS.map((post) => {
            const isAssigned = postModalTarget
              ? getPostsForCell(postModalTarget.volunteerId, postModalTarget.shift).includes(post)
              : false;
            return (
              <Button
                key={post}
                variant="outline"
                onClick={async () => {
                  if (!postModalTarget) return;
                  if (isAssigned) {
                    await handleUnassignPost(
                      postModalTarget.volunteerId,
                      postModalTarget.shift,
                      post
                    );
                  } else {
                    await handleAssignPost(
                      postModalTarget.volunteerId,
                      postModalTarget.shift,
                      post
                    );
                  }
                }}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all duration-150',
                  isAssigned
                    ? cn(POST_ACTIVE_COLORS[post], 'shadow-sm')
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                {isAssigned ? (
                  <Check size={14} className="shrink-0" />
                ) : (
                  <CirclePlus size={14} className="shrink-0 opacity-40" />
                )}
                {POST_LABELS[post]}
              </Button>
            );
          })}
        </div>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setPostModalTarget(null)}>
            Fermer
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Modal: 3 colonnes bénévoles ── */}
      <Modal
        isOpen={addVolOpen}
        onClose={closeAddModal}
        title="Bénévoles"
        size="lg"
        variant="fullBleed"
      >
        <ModalThreeColumnLayout
          sidebar={
            <>
              <div className="p-3 border-b border-border-custom">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  />
                  <Input
                    value={volSearch}
                    onChange={(e) => setVolSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-7 h-7 text-xs"
                    fullWidth
                  />
                </div>
              </div>
              <nav className="p-2 space-y-0.5">
                {(
                  [
                    { id: 'benevoles' as const, label: 'Bénévoles', Icon: Users },
                    { id: 'membres' as const, label: 'Membres', Icon: UserIcon },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <Button
                    key={id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveTab(id);
                      setSelectedVolunteerId(null);
                    }}
                    className={cn(
                      'flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors h-auto font-normal justify-start',
                      activeTab === id
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium'
                        : 'text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span>{label}</span>
                  </Button>
                ))}
              </nav>
            </>
          }
          list={
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {activeTab === 'benevoles' ? (
                <>
                  {isCreating && (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                      <div className="w-5 h-5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 shrink-0" />
                      <Input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nom du bénévole..."
                        autoFocus
                        size="sm"
                        className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateVolunteer();
                          if (e.key === 'Escape') {
                            setIsCreating(false);
                            setNewName('');
                          }
                        }}
                        onBlur={() => {
                          if (newName.trim()) handleCreateVolunteer();
                          else {
                            setIsCreating(false);
                            setNewName('');
                          }
                        }}
                      />
                      <Star size={14} className="text-zinc-200 dark:text-zinc-700 shrink-0" />
                    </div>
                  )}

                  {sortedVolunteers.benevoles.map((vol) => (
                    <VolunteerRow
                      key={vol.id}
                      vol={vol}
                      inPlanning={isInPlanning(vol.id)}
                      isSelected={selectedVolunteerId === vol.id}
                      showFavorite
                      onSelect={() =>
                        setSelectedVolunteerId(
                          vol.id === selectedVolunteerId ? null : vol.id
                        )
                      }
                      onTogglePlanning={() => handleToggleVolunteerInPlanning(vol.id)}
                      onToggleFavorite={(e) => handleToggleFavorite(e, vol.id)}
                    />
                  ))}

                  {!isCreating && sortedVolunteers.benevoles.length === 0 && (
                    <EmptyState
                      icon={UserIcon}
                      title="Aucun bénévole"
                      variant="inline"
                    />
                  )}
                </>
              ) : (
                <>
                  {sortedVolunteers.membres.map((vol) => (
                    <VolunteerRow
                      key={vol.id}
                      vol={vol}
                      inPlanning={isInPlanning(vol.id)}
                      isSelected={selectedVolunteerId === vol.id}
                      showFavorite={false}
                      onSelect={() =>
                        setSelectedVolunteerId(
                          vol.id === selectedVolunteerId ? null : vol.id
                        )
                      }
                      onTogglePlanning={() => handleToggleVolunteerInPlanning(vol.id)}
                      onToggleFavorite={() => {}}
                    />
                  ))}

                  {sortedVolunteers.membres.length === 0 && (
                    <EmptyState
                      icon={Users}
                      title="Aucun membre"
                      variant="inline"
                    />
                  )}
                </>
              )}
            </div>
          }
          detail={
            selectedVolunteerId && volunteers.find((v) => v.id === selectedVolunteerId) ? (
              <VolunteerDetailsPanel
                volunteer={volunteers.find((v) => v.id === selectedVolunteerId)!}
                phone={detailPhone}
                email={detailEmail}
                notes={detailNotes}
                setPhone={setDetailPhone}
                setEmail={setDetailEmail}
                setNotes={setDetailNotes}
                onBack={() => setSelectedVolunteerId(null)}
                onSave={handleSaveVolunteerField}
              />
            ) : (
              <PlanningOverviewPanel
                benevoles={volunteers.filter((v) => v.kind === 'benevole').length}
                membres={volunteers.filter((v) => v.kind === 'membre').length}
                inPlanning={planningVolunteers.length}
                missingPhone={volunteers.filter((v) => !v.phone).length}
                missingEmail={volunteers.filter((v) => !v.email).length}
              />
            )
          }
        />

        <ModalFooter>
          {activeTab === 'benevoles' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreating(true);
                setNewName('');
              }}
            >
              <Plus size={14} className="mr-1" />
              Nouveau bénévole
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={closeAddModal}>
            Fermer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

// ── Sub-component: row in the middle column ──

interface VolunteerRowProps {
  vol: Volunteer;
  inPlanning: boolean;
  isSelected: boolean;
  showFavorite: boolean;
  onSelect: () => void;
  onTogglePlanning: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function VolunteerRow({
  vol,
  inPlanning,
  isSelected,
  showFavorite,
  onSelect,
  onTogglePlanning,
  onToggleFavorite,
}: VolunteerRowProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors group/vol',
        isSelected
          ? 'bg-zinc-200 dark:bg-zinc-700'
          : inPlanning
          ? 'bg-zinc-100 dark:bg-zinc-800/70 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
      )}
    >
      {/* Planning toggle */}
      <IconButton
        icon={<Check />}
        ariaLabel={inPlanning ? 'Retirer du planning' : 'Ajouter au planning'}
        variant="ghost"
        size="xs"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePlanning();
        }}
        className={cn(
          'flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-colors [&>svg]:w-2.5 [&>svg]:h-2.5',
          inPlanning
            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
            : 'border border-zinc-300 dark:border-zinc-600 text-transparent group-hover/vol:border-zinc-400'
        )}
      />

      <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 truncate">
        {vol.name}
      </span>

      {showFavorite && (
        <IconButton
          icon={<Star className={vol.isFavorite ? 'fill-current' : ''} />}
          ariaLabel={vol.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          variant="ghost"
          size="xs"
          onClick={onToggleFavorite}
          className={cn(
            'p-1 rounded-md transition-colors shrink-0',
            vol.isFavorite
              ? 'text-amber-400 hover:text-amber-500'
              : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-400 dark:hover:text-amber-400'
          )}
        />
      )}
    </div>
  );
}

// ── Sub-component: detail panel ──

interface VolunteerDetailsPanelProps {
  volunteer: Volunteer;
  phone: string;
  email: string;
  notes: string;
  setPhone: (v: string) => void;
  setEmail: (v: string) => void;
  setNotes: (v: string) => void;
  onBack: () => void;
  onSave: (field: 'phone' | 'email' | 'notes', value: string) => void;
}

function VolunteerDetailsPanel({
  volunteer,
  phone,
  email,
  notes,
  setPhone,
  setEmail,
  setNotes,
  onBack,
  onSave,
}: VolunteerDetailsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={onBack} className="text-zinc-500 -ml-2">
        <ArrowLeft size={14} className="mr-1" />
        Retour
      </Button>

      {/* Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <UserIcon size={20} className="text-zinc-400" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-foreground leading-tight">
            {volunteer.name}
          </h3>
          <Badge
            variant={volunteer.kind === 'membre' ? 'default' : 'secondary'}
            className="text-[9px] px-1.5 py-0 mt-0.5"
          >
            {volunteer.kind === 'membre' ? 'Membre' : 'Bénévole'}
          </Badge>
        </div>
      </div>

      {/* Editable fields */}
      <div className="border-t border-border-custom pt-4 space-y-3">
        <DetailField
          icon={<Phone size={13} />}
          value={phone}
          placeholder="Numéro de téléphone"
          onChange={setPhone}
          onBlur={() => onSave('phone', phone)}
          type="tel"
        />
        <DetailField
          icon={<Mail size={13} />}
          value={email}
          placeholder="Adresse email"
          onChange={setEmail}
          onBlur={() => onSave('email', email)}
          type="email"
        />
        <div className="flex items-start gap-2.5 pt-1">
          <FileText size={13} className="text-zinc-400 shrink-0 mt-1.5" />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onSave('notes', notes)}
            placeholder="Notes..."
            rows={3}
            className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 outline-none text-sm py-1 resize-none transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-800 dark:text-zinc-200 border-0 rounded-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Contracts */}
      <div className="border-t border-border-custom pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Contrats
          </h4>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-zinc-400">
            <Plus size={11} className="mr-1" />
            Ajouter
          </Button>
        </div>
        <EmptyState
          icon={FileText}
          title="Aucun contrat"
          variant="inline"
        />
      </div>
    </div>
  );
}

interface DetailFieldProps {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  type?: string;
}

function DetailField({ icon, value, placeholder, onChange, onBlur, type = 'text' }: DetailFieldProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-zinc-400 shrink-0">{icon}</span>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        size="sm"
        className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-700 rounded-none border-x-0 border-t-0 shadow-none focus-visible:ring-0 py-1"
      />
    </div>
  );
}

// ── Sub-component: overview panel ──

interface PlanningOverviewPanelProps {
  benevoles: number;
  membres: number;
  inPlanning: number;
  missingPhone: number;
  missingEmail: number;
}

function PlanningOverviewPanel({
  benevoles,
  membres,
  inPlanning,
  missingPhone,
  missingEmail,
}: PlanningOverviewPanelProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Vue d&apos;ensemble
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <KPICard label="Bénévoles" value={benevoles} icon={Users} />
        <KPICard label="Membres" value={membres} icon={UserIcon} />
        <KPICard label="Au planning" value={inPlanning} icon={Check} />
        <KPICard label="Total" value={benevoles + membres} icon={Users} />
      </div>

      {(missingPhone > 0 || missingEmail > 0) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            À compléter
          </h4>
          {missingPhone > 0 && (
            <WarningItem
              label={`${missingPhone} sans numéro de téléphone`}
            />
          )}
          {missingEmail > 0 && (
            <WarningItem
              label={`${missingEmail} sans adresse email`}
            />
          )}
        </div>
      )}

      {benevoles + membres === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-300 dark:text-zinc-700">
          <Users size={28} className="mb-2" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center">
            Sélectionnez un bénévole
            <br />
            pour voir ses informations
          </p>
        </div>
      )}
    </div>
  );
}

function WarningItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
      <AlertCircle size={13} className="shrink-0" />
      <span className="text-xs">{label}</span>
    </div>
  );
}
