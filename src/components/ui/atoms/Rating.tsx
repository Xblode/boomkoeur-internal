import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  ({ className, value, max = 5, readOnly = false, onChange, ...props }, ref) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
        {Array.from({ length: max }).map((_, i) => {
          const ratingValue = i + 1;
          const isFilled = (hoverValue !== null ? hoverValue : value) >= ratingValue;
          
          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              className={cn(
                "focus:outline-none transition-transform hover:scale-110",
                readOnly && "cursor-default hover:scale-100"
              )}
              onMouseEnter={() => !readOnly && setHoverValue(ratingValue)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              onClick={() => !readOnly && onChange?.(ratingValue)}
            >
              <Star
                size={20}
                className={cn(
                  "transition-colors",
                  isFilled 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-zinc-300 dark:text-zinc-700"
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }
);
Rating.displayName = "Rating";
