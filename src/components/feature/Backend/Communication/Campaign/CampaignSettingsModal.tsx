'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button, Input } from '@/components/ui/atoms';
import { EventSelector } from '@/components/ui/molecules';
import { Campaign } from '@/types/communication';
import { getEvents } from '@/lib/localStorage/events';
import { Event } from '@/types/event';

interface CampaignSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onUpdate: (updates: Partial<Campaign>) => void;
  onDelete: (campaignId: string) => void;
}

export const CampaignSettingsModal: React.FC<CampaignSettingsModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onUpdate,
  onDelete,
}) => {
  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description || '');
  const [startDate, setStartDate] = useState(
    campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : ''
  );
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(campaign.eventIds || []);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const events = getEvents();
      const sortedEvents = [...events].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAvailableEvents(sortedEvents);
      setSelectedEventIds(campaign.eventIds || []);
    }
  }, [isOpen, campaign.eventIds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    
    onUpdate({
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventIds: selectedEventIds,
      type: selectedEventIds.length > 0 ? 'event' : 'generic',
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement cette campagne ? Cette action est irréversible.')) {
      onDelete(campaign.id);
      onClose();
    }
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card-bg border border-border-custom rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border-custom">
          <h2 className="text-lg font-semibold text-foreground">Paramètres de la campagne</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Nom de la campagne
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Objectif de la campagne..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                  Date de début
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium text-foreground">
                  Date de fin
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">
                Événements liés
              </label>
              <EventSelector
                availableEvents={availableEvents}
                selectedEventIds={selectedEventIds}
                onEventToggle={handleEventToggle}
                placeholder="Lier à un événement"
              />
            </div>
          </div>

          <div className="border-t border-border-custom pt-4">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Zone de danger</h3>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
              onClick={handleDelete}
            >
              <Trash2 size={16} className="mr-2" />
              Supprimer la campagne
            </Button>
          </div>
        </form>

        <div className="p-4 border-t border-border-custom bg-card-bg flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="primary" 
            disabled={isSubmitting || !name}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};
