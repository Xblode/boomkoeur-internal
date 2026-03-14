'use client';

import React from 'react';
import { Sidebar, Header, DashboardShell, MobileBottomToolbar, MOBILE_TOOLBAR_HEIGHT_PX } from '@/components/ui/organisms';
import { backendNavigation } from '@/config/navigation';
import { SearchModalProvider } from '@/components/providers/SearchModalProvider';
import { isDetailPage, isMainDashboardPage, usesDashboardShell } from '@/config/layout';
import { useSidebarMode } from '@/hooks';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToolbarProvider, useToolbar } from '@/components/providers/ToolbarProvider';
import { AlertProvider } from '@/components/providers/AlertProvider';
import { PageSidebarProvider } from '@/components/providers/PageSidebarProvider';
import { ChatPanelProvider } from '@/components/providers/ChatPanelProvider';
import { DetailPanelProvider } from '@/components/providers/DetailPanelProvider';
import { PageLayoutProvider } from '@/components/providers/PageLayoutProvider';
import { OrgProvider } from '@/components/providers/OrgProvider';
import { HeaderActionProvider } from '@/components/providers/HeaderActionProvider';
import { MessagesDrawerProvider } from '@/components/providers/MessagesDrawerProvider';
import { MessagesDrawer } from '@/components/feature/Backend/Messages/MessagesDrawer';
import { PwaInstallBanner } from '@/components/feature/PWA/PwaInstallBanner';

function BackendLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarMode } = useSidebarMode();
  const pathname = usePathname();
  const isDetail = isDetailPage(pathname);
  const useShell = usesDashboardShell(pathname);
  // Mode présentation : /meetings/[id]/present (exclure /presentation utilisé par docs)
  const isPresentationMode =
    pathname?.includes('/present') && !pathname?.includes('/presentation');
  const { toolbar } = useToolbar();

  // Mode présentation : pas de layout du tout
  if (isPresentationMode) {
    return <>{children}</>;
  }

  const showMobileToolbar = isMainDashboardPage(pathname);

  return (
    <SearchModalProvider>
      <div className={cn(
        "bg-backend flex flex-col",
        showMobileToolbar ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
      )}>
        {/* Header Fixed Top */}
        <Header variant="admin" />

        {/* Toolbar dynamique (sous le header) — uniquement hors pages detail */}
        {toolbar && !isDetail && (
          <div
            className={cn(
              "fixed top-[52px] right-0 z-40 flex w-full transition-all duration-300 ease-in-out",
              "left-0 lg:left-[52px]",
              sidebarMode === 'expanded' && "lg:left-[200px]"
            )}
          >
            {toolbar}
          </div>
        )}

        {/* Sidebar Fixed Left — masquée sur mobile (remplacée par MobileBottomToolbar) */}
        <Sidebar items={backendNavigation} mode={sidebarMode} className="hidden lg:flex" />
        
        {/* Mobile Bottom Toolbar — pages principales uniquement */}
        {showMobileToolbar && <MobileBottomToolbar />}
        
        {/* Contenu principal — une seule zone de scroll sur mobile */}
        <div className={cn(
          "flex flex-col flex-1 min-h-0 transition-all duration-300 ease-in-out",
          showMobileToolbar && "lg:flex-initial lg:min-h-[100dvh]",
          (toolbar && !isDetail) ? "pt-[97px]" : "pt-[52px]",
          "pl-0 lg:pl-[52px]",
          sidebarMode === 'expanded' && "lg:pl-[200px]",
          showMobileToolbar && `pb-[calc(${MOBILE_TOOLBAR_HEIGHT_PX}px+env(safe-area-inset-bottom))] lg:pb-0`
        )}>
          {useShell ? (
            <DashboardShell showMobileToolbar={showMobileToolbar}>{children}</DashboardShell>
          ) : (
            <main className="flex-1 min-w-0 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 lg:p-8">
                <div className="max-w-7xl mx-auto">{children}</div>
              </div>
            </main>
          )}
        </div>
      </div>
    </SearchModalProvider>
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
        <MessagesDrawerProvider>
        <HeaderActionProvider>
        <ToolbarProvider>
          <AlertProvider>
            <PageSidebarProvider>
              <ChatPanelProvider>
                <DetailPanelProvider>
                <PageLayoutProvider>
                  <BackendLayoutContent>
                    {children}
                  </BackendLayoutContent>
                </PageLayoutProvider>
                </DetailPanelProvider>
              </ChatPanelProvider>
            </PageSidebarProvider>
          </AlertProvider>
        </ToolbarProvider>
        </HeaderActionProvider>
        <MessagesDrawer />
        </MessagesDrawerProvider>
        <PwaInstallBanner />
        </OrgProvider>
      </ThemeProvider>
  );
}
