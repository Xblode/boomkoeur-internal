'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Artist, ArtistType } from '@/types/event';
import { Button, Input } from '@/components/ui/atoms';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Music,
  Camera,
  Lightbulb,
  ArrowLeft,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  X,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';
import { useEventDetail } from './EventDetailProvider';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar } from '@/components/ui/organisms';
import { artistService, eventArtistService } from '@/lib/services/ArtistService';
import { toast } from 'sonner';

// ── Constantes ──

const ARTIST_TYPES: { id: ArtistType; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'dj', label: 'DJ', Icon: Music },
  { id: 'photographe', label: 'Photographe', Icon: Camera },
  { id: 'lightjockey', label: 'Lightjockey', Icon: Lightbulb },
];

const TYPE_DEFAULT: ArtistType = 'dj';

// ── Component ──

export function EventArtistsSection() {
  const { event, reloadEvent } = useEventDetail();

  // Pool global (comme bénévoles)
  const [globalArtists, setGlobalArtists] = useState<Artist[]>([]);

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeType, setActiveType] = useState<ArtistType>(TYPE_DEFAULT);
  const [artistSearch, setArtistSearch] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGenre, setNewGenre] = useState('');

  // Detail panel editable fields (modal = contenu commun, pas d'horaire)
  const [detailGenre, setDetailGenre] = useState('');

  const { setToolbar } = useToolbar();

  // ── Load global artists ──

  const loadData = async () => {
    const all = await artistService.getAll();
    setGlobalArtists(all);
  };

  useEffect(() => {
    loadData();
  }, [addModalOpen]);

  // ── Toolbar ──

  useEffect(() => {
    setToolbar(
      <PageToolbar className="justify-between">
        <span className="text-xs text-zinc-400 hidden sm:block">Artistes</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Music size={13} />
            Gérer les artistes
          </button>
        </div>
      </PageToolbar>
    );
    return () => setToolbar(null);
  }, [setToolbar]);

  // ── Derived ──

  const artists = event.artists ?? [];
  const isInEvent = (artistId: string) => artists.some((a) => a.id === artistId);

  const filteredArtists = useMemo(() => {
    const q = artistSearch.trim().toLowerCase();
    const byType = globalArtists.filter((a) => (a.type ?? TYPE_DEFAULT) === activeType);
    return q ? byType.filter((a) => a.name.toLowerCase().includes(q)) : byType;
  }, [globalArtists, activeType, artistSearch]);

  const selectedArtist = selectedArtistId
    ? globalArtists.find((a) => a.id === selectedArtistId)
    : null;

  // Sync detail fields when selected artist changes
  useEffect(() => {
    if (selectedArtist) {
      setDetailGenre(selectedArtist.genre ?? '');
    }
  }, [selectedArtistId, selectedArtist]);

  // Édition détaillée sur la page (comme Post en Campagne)
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);

  // ── Actions (comme bénévoles) ──

  const handleCreateArtist = async () => {
    if (!newName.trim()) {
      setIsCreating(false);
      return;
    }
    const artist = await artistService.create({
      name: newName.trim(),
      genre: newGenre.trim(),
      type: activeType,
    });
    await eventArtistService.addArtistToEvent(event.id, artist.id);
    setNewName('');
    setNewGenre('');
    setIsCreating(false);
    await loadData();
    reloadEvent();
    toast.success(`${artist.name} ajouté à l'événement`);
  };

  const handleSaveArtistField = async (field: 'genre', value: string) => {
    if (!selectedArtistId) return;
    await artistService.update(selectedArtistId, { genre: String(value) });
    await loadData();
    reloadEvent();
  };

  const handleToggleArtistInEvent = async (artistId: string) => {
    if (isInEvent(artistId)) {
      await eventArtistService.removeArtistFromEvent(event.id, artistId);
    } else {
      await eventArtistService.addArtistToEvent(event.id, artistId);
    }
    reloadEvent();
  };

  const updateArtist = async (artistId: string, updates: Partial<Pick<Artist, 'performanceTime' | 'fee'>>) => {
    await eventArtistService.updateAssignment(event.id, artistId, {
      performanceTime: updates.performanceTime,
      fee: updates.fee,
    });
    reloadEvent();
  };

  const deleteArtist = async (artistId: string) => {
    await eventArtistService.removeArtistFromEvent(event.id, artistId);
    if (editingArtistId === artistId) setEditingArtistId(null);
    reloadEvent();
  };

  const handleRemoveArtist = async (artistId: string) => {
    await eventArtistService.removeArtistFromEvent(event.id, artistId);
    if (selectedArtistId === artistId) setSelectedArtistId(null);
    reloadEvent();
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setIsCreating(false);
    setNewName('');
    setNewGenre('');
    setSelectedArtistId(null);
  };

  // ── Render ──

  return (
    <div className="space-y-4">
      {/* Info bar */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {artists.length > 0
          ? `${artists.length} artiste${artists.length !== 1 ? 's' : ''} programmé${artists.length !== 1 ? 's' : ''}`
          : 'Aucun artiste programmé'}
      </p>

      {/* ── Cards artistes (2 colonnes indépendantes, pas de vide) ── */}
      {artists.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-3">
              {[0, 1].map((colIndex) => (
                <div key={colIndex} className="flex-1 min-w-0 flex flex-col gap-3">
                  {artists
                    .filter((_, i) => i % 2 === colIndex)
                    .map((artist) => (
                <div key={artist.id} className="group/card rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Music className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shrink-0">
                              {ARTIST_TYPES.find((t) => t.id === (artist.type ?? TYPE_DEFAULT))?.label ?? 'DJ'}
                            </span>
                            <p className="text-sm font-medium leading-snug">{artist.name}</p>
                          </div>
                          {editingArtistId === artist.id ? (
                            <Button variant="outline" size="sm" onClick={() => setEditingArtistId(null)} className="shrink-0 h-6 w-6 p-0" aria-label="Fermer">
                              <X size={12} />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <Button variant="outline" size="sm" onClick={() => setEditingArtistId(artist.id)}>
                                <Edit size={12} /> Éditer
                              </Button>
                              <button
                                type="button"
                                onClick={() => deleteArtist(artist.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-zinc-400 hover:text-red-600"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                        {artist.genre && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{artist.genre}</p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                          {artist.performanceTime && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {artist.performanceTime}
                            </p>
                          )}
                          {artist.fee != null && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {artist.fee}€
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zone d'édition (comme Post) */}
                  {editingArtistId === artist.id && (
                    <div className="border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 p-4 space-y-4 bg-white dark:bg-zinc-900/60">
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Horaire (cet événement)</label>
                        <Input
                          placeholder="23:00 – 01:00"
                          value={artist.performanceTime ?? ''}
                          onChange={(e) => updateArtist(artist.id, { performanceTime: e.target.value || undefined })}
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Cachet (€)</label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={artist.fee != null ? String(artist.fee) : ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateArtist(artist.id, { fee: v === '' ? undefined : Number(v) });
                          }}
                          fullWidth
                        />
                      </div>
                    </div>
                  )}
                </div>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
              <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Music className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Aucun artiste programmé</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Ajoute les artistes ou DJs qui se produiront lors de cet événement.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Gérer les artistes
              </Button>
            </div>
          )}

      {/* ── Modal: 3 colonnes (comme Bénévoles) ── */}
      <Modal
        isOpen={addModalOpen}
        onClose={closeAddModal}
        title="Artistes"
        size="lg"
        scrollable
      >
        <div
          className="-mx-6 -my-4 grid overflow-hidden border-t border-border-custom"
          style={{ height: '500px', gridTemplateColumns: '250px 1fr 1fr' }}
        >
          {/* ── Col 1 (gauche) : Types d'artiste ── */}
          <aside className="border-r border-border-custom flex flex-col bg-zinc-50/30 dark:bg-zinc-900/20 min-w-0">
            <div className="p-3 border-b border-border-custom">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                />
                <Input
                  value={artistSearch}
                  onChange={(e) => setArtistSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-7 h-7 text-xs"
                  fullWidth
                />
              </div>
            </div>
            <nav className="p-2 space-y-0.5">
              {ARTIST_TYPES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveType(id);
                    setSelectedArtistId(null);
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors',
                    activeType === id
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium'
                      : 'text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  )}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Col 2 (milieu) : Liste des artistes ── */}
          <div className="border-r border-border-custom flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {isCreating && (
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="w-5 h-5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 shrink-0" />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nom de l'artiste..."
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateArtist();
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewName('');
                      }
                    }}
                    onBlur={() => {
                      if (newName.trim()) handleCreateArtist();
                      else {
                        setIsCreating(false);
                        setNewName('');
                      }
                    }}
                  />
                </div>
              )}

              {filteredArtists.map((artist) => (
                <ArtistRow
                  key={artist.id}
                  artist={artist}
                  inEvent={isInEvent(artist.id)}
                  isSelected={selectedArtistId === artist.id}
                  onSelect={() =>
                    setSelectedArtistId(artist.id === selectedArtistId ? null : artist.id)
                  }
                  onToggleInEvent={() => handleToggleArtistInEvent(artist.id)}
                  onRemove={() => handleRemoveArtist(artist.id)}
                />
              ))}

              {!isCreating && filteredArtists.length === 0 && (
                <p className="text-sm text-zinc-400 text-center py-8">Aucun artiste</p>
              )}
            </div>
          </div>

          {/* ── Col 3 (droite) : Détails / infos (contenu commun, pas d'horaire) ── */}
          <div className="overflow-y-auto p-5 min-w-0">
            {selectedArtist ? (
              <ArtistDetailsPanel
                artist={selectedArtist}
                genre={detailGenre}
                setGenre={setDetailGenre}
                onBack={() => setSelectedArtistId(null)}
                onSave={handleSaveArtistField}
              />
            ) : (
              <ArtistsOverviewPanel
                dj={artists.filter((a) => (a.type ?? TYPE_DEFAULT) === 'dj').length}
                photographe={artists.filter((a) => (a.type ?? TYPE_DEFAULT) === 'photographe').length}
                lightjockey={artists.filter((a) => (a.type ?? TYPE_DEFAULT) === 'lightjockey').length}
                total={artists.length}
              />
            )}
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsCreating(true);
              setNewName('');
              setNewGenre('');
            }}
          >
            <Plus size={14} className="mr-1" />
            Nouvel artiste
          </Button>
          <Button variant="ghost" size="sm" onClick={closeAddModal}>
            Fermer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// ── Sub-component: row in the middle column ──

interface ArtistRowProps {
  artist: Artist;
  inEvent: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleInEvent: () => void;
  onRemove: () => void;
}

function ArtistRow({ artist, inEvent, isSelected, onSelect, onToggleInEvent, onRemove }: ArtistRowProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors group/artist',
        isSelected
          ? 'bg-zinc-200 dark:bg-zinc-700'
          : inEvent
          ? 'bg-zinc-100 dark:bg-zinc-800/70 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
      )}
    >
      {/* Toggle add/remove (comme VolunteerRow) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleInEvent();
        }}
        className={cn(
          'flex items-center justify-center w-5 h-5 rounded-full shrink-0 transition-colors',
          inEvent
            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
            : 'border border-zinc-300 dark:border-zinc-600 text-transparent group-hover/artist:border-zinc-400'
        )}
        title={inEvent ? 'Retirer de l\'événement' : 'Ajouter à l\'événement'}
      >
        <Check size={11} />
      </button>
      <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 truncate">{artist.name}</span>
      {inEvent && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover/artist:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all shrink-0"
          title="Retirer"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ── Sub-component: detail panel (modal = contenu commun, pas d'horaire) ──

interface ArtistDetailsPanelProps {
  artist: Artist;
  genre: string;
  setGenre: (v: string) => void;
  onBack: () => void;
  onSave: (field: 'genre', value: string) => void;
}

function ArtistDetailsPanel({
  artist,
  genre,
  setGenre,
  onBack,
  onSave,
}: ArtistDetailsPanelProps) {
  const typeLabel = ARTIST_TYPES.find((t) => t.id === (artist.type ?? TYPE_DEFAULT))?.label ?? 'DJ';

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-zinc-500 -ml-2">
        <ArrowLeft size={14} className="mr-1" />
        Retour
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <Music size={20} className="text-zinc-400" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-foreground leading-tight">{artist.name}</h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{typeLabel}</span>
        </div>
      </div>

      <div className="border-t border-border-custom pt-4 space-y-3">
        <DetailField
          icon={<FileText size={13} />}
          value={genre}
          placeholder="Genre (Techno, House…)"
          onChange={setGenre}
          onBlur={() => onSave('genre', genre)}
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

function DetailField({
  icon,
  value,
  placeholder,
  onChange,
  onBlur,
  type = 'text',
}: DetailFieldProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-zinc-400 shrink-0">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 outline-none text-sm py-1 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-800 dark:text-zinc-200"
      />
    </div>
  );
}

// ── Sub-component: overview panel ──

interface ArtistsOverviewPanelProps {
  dj: number;
  photographe: number;
  lightjockey: number;
  total: number;
}

function ArtistsOverviewPanel({ dj, photographe, lightjockey, total }: ArtistsOverviewPanelProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Vue d&apos;ensemble
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="DJ" value={dj} />
        <StatCard label="Photographe" value={photographe} />
        <StatCard label="Lightjockey" value={lightjockey} />
        <StatCard label="Total" value={total} />
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-300 dark:text-zinc-700">
          <Music size={28} className="mb-2" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center">
            Sélectionnez un type d&apos;artiste
            <br />
            et ajoutez des artistes
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
      <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</div>
    </div>
  );
}
