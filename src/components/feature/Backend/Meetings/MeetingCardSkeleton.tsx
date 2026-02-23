'use client';

import { Card, CardContent, CardFooter, CardDateBadge } from '@/components/ui/molecules';
import { Skeleton } from '@/components/ui/atoms';

export default function MeetingCardSkeleton() {
  return (
    <Card variant="list" className="flex flex-col h-full overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Title + Status + Date block */}
        <div className="p-4 flex gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 flex-1 rounded !bg-zinc-700" />
              <Skeleton className="h-5 w-16 rounded-full shrink-0 !bg-zinc-700" />
            </div>
            <Skeleton className="h-4 w-24 rounded !bg-zinc-700" />
          </div>
          <CardDateBadge month="" day="" skeleton />
        </div>

        {/* Meta */}
        <div className="px-4 pb-4 space-y-2">
          <Skeleton className="h-4 w-28 rounded !bg-zinc-700" />
          <Skeleton className="h-4 w-40 rounded !bg-zinc-700" />
        </div>

        {/* Footer */}
        <CardFooter variant="list" className="mt-auto px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded !bg-zinc-700" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md !bg-zinc-700" />
            <Skeleton className="h-8 w-8 rounded-md !bg-zinc-700" />
            <Skeleton className="h-8 w-8 rounded-md !bg-zinc-700" />
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
