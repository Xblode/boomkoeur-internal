'use client';

import React from 'react';
import { Sidebar, Header, DashboardShell, MobileNavDrawer } from '@/components/ui/organisms';
import { backendNavigation } from '@/config/navigation';
import { MobileNavProvider } from '@/components/providers/MobileNavProvider';
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
import { OrgProvider } from '@/components/providers/OrgProvider';

function BackendLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarMode } = useSidebarMode();
  const pathname = usePathname();
  const isDetail = isDetailPage(pathname);
  const useShell = usesDashboardShell(pathname);
  const isPresentationMode = pathname?.includes('/present');
  const { toolbar } = useToolbar();

  // Mode présentation : pas de layout du tout
  if (isPresentationMode) {
    return <>{children}</>;
  }

  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-backend">
        {/* Header Fixed Top */}
        <Header variant="admin" />

        {/* Toolbar dynamique (sous le header) — uniquement hors pages detail */}
        {toolbar && !isDetail && (
          <div
            className={cn(
              "fixed top-[60px] right-0 z-40 transition-all duration-300 ease-in-out",
              "left-0 lg:left-[60px]",
              sidebarMode === 'expanded' && "lg:left-[200px]"
            )}
          >
            {toolbar}
          </div>
        )}

        {/* Sidebar Fixed Left — masquée sur mobile (remplacée par MobileNavDrawer) */}
        <Sidebar items={backendNavigation} mode={sidebarMode} className="hidden lg:flex" />
        
        {/* Mobile Nav Drawer */}
        <MobileNavDrawer items={backendNavigation} />
        
        {/* Contenu principal décalé — pas de padding gauche sur mobile */}
        <div className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          (toolbar && !isDetail) ? "pt-[105px]" : "pt-[60px]",
          "pl-0 lg:pl-[60px]",
          sidebarMode === 'expanded' && "lg:pl-[200px]"
        )}>
          {useShell ? (
            <DashboardShell>{children}</DashboardShell>
          ) : (
            <main className="flex-1 min-w-0">
              <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">{children}</div>
              </div>
            </main>
          )}
        </div>
      </div>
    </MobileNavProvider>
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
      <OrgProvider>
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
      </OrgProvider>
    </ThemeProvider>
  );
}
