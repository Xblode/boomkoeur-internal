import { SettingsLayoutConfig } from '@/components/feature/Backend/Settings/SettingsLayoutConfig';
import { DemoGuard } from '@/components/providers/DemoGuard';

export default function SettingsRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoGuard>
      <SettingsLayoutConfig>{children}</SettingsLayoutConfig>
    </DemoGuard>
  );
}
