import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { TodoForm } from '@/components/TodoForm';
import { useTodos } from '@/hooks/useTodos';
import { useTheme } from '@/hooks/useTheme';
import { Todo } from '@/types/Todo';

export default function AddTodoScreen() {
  const { editTodo } = useLocalSearchParams<{ editTodo?: string }>();
  const { addTodo, updateTodo } = useTodos();
  const { isDark } = useTheme();

  // Parse the todo data if we're editing
  const todoToEdit: Todo | undefined = editTodo 
    ? JSON.parse(editTodo as string) 
    : undefined;

  const handleSave = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (todoToEdit) {
        // Update existing todo
        await updateTodo(todoToEdit.id, todoData);
      } else {
        // Add new todo
        await addTodo(todoData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TodoForm
      todo={todoToEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isDark={isDark}
    />
  );
}
