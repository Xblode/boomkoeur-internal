import { ProfileLayout } from '@/components/feature/Backend/Profile/ProfileLayout';

export default function ProfileRootLayout({ children }: { children: React.ReactNode }) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
