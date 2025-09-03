export const DEFAULT_CATEGORIES = [
  'Personal',
  'Work',
  'Shopping',
  'Grocery',
  'Health',
  'Finance',
  'Family',
  'Learning',
  'Travel',
  'Priority',
] as const;

export const DEFAULT_CATEGORY = 'Personal';

export type CategoryType = typeof DEFAULT_CATEGORIES[number] | string;
