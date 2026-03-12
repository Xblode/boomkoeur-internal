import type { LucideIcon } from 'lucide-react';
import { FileText, Calendar as CalendarIcon, Video, Bot } from 'lucide-react';
import type { RelatedEntityType } from '@/types/messages';

type AgendaItemInput = string | { title: string };
function isMeetingPassed(scheduledAt: string | undefined): boolean {
  if (!scheduledAt) return false;
  return new Date(scheduledAt) < new Date();
}

/** Nombre d'éléments manquants pour event/meeting — un seul badge affiché sous la bulle */
export function getEntityMissingCount(
  entityType: RelatedEntityType,
  metadata: Record<string, unknown>
): number {
  let count = 0;
  if (entityType === 'meeting') {
    const scheduledAt = metadata.scheduledAt as string | undefined;
    const meetingPassed = isMeetingPassed(scheduledAt);
    const orderOfDay = metadata.orderOfDay as string | string[] | undefined;
    const rawOrderItems = (Array.isArray(orderOfDay) ? orderOfDay : orderOfDay ? [orderOfDay] : []) as AgendaItemInput[];
    const hasOrderOfDay = rawOrderItems.length > 0 && rawOrderItems.some((item) =>
      typeof item === 'string' ? item.trim() !== '' : (item as { title?: string }).title?.trim() !== ''
    );
    const report = metadata.report as string | undefined;
    if (!meetingPassed && !hasOrderOfDay) count++;
    if (meetingPassed && !report?.trim()) count++;
  }
  if (entityType === 'event') {
    const location = metadata.location as string | undefined;
    const artists = (metadata.artists as string[] | undefined) ?? [];
    const description = metadata.description as string | undefined;
    const brief = metadata.brief as string | undefined;
    const status = metadata.eventStatus as string | undefined;
    const assignees = (metadata.assignees as string[] | undefined) ?? [];
    const shotgunSynced = metadata.shotgunSynced as boolean | undefined;
    if (!location?.trim()) count++;
    if (artists.length === 0) count++;
    if (!description?.trim()) count++;
    if ((status === 'preparation' || status === 'confirmed') && !brief?.trim()) count++;
    if (assignees.length === 0) count++;
    if (shotgunSynced === false) count++;
  }
  return count;
}

export const ENTITY_CONFIG: Record<
  RelatedEntityType | 'system',
  { icon: LucideIcon; label: string; avatarBg: string; borderColor: string; iconColor: string; cardColor: string; basePath: string }
> = {
  post: {
    icon: FileText,
    label: 'Post',
    avatarBg: 'bg-blue-100 dark:bg-blue-950/50',
    borderColor: 'border-blue-300 dark:border-blue-700',
    iconColor: 'text-blue-600 dark:text-blue-400',
    cardColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    basePath: '/dashboard/communication',
  },
  event: {
    icon: CalendarIcon,
    label: 'Événement',
    avatarBg: 'bg-purple-100 dark:bg-purple-950/50',
    borderColor: 'border-purple-300 dark:border-purple-700',
    iconColor: 'text-purple-600 dark:text-purple-400',
    cardColor: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
    basePath: '/dashboard/events',
  },
  meeting: {
    icon: Video,
    label: 'Réunion',
    avatarBg: 'bg-amber-100 dark:bg-amber-950/50',
    borderColor: 'border-amber-300 dark:border-amber-700',
    iconColor: 'text-amber-600 dark:text-amber-400',
    cardColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
    basePath: '/dashboard/meetings',
  },
  system: {
    icon: Bot,
    label: 'Système',
    avatarBg: 'bg-zinc-100 dark:bg-zinc-800',
    borderColor: 'border-zinc-300 dark:border-zinc-600',
    iconColor: 'text-zinc-500 dark:text-zinc-400',
    cardColor: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-950/30',
    basePath: '/dashboard',
  },
};

export function getEntityConfig(relatedEntityType: RelatedEntityType | null) {
  return relatedEntityType ? ENTITY_CONFIG[relatedEntityType] : ENTITY_CONFIG.system;
}
