import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { storageService } from '../services/StorageService';
import { AppSettings, ColorScheme } from '../types/App';

type ThemeContextType = {
  isDark: boolean;
  colorScheme: ColorScheme;
  isLoading: boolean;
  updateColorScheme: (scheme: ColorScheme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useSystemColorScheme();
  const [settings, setSettings] = useState<AppSettings>({ colorScheme: 'auto' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const saved = await storageService.loadSettings();
        setSettings(saved);
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const isDark = useMemo(() => {
    return (
      settings.colorScheme === 'dark' ||
      (settings.colorScheme === 'auto' && system === 'dark')
    );
  }, [settings.colorScheme, system]);

  const updateColorScheme = async (colorScheme: ColorScheme) => {
    const newSettings = { ...settings, colorScheme };
    setSettings(newSettings);
    try {
      await storageService.saveSettings(newSettings);
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, colorScheme: settings.colorScheme, isLoading, updateColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within AppThemeProvider');
  return ctx;
};
