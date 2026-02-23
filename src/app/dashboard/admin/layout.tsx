import { AdminLayoutConfig } from '@/components/feature/Backend/Admin/AdminLayoutConfig';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutConfig>{children}</AdminLayoutConfig>;
}
