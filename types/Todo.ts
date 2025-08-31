export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  priority: TodoPriority;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoFilter = 'all' | 'completed' | 'pending';

export type TodoPriority = 'low' | 'medium' | 'high';

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  isLoading: boolean;
}
