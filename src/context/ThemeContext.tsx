import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
}

export const palettes: ColorPalette[] = [
  { id: 'indigo', name: 'Indigo', primary: '#4f46e5' },
  { id: 'emerald', name: 'Emerald', primary: '#059669' },
  { id: 'rose', name: 'Rose', primary: '#e11d48' },
  { id: 'amber', name: 'Amber', primary: '#d97706' },
  { id: 'sky', name: 'Sky', primary: '#0284c7' },
  { id: 'violet', name: 'Violet', primary: '#7c3aed' },
  { id: 'fuchsia', name: 'Fuchsia', primary: '#c026d3' },
  { id: 'teal', name: 'Teal', primary: '#0d9488' },
  { id: 'cyan', name: 'Cyan', primary: '#0891b2' },
  { id: 'orange', name: 'Orange', primary: '#ea580c' },
  { id: 'pink', name: 'Pink', primary: '#db2777' },
  { id: 'lime', name: 'Lime', primary: '#65a30d' },
  { id: 'slate', name: 'Slate', primary: '#475569' },
];

export type PortalDesign = 'cosmic' | 'aurora' | 'cyber';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colorPalette: string;
  setColorPalette: (id: string) => void;
  palettes: ColorPalette[];
  portalDesign: PortalDesign;
  setPortalDesign: (design: PortalDesign) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  const [colorPalette, setColorPaletteState] = useState<string>(() => {
    const saved = localStorage.getItem('colorPalette');
    return saved || 'indigo';
  });

  const [portalDesign, setPortalDesignState] = useState<PortalDesign>(() => {
    const saved = localStorage.getItem('portalDesign');
    return (saved as PortalDesign) || 'cosmic';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', colorPalette);
    localStorage.setItem('colorPalette', colorPalette);
  }, [colorPalette]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-design', portalDesign);
    localStorage.setItem('portalDesign', portalDesign);
  }, [portalDesign]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      const root = window.document.documentElement;
      if (next === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', next);
      return next;
    });
  };

  const setColorPalette = (id: string) => {
    setColorPaletteState(id);
  };

  const setPortalDesign = (design: PortalDesign) => {
    setPortalDesignState(design);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorPalette, setColorPalette, palettes, portalDesign, setPortalDesign }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
