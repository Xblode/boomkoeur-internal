'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarMode } from '@/hooks';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface SidebarProps {
  items?: SidebarItem[];
  className?: string;
  mode?: SidebarMode;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  items = [], 
  className = '', 
  mode = 'compact' 
}) => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // En mode compact, la sidebar peut s'étendre au hover
  const isExpanded = mode === 'expanded' || (mode === 'compact' && isHovered);

  return (
    <aside 
      onMouseEnter={() => mode === 'compact' && setIsHovered(true)}
      onMouseLeave={() => mode === 'compact' && setIsHovered(false)}
      className={cn(
        "fixed left-0 top-[60px] bottom-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#171717] flex flex-col py-4 transition-all duration-300 ease-in-out overflow-hidden",
        isExpanded ? "w-[200px]" : "w-[60px]",
        mode === 'compact' && isHovered ? "z-50 shadow-lg" : "z-40",
        className
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 w-full flex flex-col gap-2 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg transition-all duration-300 ease-in-out h-10 px-3 gap-3 relative",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              )}
            >
              {item.icon && <item.icon size={20} className="shrink-0" />}
              
              {/* Label toujours présent, apparition en fondu */}
              <span className={cn(
                "text-sm font-medium whitespace-nowrap transition-opacity duration-300 ease-in-out",
                isExpanded ? "opacity-100" : "opacity-0"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
