'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

const THEME_STORAGE_KEY = 'theme-dashboard';

/** Couleurs pour theme-color meta (PWA) — clair/sombre */
const THEME_COLORS = { light: '#ffffff', dark: '#171717' } as const;

function ThemeColorSync() {
  const { resolvedTheme } = useNextTheme();
  React.useEffect(() => {
    if (typeof document === 'undefined' || !resolvedTheme) return;
    const color = THEME_COLORS[resolvedTheme as keyof typeof THEME_COLORS] ?? THEME_COLORS.light;
    document.querySelectorAll('meta[name="theme-color"]').forEach((el) => el.remove());
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, [resolvedTheme]);
  return null;
}
const PALETTE_STORAGE_KEY = 'theme-palette';

export const PALETTE_OPTIONS = ['neutral', 'brand'] as const;
export type PaletteOption = (typeof PALETTE_OPTIONS)[number];

export const MODE_OPTIONS = ['light', 'dark', 'system'] as const;
export type ModeOption = (typeof MODE_OPTIONS)[number];

const PaletteStateContext = React.createContext<{
  palette: PaletteOption;
  setPalette: (value: PaletteOption) => void;
} | null>(null);

function migrateStoredPalette(stored: string | null): PaletteOption | null {
  if (!stored) return null;
  if (stored === 'custom') return 'brand';
  if (PALETTE_OPTIONS.includes(stored as PaletteOption)) return stored as PaletteOption;
  return null;
}

function ThemeStateSync({
  storageKey,
  defaultPalette,
}: {
  storageKey: string;
  defaultPalette?: PaletteOption;
}) {
  const { theme: nextTheme, resolvedTheme } = useNextTheme();
  const { setPalette } = React.useContext(PaletteStateContext)!;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sync data-theme on document (brand = custom theme)
  React.useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    const raw = localStorage.getItem(PALETTE_STORAGE_KEY);
    const palette = migrateStoredPalette(raw) ?? defaultPalette ?? 'neutral';
    if (palette === 'brand') {
      document.documentElement.setAttribute('data-theme', 'custom');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [mounted, storageKey, nextTheme, resolvedTheme, defaultPalette]);

  // Sync palette state from localStorage on mount (and when storage changes from another tab)
  // Migration: 'custom' -> 'brand' (migrateStoredPalette convertit à la lecture)
  React.useEffect(() => {
    if (!mounted) return;
    const readPalette = () => {
      const raw = localStorage.getItem(PALETTE_STORAGE_KEY);
      const palette = migrateStoredPalette(raw) ?? defaultPalette ?? 'neutral';
      if (raw === 'custom') localStorage.setItem(PALETTE_STORAGE_KEY, 'brand');
      setPalette(palette);
    };
    readPalette();
    window.addEventListener('storage', readPalette);
    return () => window.removeEventListener('storage', readPalette);
  }, [mounted, defaultPalette, setPalette]);

  return null;
}

export function ThemeProvider({
  children,
  storageKey = THEME_STORAGE_KEY,
  defaultPalette,
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & {
  storageKey?: string;
  defaultPalette?: PaletteOption;
}) {
  const [palette, setPaletteState] = React.useState<PaletteOption>(defaultPalette ?? 'neutral');

  const setPalette = React.useCallback((value: PaletteOption) => {
    setPaletteState(value);
    localStorage.setItem(PALETTE_STORAGE_KEY, value);
    if (value === 'brand') {
      document.documentElement.setAttribute('data-theme', 'custom');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  return (
    <PaletteStateContext.Provider value={{ palette, setPalette }}>
      <NextThemesProvider
        {...props}
        storageKey={storageKey}
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={['light', 'dark', 'system']}
      >
        <ThemeStateSync storageKey={storageKey} defaultPalette={defaultPalette} />
        <ThemeColorSync />
        {children}
      </NextThemesProvider>
    </PaletteStateContext.Provider>
  );
}

export function useTheme() {
  const nextTheme = useNextTheme();
  const paletteContext = React.useContext(PaletteStateContext);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const palette = React.useMemo((): PaletteOption => {
    if (!mounted || typeof window === 'undefined') {
      return paletteContext?.palette ?? 'neutral';
    }
    const raw = localStorage.getItem(PALETTE_STORAGE_KEY);
    return migrateStoredPalette(raw) ?? paletteContext?.palette ?? 'neutral';
  }, [mounted, paletteContext?.palette]);

  const mode = React.useMemo((): ModeOption => {
    return (nextTheme.theme ?? 'system') as ModeOption;
  }, [nextTheme.theme]);

  const setPalette = React.useCallback(
    (value: PaletteOption) => {
      localStorage.setItem(PALETTE_STORAGE_KEY, value);
      if (value === 'brand') {
        document.documentElement.setAttribute('data-theme', 'custom');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      paletteContext?.setPalette(value);
    },
    [paletteContext]
  );

  const setMode = React.useCallback(
    (value: ModeOption) => {
      nextTheme.setTheme(value);
    },
    [nextTheme]
  );

  return {
    ...nextTheme,
    palette,
    mode,
    setPalette,
    setMode,
    // Rétrocompatibilité : theme = mode pour les usages legacy
    theme: mode,
    setTheme: setMode,
  };
}

export { PALETTE_STORAGE_KEY };
