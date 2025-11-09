import { useState, useEffect } from 'react';
import { ThemeMode } from '../types';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'theme-blue';
  });
  
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'system';
  });

  useEffect(() => {
    document.documentElement.classList.remove('theme-blue', 'theme-teal', 'theme-purple');
    document.documentElement.classList.add(theme);

    const applyThemeMode = (mode: ThemeMode) => {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (mode === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyThemeMode(themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'system') {
        applyThemeMode('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, themeMode]);

  const handleThemeChange = (newTheme: string) => {
    document.documentElement.classList.remove('theme-blue', 'theme-teal', 'theme-purple');
    document.documentElement.classList.add(newTheme);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeModeChange = (newMode: ThemeMode) => {
    setThemeMode(newMode);
    localStorage.setItem('theme-mode', newMode);

    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return {
    theme,
    themeMode,
    handleThemeChange,
    handleThemeModeChange,
  };
}
