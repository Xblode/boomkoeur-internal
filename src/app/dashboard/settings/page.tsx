import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paramètres',
  description: 'Préférences utilisateur et configuration',
};

export default function SettingsPage() {
  redirect('/dashboard/settings/apparence');
}
