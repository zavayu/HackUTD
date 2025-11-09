import { Sun, Moon, Palette } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ThemeToggleProps {
  theme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const handleModeToggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const accentThemes = [
    { id: 'theme-blue', label: 'Blue', color: 'bg-blue-500' },
    { id: 'theme-teal', label: 'Teal', color: 'bg-teal-500' },
    { id: 'theme-purple', label: 'Purple', color: 'bg-purple-500' },
  ];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Palette className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Accent Color</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accentThemes.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className={`w-4 h-4 rounded-full ${t.color}`} />
              <span>{t.label}</span>
              {theme === t.id && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={handleModeToggle}
        className="p-2 hover:bg-accent rounded-lg transition-colors"
        aria-label="Toggle theme"
      >
        {mode === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
