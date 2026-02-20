'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Button, Input, Badge, Label } from '@/components/ui/atoms';
import { FormField, DatePicker, TimePicker } from '@/components/ui/molecules';
import { Meeting, MeetingInput, AgendaItem } from '@/types/meeting';
import { meetingService } from '@/lib/services/MeetingService';
import { Plus, X, MoveUp, MoveDown, FileText, Edit2, Check } from 'lucide-react';

interface MeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meeting?: Meeting | null;
}

export default function MeetingForm({ isOpen, onClose, onSuccess, meeting }: MeetingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<MeetingInput>>({
    title: meeting?.title || '',
    date: meeting?.date || new Date(),
    startTime: meeting?.startTime || '14:00',
    endTime: meeting?.endTime || '16:00',
    location: meeting?.location || '',
    participants: meeting?.participants || [],
    status: meeting?.status || 'upcoming',
    agenda: meeting?.agenda || [],
    minutes: meeting?.minutes || { freeText: '' },
  });

  const [newParticipant, setNewParticipant] = useState('');
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: '',
    description: '',
    duration: 15,
    responsible: '',
    requiresVote: false,
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<{
    title: string;
    description: string;
    duration: number;
    responsible: string;
    requiresVote: boolean;
  } | null>(null);

  useEffect(() => {
    if (meeting && isOpen) {
      setFormData({
        title: meeting.title,
        date: meeting.date,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        location: meeting.location,
        participants: meeting.participants,
        status: meeting.status,
        agenda: meeting.agenda,
        minutes: meeting.minutes,
      });
    }
  }, [meeting, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (meeting) {
        await meetingService.updateMeeting(meeting.id, formData);
      } else {
        await meetingService.createMeeting(formData as MeetingInput);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      setFormData(prev => ({
        ...prev,
        participants: [...(prev.participants || []), newParticipant.trim()],
      }));
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleAddAgendaItem = () => {
    if (newAgendaItem.title.trim()) {
      const item: AgendaItem = {
        id: `temp-${Date.now()}`,
        order: (formData.agenda?.length || 0) + 1,
        title: newAgendaItem.title,
        description: newAgendaItem.description || undefined,
        duration: newAgendaItem.duration,
        responsible: newAgendaItem.responsible,
        documents: [],
        requiresVote: newAgendaItem.requiresVote,
      };
      
      setFormData(prev => ({
        ...prev,
        agenda: [...(prev.agenda || []), item],
      }));

      setNewAgendaItem({
        title: '',
        description: '',
        duration: 15,
        responsible: '',
        requiresVote: false,
      });
    }
  };

  const handleRemoveAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleMoveAgendaItem = (index: number, direction: 'up' | 'down') => {
    const agenda = [...(formData.agenda || [])];
    if (direction === 'up' && index > 0) {
      [agenda[index], agenda[index - 1]] = [agenda[index - 1], agenda[index]];
    } else if (direction === 'down' && index < agenda.length - 1) {
      [agenda[index], agenda[index + 1]] = [agenda[index + 1], agenda[index]];
    }
    
    // Update order
    agenda.forEach((item, i) => {
      item.order = i + 1;
    });

    setFormData(prev => ({ ...prev, agenda }));
  };

  const handleEditAgendaItem = (item: AgendaItem) => {
    setEditingItemId(item.id);
    setEditingItemData({
      title: item.title,
      description: item.description || '',
      duration: item.duration,
      responsible: item.responsible || '',
      requiresVote: item.requiresVote || false,
    });
  };

  const handleSaveEditedItem = () => {
    if (!editingItemId || !editingItemData) return;

    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda?.map(item => 
        item.id === editingItemId
          ? { ...item, ...editingItemData, description: editingItemData.description || undefined }
          : item
      ) || [],
    }));

    setEditingItemId(null);
    setEditingItemData(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemData(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meeting ? 'Modifier la réunion' : 'Nouvelle réunion'}
      size="xl"
      scrollable
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-md mb-4">Informations générales</h3>
            
            <div className="space-y-4">
              <FormField 
                label="Titre" 
                required 
                inputProps={{
                  value: formData.title,
                  onChange: (e) => setFormData(prev => ({ ...prev, title: e.target.value })),
                  placeholder: "Ex: Point hebdomadaire équipe",
                  required: true
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label required>Date</Label>
                  <DatePicker
                    date={formData.date instanceof Date ? formData.date : undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                    placeholder="Sélectionner une date"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label required>Heure début</Label>
                  <TimePicker
                    time={formData.startTime}
                    onChange={(time) => setFormData(prev => ({ ...prev, startTime: time }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label required>Heure fin</Label>
                  <TimePicker
                    time={formData.endTime}
                    onChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
                  />
                </div>
              </div>

              <FormField 
                label="Lieu" 
                inputProps={{
                  value: formData.location,
                  onChange: (e) => setFormData(prev => ({ ...prev, location: e.target.value })),
                  placeholder: "Ex: Salle de réunion A, Visio Zoom..."
                }}
              />
            </div>
          </div>

          {/* Participants */}
          <div>
            <Label>Participants</Label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                placeholder="Ajouter un participant et appuyer sur Entrée..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                fullWidth
              />
              <Button type="button" variant="outline" onClick={handleAddParticipant}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.participants?.map((participant, index) => (
                <Badge key={index} variant="secondary" className="gap-1 pr-1">
                  {participant}
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(index)}
                    className="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div>
            <h3 className="font-semibold text-md mb-4">Ordre du jour</h3>
            
            {/* Add Agenda Item */}
            <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-zinc-200 border-dashed dark:border-zinc-800 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Titre du point</Label>
                  <Input
                    value={newAgendaItem.title}
                    onChange={(e) => setNewAgendaItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Revue du budget Q1"
                    fullWidth
                  />
                </div>
                <div>
                  <Label>Durée (minutes)</Label>
                  <Input
                    type="number"
                    value={newAgendaItem.duration}
                    onChange={(e) => setNewAgendaItem(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    placeholder="15"
                    min="5"
                    fullWidth
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Responsable</Label>
                  <Input
                    value={newAgendaItem.responsible}
                    onChange={(e) => setNewAgendaItem(prev => ({ ...prev, responsible: e.target.value }))}
                    placeholder="Nom du responsable"
                    fullWidth
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAgendaItem.requiresVote}
                      onChange={(e) => setNewAgendaItem(prev => ({ ...prev, requiresVote: e.target.checked }))}
                      className="rounded"
                    />
                    Nécessite un vote
                  </label>
                </div>
              </div>

              <div>
                <Label>Description (optionnelle)</Label>
                <textarea
                  value={newAgendaItem.description}
                  onChange={(e) => setNewAgendaItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Détails supplémentaires sur ce point..."
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>

              <Button type="button" onClick={handleAddAgendaItem} variant="outline" size="sm" className="w-full mt-3">
                <Plus size={14} className="mr-2" />
                Ajouter le point
              </Button>
            </div>

            {/* Agenda Items List */}
            <div className="space-y-2">
              {formData.agenda?.map((item, index) => {
                const isEditing = editingItemId === item.id;
                
                return (
                  <div key={item.id} className={isEditing ? "bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 border-dashed dark:border-zinc-800 rounded-lg" : "rounded-md overflow-hidden"}>
                    {isEditing && editingItemData ? (
                      // Mode édition
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Titre du point</Label>
                            <Input
                              value={editingItemData.title}
                              onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                              placeholder="Ex: Revue du budget Q1"
                              fullWidth
                            />
                          </div>
                          <div>
                            <Label>Durée (minutes)</Label>
                            <Input
                              type="number"
                              value={editingItemData.duration}
                              onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, duration: Number(e.target.value) }) : null)}
                              placeholder="15"
                              min="5"
                              fullWidth
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Responsable</Label>
                            <Input
                              value={editingItemData.responsible}
                              onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, responsible: e.target.value }) : null)}
                              placeholder="Nom du responsable"
                              fullWidth
                            />
                          </div>
                          <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingItemData.requiresVote}
                                onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, requiresVote: e.target.checked }) : null)}
                                className="rounded"
                              />
                              Nécessite un vote
                            </label>
                          </div>
                        </div>

                        <div>
                          <Label>Description (optionnelle)</Label>
                          <textarea
                            value={editingItemData.description}
                            onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                            placeholder="Détails supplémentaires sur ce point..."
                            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={2}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" onClick={handleCancelEdit} variant="secondary" size="sm">
                            Annuler
                          </Button>
                          <Button type="button" onClick={handleSaveEditedItem} size="sm">
                            <Check size={14} className="mr-1" />
                            Sauvegarder
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <div className="flex items-center gap-3 p-4 py-3 pr-3 bg-zinc-50 dark:bg-zinc-800">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveAgendaItem(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-30"
                          >
                            <MoveUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveAgendaItem(index, 'down')}
                            disabled={index === (formData.agenda?.length || 0) - 1}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-30"
                          >
                            <MoveDown size={12} />
                          </button>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.title}</span>
                            {item.requiresVote && (
                              <Badge variant="warning" className="text-xs">Vote</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            <span>{item.duration} min</span>
                            {item.responsible && <span>• {item.responsible}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEditAgendaItem(item)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 rounded"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveAgendaItem(index)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : meeting ? 'Mettre à jour' : 'Créer'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
