'use client';

import React, { useState } from 'react';
import { useEventDetail } from './EventDetailProvider';
import { useOrg } from '@/hooks';
import { Button, Textarea, Label } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_LABELS: Record<string, string> = {
  post: 'Post',
  reel: 'Réel',
  story: 'Story',
  newsletter: 'Newsletter',
};

export function EventBilanSection() {
  const { event, persistField } = useEventDetail();
  const { activeOrg } = useOrg();
  const [exporting, setExporting] = useState(false);

  const wf = event.comWorkflow;
  const posts = wf?.posts ?? [];
  const publishedCount = posts.filter((p) => p.published).length;
  const bilanNotes = wf?.bilanNotes ?? '';

  const handleExport = async () => {
    if (!activeOrg?.id || !event.id) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/bilan/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: activeOrg.id,
          bilan_notes: bilanNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Erreur lors de l\'export');
      }
      if (data.webViewLink) {
        window.open(data.webViewLink, '_blank');
      }
      toast.success('Bilan exporté et enregistré sur Drive');
    } catch (err) {
      console.error('Bilan export error:', err);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const eventDate = event.date ? new Date(event.date) : null;
  const eventDateStr = eventDate ? format(eventDate, 'EEEE d MMMM yyyy', { locale: fr }) : '-';

  return (
    <div className="space-y-6">
      {/* Synthèse auto */}
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Synthèse campagne</p>
        <Card variant="outline">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Événement</p>
                <p className="font-medium">{event.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Date</p>
                <p className="font-medium">{eventDateStr}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Lieu</p>
                <p className="font-medium">{event.location || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Posts publiés</p>
                <p className="font-medium">{publishedCount} / {posts.length}</p>
              </div>
            </div>
            {posts.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-1.5">Posts planifiés</p>
                <ul className="text-sm space-y-1">
                  {posts.map((p) => (
                    <li key={p.id} className="flex items-center gap-2">
                      <span className={p.published ? 'text-green-600 dark:text-green-400' : 'text-zinc-500'}>
                        {p.published ? '✓' : '○'}
                      </span>
                      {p.type && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                          {TYPE_LABELS[p.type] ?? p.type}
                        </span>
                      )}
                      {p.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes / Enseignements */}
      <div>
        <Label className="text-xs font-medium text-zinc-500 mb-2 block uppercase tracking-wide">
          Notes / Enseignements
        </Label>
        <Textarea
          key={`bilan-${event.id}`}
          defaultValue={bilanNotes}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v !== bilanNotes) {
              persistField((current) => {
                const base = current.comWorkflow;
                if (!base) return {};
                return {
                  comWorkflow: { ...base, bilanNotes: v || undefined },
                };
              });
            }
          }}
          rows={5}
          placeholder="Analyse, enseignements, points d'amélioration pour les prochaines campagnes..."
          className="resize-none"
        />
      </div>

      {/* Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <Button
          variant="primary"
          size="md"
          onClick={handleExport}
          disabled={exporting || !activeOrg?.id}
          className="inline-flex items-center gap-2"
        >
          {exporting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Export en cours...
            </>
          ) : (
            <>
              <Upload size={18} />
              Exporter et enregistrer sur Drive
            </>
            )}
        </Button>
        <p className="text-xs text-zinc-500">
          Le bilan sera exporté en PDF dans le dossier « Bilan Campagne » à la racine de votre Google Drive.
        </p>
      </div>
    </div>
  );
}
