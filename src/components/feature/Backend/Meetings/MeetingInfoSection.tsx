"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MeetingStatus, AgendaItem, AgendaDocument } from '@/types/meeting';
import { Button, Textarea, Calendar, Popover, PopoverContent, PopoverTrigger, Badge, Input, InlineEdit, IconButton, Label, Switch } from '@/components/ui/atoms';
import { TimePicker, MemberPicker, SectionHeader, EditableCard } from '@/components/ui/molecules';
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
import { useOrg } from '@/hooks';
import { DrivePickerModal } from '../Events/DrivePickerModal';
import { PageToolbar, PageToolbarFilters, PageToolbarActions } from '@/components/ui/organisms';
import { useRouter, useParams } from 'next/navigation';

const STATUS_CONFIG: Record<MeetingStatus, { label: string; variant: 'default' | 'success' }> = {
  upcoming:  { label: 'À venir',   variant: 'default' },
  completed: { label: 'Terminée',  variant: 'success' },
};

export function MeetingInfoSection() {
  const { meeting, persistField } = useMeetingDetail();
  const { activeOrg } = useOrg();
  const { setToolbar } = useToolbar();
  const router = useRouter();
  const params = useParams();

  // ── Toolbar ──
  useEffect(() => {
    setToolbar(
      <PageToolbar
        filters={<PageToolbarFilters><span className="text-xs text-zinc-400 hidden sm:block">Informations</span></PageToolbarFilters>}
        actions={
          <PageToolbarActions>
            <Button onClick={() => router.push(`/dashboard/meetings/${params.id}/present`)}>
              <Presentation className="w-3 h-3 mr-1.5" />
              Mode présentation
            </Button>
          </PageToolbarActions>
        }
      />
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
  const [drivePickerDocContext, setDrivePickerDocContext] = useState<{ itemId: string } | 'new' | null>(null);
  const [newItemData, setNewItemData] = useState({
    title: '',
    description: '',
    duration: 15,
    responsible: '',
    documents: [] as AgendaDocument[],
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
      documents: newItemData.documents,
      requiresVote: false,
    };
    persistField({ agenda: [...meeting.agenda, newItem] });
    setNewItemData({ title: '', description: '', duration: 15, responsible: '', documents: [] });
    setIsAddingItem(false);
  };

  const handleDriveDocSelect = (url: string, name?: string) => {
    const doc: AgendaDocument = {
      id: `doc-${Date.now()}`,
      name: name ?? 'Document',
      url,
    };
    if (drivePickerDocContext === 'new') {
      setNewItemData(prev => ({ ...prev, documents: [...prev.documents, doc] }));
    } else if (drivePickerDocContext?.itemId && editingItemData) {
      setEditingItemData(prev => prev ? { ...prev, documents: [...prev.documents, doc] } : null);
    }
    setDrivePickerDocContext(null);
  };

  const totalDuration = meeting.agenda.reduce((sum, item) => sum + item.duration, 0);

  const titleBlock = (
    <InlineEdit
      ref={nameInputRef}
      value={titleValue}
      onChange={(e) => setTitleValue(e.target.value)}
      onBlur={saveTitle}
      onKeyDown={handleTitleKeyDown}
      onFocus={() => setEditingField('title')}
      placeholder="Titre de la réunion"
      variant="title"
    />
  );

  const metadata = [
    [
      { icon: CalendarIcon, label: 'Date', value: (
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="group flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors h-auto font-normal">
              <span>{format(dateValue, "EEEE d MMMM yyyy", { locale: fr })} · {startTime}{endTimeValue && ` — ${endTimeValue}`}</span>
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
      { icon: CircleDot, label: 'Statut', value: (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left h-auto font-normal">
              <Badge variant={STATUS_CONFIG[meeting.status].variant}>
                {STATUS_CONFIG[meeting.status].label}
              </Badge>
              <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" align="start">
            <div className="flex flex-col gap-0.5">
              {(['upcoming', 'completed'] as MeetingStatus[]).map(s => (
                <Button
                  key={s}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusChange(s)}
                  className={cn(
                    'flex items-center px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full justify-start font-normal',
                    meeting.status === s && 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                >
                  <Badge variant={STATUS_CONFIG[s].variant}>{STATUS_CONFIG[s].label}</Badge>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )},
    ],
    [
      { icon: MapPin, label: 'Lieu', value: (
        <InlineEdit
          ref={locationInputRef}
          value={locationValue}
          onChange={(e) => setLocationValue(e.target.value)}
          onBlur={saveLocation}
          onKeyDown={handleLocationKeyDown}
          onFocus={() => setEditingField('location')}
          placeholder="Lieu"
          variant="default"
          className="w-full min-w-0"
        />
      )},
      { icon: Users, label: 'Participants', value: (
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
      )},
    ],
    [
      { icon: Clock, label: 'Durée', value: (
        <span className={cn('px-3 py-2 text-sm block', computeDuration() === '—' ? 'text-zinc-400' : 'text-foreground')}>
          {computeDuration()}
        </span>
      )},
    ],
  ];

  return (
    <div className="space-y-8">

      <SectionHeader
        title={titleBlock}
        metadata={metadata}
        gridColumns="120px 1fr 120px 1fr"
      />

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
                <EditableCard
                  key={item.id}
                  isEditing={isEditing}
                  onEdit={() => toggleEditItem(item.id)}
                  onCloseEdit={() => toggleEditItem(item.id)}
                  onDelete={() => handleDeleteAgendaItem(item.id)}
                  headerContent={
                    <>
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
                    </>
                  }
                  editContent={
                    editingItemData ? (
                    <>
                      {/* Fields */}
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-6">
                          <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Titre</Label>
                          <Input
                            value={editingItemData.title}
                            onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                            placeholder="Titre du point"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                          <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Durée (min)</Label>
                          <Input
                            type="number"
                            value={editingItemData.duration}
                            onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, duration: Number(e.target.value) }) : null)}
                            min="5"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-4">
                          <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Responsable</Label>
                          <Input
                            value={editingItemData.responsible}
                            onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, responsible: e.target.value }) : null)}
                            placeholder="Responsable"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Description</Label>
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
                        <Switch
                          checked={editingItemData.requiresVote}
                          onCheckedChange={(checked) => setEditingItemData(prev => prev ? { ...prev, requiresVote: checked } : null)}
                          className={cn(
                            'h-5 w-9',
                            editingItemData.requiresVote
                              ? 'bg-zinc-900 dark:bg-white'
                              : 'bg-zinc-200 dark:bg-zinc-700'
                          )}
                        />
                      </div>

                      {/* Documents */}
                      <div>
                        <Label className="text-xs font-medium text-zinc-500 mb-2 block uppercase tracking-wide">
                          Documents
                          {editingItemData.documents.length > 0 && (
                            <span className="ml-1.5 text-zinc-400 normal-case font-normal">({editingItemData.documents.length})</span>
                          )}
                        </Label>

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
                                <IconButton
                                  type="button"
                                  icon={<Trash2 size={12} />}
                                  ariaLabel="Supprimer le document"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveDocument(doc.id)}
                                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add document */}
                        <div className="flex flex-wrap gap-2">
                          <Input
                            value={newDocName}
                            onChange={e => setNewDocName(e.target.value)}
                            placeholder="Nom du document"
                            className="flex-1 min-w-0"
                            onKeyDown={e => { if (e.key === 'Enter') handleAddDocument(); }}
                          />
                          <div className="flex items-center gap-1.5 flex-1 min-w-0 px-2 rounded-md border border-border-custom bg-card-bg text-sm text-zinc-500">
                            <Link2 size={13} className="shrink-0" />
                            <Input
                              value={newDocUrl}
                              onChange={e => setNewDocUrl(e.target.value)}
                              placeholder="URL ou lien (optionnel)"
                              size="sm"
                              className="flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0 h-auto py-1.5"
                              onKeyDown={e => { if (e.key === 'Enter') handleAddDocument(); }}
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setDrivePickerDocContext({ itemId: editingItemId! })}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs shrink-0"
                          >
                            <FileText size={12} /> Depuis Drive
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddDocument}
                            disabled={!newDocName.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs shrink-0"
                          >
                            <Plus size={12} /> Ajouter
                          </Button>
                        </div>
                      </div>

                    </>
                    ) : null
                  }
                />
              );
            })}

            {/* Add new item form */}
            {isAddingItem ? (
              <div className="border border-dashed border-border-custom rounded-lg p-5 space-y-3">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6">
                    <Label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1 font-normal">Titre</Label>
                    <Input
                      value={newItemData.title}
                      onChange={(e) => setNewItemData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre du point"
                      autoFocus
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1 font-normal">Durée (min)</Label>
                    <Input
                      type="number"
                      value={newItemData.duration}
                      onChange={(e) => setNewItemData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      min="5"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <Label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1 font-normal">Responsable</Label>
                    <Input
                      value={newItemData.responsible}
                      onChange={(e) => setNewItemData(prev => ({ ...prev, responsible: e.target.value }))}
                      placeholder="Responsable"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1 font-normal">Description</Label>
                  <Textarea
                    value={newItemData.description}
                    onChange={(e) => setNewItemData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du point (optionnelle)"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                {newItemData.documents.length > 0 && (
                  <div>
                    <Label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1.5 font-normal">Documents</Label>
                    <div className="space-y-1.5">
                      {newItemData.documents.map((doc, idx) => (
                        <div key={doc.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-custom bg-zinc-50 dark:bg-zinc-800/40">
                          <FileText size={13} className="text-zinc-400 shrink-0" />
                          <span className="text-sm font-medium truncate flex-1">{doc.name}</span>
                          <IconButton
                            type="button"
                            icon={<Trash2 size={12} />}
                            ariaLabel="Supprimer"
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewItemData(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== doc.id) }))}
                            className="p-1 text-zinc-400 hover:text-red-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDrivePickerDocContext('new')}
                    className="flex items-center gap-1"
                  >
                    <FileText size={12} /> Depuis Drive
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={() => { setIsAddingItem(false); setNewItemData({ title: '', description: '', duration: 15, responsible: '', documents: [] }); }} variant="secondary" size="sm">
                      <X size={14} /> Annuler
                    </Button>
                    <Button onClick={handleAddAgendaItem} size="sm" disabled={!newItemData.title.trim()}>
                      <Check size={14} /> Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAddingItem(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border-custom rounded-lg text-sm text-zinc-500 hover:text-foreground hover:border-zinc-400 dark:hover:border-zinc-600"
              >
                <Plus size={14} />
                Ajouter un point à l&apos;ordre du jour
              </Button>
            )}
          </div>
        )}
      </div>

      {activeOrg && (
        <DrivePickerModal
          isOpen={!!drivePickerDocContext}
          onClose={() => setDrivePickerDocContext(null)}
          onSelect={handleDriveDocSelect}
          orgId={activeOrg.id}
          mode="document"
        />
      )}
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
