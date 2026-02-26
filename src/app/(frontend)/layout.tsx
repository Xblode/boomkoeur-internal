import React from 'react';
import { Header, Footer } from '@/components/ui/organisms';
import { ContactSection } from '@/components/feature/Frontend/Contact';
import { frontendNavigation, footerSocialLinksData } from '@/config/navigation';
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey="theme-frontend"
    >
      <div className="min-h-screen flex flex-col">
        <Header navigation={frontendNavigation} />
        <main className="flex-1">
          {children}
        </main>
        <ContactSection />
        <Footer socialLinks={footerSocialLinksData} />
      </div>
    </ThemeProvider>
  );
}
