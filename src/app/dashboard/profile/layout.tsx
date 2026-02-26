import { ProfileLayoutConfig } from '@/components/feature/Backend/Profile/ProfileLayoutConfig';
import { DemoGuard } from '@/components/providers/DemoGuard';

export default function ProfileRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoGuard>
      <ProfileLayoutConfig>{children}</ProfileLayoutConfig>
    </DemoGuard>
  );
}
