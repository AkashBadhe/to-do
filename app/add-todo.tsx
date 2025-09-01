import { TodoForm } from '@/components/TodoForm';
import { useTheme } from '@/hooks/ThemeContext';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/types/Todo';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function AddTodoScreen() {
  const { editTodo, defaultCategory } = useLocalSearchParams<{ editTodo?: string; defaultCategory?: string }>();
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
      defaultCategory={defaultCategory}
    />
  );
}
