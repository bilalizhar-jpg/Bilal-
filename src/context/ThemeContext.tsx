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
];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colorPalette: string;
  setColorPalette: (id: string) => void;
  palettes: ColorPalette[];
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

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', colorPalette);
    localStorage.setItem('colorPalette', colorPalette);
  }, [colorPalette]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setColorPalette = (id: string) => {
    setColorPaletteState(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorPalette, setColorPalette, palettes }}>
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
