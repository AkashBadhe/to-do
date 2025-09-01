export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  priority: TodoPriority;
  recurrence?: TodoRecurrence;
  customInterval?: number; // days for custom recurrence
  endDate?: Date; // when recurrence ends
  hasReminder?: boolean;
  reminderTime?: string; // e.g., "09:00"
  category?: string; // new category field
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoFilter = 'all' | 'completed' | 'pending' | `category:${string}`;

export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  isLoading: boolean;
}
