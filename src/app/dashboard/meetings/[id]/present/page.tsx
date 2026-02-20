'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { meetingService } from '@/lib/services/MeetingService';
import { Meeting } from '@/types/meeting';
import { Skeleton } from '@/components/ui/atoms';
import PresentationMode from '@/components/feature/Backend/Meetings/PresentationMode';

export default function MeetingPresentPage() {
  const params = useParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMeeting();
  }, [params.id]);

  const loadMeeting = async () => {
    if (typeof params.id !== 'string') return;
    
    setIsLoading(true);
    try {
      const data = await meetingService.getMeetingById(params.id);
      setMeeting(data);
    } catch (error) {
      console.error('Error loading meeting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Réunion non trouvée</p>
      </div>
    );
  }

  return <PresentationMode meeting={meeting} />;
}
