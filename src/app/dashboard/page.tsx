import { DashboardStats } from '@/components/feature/Backend/Dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Tableau de bord administrateur',
};

export default function DashboardPage() {
  return (
    <>
      <DashboardStats />
    </>
  );
}
