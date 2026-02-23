'use client';

import { Button } from '@/components/ui/atoms';
import type { LucideIcon } from 'lucide-react';

export interface ActionButton {
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  className?: string;
}

export interface ActionButtonsProps {
  buttons: ActionButton[];
  className?: string;
}

export function ActionButtons({ buttons, className = '' }: ActionButtonsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {buttons.map((button, index) => {
        const Icon = button.icon;
        return (
          <Button
            key={index}
            variant={button.variant ?? 'secondary'}
            size="sm"
            onClick={button.onClick}
            className={button.className}
          >
            <Icon className="w-4 h-4 mr-2" />
            {button.label}
          </Button>
        );
      })}
    </div>
  );
}
