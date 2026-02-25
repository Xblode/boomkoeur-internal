'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms/Popover';
import { StatusIcon, StatusIconShape, StatusIconVariant } from '@/components/ui/atoms/StatusIcon';

// Types of task
export type TaskType = 'tache' | 'jalon';

// Status definitions
export interface StatusDef {
  id: string;
  label: string;
  variant: StatusIconVariant;
  colorClass: string;
  progress?: number;
}

export const STATUS_GROUPS: { label: string; statuses: StatusDef[] }[] = [
  {
    label: 'Non démarré',
    statuses: [
      { id: 'prochainement', label: 'PROCHAINEMENT', variant: 'not_started', colorClass: 'text-zinc-400' },
      { id: 'recurrente', label: 'TÂCHE RÉCURRENTE', variant: 'not_started', colorClass: 'text-orange-500' },
    ]
  },
  {
    label: 'Actif',
    statuses: [
      { id: 'en_cours', label: 'EN COURS', variant: 'active', colorClass: 'text-blue-500', progress: 25 },
      { id: 'en_retard', label: 'EN RETARD', variant: 'active', colorClass: 'text-red-500', progress: 50 },
      { id: 'modification', label: 'MODIFICATION', variant: 'active', colorClass: 'text-yellow-500', progress: 75 },
      { id: 'verification', label: 'VERIFICATION', variant: 'active', colorClass: 'text-orange-900 dark:text-orange-700', progress: 90 },
    ]
  },
  {
    label: 'Terminé',
    statuses: [
      { id: 'termine', label: 'TERMINÉ', variant: 'done', colorClass: 'text-emerald-500' },
    ]
  },
  {
    label: 'Fermé',
    statuses: [
      { id: 'off', label: 'OFF', variant: 'done', colorClass: 'text-emerald-600' },
    ]
  }
];

// Helper to get status by ID
export function getStatusDef(id: string): StatusDef | undefined {
  for (const group of STATUS_GROUPS) {
    const found = group.statuses.find(s => s.id === id);
    if (found) return found;
  }
  return undefined;
}

export interface EtatPickerProps {
  statusId: string;
  taskType: TaskType;
  onStatusChange: (statusId: string) => void;
  onTaskTypeChange: (type: TaskType) => void;
  trigger?: React.ReactNode;
}

export function EtatPicker({
  statusId,
  taskType,
  onStatusChange,
  onTaskTypeChange,
  trigger,
}: EtatPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'statut' | 'type'>('statut');

  const shape: StatusIconShape = taskType === 'jalon' ? 'square' : 'circle';
  const currentStatus = getStatusDef(statusId) || STATUS_GROUPS[0].statuses[0];

  const defaultTrigger = (
    <button className="flex items-center justify-center p-0.5 -m-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none cursor-pointer">
      <StatusIcon 
        shape={shape} 
        variant={currentStatus.variant} 
        progress={currentStatus.progress} 
        className={currentStatus.colorClass} 
      />
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0 rounded-md overflow-hidden" 
        align="start"
        sideOffset={8}
      >
        {/* Toggle Statut / Type de tâche */}
        <div className="flex p-1 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-border-custom">
          <button
            onClick={() => setActiveTab('statut')}
            className={cn(
              "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
              activeTab === 'statut' 
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" 
                : "text-zinc-500 hover:text-foreground"
            )}
          >
            Statut
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={cn(
              "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
              activeTab === 'type' 
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" 
                : "text-zinc-500 hover:text-foreground"
            )}
          >
            Type de tâche
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[320px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
          {activeTab === 'statut' && (
            <div className="space-y-4">
              {STATUS_GROUPS.map((group) => {
                if (group.statuses.length === 0) return null;
                return (
                  <div key={group.label}>
                    <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 px-2 mt-1">
                      {group.label}
                    </h4>
                    <div className="flex flex-col gap-0.5">
                      {group.statuses.map((status) => (
                        <button
                          key={status.id}
                          onClick={() => {
                            onStatusChange(status.id);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-3 w-full px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-left",
                            statusId === status.id 
                              ? "bg-zinc-100 dark:bg-zinc-800 text-foreground" 
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                          )}
                        >
                          <div className="w-4 flex justify-center">
                            <StatusIcon 
                              shape={shape} 
                              variant={status.variant} 
                              progress={status.progress} 
                              className={status.colorClass} 
                            />
                          </div>
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'type' && (
            <div className="py-2 space-y-1">
              <button
                onClick={() => {
                  onTaskTypeChange('tache');
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  taskType === 'tache'
                    ? "bg-zinc-100 dark:bg-zinc-800 text-foreground" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                )}
              >
                <div className="w-4 flex justify-center text-zinc-500 dark:text-zinc-400">
                  <div className="w-[14px] h-[14px] rounded-full border-[1.5px] border-current bg-transparent" />
                </div>
                Tâche
              </button>
              <button
                onClick={() => {
                  onTaskTypeChange('jalon');
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  taskType === 'jalon'
                    ? "bg-zinc-100 dark:bg-zinc-800 text-foreground" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                )}
              >
                <div className="w-4 flex justify-center text-zinc-500 dark:text-zinc-400">
                  <div className="w-[14px] h-[14px] rotate-45 rounded-[2.5px] border-[1.5px] border-current bg-transparent" />
                </div>
                Jalon
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}