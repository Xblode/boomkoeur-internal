"use client";

import React, { useState, useEffect } from 'react';
import { Button, Textarea, Label } from '@/components/ui/atoms';
import { Check, Presentation, FileText } from 'lucide-react';
import { useMeetingDetail } from './MeetingDetailProvider';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar, PageToolbarFilters, PageToolbarActions } from '@/components/ui/organisms';
import { SectionHeader } from '@/components/ui';
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
      <PageToolbar
        filters={<PageToolbarFilters><span className="text-xs text-zinc-400 hidden sm:block">Compte-rendu</span></PageToolbarFilters>}
        actions={
          <PageToolbarActions>
            <Button onClick={() => router.push(`/dashboard/meetings/${params.id}/present`)}>
              <Presentation className="w-3 h-3 mr-1.5" />
              Mode présentation
            </Button>
          </PageToolbarActions>
        }
      />
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
      <SectionHeader
        icon={<FileText size={28} />}
        title="Compte-rendu"
        subtitle="Rédigez et consultez le compte-rendu de la réunion."
      />

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
                <Label className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                  {item.title}
                </Label>
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
