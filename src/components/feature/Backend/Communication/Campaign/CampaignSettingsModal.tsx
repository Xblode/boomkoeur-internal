'use client';

import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Input, Label, Textarea } from '@/components/ui/atoms';
import { EventSelector } from '@/components/ui/molecules';
import { Modal, ModalFooter } from '@/components/ui/organisms';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Paramètres de la campagne" size="md" scrollable>
      <form id="campaign-settings-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Nom de la campagne
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Objectif de la campagne..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-foreground">
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-foreground">
                  Date de fin
                </Label>
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
              <Label className="text-sm font-medium text-foreground block">
                Événements liés
              </Label>
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

      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="submit"
          form="campaign-settings-form"
          variant="primary"
          size="sm"
          disabled={isSubmitting || !name}
        >
          Enregistrer
        </Button>
      </ModalFooter>
    </Modal>
  );
};
