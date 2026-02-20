import React from 'react';
import { Header, Footer } from '@/components/ui/organisms';
import { frontendNavigation, footerLinks, footerSocialLinks } from '@/config/navigation';
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
        <Footer links={footerLinks} socialLinks={footerSocialLinks} />
      </div>
    </ThemeProvider>
  );
}
