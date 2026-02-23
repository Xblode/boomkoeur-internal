'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarClock, MapPin, Clock } from 'lucide-react';

import { Event } from '@/types/event';
import {
  Volunteer,
  PLANNING_POSTS,
  POST_LABELS,
  PostId,
  EventPlanning,
  ShiftKey,
} from '@/types/planning';
import { getEventById } from '@/lib/localStorage/events';
import { getVolunteers } from '@/lib/localStorage/volunteers';
import { getPlanningByEventId } from '@/lib/localStorage/planning';

// ── Helpers (copiés du section component) ──

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
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;

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

const POST_COLORS: Record<PostId, string> = {
  entree:    'bg-blue-100 text-blue-800',
  merch_rdr: 'bg-violet-100 text-violet-800',
  vestiaire: 'bg-amber-100 text-amber-800',
  safer:     'bg-red-100 text-red-800',
  dj:        'bg-pink-100 text-pink-800',
  photo:     'bg-teal-100 text-teal-800',
  pause:     'bg-zinc-100 text-zinc-600',
};

// ── Page ──

export default function PublicPlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [event, setEvent] = useState<Event | null | undefined>(undefined);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [planning, setPlanning] = useState<EventPlanning | null>(null);

  useEffect(() => {
    const ev = getEventById(id);
    setEvent(ev ?? null);
    if (ev) {
      setVolunteers(getVolunteers());
      setPlanning(getPlanningByEventId(id) ?? null);
    }
  }, [id]);

  const shiftKeys = useMemo(
    () => (event ? generateShiftKeys(new Date(event.date), event.endTime) : []),
    [event]
  );

  const planningVolunteers = useMemo<Volunteer[]>(() => {
    if (!planning) return [];
    return (planning.volunteerIds ?? [])
      .map((id) => volunteers.find((v) => v.id === id))
      .filter(Boolean) as Volunteer[];
  }, [planning, volunteers]);

  const getPostForCell = (volunteerId: string, shift: ShiftKey): PostId | null => {
    if (!planning) return null;
    const shiftData = planning.assignments[shift] ?? {};
    for (const post of PLANNING_POSTS) {
      if ((shiftData[post] ?? []).includes(volunteerId)) return post;
    }
    return null;
  };

  // ── States ──

  if (event === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <CalendarClock size={40} className="mx-auto mb-4 text-zinc-300" />
          <h1 className="text-xl font-semibold text-zinc-700 mb-2">Planning introuvable</h1>
          <p className="text-zinc-500 text-sm">Ce planning n&apos;existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  const startTime = format(new Date(event.date), 'HH:mm');
  const dateLabel = format(new Date(event.date), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1.5 text-sm text-zinc-500 capitalize">
                  <CalendarClock size={14} className="text-zinc-400 shrink-0" />
                  {dateLabel}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <Clock size={14} className="text-zinc-400 shrink-0" />
                  {startTime}
                  {event.endTime && ` → ${event.endTime}`}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <MapPin size={14} className="text-zinc-400 shrink-0" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-2xl font-bold text-zinc-900">{planningVolunteers.length}</div>
                <div className="text-xs text-zinc-500">bénévole{planningVolunteers.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-zinc-900">{shiftKeys.length}</div>
                <div className="text-xs text-zinc-500">créneau{shiftKeys.length !== 1 ? 'x' : ''}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Planning table ── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">

        {planningVolunteers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <CalendarClock size={40} className="mb-3 opacity-40" />
            <p className="text-base font-medium text-zinc-500">Aucun bénévole planifié</p>
            <p className="text-sm mt-1">Le planning de cet événement est vide.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-sm">
            <table
              className="text-sm bg-white"
              style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
            >
              <thead>
                <tr className="bg-zinc-50">
                  <th className="sticky left-0 z-10 bg-zinc-50 px-3 sm:px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider min-w-[100px] sm:min-w-[160px] whitespace-nowrap border-b border-r border-zinc-200" style={{ boxShadow: '1px 0 0 0 var(--color-neutral-200)' }}>
                    Bénévole
                  </th>
                  {shiftKeys.map((shift) => (
                    <th
                      key={shift}
                      className="px-3 py-3 text-center text-xs font-semibold text-zinc-600 min-w-[90px] whitespace-nowrap border-b border-r last:border-r-0 border-zinc-200"
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
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}
                  >
                    {/* Volunteer name — sticky, fond opaque obligatoire */}
                    <td
                      className={cn(
                        'sticky left-0 z-10 px-3 sm:px-4 py-3 border-b border-zinc-100 last-of-type:border-b-0 w-[100px] sm:w-[160px]',
                        idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'
                      )}
                      style={{ boxShadow: '1px 0 0 0 var(--color-neutral-200)' }}
                    >
                      <div>
                        <div className="font-semibold text-zinc-900 text-sm leading-tight">
                          {vol.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 capitalize">
                          {vol.kind === 'membre' ? 'Membre' : 'Bénévole'}
                        </div>
                      </div>
                    </td>

                    {/* Shift cells */}
                    {shiftKeys.map((shift) => {
                      const post = getPostForCell(vol.id, shift);
                      return (
                        <td
                          key={shift}
                          className="px-1.5 py-1.5 border-b border-r last:border-r-0 border-zinc-100"
                        >
                          {post ? (
                            <div
                              className={cn(
                                'flex items-center justify-center min-h-[44px] rounded-lg px-2 py-1.5 text-xs font-medium text-center leading-tight',
                                POST_COLORS[post]
                              )}
                            >
                              {POST_LABELS[post]}
                            </div>
                          ) : (
                            <div className="min-h-[44px]" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {planningVolunteers.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {PLANNING_POSTS.map((post) => (
              <span
                key={post}
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
                  POST_COLORS[post]
                )}
              >
                {POST_LABELS[post]}
              </span>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-100 py-6 mt-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 text-center text-xs text-zinc-400">
          Vue en lecture seule · Planning de l&apos;événement &ldquo;{event.name}&rdquo;
        </div>
      </footer>
    </div>
  );
}
