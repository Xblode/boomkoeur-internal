'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, FileText } from 'lucide-react';
import { EntitySelectorDropdown } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';

const MESSAGES_SECTIONS = [
  { id: 'messages' as const, label: 'Messages', icon: <MessageSquare size={16} />, href: '/dashboard/messages' },
  { id: 'journal' as const, label: 'Journal', icon: <FileText size={16} />, href: '/dashboard/messages/journal' },
] as const;

export function MessagesLayoutConfig({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setPageSidebarConfig } = usePageSidebar();

  const activeSection = pathname?.endsWith('/journal') ? 'journal' : 'messages';
  const activeSectionData = MESSAGES_SECTIONS.find((s) => s.id === activeSection);

  useEffect(() => {
    setPageSidebarConfig({
      activeSectionId: activeSection,
      mobileHeaderSelector: (
        <EntitySelectorDropdown<(typeof MESSAGES_SECTIONS)[number]>
          value={activeSectionData ?? null}
          options={[...MESSAGES_SECTIONS]}
          onSelect={(s) => router.push(s.href)}
          renderValue={(s) => s.label}
          renderOption={(s) => s.label}
          placeholder="Sous-page"
          variant="ghost"
          centerText
        />
      ),
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, activeSectionData, router, setPageSidebarConfig]);

  return <>{children}</>;
}
