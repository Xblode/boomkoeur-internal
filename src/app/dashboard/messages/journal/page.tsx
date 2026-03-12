import { MessagesLayout } from '@/components/feature/Backend/Messages';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal | Messages | Boomkoeur',
  description: 'Résumés quotidiens des messages de l\'équipe',
};

export default function JournalPage() {
  return <MessagesLayout />;
}
