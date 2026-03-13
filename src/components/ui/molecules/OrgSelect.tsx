'use client';

import React, { useState } from 'react';
import { Building2, ChevronsUpDown, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';
import { useOrg } from '@/hooks';

export interface OrgSelectProps {
  className?: string;
  /** Max width du label affiché */
  maxLabelWidth?: number;
}

export function OrgSelect({ className, maxLabelWidth = 160 }: OrgSelectProps) {
  const { activeOrg, userOrgs, switchOrg, isLoading } = useOrg();
  const [orgSearch, setOrgSearch] = useState('');
  const [orgPopoverOpen, setOrgPopoverOpen] = useState(false);

  const filteredOrgs = userOrgs.filter(org =>
    org.name.toLowerCase().includes(orgSearch.toLowerCase()),
  );

  const handleSwitchOrg = (orgId: string) => {
    switchOrg(orgId);
    setOrgPopoverOpen(false);
    setOrgSearch('');
  };

  return (
    <Popover
      open={orgPopoverOpen}
      onOpenChange={(open) => { setOrgPopoverOpen(open); if (!open) setOrgSearch(''); }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300',
            'rounded-md px-1.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800',
            'hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors',
            className
          )}
        >
          <Building2 size={16} className="shrink-0" />
          <span className="truncate" style={{ maxWidth: maxLabelWidth }}>
            {isLoading ? '...' : (activeOrg?.name ?? 'Organisation')}
          </span>
          <ChevronsUpDown size={14} className="opacity-50 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start" sideOffset={8}>
        <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto p-1" role="listbox" aria-label="Organisations">
          {filteredOrgs.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-3">Aucune organisation</p>
          ) : (
            filteredOrgs.map(org => (
              <button
                key={org.id}
                type="button"
                role="option"
                aria-selected={org.id === activeOrg?.id}
                onClick={() => handleSwitchOrg(org.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left',
                  org.id === activeOrg?.id
                    ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                )}
              >
                <Building2 size={14} className="shrink-0 text-zinc-400" />
                <span className="truncate flex-1">{org.name}</span>
                {org.id === activeOrg?.id && <Check size={14} className="shrink-0 text-zinc-500" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
