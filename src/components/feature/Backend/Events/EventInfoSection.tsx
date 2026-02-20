"use client";

import React, { useState, useRef, useEffect } from 'react';
import { EventStatus, EventPriority } from '@/types/event';
import { EventStatusBadge } from './EventStatusBadge';
import { Button, Textarea, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';
import { TimePicker, MemberPicker } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  MapPin,
  Pencil,
  Check,
  ChevronRight,
  ChevronDown,
  X,
  AlignLeft,
  Activity,
  Clock,
  CircleDot,
  Flag,
  Tag,
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
  const [descriptionValue, setDescriptionValue] = useState(event.description);
  const [dateValue, setDateValue] = useState<Date>(new Date(event.date));
  const [startTime, setStartTime] = useState(format(new Date(event.date), 'HH:mm'));
  const [endTimeValue, setEndTimeValue] = useState(event.endTime ?? '');
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [priorityValue, setPriorityValue] = useState<EventPriority | undefined>(event.priority);
  const [assigneesValue, setAssigneesValue] = useState<string[]>(event.assignees ?? []);
  const [tagsInput, setTagsInput] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const assigneesCellRef = useRef<HTMLDivElement>(null);
  const [assigneesPickerOpen, setAssigneesPickerOpen] = useState(false);

  // Sync local state when event changes externally (e.g. modal edit)
  useEffect(() => {
    setNameValue(event.name);
    setLocationValue(event.location);
    setDescriptionValue(event.description);
    setDateValue(new Date(event.date));
    setStartTime(format(new Date(event.date), 'HH:mm'));
    setEndTimeValue(event.endTime ?? '');
    setPriorityValue(event.priority);
    setAssigneesValue(event.assignees ?? []);

  }, [event.name, event.location, event.description, event.date, event.endTime, event.priority, event.assignees]);

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
  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || event.tags.includes(trimmed)) return;
    persistField({ tags: [...event.tags, trimmed] });
    setTagsInput('');
  };
  const handleRemoveTag = (tag: string) => {
    persistField({ tags: event.tags.filter(t => t !== tag) });
  };

  // ── Description ──
  const saveDescription = () => {
    const trimmed = descriptionValue.trim();
    if (trimmed !== event.description) persistField({ description: trimmed });
    setEditingField(null);
  };
  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDescriptionValue(event.description); setEditingField(null); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveDescription();
  };

  return (
    <div className="space-y-8">

      {/* Header: title + metadata grid */}
      <div className="pb-6 border-b border-border-custom space-y-3">

        {/* Inline editable title */}
        <div className="flex flex-col items-start gap-2">
          <div className={cn(
            'group inline-flex items-center gap-2 rounded-lg p-1 -m-1 transition-colors cursor-text',
            editingField === 'name'
              ? 'border border-zinc-200 dark:border-zinc-800'
              : 'border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          )}>
            <div className="inline-grid text-3xl font-bold">
              <span className="invisible col-start-1 row-start-1 whitespace-pre leading-tight">
                {nameValue || 'Titre'}
              </span>
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onFocus={() => setEditingField('name')}
                onBlur={saveName}
                onKeyDown={handleNameKeyDown}
                placeholder="Titre de la soirée"
                className="col-start-1 row-start-1 bg-transparent border-0 outline-none text-3xl font-bold text-foreground p-0 leading-tight placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
              />
            </div>
            <Pencil size={16} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
          </div>
        </div>

        {/* 4-column metadata grid */}
        <div>
          <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: '120px 1fr 120px 1fr' }}>

            {/* Row 1: Date / État */}
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <CalendarIcon size={14} className="shrink-0" />
              <span>Date</span>
            </div>
            <div>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="group flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors">
                    <span>{format(dateValue, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}{endTimeValue && ` — ${endTimeValue}`}</span>
                    <Pencil size={11} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
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
            </div>
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Activity size={14} className="shrink-0" />
              <span>État</span>
            </div>
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

            {/* Row 2: Lieu / Assignées */}
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <MapPin size={14} className="shrink-0" />
              <span>Lieu</span>
            </div>
            <div>
              <div
                className={cn(
                  'group flex items-center justify-between w-full px-3 py-2 rounded-md cursor-text transition-colors',
                  editingField === 'location' ? 'bg-zinc-100/50 dark:bg-zinc-800/50' : 'hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                )}
                onClick={() => locationInputRef.current?.focus()}
              >
                <div className="inline-grid text-sm flex-1">
                  <span className="invisible col-start-1 row-start-1 whitespace-pre">{locationValue || 'Lieu'}</span>
                  <input
                    ref={locationInputRef}
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                    onFocus={() => setEditingField('location')}
                    onBlur={saveLocation}
                    onKeyDown={handleLocationKeyDown}
                    placeholder="Lieu"
                    className="col-start-1 row-start-1 bg-transparent border-0 outline-none text-sm p-0 placeholder:text-zinc-400"
                  />
                </div>
                <Pencil size={11} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Users size={14} className="shrink-0" />
              <span>Assignées</span>
            </div>
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

            {/* Row 3: Statut / Priorité */}
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <CircleDot size={14} className="shrink-0" />
              <span>Statut</span>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left">
                    <EventStatusBadge status={event.status} />
                    <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start">
                  <div className="flex flex-col gap-0.5">
                    {(['idea', 'preparation', 'confirmed', 'completed', 'archived'] as EventStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={cn(
                          'flex items-center px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
                          event.status === s && 'bg-zinc-100 dark:bg-zinc-800'
                        )}
                      >
                        <EventStatusBadge status={s} />
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Flag size={14} className="shrink-0" />
              <span>Priorité</span>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left text-sm">
                    {priorityValue ? (
                      <span className={cn('font-medium', PRIORITY_CONFIG[priorityValue].className)}>
                        {PRIORITY_CONFIG[priorityValue].label}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                    <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start">
                  <div className="flex flex-col gap-0.5">
                    {(Object.entries(PRIORITY_CONFIG) as [EventPriority, typeof PRIORITY_CONFIG[EventPriority]][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handlePriorityChange(key)}
                        className={cn(
                          'flex items-center px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm text-left',
                          priorityValue === key && 'bg-zinc-100 dark:bg-zinc-800'
                        )}
                      >
                        <span className={cn('font-medium', cfg.className)}>{cfg.label}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Row 4: Durée */}
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Clock size={14} className="shrink-0" />
              <span>Durée</span>
            </div>
            <div className="flex items-center px-3 py-2 text-sm">
              <span className={cn(computeDuration() === '—' ? 'text-zinc-400' : 'text-foreground')}>
                {computeDuration()}
              </span>
            </div>
            <div className="col-span-2" />

          </div>

          {/* Tags */}
          <div className="py-5 flex flex-wrap items-center gap-2">
            <Tag size={14} className="text-zinc-400 shrink-0" />
            {event.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs font-medium border bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors ml-0.5"
                >
                  <X size={9} />
                </button>
              </span>
            ))}
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(tagsInput); }
                if (e.key === 'Backspace' && tagsInput === '' && event.tags.length > 0) {
                  handleRemoveTag(event.tags[event.tags.length - 1]);
                }
              }}
              placeholder={event.tags.length === 0 ? 'Ajouter une étiquette...' : '+'}
              className="bg-transparent border-0 outline-none text-sm placeholder:text-zinc-400 flex-1 min-w-[140px]"
            />
          </div>
        </div>
      </div>

      {/* Inline editable description */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlignLeft className="h-5 w-5 text-zinc-500" />
          Description
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
            placeholder="Ajouter une description..."
            className="resize-none py-3 px-4"
          />
        </div>
      </div>
    </div>
  );
}
