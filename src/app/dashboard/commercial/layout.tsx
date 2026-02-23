import { CommercialLayoutConfig } from '@/components/feature/Backend/Commercial/CommercialLayoutConfig';

export default function CommercialLayoutRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommercialLayoutConfig>{children}</CommercialLayoutConfig>;
}
