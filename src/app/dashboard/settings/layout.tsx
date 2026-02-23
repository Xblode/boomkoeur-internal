import { SettingsLayoutConfig } from '@/components/feature/Backend/Settings/SettingsLayoutConfig';

export default function SettingsRootLayout({ children }: { children: React.ReactNode }) {
  return <SettingsLayoutConfig>{children}</SettingsLayoutConfig>;
}
