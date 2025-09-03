/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#007AFF';
const tintColorDark = '#007AFF';

export const Colors = {
  light: {
    primary: '#007AFF',
    primaryLight: '#E3F2FD',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#F5F7FA',
    text: '#1C1C1E',
    textSecondary: '#6C6C70',
    border: '#E5E5EA',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    shadow: '#000000',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    primary: '#007AFF',
    primaryLight: '#1E3A8A',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#1F1F23',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF453A',
    shadow: '#FFFFFF',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export type ThemeColors = typeof Colors.light;
