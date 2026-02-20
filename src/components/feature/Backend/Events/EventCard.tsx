"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/molecules";
import { Event } from "@/types/event";
import { EventStatusBadge } from "./EventStatusBadge";
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
  onDelete: (id: string) => void;
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${event.name}" ?`)) {
      onDelete(event.id);
    }
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
      className="group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full bg-[#1f1f1f] border-zinc-800 hover:shadow-xl"
      onClick={() => onClick(event)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image d'en-tête - format paysage (16:9) avec padding et coins arrondis */}
        <div className="p-2 pt-2">
          <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-[#262626] border border-zinc-800 flex items-center justify-center">
            {hasImage ? (
              <Image
                src={event.media!.posterShotgun!}
                alt={event.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <CalendarDays className="w-16 h-16 text-zinc-600" aria-hidden />
            )}
          </div>
        </div>

        {/* Section Titre, Statut, Lieu + Bloc Date */}
        <div className="p-4 flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="flex-1 font-bold text-lg text-white leading-tight line-clamp-2 group-hover:text-white/90 transition-colors min-w-0">
                {event.name}
              </h3>
              <EventStatusBadge status={event.status} className="flex-shrink-0 shadow-none rounded-full" />
            </div>
            <p className="text-sm text-zinc-400 font-medium">{event.location}</p>
          </div>

          {/* Bloc Date - hauteur définie par le contenu, pas par la ligne */}
          <div className="flex-shrink-0 self-start flex flex-col items-center justify-center bg-[#262626] border border-[#313133] rounded-lg px-3 py-2 min-w-[3.5rem]">
            <span className="text-xs font-medium text-zinc-400 uppercase">
              {format(event.date, "MMM", { locale: fr })}
            </span>
            <span className="text-2xl font-bold text-white leading-none mt-0.5">
              {format(event.date, "dd", { locale: fr })}
            </span>
          </div>
        </div>

        {/* Tags, Artistes, Horaires */}
        <div className="px-4 pb-4 space-y-3">
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#262626] text-[#939393]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm text-[#939393]">
            {artistsText && (
              <div className="flex items-center gap-2.5">
                <Music className="h-4 w-4 text-[#939393] flex-shrink-0" />
                <span className="line-clamp-1">{artistsText}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Music className="h-4 w-4 text-[#939393] flex-shrink-0" />
              <span>{timeRange}</span>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-auto px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-white">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            <span className="font-medium">{event.comments.length}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleEdit}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Éditer"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Dupliquer"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
