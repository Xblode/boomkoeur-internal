'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

const THEME_STORAGE_KEY = 'theme-dashboard';
const PALETTE_STORAGE_KEY = 'theme-palette';
const THEME_OPTIONS = ['light', 'dark', 'system', 'custom'] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];

function CustomThemeEffect({ storageKey }: { storageKey: string }) {
  const { theme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    const palette = localStorage.getItem(PALETTE_STORAGE_KEY) as ThemeOption | null;
    const effectivePalette = palette && THEME_OPTIONS.includes(palette) ? palette : null;
    if (effectivePalette === 'custom') {
      document.documentElement.setAttribute('data-theme', 'custom');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [mounted, storageKey, theme, resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  storageKey = THEME_STORAGE_KEY,
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & { storageKey?: string }) {
  return (
    <NextThemesProvider
      {...props}
      storageKey={storageKey}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={['light', 'dark', 'system']}
    >
      <CustomThemeEffect storageKey={storageKey} />
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const nextTheme = useNextTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const theme = React.useMemo(() => {
    if (!mounted || typeof window === 'undefined') return nextTheme.theme ?? 'system';
    const palette = localStorage.getItem(PALETTE_STORAGE_KEY) as ThemeOption | null;
    if (palette === 'custom') return 'custom';
    return nextTheme.theme ?? 'system';
  }, [mounted, nextTheme.theme]);

  const setTheme = React.useCallback(
    (value: ThemeOption) => {
      if (value === 'custom') {
        localStorage.setItem(PALETTE_STORAGE_KEY, 'custom');
        nextTheme.setTheme('system');
      } else {
        localStorage.removeItem(PALETTE_STORAGE_KEY);
        nextTheme.setTheme(value);
      }
    },
    [nextTheme]
  );

  return { ...nextTheme, theme, setTheme };
}

export { PALETTE_STORAGE_KEY, THEME_OPTIONS };
