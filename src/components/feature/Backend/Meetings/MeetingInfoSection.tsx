"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MeetingStatus, AgendaItem, AgendaDocument } from '@/types/meeting';
import { Button, Textarea, Calendar, Popover, PopoverContent, PopoverTrigger, Badge, Input } from '@/components/ui/atoms';
import { TimePicker, MemberPicker } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  MapPin,
  Pencil,
  Check,
  ChevronDown,
  X,
  AlignLeft,
  Clock,
  CircleDot,
  Users,
  ListOrdered,
  Plus,
  Trash2,
  Clock3,
  Presentation,
  Edit,
  FileText,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMeetingDetail } from './MeetingDetailProvider';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar } from '@/components/ui/organisms/PageToolbar';
import { useRouter, useParams } from 'next/navigation';

const STATUS_CONFIG: Record<MeetingStatus, { label: string; variant: 'default' | 'success' }> = {
  upcoming:  { label: 'À venir',   variant: 'default' },
  completed: { label: 'Terminée',  variant: 'success' },
};

export function MeetingInfoSection() {
  const { meeting, persistField } = useMeetingDetail();
  const { setToolbar } = useToolbar();
  const router = useRouter();
  const params = useParams();

  // ── Toolbar ──
  useEffect(() => {
    setToolbar(
      <PageToolbar className="justify-between bg-[#171717] h-10 min-h-0 p-0 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 flex-1 h-full">
          <span className="text-xs text-zinc-400 hidden sm:block">Informations</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/meetings/${params.id}/present`)}
              className="px-2 py-1 bg-white text-black rounded text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <Presentation className="w-3 h-3" />
              Mode présentation
            </button>
          </div>
        </div>
      </PageToolbar>
    );
    return () => setToolbar(null);
  }, [meeting.id, setToolbar, router, params.id]);

  // ── Local editing state ──
  const [editingField, setEditingField] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState(meeting.title);
  const [locationValue, setLocationValue] = useState(meeting.location ?? '');
  const [dateValue, setDateValue] = useState<Date>(new Date(meeting.date));
  const [startTime, setStartTime] = useState(meeting.startTime);
  const [endTimeValue, setEndTimeValue] = useState(meeting.endTime);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [participantsValue, setParticipantsValue] = useState<string[]>(meeting.participants);

  // Agenda state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<{
    title: string;
    description: string;
    duration: number;
    responsible: string;
    documents: AgendaDocument[];
    requiresVote: boolean;
  } | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemData, setNewItemData] = useState({
    title: '',
    description: '',
    duration: 15,
    responsible: '',
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const participantsCellRef = useRef<HTMLDivElement>(null);
  const [participantsPickerOpen, setParticipantsPickerOpen] = useState(false);

  // Sync local state
  useEffect(() => {
    setTitleValue(meeting.title);
    setLocationValue(meeting.location ?? '');
    setDateValue(new Date(meeting.date));
    setStartTime(meeting.startTime);
    setEndTimeValue(meeting.endTime);
    setParticipantsValue(meeting.participants);
  }, [meeting.title, meeting.location, meeting.date, meeting.startTime, meeting.endTime, meeting.participants]);

  // ── Title ──
  const saveTitle = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== meeting.title) persistField({ title: trimmed });
    else setTitleValue(meeting.title);
    setEditingField(null);
  };
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') { setTitleValue(meeting.title); setEditingField(null); }
  };

  // ── Location ──
  const saveLocation = () => {
    const trimmed = locationValue.trim();
    if (trimmed !== (meeting.location ?? '')) persistField({ location: trimmed || undefined });
    else setLocationValue(meeting.location ?? '');
    setEditingField(null);
  };
  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveLocation();
    if (e.key === 'Escape') { setLocationValue(meeting.location ?? ''); setEditingField(null); }
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
    persistField({ startTime: time });
  };
  const handleEndTimeChange = (time: string) => {
    setEndTimeValue(time);
    persistField({ endTime: time });
  };

  // ── Duration ──
  const computeDuration = (): string => {
    if (!endTimeValue || !startTime) return '—';
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTimeValue.split(':').map(Number);
    let totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMinutes <= 0) totalMinutes += 24 * 60;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
  };

  // ── Status ──
  const handleStatusChange = (status: MeetingStatus) => {
    persistField({ status });
  };

  // ── Participants ──
  const handleParticipantsChange = (next: string[]) => {
    setParticipantsValue(next);
    persistField({ participants: next });
  };

  // ── Agenda items ──
  const toggleEditItem = (itemId: string) => {
    if (editingItemId === itemId) {
      // Save & close
      if (editingItemData) {
        const updatedAgenda = meeting.agenda.map(item =>
          item.id === itemId
            ? { ...item, ...editingItemData, description: editingItemData.description || undefined }
            : item
        );
        persistField({ agenda: updatedAgenda });
      }
      setEditingItemId(null);
      setEditingItemData(null);
      setNewDocName('');
      setNewDocUrl('');
    } else {
      const item = meeting.agenda.find(i => i.id === itemId);
      if (!item) return;
      setEditingItemId(itemId);
      setEditingItemData({
        title: item.title,
        description: item.description || '',
        duration: item.duration,
        responsible: item.responsible || '',
        documents: item.documents || [],
        requiresVote: item.requiresVote,
      });
      setNewDocName('');
      setNewDocUrl('');
    }
  };

  const handleAddDocument = () => {
    if (!newDocName.trim() || !editingItemData) return;
    const doc: AgendaDocument = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      url: newDocUrl.trim(),
    };
    setEditingItemData(prev => prev ? { ...prev, documents: [...prev.documents, doc] } : null);
    setNewDocName('');
    setNewDocUrl('');
  };

  const handleRemoveDocument = (docId: string) => {
    setEditingItemData(prev =>
      prev ? { ...prev, documents: prev.documents.filter(d => d.id !== docId) } : null
    );
  };

  const handleDeleteAgendaItem = (itemId: string) => {
    const updatedAgenda = meeting.agenda.filter(item => item.id !== itemId);
    persistField({ agenda: updatedAgenda });
  };

  const handleAddAgendaItem = () => {
    if (!newItemData.title.trim()) return;
    const newItem: AgendaItem = {
      id: `agenda-${Date.now()}`,
      order: meeting.agenda.length + 1,
      title: newItemData.title.trim(),
      description: newItemData.description.trim() || undefined,
      duration: newItemData.duration,
      responsible: newItemData.responsible.trim() || undefined,
      documents: [],
      requiresVote: false,
    };
    persistField({ agenda: [...meeting.agenda, newItem] });
    setNewItemData({ title: '', description: '', duration: 15, responsible: '' });
    setIsAddingItem(false);
  };

  const totalDuration = meeting.agenda.reduce((sum, item) => sum + item.duration, 0);

  return (
    <div className="space-y-8">

      {/* Header: title + metadata grid */}
      <div className="pb-6 border-b border-border-custom space-y-3">

        {/* Inline editable title */}
        <div className="flex flex-col items-start gap-2">
          <div className={cn(
            'group inline-flex items-center gap-2 rounded-lg p-1 -m-1 transition-colors cursor-text',
            editingField === 'title'
              ? 'border border-zinc-200 dark:border-zinc-800'
              : 'border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
          )}>
            <div className="inline-grid text-3xl font-bold">
              <span className="invisible col-start-1 row-start-1 whitespace-pre leading-tight">
                {titleValue || 'Titre'}
              </span>
              <input
                ref={nameInputRef}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onFocus={() => setEditingField('title')}
                onBlur={saveTitle}
                onKeyDown={handleTitleKeyDown}
                placeholder="Titre de la réunion"
                className="col-start-1 row-start-1 bg-transparent border-0 outline-none text-3xl font-bold text-foreground p-0 leading-tight placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
              />
            </div>
            <Pencil size={16} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
          </div>
        </div>

        {/* 4-column metadata grid */}
        <div>
          <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: '120px 1fr 120px 1fr' }}>

            {/* Row 1: Date / Statut */}
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <CalendarIcon size={14} className="shrink-0" />
              <span>Date</span>
            </div>
            <div>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="group flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors">
                    <span>{format(dateValue, "EEEE d MMMM yyyy", { locale: fr })} · {startTime}{endTimeValue && ` — ${endTimeValue}`}</span>
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
              <CircleDot size={14} className="shrink-0" />
              <span>Statut</span>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left">
                    <Badge variant={STATUS_CONFIG[meeting.status].variant}>
                      {STATUS_CONFIG[meeting.status].label}
                    </Badge>
                    <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start">
                  <div className="flex flex-col gap-0.5">
                    {(['upcoming', 'completed'] as MeetingStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={cn(
                          'flex items-center px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
                          meeting.status === s && 'bg-zinc-100 dark:bg-zinc-800'
                        )}
                      >
                        <Badge variant={STATUS_CONFIG[s].variant}>{STATUS_CONFIG[s].label}</Badge>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Row 2: Lieu / Participants */}
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
              <span>Participants</span>
            </div>
            <div
              ref={participantsCellRef}
              className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
              onClick={() => setParticipantsPickerOpen(true)}
            >
              <MemberPicker
                value={participantsValue}
                onChange={handleParticipantsChange}
                open={participantsPickerOpen}
                onOpenChange={setParticipantsPickerOpen}
                cellRef={participantsCellRef}
                className="flex-1"
              />
              <Users size={11} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </div>

            {/* Row 3: Durée */}
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
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlignLeft className="h-5 w-5 text-zinc-500" />
          Description
        </h2>
        <DescriptionEditor meeting={meeting} persistField={persistField} />
      </div>

      {/* Ordre du jour */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-zinc-500" />
            Ordre du jour
          </h2>
          {meeting.agenda.length > 0 && (
            <span className="text-sm text-zinc-500">
              {meeting.agenda.length} point{meeting.agenda.length > 1 ? 's' : ''} · {totalDuration} min
            </span>
          )}
        </div>

        {meeting.agenda.length === 0 && !isAddingItem ? (
          <div className="flex flex-col items-center text-center gap-4 py-12 border border-dashed border-border-custom rounded-lg">
            <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <ListOrdered size={28} className="text-zinc-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Aucun point à l&apos;ordre du jour</h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Ajoutez des points pour structurer votre réunion.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsAddingItem(true)}>
              <Plus size={14} /> Ajouter un point
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {meeting.agenda.map((item, index) => {
              const isEditing = editingItemId === item.id;

              return (
                <div key={item.id} className="group/card rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden">

                  {/* ── Always visible header ── */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-semibold text-xs">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium leading-snug">{item.title}</p>
                          {(isEditing ? editingItemData?.requiresVote : item.requiresVote) && (
                            <Badge variant={
                              item.voteResult === 'approved' ? 'success' :
                              item.voteResult === 'rejected' ? 'destructive' : 'warning'
                            }>
                              {item.voteResult === 'approved' ? 'Approuvé' :
                               item.voteResult === 'rejected' ? 'Rejeté' : 'Vote'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <Clock3 size={12} /> {item.duration} min
                          </span>
                          {item.responsible && (
                            <span className="text-xs text-zinc-500">{item.responsible}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      {isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleEditItem(item.id)}
                          className="shrink-0 h-7 w-7 p-0"
                          aria-label="Fermer"
                        >
                          <X size={12} />
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEditItem(item.id)}
                            className="h-7 text-xs px-2"
                          >
                            <Edit size={12} /> Éditer
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAgendaItem(item.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Edit zone (expands below) ── */}
                  {isEditing && editingItemData && (
                    <div className="border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 p-4 space-y-4 bg-white dark:bg-zinc-900/60">

                      {/* Fields */}
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-6">
                          <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Titre</label>
                          <Input
                            value={editingItemData.title}
                            onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                            placeholder="Titre du point"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                          <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Durée (min)</label>
                          <Input
                            type="number"
                            value={editingItemData.duration}
                            onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, duration: Number(e.target.value) }) : null)}
                            min="5"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-4">
                          <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Responsable</label>
                          <Input
                            value={editingItemData.responsible}
                            onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, responsible: e.target.value }) : null)}
                            placeholder="Responsable"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Description</label>
                        <Textarea
                          value={editingItemData.description}
                          onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                          placeholder="Description du point (optionnelle)"
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      {/* Vote toggle */}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Vote requis</p>
                          <p className="text-xs text-zinc-400 mt-0.5">Ce point nécessite un vote lors de la réunion</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingItemData(prev => prev ? { ...prev, requiresVote: !prev.requiresVote } : null)}
                          className={cn(
                            'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                            editingItemData.requiresVote
                              ? 'bg-zinc-900 dark:bg-white'
                              : 'bg-zinc-200 dark:bg-zinc-700'
                          )}
                        >
                          <span className={cn(
                            'inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-zinc-900 transition-transform',
                            editingItemData.requiresVote ? 'translate-x-[18px]' : 'translate-x-[3px]'
                          )} />
                        </button>
                      </div>

                      {/* Documents */}
                      <div>
                        <label className="text-xs font-medium text-zinc-500 mb-2 block uppercase tracking-wide">
                          Documents
                          {editingItemData.documents.length > 0 && (
                            <span className="ml-1.5 text-zinc-400 normal-case font-normal">({editingItemData.documents.length})</span>
                          )}
                        </label>

                        {editingItemData.documents.length > 0 && (
                          <div className="space-y-1.5 mb-3">
                            {editingItemData.documents.map((doc, docIndex) => (
                              <div key={doc.id ?? `doc-${docIndex}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-800/40">
                                <FileText size={13} className="text-zinc-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{doc.name}</p>
                                  {doc.url && <p className="text-xs text-zinc-400 truncate">{doc.url}</p>}
                                </div>
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-foreground transition-colors"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(doc.id)}
                                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add document */}
                        <div className="flex gap-2">
                          <Input
                            value={newDocName}
                            onChange={e => setNewDocName(e.target.value)}
                            placeholder="Nom du document"
                            className="flex-1"
                            onKeyDown={e => { if (e.key === 'Enter') handleAddDocument(); }}
                          />
                          <div className="flex items-center gap-1.5 flex-1 px-2 rounded-md border border-border-custom bg-card-bg text-sm text-zinc-500">
                            <Link2 size={13} className="shrink-0" />
                            <input
                              value={newDocUrl}
                              onChange={e => setNewDocUrl(e.target.value)}
                              placeholder="URL ou lien (optionnel)"
                              className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-400 py-1.5"
                              onKeyDown={e => { if (e.key === 'Enter') handleAddDocument(); }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddDocument}
                            disabled={!newDocName.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium disabled:opacity-30 transition-opacity hover:opacity-90 shrink-0"
                          >
                            <Plus size={12} /> Ajouter
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}

            {/* Add new item form */}
            {isAddingItem ? (
              <div className="border border-dashed border-border-custom rounded-lg p-5 space-y-3">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6">
                    <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Titre</label>
                    <Input
                      value={newItemData.title}
                      onChange={(e) => setNewItemData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre du point"
                      autoFocus
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Durée (min)</label>
                    <Input
                      type="number"
                      value={newItemData.duration}
                      onChange={(e) => setNewItemData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      min="5"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Responsable</label>
                    <Input
                      value={newItemData.responsible}
                      onChange={(e) => setNewItemData(prev => ({ ...prev, responsible: e.target.value }))}
                      placeholder="Responsable"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Description</label>
                  <Textarea
                    value={newItemData.description}
                    onChange={(e) => setNewItemData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du point (optionnelle)"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => { setIsAddingItem(false); setNewItemData({ title: '', description: '', duration: 15, responsible: '' }); }} variant="secondary" size="sm">
                    <X size={14} /> Annuler
                  </Button>
                  <Button onClick={handleAddAgendaItem} size="sm" disabled={!newItemData.title.trim()}>
                    <Check size={14} /> Ajouter
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingItem(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border-custom rounded-lg text-sm text-zinc-500 hover:text-foreground hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <Plus size={14} />
                Ajouter un point à l&apos;ordre du jour
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DescriptionEditor({ meeting, persistField }: { meeting: { description?: string } & Record<string, any>; persistField: (updates: Record<string, any>) => void }) {
  const description = meeting.description ?? '';
  const [descriptionValue, setDescriptionValue] = useState(description);

  useEffect(() => {
    setDescriptionValue(meeting.description ?? '');
  }, [meeting.description]);

  const save = () => {
    const trimmed = descriptionValue.trim();
    if (trimmed !== description) {
      persistField({ description: trimmed });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDescriptionValue(description); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') save();
  };

  return (
    <div
      className="space-y-2"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) save();
      }}
    >
      <Textarea
        value={descriptionValue}
        onChange={(e) => setDescriptionValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={5}
        placeholder="Ajouter une description ou un contexte pour la réunion..."
        className="resize-none py-3 px-4"
      />
    </div>
  );
}
