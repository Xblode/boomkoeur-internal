import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function PresentationLayout({
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
      <div className="h-screen w-screen overflow-hidden" style={{ backgroundColor: '#171717' }}>
        {children}
      </div>
    </ThemeProvider>
  );
}
