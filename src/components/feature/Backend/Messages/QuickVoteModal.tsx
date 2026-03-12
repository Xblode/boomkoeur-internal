'use client';

import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Input, Button } from '@/components/ui/atoms';

export interface QuickVoteData {
  question?: string;
  yes: string[];
  no: string[];
}

interface QuickVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quickVote: QuickVoteData) => void;
}

export function QuickVoteModal({ isOpen, onClose, onSubmit }: QuickVoteModalProps) {
  const [question, setQuestion] = useState('');

  const handleClose = () => {
    setQuestion('');
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({
      question: question.trim() || undefined,
      yes: [],
      no: [],
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Vote rapide oui / non" size="sm">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Question (optionnelle)
          </label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: On confirme le lieu ?"
            fullWidth
            className="text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Les membres pourront voter Oui ou Non directement dans le chat.
        </p>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          className="flex items-center gap-2"
        >
          <ThumbsUp size={14} />
          Lancer le vote
        </Button>
      </ModalFooter>
    </Modal>
  );
}
