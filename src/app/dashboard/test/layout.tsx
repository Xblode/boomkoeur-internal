import { TestLayoutConfig } from '@/components/feature/Backend/Test/TestLayoutConfig';

export default function TestLayoutRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TestLayoutConfig>{children}</TestLayoutConfig>;
}
