'use client';

import { useState } from 'react';
import { FileText, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messages';

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

  // Image uploadée (Supabase storage) — URL directe (bucket public)
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

  // Drive : image — proxy avec fallback URL directe
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

  // Drive : vidéo
  if (attachmentType === 'drive' && mimeType?.startsWith('video/')) {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2.5',
          'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors max-w-[280px]',
          className
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

  // Drive : fichier (document, PDF, etc.)
  if (attachmentType === 'drive') {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2.5',
          'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors max-w-[280px]',
          className
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
