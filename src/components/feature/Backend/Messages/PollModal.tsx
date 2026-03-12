'use client';

import { useState } from 'react';
import { BarChart3, Plus, Trash2 } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/organisms/Modal';
import { Input, Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';

export interface PollData {
  question: string;
  options: { id: string; label: string }[];
}

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poll: PollData) => void;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export function PollModal({ isOpen, onClose, onSubmit }: PollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<{ id: string; label: string }[]>([
    { id: 'opt_0', label: '' },
    { id: 'opt_1', label: '' },
  ]);

  const reset = () => {
    setQuestion('');
    setOptions([
      { id: 'opt_0', label: '' },
      { id: 'opt_1', label: '' },
    ]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    const nextId = `opt_${Date.now()}`;
    setOptions((prev) => [...prev, { id: nextId, label: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOption = (id: string, label: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, label } : o))
    );
  };

  const canSubmit =
    question.trim().length > 0 &&
    options.filter((o) => o.label.trim()).length >= MIN_OPTIONS;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const validOptions = options
      .filter((o) => o.label.trim())
      .map((o) => ({ id: o.id, label: o.label.trim() }));
    if (validOptions.length < MIN_OPTIONS) return;
    onSubmit({ question: question.trim(), options: validOptions });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Créer un sondage" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Question
          </label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Quelle date pour le team building ?"
            fullWidth
            className="text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Options
            </label>
            <span className="text-xs text-zinc-500">
              {options.filter((o) => o.label.trim()).length} / {MAX_OPTIONS}
            </span>
          </div>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 w-5">{i + 1}.</span>
                <Input
                  value={opt.label}
                  onChange={(e) => updateOption(opt.id, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  fullWidth
                  size="sm"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeOption(opt.id)}
                  disabled={options.length <= MIN_OPTIONS}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    options.length <= MIN_OPTIONS
                      ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                  )}
                  aria-label="Supprimer l'option"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
            >
              <Plus size={14} />
              Ajouter une option
            </button>
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2"
        >
          <BarChart3 size={14} />
          Créer le sondage
        </Button>
      </ModalFooter>
    </Modal>
  );
}
