'use client';

import React from 'react';
import { Sidebar, Header } from '@/components/ui/organisms';
import { backendNavigation } from '@/config/navigation';
import { useSidebarMode } from '@/hooks';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToolbarProvider, useToolbar } from '@/components/providers/ToolbarProvider';

function BackendLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarMode } = useSidebarMode();
  const pathname = usePathname();
  const isDesignSystem = pathname?.startsWith('/dashboard/design-system');
  const isEventDetail = /^\/dashboard\/events\/[^/]+/.test(pathname ?? '');
  const isMeetingDetail = /^\/dashboard\/meetings\/[^/]+/.test(pathname ?? '');
  const isFinancePage = pathname?.startsWith('/dashboard/finance');
  const isCommercialPage = pathname?.startsWith('/dashboard/commercial');
  const isProductsPage = pathname?.startsWith('/dashboard/products');
  const isAdminPage = pathname?.startsWith('/dashboard/admin');
  const isSettingsPage = pathname?.startsWith('/dashboard/settings');
  const isProfilePage = pathname?.startsWith('/dashboard/profile');
  const isCalendarPage = pathname?.startsWith('/dashboard/calendar');
  const isDetailPage = isEventDetail || isMeetingDetail || isFinancePage || isCommercialPage || isProductsPage || isAdminPage || isSettingsPage || isProfilePage || isCalendarPage;
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
      {toolbar && !isDetailPage && (
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
        (toolbar && !isDetailPage) ? "pt-[105px]" : "pt-[60px]",
        sidebarMode === 'expanded' ? 'pl-[200px]' : 'pl-[60px]'
      )}>
        <main className={cn("flex-1", !isDesignSystem && !isDetailPage && "p-6 md:p-8")}>
          <div className={cn(!isDesignSystem && !isDetailPage && "max-w-7xl mx-auto")}>
            {children}
          </div>
        </main>
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
        <BackendLayoutContent>
          {children}
        </BackendLayoutContent>
      </ToolbarProvider>
    </ThemeProvider>
  );
}
