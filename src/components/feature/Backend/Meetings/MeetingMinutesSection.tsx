"use client";

import React, { useState, useEffect } from 'react';
import { Button, Textarea } from '@/components/ui/atoms';
import { Check, Presentation } from 'lucide-react';
import { useMeetingDetail } from './MeetingDetailProvider';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar } from '@/components/ui/organisms/PageToolbar';
import { useRouter, useParams } from 'next/navigation';

export function MeetingMinutesSection() {
  const { meeting, persistField } = useMeetingDetail();
  const { setToolbar } = useToolbar();
  const router = useRouter();
  const params = useParams();

  const [freeText, setFreeText] = useState(meeting.minutes.freeText || '');
  const [agendaItemNotes, setAgendaItemNotes] = useState<Record<string, string>>(
    meeting.agenda.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.notes || '',
    }), {} as Record<string, string>)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync from context
  useEffect(() => {
    setFreeText(meeting.minutes.freeText || '');
    setAgendaItemNotes(
      meeting.agenda.reduce((acc, item) => ({
        ...acc,
        [item.id]: item.notes || '',
      }), {} as Record<string, string>)
    );
  }, [meeting.minutes.freeText, meeting.agenda]);

  // Toolbar
  useEffect(() => {
    setToolbar(
      <PageToolbar className="justify-between bg-[#171717] h-10 min-h-0 p-0 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 flex-1 h-full">
          <span className="text-xs text-zinc-400 hidden sm:block">Compte-rendu</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/meetings/${params.id}/present`)}
              className="px-2 py-1 bg-white text-black rounded text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <Presentation className="w-3 h-3" />
              Mode présentation
            </button>
          </div>
        </div>
      </PageToolbar>
    );
    return () => setToolbar(null);
  }, [meeting.id, setToolbar, router, params.id]);

  const handleSave = () => {
    setIsSaving(true);

    const updatedAgenda = meeting.agenda.map(item => ({
      ...item,
      notes: agendaItemNotes[item.id] !== undefined ? agendaItemNotes[item.id] : item.notes,
    }));

    persistField({
      minutes: {
        freeText,
        createdAt: meeting.minutes.createdAt || new Date(),
        updatedAt: new Date(),
      },
      agenda: updatedAgenda,
    });

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">

      {/* Notes libres */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Notes libres</h3>
        <Textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Saisissez vos notes générales sur la réunion..."
          rows={8}
          className="w-full resize-none py-3 px-4"
        />
      </div>

      {/* Notes par point */}
      {meeting.agenda.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Notes par point d&apos;ordre du jour</h3>
          <div className="space-y-4">
            {meeting.agenda.map((item) => (
              <div key={item.id} className="space-y-2">
                <label className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                  {item.title}
                </label>
                <Textarea
                  value={agendaItemNotes[item.id] || ''}
                  onChange={(e) => setAgendaItemNotes(prev => ({
                    ...prev,
                    [item.id]: e.target.value,
                  }))}
                  placeholder={`Notes sur "${item.title}"...`}
                  rows={3}
                  className="w-full resize-none py-3 px-4"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3 justify-end">
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <Check size={14} /> Sauvegardé
          </span>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder le compte-rendu'}
        </Button>
      </div>
    </div>
  );
}
