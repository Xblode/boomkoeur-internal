'use client';

import { useUser } from '@/hooks';

export function DashboardHero() {
  const { user } = useUser();
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const displayName = user?.name?.split(' ')[0] || 'Bienvenue';
  const dateFormatted = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
        {greeting}, {displayName}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground capitalize">{dateFormatted}</p>
    </div>
  );
}

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Bonjour';
  if (hour >= 12 && hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}
