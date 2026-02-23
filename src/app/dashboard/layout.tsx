'use client';

import React from 'react';
import { Sidebar, Header, DashboardShell } from '@/components/ui/organisms';
import { backendNavigation } from '@/config/navigation';
import { isDetailPage, usesDashboardShell } from '@/config/layout';
import { useSidebarMode } from '@/hooks';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToolbarProvider, useToolbar } from '@/components/providers/ToolbarProvider';
import { AlertProvider } from '@/components/providers/AlertProvider';
import { PageSidebarProvider } from '@/components/providers/PageSidebarProvider';
import { ChatPanelProvider } from '@/components/providers/ChatPanelProvider';
import { PageLayoutProvider } from '@/components/providers/PageLayoutProvider';

function BackendLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarMode } = useSidebarMode();
  const pathname = usePathname();
  const isDesignSystem = pathname?.startsWith('/dashboard/design-system');
  const isDetail = isDetailPage(pathname);
  const useShell = usesDashboardShell(pathname);
  const isPresentationMode = pathname?.includes('/present');
  const { toolbar } = useToolbar();

  // Mode présentation : pas de layout du tout
  if (isPresentationMode) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-backend">
      {/* Header Fixed Top */}
      <Header variant="admin" />

      {/* Toolbar dynamique (sous le header) — uniquement hors pages detail */}
      {toolbar && !isDetail && (
        <div
          className={cn(
            "fixed top-[60px] right-0 z-40 transition-all duration-300 ease-in-out",
            sidebarMode === 'expanded' ? 'left-[200px]' : 'left-[60px]'
          )}
        >
          {toolbar}
        </div>
      )}

      {/* Sidebar Fixed Left (sous le header) */}
      <Sidebar items={backendNavigation} mode={sidebarMode} />
      
      {/* Contenu principal décalé */}
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        (toolbar && !isDetail) ? "pt-[105px]" : "pt-[60px]",
        sidebarMode === 'expanded' ? 'pl-[200px]' : 'pl-[60px]'
      )}>
        {useShell ? (
          <DashboardShell>{children}</DashboardShell>
        ) : isDetail ? (
          children
        ) : (
          <main className={cn("flex-1", !isDesignSystem && "p-6 md:p-8")}>
            <div className={cn(!isDesignSystem && "max-w-7xl mx-auto")}>
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme-dashboard"
    >
      <ToolbarProvider>
        <AlertProvider>
          <PageSidebarProvider>
            <ChatPanelProvider>
              <PageLayoutProvider>
                <BackendLayoutContent>
                  {children}
                </BackendLayoutContent>
              </PageLayoutProvider>
            </ChatPanelProvider>
          </PageSidebarProvider>
        </AlertProvider>
      </ToolbarProvider>
    </ThemeProvider>
  );
}
