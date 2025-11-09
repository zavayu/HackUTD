import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeCustomizationProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  currentMode: 'light' | 'dark' | 'system';
  onModeChange: (mode: 'light' | 'dark' | 'system') => void;
}

export function ThemeCustomization({ currentTheme, onThemeChange, currentMode, onModeChange }: ThemeCustomizationProps) {
  const themes = [
    {
      id: 'theme-blue',
      name: 'Ocean Blue',
      description: 'Professional and calm',
      colors: {
        light: {
          primary: '#2563eb',
          secondary: '#dbeafe',
          accent: '#93c5fd',
        },
        dark: {
          primary: '#3b82f6',
          secondary: '#1e3a8a',
          accent: '#60a5fa',
        },
      },
    },
    {
      id: 'theme-teal',
      name: 'Teal Fresh',
      description: 'Modern and energetic',
      colors: {
        light: {
          primary: '#0d9488',
          secondary: '#ccfbf1',
          accent: '#5eead4',
        },
        dark: {
          primary: '#14b8a6',
          secondary: '#134e4a',
          accent: '#2dd4bf',
        },
      },
    },
    {
      id: 'theme-purple',
      name: 'Royal Purple',
      description: 'Creative and bold',
      colors: {
        light: {
          primary: '#7c3aed',
          secondary: '#ede9fe',
          accent: '#c4b5fd',
        },
        dark: {
          primary: '#8b5cf6',
          secondary: '#4c1d95',
          accent: '#a78bfa',
        },
      },
    },
  ];

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    onModeChange(newMode);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="mb-2">Theme Customization</h1>
        <p className="text-muted-foreground">
          Personalize your workspace with custom themes and color schemes
        </p>
      </div>

      {/* Mode Selection */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="mb-4">Appearance Mode</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((modeOption) => {
            const Icon = modeOption.icon;
            return (
              <button
                key={modeOption.id}
                onClick={() => handleModeChange(modeOption.id as 'light' | 'dark' | 'system')}
                className={`relative p-4 border-2 rounded-xl transition-all ${
                  currentMode === modeOption.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="w-6 h-6" />
                  <span className="text-sm">{modeOption.label}</span>
                </div>
                {currentMode === modeOption.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Previews */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="mb-4">Accent Color</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const isActive = currentTheme === theme.id;
            const currentMode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const colors = theme.colors[currentMode];

            return (
              <motion.button
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                className={`relative p-5 border-2 rounded-xl text-left transition-all ${
                  isActive
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
                whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Preview */}
                <div className="mb-4 h-32 rounded-lg overflow-hidden border border-border bg-background">
                  <div className="h-8 flex items-center px-3 gap-2" style={{ backgroundColor: colors.primary }}>
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="h-3 rounded" style={{ backgroundColor: colors.secondary }} />
                    <div className="h-3 w-2/3 rounded" style={{ backgroundColor: colors.accent }} />
                    <div className="h-3 w-1/2 rounded" style={{ backgroundColor: colors.secondary }} />
                  </div>
                </div>

                {/* Info */}
                <div className="mb-2">
                  <h4 className="mb-1">{theme.name}</h4>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>

                {/* Color Swatches */}
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-border"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg border border-border"
                    style={{ backgroundColor: colors.accent }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg border border-border"
                    style={{ backgroundColor: colors.secondary }}
                  />
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          Apply Theme
        </button>
      </div>
    </div>
  );
}
