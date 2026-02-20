"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  label: string;
  isCompleted: boolean;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepChange?: (index: number) => void;
  className?: string;
}

export function WorkflowStepper({
  steps,
  currentStep,
  onStepChange,
  className,
}: WorkflowStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = step.isCompleted;
          const isLast = index === steps.length - 1;
          const isClickable = isCompleted || index <= currentStep;

          return (
            <React.Fragment key={index}>
              {/* Nœud */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => isClickable && onStepChange?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all focus:outline-none',
                    isCurrent && 'border-zinc-900 bg-transparent text-zinc-900 dark:border-white dark:bg-transparent dark:text-white',
                    isCompleted && !isCurrent && 'cursor-pointer border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900',
                    !isCompleted && !isCurrent && 'cursor-default border-zinc-200 bg-transparent text-zinc-400 dark:border-zinc-700 dark:text-zinc-600',
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                <span
                  className={cn(
                    'max-w-[90px] text-center text-[11px] leading-tight break-words whitespace-pre-line',
                    isCurrent && 'font-semibold text-zinc-900 dark:text-white',
                    isCompleted && !isCurrent && 'text-zinc-600 dark:text-zinc-400',
                    !isCompleted && !isCurrent && 'text-zinc-400 dark:text-zinc-600',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Ligne de connexion */}
              {!isLast && (
                <div
                  className={cn(
                    'mt-4 mx-2 h-[2px] flex-1 rounded-full transition-colors',
                    isCompleted ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700',
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
