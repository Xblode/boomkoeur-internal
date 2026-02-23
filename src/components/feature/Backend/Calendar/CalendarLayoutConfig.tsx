'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, ChevronDown, CalendarDays, ClipboardList, FileText, Bell, MapPin, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Button, Input, IconButton } from '@/components/ui/atoms';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { SidebarCard, SidebarHeader } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { getEvents } from '@/lib/localStorage/events';
import { getCampaigns } from '@/lib/localStorage/communication';
import { createReminder } from '@/lib/localStorage/reminders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Meeting } from '@/types/meeting';

interface CalendarLayoutConfigProps {
  children: React.ReactNode;
  meetings: Meeting[];
}

export function CalendarLayoutConfig({ children, meetings }: CalendarLayoutConfigProps) {
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

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

  const sidebarContent = (
    <>
      <SidebarHeader
        title="Planificateurs"
        actions={
          <div className="relative flex" ref={dropdownRef}>
            <IconButton
              icon={<Plus size={12} />}
              ariaLabel="Nouveau rappel"
              variant="primary"
              size="sm"
              onClick={() => setReminderModalOpen(true)}
              className="flex items-center justify-center h-6 w-6 rounded-l-md rounded-r-none [&>svg]:w-3 [&>svg]:h-3"
              title="Nouveau rappel"
            />
            <IconButton
              icon={<ChevronDown size={10} className={cn('transition-transform', dropdownOpen && 'rotate-180')} />}
              ariaLabel="Options"
              variant="primary"
              size="sm"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center justify-center h-6 w-5 rounded-r-md rounded-l-none border-l border-zinc-700 dark:border-zinc-300 [&>svg]:w-2.5 [&>svg]:h-2.5"
            />
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 bg-card-bg border border-border-custom rounded-lg shadow-lg py-1 w-36">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDropdownOpen(false);
                    setReminderModalOpen(true);
                  }}
                  className="w-full justify-start px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground transition-colors"
                >
                  <Bell size={12} />
                  Rappel
                </Button>
              </div>
            )}
          </div>
        }
      />

      <div className="space-y-3">
        <SidebarCard
          icon={CalendarDays}
          title="Prochain événement"
          href={nextEvent ? `/dashboard/events/${nextEvent.id}` : undefined}
          iconClassName="text-purple-500"
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

        <SidebarCard
          icon={ClipboardList}
          title="Prochaine réunion"
          href={nextMeeting ? `/dashboard/meetings/${nextMeeting.id}` : undefined}
          iconClassName="text-blue-500"
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

        <SidebarCard icon={FileText} title="À faire aujourd'hui" iconClassName="text-amber-500">
          {todayPosts.length > 0 ? (
            <div className="space-y-2">
              {todayPosts.map((p) => (
                <Link
                  key={p.id}
                  href="/dashboard/communication"
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
    </>
  );

  useEffect(() => {
    setMaxWidth('7xl');
    setPageSidebarConfig({
      customContent: sidebarContent,
      activeSectionId: '',
    });
    return () => setPageSidebarConfig(null);
  }, [nextEvent, nextMeeting, todayPosts, dropdownOpen, setPageSidebarConfig, setMaxWidth]);

  return (
    <>
      {children}

      {/* Mini-modal rappel */}
      <Modal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        title="Nouveau rappel"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            autoFocus
            type="text"
            placeholder="Titre du rappel"
            value={reminderTitle}
            onChange={(e) => setReminderTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateReminder()}
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="flex-1"
            />
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-24"
            />
          </div>
        </div>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReminderModalOpen(false)}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateReminder}
            disabled={!reminderTitle.trim()}
          >
            Créer
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
