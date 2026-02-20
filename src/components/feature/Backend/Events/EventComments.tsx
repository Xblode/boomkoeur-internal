"use client";

import React, { useState } from 'react';
import { Comment } from '@/types/event';
import { Button, Input, Textarea } from '@/components/ui/atoms';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventCommentsProps {
  eventId: string;
  comments: Comment[];
  onAddComment: (eventId: string, author: string, content: string) => void;
}

export const EventComments: React.FC<EventCommentsProps> = ({
  eventId,
  comments,
  onAddComment,
}) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!author.trim() || !content.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    onAddComment(eventId, author, content);
    setAuthor('');
    setContent('');
  };

  // Trier les commentaires du plus récent au plus ancien
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Commentaires ({comments.length})
      </h3>

      {/* Formulaire d'ajout de commentaire */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
        <div>
          <Input
            type="text"
            placeholder="Votre nom"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            fullWidth
          />
        </div>
        <div>
          <Textarea
            placeholder="Écrivez votre commentaire..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
        </div>
        <Button type="submit" variant="primary" size="sm">
          <Send className="h-4 w-4" />
          Envoyer
        </Button>
      </form>

      {/* Liste des commentaires */}
      {sortedComments.length > 0 ? (
        <div className="space-y-3">
          {sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-sm">{comment.author}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {format(new Date(comment.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <MessageSquare className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
          <p className="text-sm text-zinc-500">Aucun commentaire pour le moment</p>
          <p className="text-xs text-zinc-400 mt-1">Soyez le premier à commenter !</p>
        </div>
      )}
    </div>
  );
};
