'use client';

import { PageToolbar } from '@/components/ui/organisms/PageToolbar';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AdminToolbarProps {
  activeSection: 'users';
  onSectionChange: (section: 'users') => void;
}

export default function AdminToolbar({ activeSection, onSectionChange }: AdminToolbarProps) {
  const sections = [
    { id: 'users' as const, label: 'UTILISATEURS', icon: Users },
  ];

  return (
    <PageToolbar className="justify-between bg-[#171717] h-10 min-h-0 p-0 px-4 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-4 flex-1 h-full">
        <div className="flex items-center gap-6 px-2 h-full">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "relative flex items-center gap-2 h-full text-xs font-medium transition-colors uppercase",
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                )}
                title={section.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{section.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </PageToolbar>
  );
}
