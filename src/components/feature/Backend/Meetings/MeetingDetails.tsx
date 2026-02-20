'use client';

import { useState } from 'react';
import { Meeting } from '@/types/meeting';
import { Card, CardContent } from '@/components/ui/molecules/Card';
import { Button, Badge, Textarea, Input } from '@/components/ui/atoms';
import { Clock, Users, MapPin, FileText, CheckCircle, XCircle, Clock3, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { meetingService } from '@/lib/services/MeetingService';

interface MeetingDetailsProps {
  meeting: Meeting;
  onUpdate: () => void;
  activeTab: 'agenda' | 'minutes' | 'info';
}

export default function MeetingDetails({ meeting, onUpdate, activeTab }: MeetingDetailsProps) {
  const [freeText, setFreeText] = useState(meeting.minutes.freeText || '');
  const [agendaItemNotes, setAgendaItemNotes] = useState<Record<string, string>>(
    meeting.agenda.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.notes || '',
    }), {})
  );
  const [isSaving, setIsSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<{
    title: string;
    description: string;
    duration: number;
    responsible: string;
  } | null>(null);

  const handleSaveMinutes = async () => {
    setIsSaving(true);
    try {
      await meetingService.saveMinutes(meeting.id, freeText, agendaItemNotes);
      onUpdate();
      alert('Compte-rendu sauvegardé');
    } catch (error) {
      console.error('Error saving minutes:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAgendaItem = (item: typeof meeting.agenda[0]) => {
    setEditingItemId(item.id);
    setEditingItemData({
      title: item.title,
      description: item.description || '',
      duration: item.duration,
      responsible: item.responsible || '',
    });
  };

  const handleSaveEditedItem = async () => {
    if (!editingItemId || !editingItemData) return;

    setIsSaving(true);
    try {
      const updatedAgenda = meeting.agenda.map(item =>
        item.id === editingItemId
          ? { ...item, ...editingItemData, description: editingItemData.description || undefined }
          : item
      );
      
      await meetingService.updateMeeting(meeting.id, { agenda: updatedAgenda });
      onUpdate();
      setEditingItemId(null);
      setEditingItemData(null);
    } catch (error) {
      console.error('Error updating agenda item:', error);
      alert('Erreur lors de la modification');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemData(null);
  };

  const totalDuration = meeting.agenda.reduce((sum, item) => sum + item.duration, 0);

  return (
    <div className="space-y-6">
      {/* Tab Content */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Ordre du jour</h3>
            <div className="text-sm text-zinc-500">
              {meeting.agenda.length} point{meeting.agenda.length > 1 ? 's' : ''} • {totalDuration} min total
            </div>
          </div>

          {meeting.agenda.length === 0 ? (
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-12 text-center text-zinc-500">
                Aucun point à l'ordre du jour
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {meeting.agenda.map((item, index) => {
                const isEditing = editingItemId === item.id;
                
                return (
                  <Card key={item.id} className="border-zinc-200 dark:border-zinc-800">
                    <CardContent className="p-5">
                      {isEditing && editingItemData ? (
                        // Mode édition
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12 md:col-span-6">
                              <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Titre</label>
                              <Input
                                value={editingItemData.title}
                                onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                                placeholder="Titre du point"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-2">
                              <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Durée (min)</label>
                              <Input
                                type="number"
                                value={editingItemData.duration}
                                onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, duration: Number(e.target.value) }) : null)}
                                min="5"
                              />
                            </div>
                            <div className="col-span-6 md:col-span-4">
                              <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Responsable</label>
                              <Input
                                value={editingItemData.responsible}
                                onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, responsible: e.target.value }) : null)}
                                placeholder="Responsable"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Description</label>
                            <textarea
                              value={editingItemData.description}
                              onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                              placeholder="Description du point (optionnelle)"
                              className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button onClick={handleCancelEdit} variant="secondary" size="sm">
                              <X size={14} className="mr-1" />
                              Annuler
                            </Button>
                            <Button onClick={handleSaveEditedItem} size="sm" disabled={isSaving}>
                              <Check size={14} className="mr-1" />
                              Sauvegarder
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Mode affichage
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {item.requiresVote && (
                                  <Badge variant={
                                    item.voteResult === 'approved' ? 'success' :
                                    item.voteResult === 'rejected' ? 'error' : 'warning'
                                  }>
                                    {item.voteResult === 'approved' ? <CheckCircle size={12} className="mr-1" /> :
                                     item.voteResult === 'rejected' ? <XCircle size={12} className="mr-1" /> : null}
                                    {item.voteResult === 'approved' ? 'Approuvé' :
                                     item.voteResult === 'rejected' ? 'Rejeté' : 'Vote'}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 text-sm text-zinc-500">
                                  <Clock3 size={14} />
                                  {item.duration}min
                                </div>
                              </div>
                            </div>

                            {item.responsible && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                                Responsable: <span className="font-medium">{item.responsible}</span>
                              </p>
                            )}

                            {item.description && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {item.documents.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.documents.map((doc, idx) => (
                                  <span key={doc.id} className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center gap-1">
                                    <FileText size={12} />
                                    {doc.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEditAgendaItem(item)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 rounded transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'minutes' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Notes libres</h3>
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Saisissez vos notes générales sur la réunion..."
              rows={8}
              className="w-full"
            />
          </div>

          {meeting.agenda.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Notes par point d'ordre du jour</h3>
              <div className="space-y-4">
                {meeting.agenda.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <label className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                      {item.title}
                    </label>
                    <Textarea
                      value={agendaItemNotes[item.id] || ''}
                      onChange={(e) => setAgendaItemNotes(prev => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))}
                      placeholder={`Notes sur "${item.title}"...`}
                      rows={3}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveMinutes} disabled={isSaving}>
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder le compte-rendu'}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2">Date et heure</h4>
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Clock size={18} />
                  <span>{format(meeting.date, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="ml-7 text-sm text-zinc-600 dark:text-zinc-400">
                  De {meeting.startTime} à {meeting.endTime}
                </div>
              </div>

              {meeting.location && (
                <div>
                  <h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2">Lieu</h4>
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <MapPin size={18} />
                    <span>{meeting.location}</span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2">Participants</h4>
                <div className="flex items-start gap-2">
                  <Users size={18} className="mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    {meeting.participants.map((participant, idx) => (
                      <Badge key={idx} variant="default">
                        {participant}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2">Statut</h4>
                <Badge variant={meeting.status === 'completed' ? 'success' : 'info'}>
                  {meeting.status === 'completed' ? 'Terminée' : 'À venir'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
