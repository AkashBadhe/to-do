import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { storageService } from '../services/StorageService';
import { AppSettings, ColorScheme } from '../types/App';

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
    try {
      const newSettings = { ...settings, colorScheme };
      // Update state first for immediate UI feedback
      setSettings(newSettings);
      // Then save to storage
      await storageService.saveSettings(newSettings);
    } catch (error) {
      console.error('Failed to update color scheme:', error);
      // Revert the state change if storage fails
      setSettings(settings);
    }
  }, [settings.colorScheme]); // Use only the colorScheme property to avoid unnecessary re-creations

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
