export const DEFAULT_CATEGORIES = [
  'Personal',
  'Work / Office',
  'Shopping / Groceries',
  'Health & Fitness',
  'Finance / Bills',
  'Family / Home',
  'Study / Learning',
  'Travel / Plans',
  'Important / Priority',
] as const;

export const DEFAULT_CATEGORY = 'Personal';

export type CategoryType = typeof DEFAULT_CATEGORIES[number] | string;
