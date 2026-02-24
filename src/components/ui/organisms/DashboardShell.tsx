'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PageSidebar, PageAlert } from '@/components/ui';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { useAlert } from '@/components/providers/AlertProvider';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { useChatPanel } from '@/components/providers/ChatPanelProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { ChatPanel } from '@/components/ui/molecules/ChatPanel';
import type { PageContentMaxWidth } from './PageContentLayout';

const maxWidthClasses: Record<PageContentMaxWidth, string> = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DashboardShell - Structure unique pour les pages détail.
 * Lit les providers (PageSidebar, Toolbar, Alert, ChatPanel) et affiche les slots.
 * Alert : slot toujours présent (contenu optionnel).
 */
export function DashboardShell({ children, className }: DashboardShellProps) {
  const { toolbar } = useToolbar();
  const { alert } = useAlert();
  const { config: pageSidebarConfig } = usePageSidebar();
  const { config: chatPanelConfig } = useChatPanel();
  const { maxWidth, fullBleed } = usePageLayout();

  const hasPageSidebar = pageSidebarConfig != null;
  const hasCustomSidebar = hasPageSidebar && pageSidebarConfig.customContent != null;
  const hasStandardSidebar = hasPageSidebar && !hasCustomSidebar;

  const alertNode =
    alert != null ? (
      <PageAlert
        variant={alert.variant}
        message={alert.message}
        onDismiss={alert.onDismiss}
      />
    ) : null;

  return (
    <div className={cn('flex h-[calc(100vh-52px)] min-h-0 overflow-hidden', className)}>
      {/* PageSidebar — standard ou custom */}
      {hasPageSidebar && (
        <>
          {hasCustomSidebar ? (
            <aside className="hidden lg:block w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
              <div className="p-4 space-y-4">{pageSidebarConfig.customContent}</div>
            </aside>
          ) : hasStandardSidebar ? (
            <PageSidebar
              backLink={pageSidebarConfig.backLink}
              entitySelector={pageSidebarConfig.entitySelector}
              sections={pageSidebarConfig.sections}
              sectionGroups={pageSidebarConfig.sectionGroups}
              activeSectionId={pageSidebarConfig.activeSectionId}
              onSectionChange={pageSidebarConfig.onSectionChange}
              basePath={pageSidebarConfig.basePath}
              compact
            >
              {pageSidebarConfig.children}
            </PageSidebar>
          ) : null}
        </>
      )}

      {/* Zone droite : Alert (toujours slot) + Toolbar + Main */}
      <main className="flex-1 min-w-0 flex flex-col min-h-0">
        {(alertNode || toolbar) && (
          <div className="shrink-0 flex flex-col z-20">
            {alertNode}
            {toolbar}
          </div>
        )}

        <div className={cn('flex-1 min-h-0 overflow-y-auto', !fullBleed && 'p-6 md:p-8 lg:p-12')}>
          <div className={cn(!fullBleed && 'mx-auto', !fullBleed && maxWidthClasses[maxWidth])}>
            {children}
          </div>
        </div>
      </main>

      {/* ChatPanel — flottant si activé */}
      {chatPanelConfig != null && (
        <ChatPanel
          comments={chatPanelConfig.comments}
          onSendComment={chatPanelConfig.onSendComment}
          hideAuthorInput={chatPanelConfig.hideAuthorInput}
          title={chatPanelConfig.title}
          emptyTitle={chatPanelConfig.emptyTitle}
          emptyDescription={chatPanelConfig.emptyDescription}
        />
      )}
    </div>
  );
}
