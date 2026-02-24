'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/molecules';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

/** URL affichable (Google Drive nécessite export=view, comme EventCard) */
function getDisplayUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  return m ? `https://drive.google.com/uc?export=view&id=${m[1]}` : url;
}

/** Format unifié pour le prochain post (même source que Calendar: events.comWorkflow.posts) */
export interface NextPostForDashboard {
  id: string;
  eventId: string;
  name: string;
  visuals: string[];
}

export interface DashboardNextPostCardProps {
  /** Prochain post planifié (depuis events.comWorkflow.posts, comme le Calendar) */
  nextPost: NextPostForDashboard | null;
}

export function DashboardNextPostCard({ nextPost }: DashboardNextPostCardProps) {
  const visuals = nextPost?.visuals ?? [];
  const campaignHref =
    nextPost && nextPost.eventId && nextPost.eventId !== 'fallback'
      ? `/dashboard/events/${nextPost.eventId}/campagne`
      : '/dashboard/events';

  if (!nextPost || visuals.length === 0) {
    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card variant="none">
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prochain post
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            <p className="text-sm text-muted-foreground">
              {nextPost ? nextPost.name : 'Aucun post planifié'}
            </p>
            <Link
              href={nextPost ? campaignHref : '/dashboard/events'}
              className="mt-2 inline-block text-xs text-primary hover:underline"
            >
              {nextPost ? 'Voir la campagne →' : 'Voir les événements →'}
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <Card variant="none">
        <CardHeader className="p-0 pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Prochain post
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          <div
            className="flex gap-2 overflow-x-auto overflow-y-hidden py-1 -mx-1 scroll-smooth snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollPaddingInline: '25%',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {visuals.map((url, index) => (
              <div
                key={`${nextPost.id}-${index}`}
                className="flex-shrink-0 w-[50%] min-w-[50%] snap-center rounded-lg overflow-hidden border border-border-custom bg-muted/30 aspect-[3/4] relative"
              >
                <Image
                  src={getDisplayUrl(url)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 200px"
                  unoptimized={url.startsWith('http')}
                />
              </div>
            ))}
          </div>
          <Link
            href={campaignHref}
            className="mt-3 inline-block text-xs text-primary hover:underline"
          >
            Voir la campagne →
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
