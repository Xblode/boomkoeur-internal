'use client';

import { cn } from '@/lib/utils';

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
        'block max-w-sm rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden',
        'bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors',
        className
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
