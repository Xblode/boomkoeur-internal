"use client";

import React, { useState, useRef, useEffect } from 'react';
import { EventStatus, EventPriority } from '@/types/event';
import { EventStatusBadge } from './EventStatusBadge';
import { EventProgressTimeline } from './EventProgressTimeline';
import { Button, Textarea, Calendar, Popover, PopoverContent, PopoverTrigger, InlineEdit } from '@/components/ui/atoms';
import { TimePicker, MemberPicker, SectionHeader, TagMultiSelect } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  MapPin,
  Pencil,
  Check,
  ChevronRight,
  ChevronDown,
  AlignLeft,
  Activity,
  Clock,
  CircleDot,
  Flag,
  Users,
} from 'lucide-react';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEventDetail } from './EventDetailProvider';

const WORKFLOW_PHASE_LABELS: Record<string, string> = {
  preparation: 'Préparation',
  production: 'Production',
  communication: 'Communication',
  postEvent: 'Post-Event',
};

const WORKFLOW_STEP_LABELS: Record<string, string[]> = {
  preparation: ['Plan de Communication', 'Event Shotgun', 'Visuels primaires'],
  production: ['Calendrier éditorial', 'Posts préparés', 'Textes & captions', 'Lancement Annonce'],
  communication: ['Campagne en cours', 'Event\nJ-0'],
  postEvent: ['Publication des photos', 'Bilan & statistiques'],
};

const PRIORITY_CONFIG: Record<EventPriority, { label: string; className: string }> = {
  low:    { label: 'Faible',   className: 'text-zinc-500 dark:text-zinc-400' },
  medium: { label: 'Normale',  className: 'text-blue-600 dark:text-blue-400' },
  high:   { label: 'Haute',    className: 'text-orange-600 dark:text-orange-400' },
  urgent: { label: 'Urgente',  className: 'text-red-600 dark:text-red-400' },
};

export function EventInfoSection() {
  const { event, persistField } = useEventDetail();

  // ── Local editing state ──
  const [editingField, setEditingField] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState(event.name);
  const [locationValue, setLocationValue] = useState(event.location);
  const [briefValue, setBriefValue] = useState(event.brief ?? '');
  const [descriptionValue, setDescriptionValue] = useState(event.description);
  const [dateValue, setDateValue] = useState<Date>(new Date(event.date));
  const [startTime, setStartTime] = useState(format(new Date(event.date), 'HH:mm'));
  const [endTimeValue, setEndTimeValue] = useState(event.endTime ?? '');
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [priorityValue, setPriorityValue] = useState<EventPriority | undefined>(event.priority);
  const [assigneesValue, setAssigneesValue] = useState<string[]>(event.assignees ?? []);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const assigneesCellRef = useRef<HTMLDivElement>(null);
  const [assigneesPickerOpen, setAssigneesPickerOpen] = useState(false);

  // Sync local state when event changes externally (e.g. modal edit)
  useEffect(() => {
    setNameValue(event.name);
    setLocationValue(event.location);
    setBriefValue(event.brief ?? '');
    setDescriptionValue(event.description);
    setDateValue(new Date(event.date));
    setStartTime(format(new Date(event.date), 'HH:mm'));
    setEndTimeValue(event.endTime ?? '');
    setPriorityValue(event.priority);
    setAssigneesValue(event.assignees ?? []);
  }, [event.name, event.location, event.brief, event.description, event.date, event.endTime, event.priority, event.assignees]);

  // ── Name ──
  const startEditingName = () => {
    setEditingField('name');
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };
  const saveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== event.name) persistField({ name: trimmed });
    else setNameValue(event.name);
    setEditingField(null);
  };
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') { setNameValue(event.name); setEditingField(null); }
  };

  // ── Location ──
  const saveLocation = () => {
    const trimmed = locationValue.trim();
    if (trimmed && trimmed !== event.location) persistField({ location: trimmed });
    else setLocationValue(event.location);
    setEditingField(null);
  };
  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveLocation();
    if (e.key === 'Escape') { setLocationValue(event.location); setEditingField(null); }
  };

  // ── Date ──
  const buildDate = (day: Date, time: string): Date => {
    const [h, m] = time.split(':').map(Number);
    return setMinutes(setHours(day, h || 0), m || 0);
  };
  const handleCalendarSelect = (selected?: Date) => {
    if (!selected) return;
    const newDate = buildDate(selected, startTime);
    setDateValue(newDate);
    persistField({ date: newDate });
  };
  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    const newDate = buildDate(dateValue, time);
    setDateValue(newDate);
    persistField({ date: newDate });
  };
  const handleEndTimeChange = (time: string) => {
    setEndTimeValue(time);
    persistField({ endTime: time });
  };

  // ── Duration ──
  const computeDuration = (): string => {
    if (!endTimeValue) return '—';
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTimeValue.split(':').map(Number);
    let totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMinutes <= 0) totalMinutes += 24 * 60;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
  };

  // ── Status ──
  const handleStatusChange = (status: EventStatus) => {
    persistField({ status });
  };

  // ── Priority ──
  const handlePriorityChange = (priority: EventPriority) => {
    setPriorityValue(priority);
    persistField({ priority });
  };


  // ── Tags ──
  const handleTagsChange = (tags: string[]) => {
    persistField({ tags });
  };

  // ── Brief ──
  const saveBrief = () => {
    const trimmed = briefValue.trim();
    if (trimmed !== (event.brief ?? '')) persistField({ brief: trimmed });
    setEditingField(null);
  };
  const handleBriefKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setBriefValue(event.brief ?? ''); setEditingField(null); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveBrief();
  };

  // ── Description (Bio) ──
  const saveDescription = () => {
    const trimmed = descriptionValue.trim();
    if (trimmed !== event.description) persistField({ description: trimmed });
    setEditingField(null);
  };
  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDescriptionValue(event.description); setEditingField(null); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveDescription();
  };

  const titleBlock = (
    <InlineEdit
      ref={nameInputRef}
      value={nameValue}
      onChange={(e) => setNameValue(e.target.value)}
      onBlur={saveName}
      onKeyDown={handleNameKeyDown}
      onFocus={() => setEditingField('name')}
      placeholder="Titre de la soirée"
      variant="title"
    />
  );

  const metadata = [
    [
      { icon: CalendarIcon, label: 'Date', value: (
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="group flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors h-auto font-normal">
              <span>{format(dateValue, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}{endTimeValue && ` — ${endTimeValue}`}</span>
              <Pencil size={11} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <Calendar mode="single" selected={dateValue} onSelect={handleCalendarSelect} initialFocus />
              <div className="border-t border-border-custom pt-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500 shrink-0">Début</span>
                  <TimePicker time={startTime} onChange={handleStartTimeChange} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500 shrink-0">Fin</span>
                  <TimePicker time={endTimeValue || '23:59'} onChange={handleEndTimeChange} />
                </div>
              </div>
              <Button size="sm" variant="primary" className="w-full" onClick={() => setDatePopoverOpen(false)}>
                <Check size={14} /> Confirmer
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )},
      { icon: Activity, label: 'État', value: (
        <div className="flex items-center px-3 py-2">
          {event.comWorkflow ? (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-zinc-500">{WORKFLOW_PHASE_LABELS[event.comWorkflow.activePhase]}</span>
              <ChevronRight size={12} className="text-zinc-400 shrink-0" />
              <span className="text-foreground">{WORKFLOW_STEP_LABELS[event.comWorkflow.activePhase]?.[event.comWorkflow.activeStep ?? 0] ?? '—'}</span>
            </div>
          ) : (
            <span className="text-sm text-zinc-400">Non démarré</span>
          )}
        </div>
      )},
    ],
    [
      { icon: MapPin, label: 'Lieu', value: (
        <div
          className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
          onClick={() => {
            setEditingField('location');
            setTimeout(() => locationInputRef.current?.focus(), 0);
          }}
        >
          <InlineEdit
            ref={locationInputRef}
            value={locationValue}
            onChange={(e) => setLocationValue(e.target.value)}
            onBlur={saveLocation}
            onKeyDown={handleLocationKeyDown}
            onFocus={() => setEditingField('location')}
            placeholder="Lieu"
            variant="default"
            showEditIcon={false}
            className="flex-1 min-w-0"
          />
          <Pencil size={11} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
        </div>
      )},
      { icon: Users, label: 'Assignées', value: (
        <div
          ref={assigneesCellRef}
          className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
          onClick={() => setAssigneesPickerOpen(true)}
        >
          <MemberPicker
            value={assigneesValue}
            onChange={(next) => {
              setAssigneesValue(next);
              persistField({ assignees: next });
            }}
            open={assigneesPickerOpen}
            onOpenChange={setAssigneesPickerOpen}
            cellRef={assigneesCellRef}
            className="flex-1"
          />
          <Users size={11} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
        </div>
      )},
    ],
    [
      { icon: CircleDot, label: 'Statut', value: (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left h-auto font-normal">
              <EventStatusBadge status={event.status} />
              <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" align="start">
            <div className="flex flex-col gap-0.5">
              {(['idea', 'preparation', 'confirmed', 'completed', 'archived'] as EventStatus[]).map(s => (
                <Button
                  key={s}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusChange(s)}
                  className={cn(
                    'flex items-center px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full justify-start font-normal',
                    event.status === s && 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                >
                  <EventStatusBadge status={s} />
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )},
      { icon: Flag, label: 'Priorité', value: (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left text-sm h-auto font-normal">
              {priorityValue ? (
                <span className={cn('font-medium', PRIORITY_CONFIG[priorityValue].className)}>
                  {PRIORITY_CONFIG[priorityValue].label}
                </span>
              ) : (
                <span className="text-zinc-400">—</span>
              )}
              <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" align="start">
            <div className="flex flex-col gap-0.5">
              {(Object.entries(PRIORITY_CONFIG) as [EventPriority, typeof PRIORITY_CONFIG[EventPriority]][]).map(([key, cfg]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePriorityChange(key)}
                  className={cn(
                    'flex items-center px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm text-left w-full justify-start font-normal',
                    priorityValue === key && 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                >
                  <span className={cn('font-medium', cfg.className)}>{cfg.label}</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )},
    ],
    [
      { icon: Clock, label: 'Durée', value: (
        <div className="flex items-center px-3 py-2 text-sm">
          <span className={cn(computeDuration() === '—' ? 'text-zinc-400' : 'text-foreground')}>
            {computeDuration()}
          </span>
        </div>
      )},
    ],
  ];

  const tagsSection = (
    <TagMultiSelect
      value={event.tags}
      onChange={handleTagsChange}
      placeholder="Ajouter une étiquette..."
    />
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title={titleBlock}
        metadata={metadata}
        tags={tagsSection}
      />

      {/* Timeline avancement */}
      <EventProgressTimeline />

      {/* Brief (étape 1 communication) */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlignLeft className="h-5 w-5 text-zinc-500" />
          Brief
        </h2>
        <div
          className="space-y-2"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              saveBrief();
            }
          }}
        >
          <Textarea
            value={briefValue}
            onChange={(e) => setBriefValue(e.target.value)}
            onKeyDown={handleBriefKeyDown}
            rows={4}
            placeholder="Brief de campagne : objectifs, ton, cibles, contraintes..."
            className="resize-none py-3 px-4"
          />
        </div>
      </div>

      {/* Bio (description publique) */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlignLeft className="h-5 w-5 text-zinc-500" />
          Bio
        </h2>
        <div
          className="space-y-2"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              saveDescription();
            }
          }}
        >
          <Textarea
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            onKeyDown={handleDescriptionKeyDown}
            rows={7}
            placeholder="Description publique de l'événement..."
            className="resize-none py-3 px-4"
          />
        </div>
      </div>
    </div>
  );
}
