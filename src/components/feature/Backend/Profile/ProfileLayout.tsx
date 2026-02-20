"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserCircle, UserCog, Lock } from 'lucide-react';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import Link from 'next/link';

type SectionId = 'profil' | 'informations' | 'securite';

interface SidebarSection {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  slug: string;
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: 'profil',       label: 'Profil',       icon: <UserCircle size={16} />, slug: '' },
  { id: 'informations', label: 'Informations', icon: <UserCog size={16} />,    slug: '/informations' },
  { id: 'securite',     label: 'Sécurité',     icon: <Lock size={16} />,       slug: '/securite' },
];

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname.includes('/informations')) return 'informations';
  if (pathname.includes('/securite')) return 'securite';
  return 'profil';
}

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();
  const { toolbar } = useToolbar();
  const basePath = '/dashboard/profile';
  const activeSection = getActiveSectionFromPath(pathname);

  return (
    <div className="flex min-h-[calc(100vh-60px)]">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <div className="mb-3 px-2 flex items-center gap-2">
              <UserCircle size={14} className="text-zinc-500" />
              <h2 className="font-bold text-sm">Mon Profil</h2>
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
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
