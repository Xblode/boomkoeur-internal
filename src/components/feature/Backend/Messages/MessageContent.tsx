'use client';

import { useState, useEffect } from 'react';
import { BarChart3, ThumbsUp, ThumbsDown, FileText, Film, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messages';

// ── LinkPreview ──────────────────────────────────────────────────────────────

export type LinkPreviewData = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

interface LinkPreviewProps {
  preview: LinkPreviewData;
  className?: string;
}

export function LinkPreview({ preview, className }: LinkPreviewProps) {
  const { url, title, description, image, siteName } = preview;
  const displayTitle = title || siteName || new URL(url).hostname;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block min-w-0 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden',
        'bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors',
        className,
      )}
    >
      {image && (
        <div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-3">
        {siteName && (
          <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
            {siteName}
          </p>
        )}
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
          {displayTitle}
        </p>
        {description && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">
            {description}
          </p>
        )}
      </div>
    </a>
  );
}

// ── PollDisplay ──────────────────────────────────────────────────────────────

interface PollOption {
  id: string;
  label: string;
}

interface VoterProfile {
  id: string;
  name: string;
  avatar?: string;
}

interface PollDisplayProps {
  question: string;
  options: PollOption[];
  votes: Record<string, string | string[]>;
  currentUserId: string | null;
  onVote?: (optionId: string) => void;
  onEditPoll?: () => void;
  canEdit?: boolean;
  bubbleRadius?: string;
  className?: string;
}

export function PollDisplay({
  question,
  options,
  votes,
  currentUserId,
  onVote,
  onEditPoll,
  canEdit = false,
  bubbleRadius = 'rounded-xl rounded-bl-md',
  className,
}: PollDisplayProps) {
  const voteCounts = options.map((opt) => ({
    ...opt,
    voterIds: Object.entries(votes)
      .filter(([, v]) => {
        const arr = Array.isArray(v) ? v : v ? [v] : [];
        return arr.includes(opt.id);
      })
      .map(([uid]) => uid),
  }));
  const [voterProfiles, setVoterProfiles] = useState<Record<string, VoterProfile>>({});
  const allVoterIds = [...new Set(voteCounts.flatMap((o) => o.voterIds))];

  useEffect(() => {
    if (allVoterIds.length === 0) return;
    supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar')
      .in('id', allVoterIds)
      .then(({ data }) => {
        const map: Record<string, VoterProfile> = {};
        for (const p of data ?? []) {
          const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Utilisateur';
          map[p.id] = { id: p.id, name, avatar: p.avatar ?? undefined };
        }
        setVoterProfiles(map);
      });
  }, [allVoterIds.join(',')]);

  const uniqueParticipants = Object.keys(votes).filter((uid) => {
    const v = votes[uid];
    const arr = Array.isArray(v) ? v : v ? [v] : [];
    return arr.length > 0;
  }).length;
  const maxCount = Math.max(...voteCounts.map((o) => o.voterIds.length), 1);

  return (
    <div
      className={cn(
        'flex-1 min-w-0 sm:min-w-[385px] w-full max-w-full sm:max-w-[385px] border overflow-hidden',
        'border-zinc-200 dark:border-zinc-700',
        'bg-zinc-50/50 dark:bg-zinc-900/30',
        bubbleRadius,
        className,
      )}
    >
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {question}
          </p>
        </div>

        <div className="space-y-2">
          {voteCounts.map((opt) => {
            const pct = maxCount > 0 ? (opt.voterIds.length / maxCount) * 100 : 0;
            const userVotes = currentUserId ? votes[currentUserId] : undefined;
            const userArr = Array.isArray(userVotes) ? userVotes : userVotes ? [userVotes] : [];
            const isSelected = userArr.includes(opt.id);
            const voters = opt.voterIds
              .map((uid) => voterProfiles[uid])
              .filter(Boolean);

            return (
              <div key={opt.id} className="relative">
                <button
                  type="button"
                  onClick={() => onVote?.(opt.id)}
                  disabled={!onVote}
                  className={cn(
                    'relative w-full text-left px-3 h-[48px] flex items-center rounded-lg text-sm transition-colors overflow-hidden',
                    'border border-zinc-200 dark:border-zinc-700',
                    onVote && 'hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer',
                    !onVote && 'cursor-default',
                    isSelected && 'ring-2 ring-blue-500/50 border-blue-400 dark:border-blue-500',
                  )}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-l-lg bg-blue-500/10 dark:bg-blue-500/5 transition-all pointer-events-none"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center w-full gap-2">
                    <span className="text-zinc-800 dark:text-zinc-200 truncate flex-1 min-w-0">
                      {opt.label}
                    </span>
                    <div className="flex items-center -space-x-1.5 shrink-0 min-w-[32px] h-8 ml-auto" title={voters.map((v) => v.name).join(', ')}>
                      {voters.length > 0 ? (
                        voters.slice(0, 5).map((v) => (
                          <Avatar
                            key={v.id}
                            src={v.avatar}
                            alt={v.name}
                            fallback={v.name.slice(0, 2).toUpperCase()}
                            size="sm"
                            className="ring-2 ring-zinc-50 dark:ring-zinc-900"
                          />
                        ))
                      ) : (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">—</span>
                      )}
                      {voters.length > 5 && (
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 ml-0.5">
                          +{voters.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {canEdit && onEditPoll && (
          <button
            type="button"
            onClick={onEditPoll}
            className={cn(
              'mt-2 w-full flex items-center justify-center gap-1.5 px-3 h-[48px] rounded-lg text-sm',
              'border border-zinc-200 dark:border-zinc-700',
              'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300',
              'hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors'
            )}
          >
            <Pencil size={14} />
            Modifier le sondage
          </button>
        )}

        {uniqueParticipants > 0 && (
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {uniqueParticipants} participant{uniqueParticipants !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

// ── QuickVoteDisplay ─────────────────────────────────────────────────────────

interface QuickVoteDisplayProps {
  question?: string;
  yes: string[];
  no: string[];
  currentUserId: string | null;
  onVote?: (vote: 'yes' | 'no') => void;
  bubbleRadius?: string;
  className?: string;
}

export function QuickVoteDisplay({
  question,
  yes,
  no,
  currentUserId,
  onVote,
  bubbleRadius = 'rounded-xl rounded-bl-md',
  className,
}: QuickVoteDisplayProps) {
  const total = yes.length + no.length;
  const hasVotedYes = currentUserId ? yes.includes(currentUserId) : false;
  const hasVotedNo = currentUserId ? no.includes(currentUserId) : false;

  return (
    <div
      className={cn(
        'flex-1 min-w-0 sm:min-w-[385px] w-full max-w-full sm:max-w-[385px] border overflow-hidden',
        'border-zinc-200 dark:border-zinc-700',
        'bg-zinc-50/50 dark:bg-zinc-900/30',
        bubbleRadius,
        className,
      )}
    >
      <div className="p-3.5">
        {question && (
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-3">
            {question}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onVote?.('yes')}
            disabled={!onVote}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              'border',
              hasVotedYes
                ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20',
              !onVote && 'cursor-default',
            )}
          >
            <ThumbsUp size={16} />
            <span>Oui</span>
            <span className="text-xs opacity-70">{yes.length}</span>
          </button>

          <button
            type="button"
            onClick={() => onVote?.('no')}
            disabled={!onVote}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              'border',
              hasVotedNo
                ? 'bg-red-100 dark:bg-red-950/40 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 ring-2 ring-red-500/30'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/20',
              !onVote && 'cursor-default',
            )}
          >
            <ThumbsDown size={16} />
            <span>Non</span>
            <span className="text-xs opacity-70">{no.length}</span>
          </button>
        </div>

        {total > 0 && (
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {total} vote{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

// ── MessageAttachment ────────────────────────────────────────────────────────

function parseDriveFileId(url: string): string | null {
  if (!url?.trim()) return null;
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (m) return m[1];
  const m2 = url.match(/docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([^/?#]+)/);
  if (m2) return m2[1];
  const m3 = url.match(/[?&]id=([^&?#]+)/);
  return m3 ? m3[1] : null;
}

function getDriveProxyUrl(fileId: string, orgId: string): string {
  return `/api/admin/integrations/google/drive/proxy?org_id=${orgId}&file_id=${fileId}`;
}

function getDriveDirectUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

interface DriveImageProps {
  attachmentUrl: string;
  attachmentName?: string;
  driveFileId?: string | null;
  orgId: string | null;
  className?: string;
}

function DriveImage({ attachmentUrl, attachmentName, driveFileId, orgId, className }: DriveImageProps) {
  const fileId = driveFileId ?? parseDriveFileId(attachmentUrl);
  const proxyUrl = fileId && orgId ? getDriveProxyUrl(fileId, orgId) : null;
  const directUrl = fileId ? getDriveDirectUrl(fileId) : null;
  const [src, setSrc] = useState(proxyUrl ?? directUrl ?? attachmentUrl);

  const handleError = () => {
    if (src === proxyUrl && directUrl) {
      setSrc(directUrl);
    }
  };

  return (
    <a
      href={attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('block rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 max-w-[360px]', className)}
    >
      <img
        src={src}
        alt={attachmentName ?? 'Image'}
        className="block w-full max-h-[320px] min-h-[60px] object-contain bg-zinc-50 dark:bg-zinc-900"
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={handleError}
      />
    </a>
  );
}

interface MessageAttachmentProps {
  message: Message;
  orgId: string | null;
  className?: string;
}

export function MessageAttachment({ message, orgId, className }: MessageAttachmentProps) {
  const meta = message.metadata ?? {};
  const attachmentType = meta.attachmentType as string | undefined;
  const attachmentUrl = meta.attachmentUrl as string | undefined;
  const attachmentName = meta.attachmentName as string | undefined;
  const fileName = meta.fileName as string | undefined;
  const mimeType = meta.attachmentMimeType as string | undefined;
  const driveFileId = meta.driveFileId as string | null | undefined;

  if (!attachmentType || !attachmentUrl) return null;

  if (attachmentType === 'image') {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('block rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 max-w-[360px]', className)}
      >
        <img
          src={attachmentUrl}
          alt={fileName ?? 'Image'}
          className="block w-full max-h-[320px] min-h-[60px] object-contain bg-zinc-50 dark:bg-zinc-900"
          loading="lazy"
        />
      </a>
    );
  }

  if (attachmentType === 'drive' && (mimeType?.startsWith('image/') || (!mimeType && !attachmentUrl.includes('document') && !attachmentUrl.includes('spreadsheet') && !attachmentUrl.includes('presentation')))) {
    return (
      <DriveImage
        attachmentUrl={attachmentUrl}
        attachmentName={attachmentName}
        driveFileId={driveFileId}
        orgId={orgId}
        className={className}
      />
    );
  }

  if (attachmentType === 'drive' && mimeType?.startsWith('video/')) {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2.5',
          'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors max-w-[280px]',
          className,
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <Film size={20} className="text-zinc-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {attachmentName ?? 'Vidéo'}
          </p>
          <p className="text-xs text-zinc-500">Cliquer pour ouvrir dans Google Drive</p>
        </div>
      </a>
    );
  }

  if (attachmentType === 'drive') {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2.5',
          'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors max-w-[280px]',
          className,
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-zinc-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {attachmentName ?? 'Fichier'}
          </p>
          <p className="text-xs text-zinc-500">Cliquer pour ouvrir dans Google Drive</p>
        </div>
      </a>
    );
  }

  return null;
}
