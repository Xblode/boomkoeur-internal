'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Textarea } from '@/components/ui/atoms';
import { EventSelector } from '@/components/ui/molecules';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { Campaign } from '@/types/communication';
import { getEvents } from '@/lib/localStorage/events';
import { Event } from '@/types/event';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const events = getEvents();
      const sortedEvents = [...events].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAvailableEvents(sortedEvents);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    
    onCreate({
      name,
      description,
      status: 'active',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventIds: selectedEventIds,
      posts: [],
      type: selectedEventIds.length > 0 ? 'event' : 'generic',
      platforms: [],
    });

    setIsSubmitting(false);
    onClose();
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setSelectedEventIds([]);
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle Campagne" size="md" scrollable>
      <form id="create-campaign-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Nom de la campagne <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Lancement Collection Été"
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
      </form>

      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="submit"
          form="create-campaign-form"
          variant="primary"
          size="sm"
          disabled={isSubmitting || !name}
        >
          Créer la campagne
        </Button>
      </ModalFooter>
    </Modal>
  );
};
