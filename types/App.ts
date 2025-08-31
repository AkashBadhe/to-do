export type ColorScheme = 'light' | 'dark' | 'auto';

export interface AppSettings {
  colorScheme: ColorScheme;
}

export interface AppState {
  settings: AppSettings;
}
