import React from 'react';
import { MeetingDetailLayout } from '@/components/feature/Backend/Meetings/MeetingDetailLayout';

interface MeetingDetailLayoutRouteProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Réunion | Boomkoeur',
  description: 'Détails de la réunion',
};

export default async function MeetingDetailLayoutRoute({ children, params }: MeetingDetailLayoutRouteProps) {
  const { id } = await params;
  return <MeetingDetailLayout meetingId={id}>{children}</MeetingDetailLayout>;
}
