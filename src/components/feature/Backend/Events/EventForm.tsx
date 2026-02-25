"use client";

import React, { useState, useRef } from 'react';
import { Input, Label, Select, Textarea, Button } from '@/components/ui/atoms';
import { DatePicker, TimePicker, TagMultiSelect } from '@/components/ui/molecules';
import { Event, EventStatus, Artist } from '@/types/event';
import { Plus, X } from 'lucide-react';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  existingArtists: Artist[];
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onCancel,
  existingArtists,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  
  // Extraire date et heure de l'événement existant
  const eventDate = event?.date ? new Date(event.date) : new Date();
  const eventTime = event?.date 
    ? `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}` 
    : '20:00';
  const eventEndTime = event?.endTime || '23:00';
  
  const [formData, setFormData] = useState({
    name: event?.name || '',
    date: event?.date ? eventDate : new Date(),
    time: eventTime,
    endTime: eventEndTime,
    location: event?.location || '',
    brief: event?.brief || '',
    description: event?.description || '',
    status: event?.status || 'idea' as EventStatus,
  });

  const [tags, setTags] = useState<string[]>(event?.tags || []);

  const [artists, setArtists] = useState<Artist[]>(event?.artists || []);
  const [newArtist, setNewArtist] = useState({
    name: '',
    genre: '',
    performanceTime: '',
    fee: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArtistChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof typeof newArtist
  ) => {
    setNewArtist(prev => ({ ...prev, [field]: e.target.value }));
  };

  const addArtist = () => {
    if (!newArtist.name || !newArtist.genre) {
      alert('Le nom et le genre de l\'artiste sont requis');
      return;
    }

    const artist: Artist = {
      id: Date.now().toString(),
      name: newArtist.name,
      genre: newArtist.genre,
      performanceTime: newArtist.performanceTime || undefined,
      fee: newArtist.fee ? parseFloat(newArtist.fee) : undefined,
    };

    setArtists(prev => [...prev, artist]);
    setNewArtist({ name: '', genre: '', performanceTime: '', fee: '' });
  };

  const removeArtist = (id: string) => {
    setArtists(prev => prev.filter(a => a.id !== id));
  };

  const selectExistingArtist = (artistName: string) => {
    const artist = existingArtists.find(a => a.name === artistName);
    if (artist) {
      setNewArtist({
        name: artist.name,
        genre: artist.genre,
        performanceTime: artist.performanceTime || '',
        fee: artist.fee ? artist.fee.toString() : '',
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Le lieu est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Combiner date et heure
    const [hours, minutes] = formData.time.split(':').map(Number);
    const combinedDate = new Date(formData.date);
    combinedDate.setHours(hours, minutes, 0, 0);

    const eventData = {
      name: formData.name,
      date: combinedDate,
      endTime: formData.endTime,
      location: formData.location,
      brief: formData.brief,
      description: formData.description,
      status: formData.status,
      artists,
      tags,
      linkedElements: event?.linkedElements || [],
      comments: event?.comments || [],
    };

    onSubmit(eventData);
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <div>
          <Label required>Nom de l'événement</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Soirée Techno Summer..."
            fullWidth
            error={errors.name}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label required>Lieu</Label>
          <Input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Le Warehouse Club"
            fullWidth
            error={errors.location}
          />
          {errors.location && (
            <p className="text-xs text-red-500 mt-1">{errors.location}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label required>Date</Label>
            <DatePicker
              date={formData.date instanceof Date ? formData.date : undefined}
              onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
              placeholder="Sélectionner une date"
            />
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <Label required>Heure début</Label>
            <TimePicker
              time={formData.time}
              onChange={(time) => setFormData(prev => ({ ...prev, time }))}
            />
          </div>

          <div>
            <Label required>Heure fin</Label>
            <TimePicker
              time={formData.endTime}
              onChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
            />
          </div>
        </div>

        <div>
          <Label>Statut</Label>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="idea">Idée</option>
            <option value="preparation">En préparation</option>
            <option value="confirmed">Confirmé</option>
            <option value="completed">Terminé</option>
            <option value="archived">Archivé</option>
          </Select>
        </div>

        <div>
          <Label>Tags</Label>
          <div className="mt-2">
            <TagMultiSelect
              value={tags}
              onChange={setTags}
              placeholder="Ajouter une étiquette..."
            />
          </div>
        </div>

        <div>
          <Label>Brief</Label>
          <Textarea
            name="brief"
            value={formData.brief}
            onChange={handleChange}
            placeholder="Brief de campagne : objectifs, ton, cibles..."
            rows={3}
          />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description publique de l'événement..."
            rows={4}
          />
        </div>
      </div>

      {/* Gestion des artistes */}
      <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <h3 className="text-lg font-semibold">Artistes / DJs</h3>

        {/* Liste des artistes ajoutés */}
        {artists.length > 0 && (
          <div className="space-y-2">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="flex items-center justify-between p-6 py-4 pr-3 bg-zinc-50 dark:bg-zinc-800 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium">{artist.name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {artist.genre}
                    {artist.performanceTime && ` • ${artist.performanceTime}`}
                    {artist.fee && ` • ${artist.fee}€`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArtist(artist.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout d'artiste */}
        <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-zinc-200 border-dashed dark:border-zinc-800 p-4">
          {existingArtists.length > 0 && (
            <div>
              <Label>Artistes déjà enregistrés</Label>
              <Select
                value=""
                onChange={(e) => selectExistingArtist(e.target.value)}
              >
                <option value="">Sélectionner un artiste...</option>
                {existingArtists.map((artist, index) => (
                  <option key={index} value={artist.name}>
                    {artist.name} ({artist.genre})
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Nom de l'artiste</Label>
              <Input
                value={newArtist.name}
                onChange={(e) => handleArtistChange(e, 'name')}
                placeholder="DJ Marcus"
                fullWidth
              />
            </div>
            <div>
              <Label>Genre musical</Label>
              <Input
                value={newArtist.genre}
                onChange={(e) => handleArtistChange(e, 'genre')}
                placeholder="Techno, House..."
                fullWidth
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Heure de passage</Label>
              <Input
                value={newArtist.performanceTime}
                onChange={(e) => handleArtistChange(e, 'performanceTime')}
                placeholder="22:00 - 00:00"
                fullWidth
              />
            </div>
            <div>
              <Label>Cachet (€)</Label>
              <Input
                type="number"
                value={newArtist.fee}
                onChange={(e) => handleArtistChange(e, 'fee')}
                placeholder="800"
                fullWidth
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addArtist}
            className="w-full mt-3"
          >
            <Plus className="h-4 w-4" />
            Ajouter l'artiste
          </Button>
        </div>
      </div>

      </form>

      {/* Actions du formulaire */}
      <div className="flex gap-3 justify-end border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-6">
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="button" 
          variant="primary"
          size="sm"
          onClick={() => {
            if (formRef.current) {
              formRef.current.requestSubmit();
            }
          }}
        >
          {event ? 'Mettre à jour' : 'Créer l\'événement'}
        </Button>
      </div>
    </>
  );
};
