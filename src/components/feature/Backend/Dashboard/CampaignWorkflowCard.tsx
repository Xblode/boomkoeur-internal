'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/molecules';
import { ChevronRight, Layers } from 'lucide-react';
import type { Event } from '@/types/event';

const WORKFLOW_PHASE_LABELS: Record<string, string> = {
  preparation: 'Préparation',
  production: 'Production',
  communication: 'Communication',
  postEvent: 'Post-Event',
};

const WORKFLOW_STEP_LABELS: Record<string, string[]> = {
  preparation: ['Plan de Communication', 'Event Shotgun', 'Visuels primaires'],
  production: ['Calendrier éditorial', 'Posts préparés', 'Textes & captions', 'Lancement Annonce'],
  communication: ['Campagne en cours', 'Event J-0'],
  postEvent: ['Publication des photos', 'Bilan & statistiques'],
};

interface CampaignWorkflowCardProps {
  event: Event;
}

export function CampaignWorkflowCard({ event }: CampaignWorkflowCardProps) {
  const wf = event.comWorkflow;
  if (!wf) return null;

  const phase = wf.activePhase ?? 'preparation';
  const stepIndex = wf.activeStep ?? 0;
  const phaseLabel = WORKFLOW_PHASE_LABELS[phase] ?? phase;
  const steps = WORKFLOW_STEP_LABELS[phase] ?? [];
  const stepLabel = steps[stepIndex] ?? '—';
  const stepDisplay = `${stepIndex + 1}/${steps.length}`;

  return (
    <Link href={`/dashboard/events/${event.id}/campagne`} className="block">
      <Card
        variant="none"
        className="group flex items-center gap-3 py-2 text-sm transition-colors hover:bg-surface-subtle rounded-md -mx-1 px-2"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300">
          <Layers size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs font-medium">{phaseLabel}</span>
            <span className="text-[10px]">·</span>
            <span className="text-[10px] tabular-nums">Étape {stepDisplay}</span>
          </div>
          <p className="text-sm font-medium text-foreground truncate mt-0.5 group-hover:text-foreground/90">
            {stepLabel.replace(/\n/g, ' ')}
          </p>
        </div>
        <ChevronRight size={16} className="shrink-0 text-zinc-500 group-hover:text-foreground" />
      </Card>
    </Link>
  );
}
