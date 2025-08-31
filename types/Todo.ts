export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoFilter = 'all' | 'completed' | 'pending';

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  isLoading: boolean;
}
