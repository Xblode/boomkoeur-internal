'use client';

import React, { useCallback } from 'react';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/atoms';
import { toast } from 'sonner';

export interface CodeSnippetProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeSnippet({ code, language = 'tsx', className }: CodeSnippetProps) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(
      () => toast.success('Code copié dans le presse-papier'),
      () => toast.error('Échec de la copie')
    );
  }, [code]);

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border-custom bg-zinc-100 dark:bg-zinc-800 overflow-hidden',
        className
      )}
    >
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          className="h-7 px-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <Copy size={14} className="mr-1" />
          Copier
        </Button>
      </div>
      <pre className="p-4 pr-24 overflow-x-auto text-xs font-mono text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}
