import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoFilter } from '../types/Todo';
import { storageService } from '../services/StorageService';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load todos from storage on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const savedTodos = await storageService.loadTodos();
      setTodos(savedTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodos = async (newTodos: Todo[]) => {
    try {
      await storageService.saveTodos(newTodos);
      setTodos(newTodos);
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

  const addTodo = useCallback(async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newTodos = [...todos, newTodo];
    await saveTodos(newTodos);
  }, [todos]);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    const newTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, ...updates, updatedAt: new Date() }
        : todo
    );
    await saveTodos(newTodos);
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    await saveTodos(newTodos);
  }, [todos]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  }, [todos, updateTodo]);

  const clearCompleted = useCallback(async () => {
    const newTodos = todos.filter(todo => !todo.completed);
    await saveTodos(newTodos);
  }, [todos]);

  // Filter todos based on current filter
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      default:
        return true;
    }
  });

  // Statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  return {
    todos: filteredTodos,
    filter,
    isLoading,
    totalTodos,
    completedTodos,
    pendingTodos,
    setFilter,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    refreshTodos: loadTodos,
  };
};
