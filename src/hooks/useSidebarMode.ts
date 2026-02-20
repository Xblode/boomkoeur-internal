'use client';

import { useState, useEffect } from 'react';

export type SidebarMode = 'compact' | 'expanded';

export const useSidebarMode = () => {
  const [mode, setMode] = useState<SidebarMode>('compact');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-mode');
    if (saved === 'expanded' || saved === 'compact') {
      setMode(saved);
    }
    setMounted(true);
  }, []);

  const setSidebarMode = (newMode: SidebarMode) => {
    setMode(newMode);
    localStorage.setItem('sidebar-mode', newMode);
  };

  const toggleSidebarMode = () => {
    const newMode = mode === 'compact' ? 'expanded' : 'compact';
    setSidebarMode(newMode);
  };

  return { 
    sidebarMode: mode, 
    setSidebarMode, 
    toggleSidebarMode,
    mounted 
  };
};
