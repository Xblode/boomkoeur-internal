import { MessagesLayoutConfig } from '@/components/feature/Backend/Messages/MessagesLayoutConfig';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <MessagesLayoutConfig>{children}</MessagesLayoutConfig>;
}
