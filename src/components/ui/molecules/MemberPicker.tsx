'use client';

import React, { useState, useCallback } from 'react';
import { User } from '@/types/user';
import { mockUsers } from '@/lib/mocks/users';
import { cn } from '@/lib/utils';
import { Check, Plus, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-orange-500',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── MemberAvatar (internal, not exported to avoid conflict with atoms/Avatar) ───

interface MemberAvatarProps {
  name: string;
  src?: string;
  size?: number;
}

function MemberAvatar({ name, src, size = 22 }: MemberAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        title={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-2 ring-card-bg shrink-0"
      />
    );
  }
  return (
    <div
      title={name}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-card-bg shrink-0',
        avatarColor(name)
      )}
    >
      {getInitials(name)}
    </div>
  );
}

// ── MemberPicker ──────────────────────────────────────────────────────────────

const MAX_VISIBLE = 3;
const ALL_MEMBERS: User[] = mockUsers.filter(u => u.status === 'active');

export interface MemberPickerProps {
  /** List of selected member full names */
  value: string[];
  onChange: (next: string[]) => void;
  /** Avatar size in px (stack). Default: 22 */
  avatarSize?: number;
  /** Controlled open state */
  open?: boolean;
  /** Controlled open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Ref to the parent cell — used to prevent closing when clicking inside the cell */
  cellRef?: React.RefObject<HTMLElement | null>;
  /** Extra className on the root wrapper (e.g. "flex-1" to span the full cell) */
  className?: string;
}

export function MemberPicker({ value, onChange, avatarSize = 22, open: openProp, onOpenChange, cellRef, className }: MemberPickerProps) {
  const [openInternal, setOpenInternal] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp! : openInternal;
  const [search, setSearch] = useState('');

  const setOpen = useCallback((next: boolean) => {
    if (!next) setSearch('');
    if (isControlled) onOpenChange?.(next);
    else setOpenInternal(next);
  }, [isControlled, onOpenChange]);

  const toggle = (fullName: string) => {
    const next = value.includes(fullName)
      ? value.filter(p => p !== fullName)
      : [...value, fullName];
    onChange(next);
  };

  const visible = value.slice(0, MAX_VISIBLE);
  const overflow = value.length - MAX_VISIBLE;

  const filtered = ALL_MEMBERS.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const resolveUser = (name: string) =>
    ALL_MEMBERS.find(u => `${u.firstName} ${u.lastName}` === name);

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            {value.length === 0 ? (
              <div className="flex items-center gap-1 text-sm text-zinc-400 hover:text-foreground transition-colors">
                <Plus size={14} />
                <span>Ajouter</span>
              </div>
            ) : (
              <div className="flex -space-x-1.5">
                {visible.map(name => {
                  const user = resolveUser(name);
                  return <MemberAvatar key={name} name={name} src={user?.avatar} size={avatarSize} />;
                })}
                {overflow > 0 && (
                  <div
                    style={{ width: avatarSize, height: avatarSize, fontSize: Math.round(avatarSize * 0.4) }}
                    className="rounded-full bg-zinc-700 dark:bg-zinc-600 text-white flex items-center justify-center font-semibold ring-2 ring-card-bg"
                  >
                    +{overflow}
                  </div>
                )}
              </div>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="!w-64 !p-0"
          align="start"
          sideOffset={8}
          onInteractOutside={(e) => {
            if (cellRef?.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
        >
          {/* Search */}
          <div className="p-2 border-b border-border-custom">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
              <Search size={13} className="text-zinc-400 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un membre..."
                className="bg-transparent border-0 outline-none text-sm w-full placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">Aucun membre trouvé</p>
            ) : (
              filtered.map(user => {
                const fullName = `${user.firstName} ${user.lastName}`;
                const selected = value.includes(fullName);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggle(fullName)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left',
                      selected && 'bg-zinc-50 dark:bg-zinc-800/60'
                    )}
                  >
                    <MemberAvatar name={fullName} src={user.avatar} size={26} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fullName}</p>
                      {user.position && (
                        <p className="text-xs text-zinc-500 truncate">{user.position}</p>
                      )}
                    </div>
                    {selected && <Check size={14} className="text-foreground shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {value.length > 0 && (
            <div className="p-2 border-t border-border-custom">
              <p className="text-xs text-zinc-500 text-center">
                {value.length} membre{value.length > 1 ? 's' : ''} sélectionné{value.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
