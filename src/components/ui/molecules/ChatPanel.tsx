'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare, X, Send } from 'lucide-react';
import { Button, Input, Textarea, IconButton } from '@/components/ui/atoms';
import { EmptyState } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks';

export interface ChatComment {
  id: string;
  author: string;
  content: string;
  createdAt: Date | string;
}

export interface ChatPanelProps {
  comments: ChatComment[];
  onSendComment: (author: string, content: string) => void;
  /** Masque le champ auteur et utilise l'utilisateur connecté */
  hideAuthorInput?: boolean;
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  inputPlaceholder?: string;
  authorPlaceholder?: string;
  className?: string;
}

/**
 * ChatPanel - Panneau de commentaires flottant réutilisable
 *
 * Bouton flottant + panneau déroulant avec liste des commentaires et formulaire d'envoi.
 * Utilisable pour les événements, produits, réunions, etc.
 */
export function ChatPanel({
  comments,
  onSendComment,
  hideAuthorInput = false,
  title = 'Commentaires',
  emptyTitle = 'Aucun commentaire pour le moment',
  emptyDescription = 'Soyez le premier à commenter !',
  inputPlaceholder = 'Écrire un commentaire...',
  authorPlaceholder = 'Votre nom',
  className,
}: ChatPanelProps) {
  const { user } = useUser();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAuthor, setChatAuthor] = useState('');
  const [chatContent, setChatContent] = useState('');
  const [mounted, setMounted] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendChat = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const author = hideAuthorInput ? (user?.name ?? 'Utilisateur') : chatAuthor.trim();
    if ((!hideAuthorInput && !chatAuthor.trim()) || !chatContent.trim()) return;
    onSendComment(author, chatContent.trim());
    setChatContent('');
    if (chatTextareaRef.current) chatTextareaRef.current.style.height = 'auto';
    setTimeout(() => {
      chatMessagesRef.current?.scrollTo({ top: chatMessagesRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const handleChatTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatContent(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        chatMessagesRef.current?.scrollTo({ top: chatMessagesRef.current.scrollHeight, behavior: 'instant' });
      }, 50);
    }
  }, [chatOpen]);

  const chatContentNode = (
    <>
      {/* Bouton flottant — toujours en bas à droite du viewport */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          variant="primary"
          onClick={() => setChatOpen((o) => !o)}
          aria-label={title}
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 p-0',
            chatOpen
              ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105'
          )}
        >
          {chatOpen ? <X size={22} /> : <MessageSquare size={22} />}
        </Button>
        {!chatOpen && comments.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
            {comments.length}
          </span>
        )}
      </div>

      {/* Panneau de chat — toujours en bas à droite du viewport */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-40 w-80 flex flex-col rounded-xl border border-border-custom bg-card-bg shadow-2xl transition-all duration-300 origin-bottom-right',
          chatOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        )}
        style={{ height: '480px', maxHeight: 'calc(100vh - 140px)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-custom shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-zinc-500" />
            <span className="font-semibold text-sm">{title}</span>
            {comments.length > 0 && (
              <span className="text-xs text-zinc-500">({comments.length})</span>
            )}
          </div>
          <IconButton
            icon={<X size={15} />}
            ariaLabel="Fermer"
            variant="ghost"
            size="sm"
            onClick={() => setChatOpen(false)}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-foreground"
          />
        </div>

        <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-3 min-h-0">
          {comments.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={emptyTitle}
              description={emptyDescription}
              variant="inline"
              className="h-full min-h-0"
            />
          ) : (
            <div className="space-y-0.5">
              {[...comments]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((comment, index, sorted) => {
                  const prev = sorted[index - 1];
                  const isGrouped = prev?.author === comment.author;
                  return (
                    <div key={comment.id} className={cn('space-y-0.5', !isGrouped && index > 0 && 'mt-4')}>
                      {!isGrouped && (
                        <div className="flex items-baseline gap-2 px-1 mb-1">
                          <span className="text-xs font-semibold">{comment.author}</span>
                          <span className="text-[10px] text-zinc-400">
                            {format(new Date(comment.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          'bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed',
                          !isGrouped ? 'rounded-lg rounded-tl-none' : 'rounded-lg'
                        )}
                      >
                        {comment.content}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <form onSubmit={handleSendChat} className="p-3 border-t border-border-custom space-y-2 shrink-0">
          {!hideAuthorInput && (
            <Input
              type="text"
              placeholder={authorPlaceholder}
              value={chatAuthor}
              onChange={(e) => setChatAuthor(e.target.value)}
              fullWidth
            />
          )}
          <div className="flex rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent shadow-sm transition-colors focus-within:ring-1 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-300">
            <Textarea
              ref={chatTextareaRef}
              placeholder={inputPlaceholder}
              value={chatContent}
              onChange={handleChatTextareaChange}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSendChat(e);
              }}
              rows={1}
              className="flex-1 min-w-0 resize-none bg-transparent border-0 focus-visible:ring-0 shadow-none min-h-[36px] max-h-[120px] overflow-y-auto"
              style={{ minHeight: '36px', maxHeight: '120px' }}
            />
            <div className="flex items-end shrink-0 p-1.5">
              <IconButton
                type="submit"
                icon={<Send size={13} />}
                ariaLabel="Envoyer"
                variant="primary"
                size="sm"
                disabled={(!hideAuthorInput && !chatAuthor.trim()) || !chatContent.trim()}
                className="flex items-center justify-center w-7 h-7 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400">⌘↵ pour envoyer</p>
        </form>
      </div>
    </>
  );

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(chatContentNode, document.body);
}
