import { Platform } from 'react-native';
import { AppSettings } from '../types/App';
import { Todo } from '../types/Todo';

// Dynamic import for AsyncStorage to avoid bundling issues
let AsyncStorage: any = null;

if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('AsyncStorage not available, using fallback storage');
  }
}

class StorageService {
  private readonly TODOS_KEY = '@todos';
  private readonly SETTINGS_KEY = '@settings';
  private memoryStorage: Map<string, string> = new Map();

  // Universal storage methods that work on both web and mobile
  private async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        // Fallback to memory storage if localStorage is not available
        this.memoryStorage.set(key, value);
      }
    } else if (AsyncStorage) {
      await AsyncStorage.setItem(key, value);
    } else {
      // Fallback to memory storage
      this.memoryStorage.set(key, value);
    }
  }

  private async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        // Fallback to memory storage if localStorage is not available
        return this.memoryStorage.get(key) || null;
      }
    } else if (AsyncStorage) {
      return await AsyncStorage.getItem(key);
    } else {
      // Fallback to memory storage
      return this.memoryStorage.get(key) || null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Fallback to memory storage if localStorage is not available
        this.memoryStorage.delete(key);
      }
    } else if (AsyncStorage) {
      await AsyncStorage.removeItem(key);
    } else {
      // Fallback to memory storage
      this.memoryStorage.delete(key);
    }
  }

  // Todo operations
  async saveTodos(todos: Todo[]): Promise<void> {
    const todosJson = JSON.stringify(todos.map(todo => ({
      ...todo,
      dueDate: todo.dueDate?.toISOString(),
      recurrence: todo.recurrence || 'none',
      endDate: todo.endDate?.toISOString(),
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    })));
    await this.setItem(this.TODOS_KEY, todosJson);
  }

  async loadTodos(): Promise<Todo[]> {
    try {
      const todosJson = await this.getItem(this.TODOS_KEY);
      if (!todosJson) return [];
      
      const todosData = JSON.parse(todosJson);
      return todosData.map((todo: any) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        recurrence: todo.recurrence || 'none',
        endDate: todo.endDate ? new Date(todo.endDate) : undefined,
        hasReminder: todo.hasReminder || false,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load todos:', error);
      return [];
    }
  }

  async clearTodos(): Promise<void> {
    await this.removeItem(this.TODOS_KEY);
  }

  // Settings operations
  async saveSettings(settings: AppSettings): Promise<void> {
    const settingsJson = JSON.stringify(settings);
    await this.setItem(this.SETTINGS_KEY, settingsJson);
  }

  async loadSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await this.getItem(this.SETTINGS_KEY);
      if (!settingsJson) {
        return { colorScheme: 'auto' };
      }
      return JSON.parse(settingsJson);
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { colorScheme: 'auto' };
    }
  }
}

export const storageService = new StorageService();
