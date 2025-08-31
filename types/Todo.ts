export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  priority: TodoPriority;
  recurrence?: TodoRecurrence;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoFilter = 'all' | 'completed' | 'pending';

export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  isLoading: boolean;
}
