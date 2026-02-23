import { ProfileLayoutConfig } from '@/components/feature/Backend/Profile/ProfileLayoutConfig';

export default function ProfileRootLayout({ children }: { children: React.ReactNode }) {
  return <ProfileLayoutConfig>{children}</ProfileLayoutConfig>;
}
