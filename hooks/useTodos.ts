import { useCallback, useEffect, useState } from 'react';
import { storageService } from '../services/StorageService';
import { Todo, TodoFilter, TodoPriority, TodoRecurrence } from '../types/Todo';

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
      // Ensure all todos have a priority field for backward compatibility
      const todosWithPriority = savedTodos.map(todo => ({
        ...todo,
        priority: todo.priority || 'medium' as TodoPriority,
      }));
      setTodos(todosWithPriority);
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
    // Get current todos state instead of using stale closure
    setTodos(currentTodos => {
      const newTodos = [...currentTodos, newTodo];
      // Save to storage asynchronously
      storageService.saveTodos(newTodos).catch(error => {
        console.error('Failed to save todos:', error);
      });
      return newTodos;
    });
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    setTodos(currentTodos => {
      const newTodos = currentTodos.map(todo =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      );
      // Save to storage asynchronously
      storageService.saveTodos(newTodos).catch(error => {
        console.error('Failed to save todos:', error);
      });
      return newTodos;
    });
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    setTodos(currentTodos => {
      const newTodos = currentTodos.filter(todo => todo.id !== id);
      // Save to storage asynchronously
      storageService.saveTodos(newTodos).catch(error => {
        console.error('Failed to save todos:', error);
      });
      return newTodos;
    });
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    setTodos(currentTodos => {
      const newTodos: Todo[] = [];
      for (const todo of currentTodos) {
        if (todo.id !== id) {
          newTodos.push(todo);
          continue;
        }

        const toggled = { ...todo, completed: !todo.completed, updatedAt: new Date() };
        newTodos.push(toggled);

        // If marking completed and this is a recurring task, create the next occurrence
        if (!todo.completed && todo.recurrence && todo.recurrence !== 'none') {
          const nextDue = (() => {
            if (!todo.dueDate) return undefined;
            const d = new Date(todo.dueDate);
            switch (todo.recurrence as TodoRecurrence) {
              case 'daily':
                d.setDate(d.getDate() + 1);
                return d;
              case 'weekly':
                d.setDate(d.getDate() + 7);
                return d;
              case 'monthly':
                d.setMonth(d.getMonth() + 1);
                return d;
              default:
                return undefined;
            }
          })();

          if (nextDue) {
            const nextTodo: Todo = {
              ...todo,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              completed: false,
              dueDate: nextDue,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            newTodos.push(nextTodo);
          }
        }
      }
      // Save to storage asynchronously
      storageService.saveTodos(newTodos).catch(error => {
        console.error('Failed to save todos:', error);
      });
      return newTodos;
    });
  }, []);

  const clearCompleted = useCallback(async () => {
    setTodos(currentTodos => {
      const newTodos = currentTodos.filter(todo => !todo.completed);
      // Save to storage asynchronously
      storageService.saveTodos(newTodos).catch(error => {
        console.error('Failed to save todos:', error);
      });
      return newTodos;
    });
  }, []);

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

  // Sort todos by: due date (soonest first), then priority (highest first), then creation time (newest first)
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Helper function to safely get date timestamp (normalized to date only)
    const getDateTime = (date: Date | undefined): number => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return Infinity; // Tasks without due dates go to the end
      }
      // Normalize to date only (remove time component)
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return normalizedDate.getTime();
    };

    // First priority: Due date (soonest first)
    const aDueDate = getDateTime(a.dueDate);
    const bDueDate = getDateTime(b.dueDate);

    if (aDueDate !== bDueDate) {
      return aDueDate - bDueDate; // Soonest first
    }

    // Second priority: Priority (highest first)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];

    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }

    // Third priority: Creation time (newest first)
    const aCreatedTime = a.createdAt && a.createdAt instanceof Date && !isNaN(a.createdAt.getTime())
      ? a.createdAt.getTime()
      : 0;
    const bCreatedTime = b.createdAt && b.createdAt instanceof Date && !isNaN(b.createdAt.getTime())
      ? b.createdAt.getTime()
      : 0;

    return bCreatedTime - aCreatedTime; // Newest first
  });

  // Statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  const refreshTodos = useCallback(async () => {
    await loadTodos();
  }, []);

  return {
    todos: sortedTodos,
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
    refreshTodos,
  };
};
