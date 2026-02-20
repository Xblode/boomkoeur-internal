"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, MapPin, Calendar, Loader2, Ticket } from 'lucide-react';
import { ShotgunEvent, ShotgunEventsResponse } from '@/types/shotgun';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShotgunSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (event: ShotgunEvent) => void;
}

export function ShotgunSearchModal({ isOpen, onClose, onSelect }: ShotgunSearchModalProps) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ShotgunEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchShotgunEvents = useCallback(
    async (params: URLSearchParams): Promise<ShotgunEvent[]> => {
      const res = await fetch(`/api/shotgun/events?${params.toString()}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json: ShotgunEventsResponse = await res.json();
      return json.data ?? [];
    },
    []
  );

  const sortByDateDesc = (events: ShotgunEvent[]) =>
    [...events].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

  const dedup = (events: ShotgunEvent[]) => {
    const seen = new Set<number>();
    return events.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  };

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [future, past] = await Promise.all([
        fetchShotgunEvents(new URLSearchParams()),
        fetchShotgunEvents(new URLSearchParams({ past_events: 'true', limit: '10' })),
      ]);
      const all = dedup(sortByDateDesc([...future, ...past]));
      setResults(all.slice(0, 3));
    } catch {
      setError('Impossible de charger les events Shotgun');
      setResults([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [fetchShotgunEvents]);

  const searchEvents = useCallback(
    async (name: string) => {
      setLoading(true);
      setError(null);
      try {
        const [future, past] = await Promise.all([
          fetchShotgunEvents(new URLSearchParams({ name })),
          fetchShotgunEvents(new URLSearchParams({ name, past_events: 'true', limit: '50' })),
        ]);
        const all = dedup(sortByDateDesc([...future, ...past]));
        setResults(all);
      } catch {
        setError('Impossible de charger les events Shotgun');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchShotgunEvents]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
      setInitialLoading(true);
      setIsSearching(false);
      loadInitial();
    }
  }, [isOpen, loadInitial]);

  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setIsSearching(false);
      debounceRef.current = setTimeout(() => loadInitial(), 100);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      searchEvents(query.trim());
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen, loadInitial, searchEvents]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return iso;
    }
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-[15%] z-[60] max-w-2xl mx-auto overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#171717] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 flex flex-col max-h-[70vh]">
        {/* Search input */}
        <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-3 shrink-0">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un event Shotgun..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-100"
          />
          {loading && <Loader2 size={16} className="animate-spin text-zinc-400 mr-2" />}
          <button
            onClick={onClose}
            className="ml-2 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {error && (
            <div className="py-6 text-center text-sm text-red-500">{error}</div>
          )}

          {!error && initialLoading && (
            <div className="py-8 flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 size={16} className="animate-spin" />
              Chargement des events...
            </div>
          )}

          {!error && !initialLoading && results.length === 0 && (
            <div className="py-6 text-center text-sm text-zinc-500">
              {query ? `Aucun event trouvé pour "${query}"` : 'Aucun event disponible sur votre compte Shotgun'}
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="py-1">
              {!isSearching && !initialLoading && (
                <div className="px-3 pt-1 pb-1.5">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Derniers events
                  </span>
                </div>
              )}
              {results.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onSelect(event)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left"
                >
                  {/* Cover thumbnail */}
                  {event.coverThumbnailUrl ? (
                    <img
                      src={event.coverThumbnailUrl}
                      alt=""
                      className="w-14 h-10 rounded-md object-cover shrink-0 bg-zinc-100 dark:bg-zinc-800"
                    />
                  ) : (
                    <div className="w-14 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                      <Ticket size={16} className="text-zinc-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100">
                      {event.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Calendar size={11} />
                        {formatDate(event.startTime)}
                      </span>
                      {event.geolocation?.city && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin size={11} />
                          {event.geolocation.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status / Tickets */}
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    {new Date(event.startTime) < new Date() ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        Passé
                      </span>
                    ) : event.leftTicketsCount !== undefined ? (
                      <span className="text-xs text-zinc-400 tabular-nums">
                        {event.leftTicketsCount} places
                      </span>
                    ) : null}
                    {!event.publishedAt && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        Brouillon
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-2 text-[11px] text-zinc-400 shrink-0">
          Sélectionne un event pour créer automatiquement l&apos;événement
        </div>
      </div>
    </>,
    document.body
  );
}
