"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardMedia, CardFooter, CardDateBadge } from "@/components/ui/molecules";
import { Badge, Chip, IconButton } from "@/components/ui/atoms";
import { Event, EventStatus } from "@/types/event";
import {
  MessageSquare,
  Edit,
  Copy,
  Trash2,
  Music,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onDuplicate: (id: string) => void;
  onClick: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onDuplicate,
  onClick,
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(event);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(event.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(event);
  };

  const STATUS_VARIANT: Record<EventStatus, 'warning' | 'info' | 'success' | 'secondary' | 'default'> = {
    idea: 'warning',
    preparation: 'info',
    confirmed: 'success',
    completed: 'secondary',
    archived: 'default',
  };
  const STATUS_LABEL: Record<EventStatus, string> = {
    idea: 'Idée',
    preparation: 'Préparation',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    archived: 'Archivé',
  };

  const hasImage = !!event.media?.posterShotgun;
  const artistsText =
    event.artists.length > 0
      ? event.artists.map((a) => a.name).join(", ")
      : null;
  const timeRange = event.endTime
    ? `${format(event.date, "HH:mm", { locale: fr })} - ${event.endTime}`
    : format(event.date, "HH:mm", { locale: fr });

  return (
    <Card
      variant="list"
      className="group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full hover:shadow-xl"
      onClick={() => onClick(event)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image d'en-tête - format paysage (16:9) avec padding et coins arrondis */}
        <div className="p-2 pt-2">
          <CardMedia aspectRatio="video" placeholder={!hasImage}>
            {hasImage ? (
              <Image
                src={event.media!.posterShotgun!}
                alt={event.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <CalendarDays size={48} className="text-zinc-600" aria-hidden />
            )}
          </CardMedia>
        </div>

        {/* Section Titre, Statut, Lieu + Bloc Date */}
        <div className="p-4 flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="flex-1 font-bold text-lg text-white leading-tight line-clamp-2 group-hover:text-white/90 transition-colors min-w-0">
                {event.name}
              </h3>
              <Badge variant={STATUS_VARIANT[event.status]} className="flex-shrink-0 shadow-none">
                {STATUS_LABEL[event.status]}
              </Badge>
            </div>
            <p className="text-sm text-zinc-400 font-medium">{event.location}</p>
          </div>

          {/* Bloc Date */}
          <CardDateBadge
            month={format(event.date, "MMM", { locale: fr })}
            day={format(event.date, "dd", { locale: fr })}
            className="self-start"
          />
        </div>

        {/* Tags, Artistes, Horaires */}
        <div className="px-4 pb-4 space-y-3">
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="default" className="!bg-surface-elevated !text-text-tertiary !border-zinc-700" />
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm text-text-tertiary">
            {artistsText && (
              <div className="flex items-center gap-2.5">
                <Music className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                <span className="line-clamp-1">{artistsText}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Music className="h-4 w-4 text-text-tertiary flex-shrink-0" />
              <span>{timeRange}</span>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <CardFooter variant="list" className="mt-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-white">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            <span className="font-medium">{event.comments.length}</span>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              icon={<Edit className="h-4 w-4" />}
              ariaLabel="Éditer"
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Éditer"
            />
            <IconButton
              icon={<Copy className="h-4 w-4" />}
              ariaLabel="Dupliquer"
              variant="ghost"
              size="sm"
              onClick={handleDuplicate}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Dupliquer"
            />
            <IconButton
              icon={<Trash2 className="h-4 w-4" />}
              ariaLabel="Supprimer"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              title="Supprimer"
            />
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
