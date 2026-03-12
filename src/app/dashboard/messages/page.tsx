import { MessagesLayout } from '@/components/feature/Backend/Messages';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Messagerie interne de l\'organisation',
};

export default function MessagesPage() {
  return <MessagesLayout />;
}
