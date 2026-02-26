import { DocsLayoutConfig } from '@/components/feature/Backend/Docs/DocsLayoutConfig';

export default function DocsLayoutRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayoutConfig>{children}</DocsLayoutConfig>;
}
