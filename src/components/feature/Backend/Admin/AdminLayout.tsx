"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, Database, Settings, Globe } from 'lucide-react';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import Link from 'next/link';

type SectionId = 'general' | 'utilisateurs' | 'migration';

interface SidebarSection {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  slug: string;
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: 'general',      label: 'Général',          icon: <Globe size={16} />,    slug: '/general' },
  { id: 'utilisateurs', label: 'Utilisateurs',     icon: <Users size={16} />,    slug: '' },
  { id: 'migration',    label: 'Migration données', icon: <Database size={16} />, slug: '/migration' },
];

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname.includes('/general')) return 'general';
  if (pathname.includes('/migration')) return 'migration';
  return 'utilisateurs';
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { toolbar } = useToolbar();

  const basePath = '/dashboard/admin';
  const activeSection = getActiveSectionFromPath(pathname);

  return (
    <div className="flex min-h-[calc(100vh-60px)]">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <div className="mb-3 px-2 flex items-center gap-2">
              <Settings size={14} className="text-zinc-500" />
              <h2 className="font-bold text-sm">Administration</h2>
            </div>

            <div className="space-y-0.5">
              {SIDEBAR_SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  href={`${basePath}${section.slug}`}
                  className={cn(
                    "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                    activeSection === section.id
                      ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                      : "text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">

        {toolbar && (
          <div className="sticky top-0 z-20 shrink-0">
            {toolbar}
          </div>
        )}

        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
