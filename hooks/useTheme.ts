import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ColorScheme, AppSettings } from '../types/App';
import { storageService } from '../services/StorageService';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>({ colorScheme: 'auto' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const savedSettings = await storageService.loadSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateColorScheme = useCallback(async (colorScheme: ColorScheme) => {
    const newSettings = { ...settings, colorScheme };
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
  }, [settings]);

  // Determine the actual color scheme to use
  const isDark = settings.colorScheme === 'dark' || 
                 (settings.colorScheme === 'auto' && systemColorScheme === 'dark');

  return {
    settings,
    isDark,
    colorScheme: settings.colorScheme,
    isLoading,
    updateColorScheme,
  };
};
