'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { cn } from '@/lib/utils';
import { Plus, ChevronDown, CalendarDays, ClipboardList, FileText, Bell, MapPin, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

import { getEvents } from '@/lib/localStorage/events';
import { getCampaigns } from '@/lib/localStorage/communication';
import { createReminder } from '@/lib/localStorage/reminders';
import { toast } from 'sonner';

import type { Event as BKEvent } from '@/types/event';
import type { Meeting } from '@/types/meeting';

interface CalendarLayoutProps {
  children: React.ReactNode;
  meetings: Meeting[];
}

export function CalendarLayout({ children, meetings }: CalendarLayoutProps) {
  const { toolbar } = useToolbar();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reminderTime, setReminderTime] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const now = new Date();

  const nextEvent = useMemo(() => {
    const events = getEvents();
    return events
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
  }, []);

  const nextMeeting = useMemo(() => {
    return meetings
      .filter((m) => new Date(m.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
  }, [meetings]);

  const todayPosts = useMemo(() => {
    const campaigns = getCampaigns();
    const today = new Date();
    const posts: { id: string; campaignId: string; campaignName: string; caption: string; platform: string; scheduledDate: Date }[] = [];
    for (const c of campaigns) {
      for (const p of c.posts) {
        if (p.scheduledDate && isSameDay(new Date(p.scheduledDate), today)) {
          posts.push({
            id: p.id,
            campaignId: c.id,
            campaignName: c.name,
            caption: p.caption || p.brainstorming?.objective || 'Post sans titre',
            platform: p.platform,
            scheduledDate: new Date(p.scheduledDate),
          });
        }
      }
    }
    return posts;
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleCreateReminder = () => {
    if (!reminderTitle.trim()) return;
    createReminder({ title: reminderTitle.trim(), date: reminderDate, time: reminderTime || undefined });
    toast.success('Rappel créé');
    setReminderTitle('');
    setReminderTime('');
    setReminderModalOpen(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)]">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 space-y-4">

          {/* En-tête : titre + split button */}
          <div className="flex items-center justify-between px-2">
            <h2 className="font-bold text-sm">Planificateurs</h2>
            <div className="relative flex" ref={dropdownRef}>
              <button
                onClick={() => setReminderModalOpen(true)}
                className="flex items-center justify-center h-7 w-7 rounded-l-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                title="Nouveau rappel"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center justify-center h-7 w-5 rounded-r-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors border-l border-zinc-700 dark:border-zinc-300"
              >
                <ChevronDown size={11} className={cn('transition-transform', dropdownOpen && 'rotate-180')} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 bg-card-bg border border-border-custom rounded-lg shadow-lg py-1 w-36">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setReminderModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Bell size={12} />
                    Rappel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">

            {/* Prochain événement */}
            <SidebarCard
              icon={<CalendarDays size={14} className="text-purple-500" />}
              label="Prochain événement"
              href={nextEvent ? `/dashboard/events/${nextEvent.id}` : undefined}
            >
              {nextEvent ? (
                <div>
                  <p className="text-sm font-medium truncate">{nextEvent.name}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                    <Clock size={10} />
                    <span>{format(new Date(nextEvent.date), "d MMM 'à' HH:mm", { locale: fr })}</span>
                  </div>
                  {nextEvent.location && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
                      <MapPin size={10} />
                      <span className="truncate">{nextEvent.location}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">Aucun événement à venir</p>
              )}
            </SidebarCard>

            {/* Prochaine réunion */}
            <SidebarCard
              icon={<ClipboardList size={14} className="text-blue-500" />}
              label="Prochaine réunion"
              href={nextMeeting ? `/dashboard/meetings/${nextMeeting.id}` : undefined}
            >
              {nextMeeting ? (
                <div>
                  <p className="text-sm font-medium truncate">{nextMeeting.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                    <Clock size={10} />
                    <span>{format(new Date(nextMeeting.date), "d MMM", { locale: fr })} {nextMeeting.startTime}</span>
                  </div>
                  {nextMeeting.location && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
                      <MapPin size={10} />
                      <span className="truncate">{nextMeeting.location}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">Aucune réunion à venir</p>
              )}
            </SidebarCard>

            {/* Choses à faire aujourd'hui (posts campagnes) */}
            <SidebarCard
              icon={<FileText size={14} className="text-amber-500" />}
              label="À faire aujourd'hui"
            >
              {todayPosts.length > 0 ? (
                <div className="space-y-2">
                  {todayPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/dashboard/communication`}
                      className="block p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <p className="text-xs font-medium truncate">{p.caption}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-zinc-400 capitalize">{p.platform}</span>
                        <span className="text-[10px] text-zinc-400">·</span>
                        <span className="text-[10px] text-zinc-400">{p.campaignName}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">Rien de programmé aujourd&apos;hui</p>
              )}
            </SidebarCard>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">

        {toolbar && (
          <div className="sticky top-0 z-20 shrink-0">
            {toolbar}
          </div>
        )}

        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Mini-modal rappel */}
      {reminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card-bg border border-border-custom rounded-xl shadow-2xl w-80 p-5 space-y-4">
            <h3 className="text-sm font-semibold">Nouveau rappel</h3>
            <input
              autoFocus
              type="text"
              placeholder="Titre du rappel"
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateReminder()}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-24 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReminderModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateReminder}
                disabled={!reminderTitle.trim()}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-30 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-component ──

interface SidebarCardProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  children: React.ReactNode;
}

function SidebarCard({ icon, label, href, children }: SidebarCardProps) {
  const content = (
    <div className="rounded-lg border border-border-custom p-3 space-y-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}
