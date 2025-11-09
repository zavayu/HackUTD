import { ThemeCustomization } from '../components/ThemeCustomization';
import { ThemeMode } from '../types';

interface SettingsViewProps {
  currentTheme: string;
  currentMode: ThemeMode;
  onThemeChange: (theme: string) => void;
  onModeChange: (mode: ThemeMode) => void;
}

export function SettingsView({
  currentTheme,
  currentMode,
  onThemeChange,
  onModeChange,
}: SettingsViewProps) {
  return (
    <div className="p-8">
      <ThemeCustomization
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        currentMode={currentMode}
        onModeChange={onModeChange}
      />
    </div>
  );
}
