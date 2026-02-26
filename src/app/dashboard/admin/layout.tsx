import { AdminLayoutConfig } from '@/components/feature/Backend/Admin/AdminLayoutConfig';
import { DemoGuard } from '@/components/providers/DemoGuard';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoGuard>
      <AdminLayoutConfig>{children}</AdminLayoutConfig>
    </DemoGuard>
  );
}
