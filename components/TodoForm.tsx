import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types/Todo';
import { Colors, ThemeColors } from '../constants/Colors';

interface TodoFormProps {
  todo?: Todo;
  onSave: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isDark: boolean;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  todo,
  onSave,
  onCancel,
  isDark,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(todo?.dueDate);
  const [titleError, setTitleError] = useState('');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      completed: todo?.completed || false,
    });
  };

  const addDueDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow);
  };

  const removeDueDate = () => {
    setDueDate(undefined);
  };

  useEffect(() => {
    if (title.trim()) {
      setTitleError('');
    }
  }, [title]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {todo ? 'Edit Task' : 'Add New Task'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, titleError && styles.inputError]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.textSecondary}
              maxLength={100}
            />
            {titleError && <Text style={styles.errorText}>{titleError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            {dueDate ? (
              <View style={styles.dueDateContainer}>
                <View style={styles.dueDateButton}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={styles.dueDateText}>
                    {formatDate(dueDate)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeDateButton}
                  onPress={removeDueDate}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addDateButton}
                onPress={addDueDate}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addDateText}>Add due date</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {todo ? 'Update' : 'Add'} Task
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    form: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
    },
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dueDateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    dueDateText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    removeDateButton: {
      padding: 8,
      marginLeft: 8,
    },
    addDateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      borderRadius: 12,
      backgroundColor: colors.primaryLight,
    },
    addDateText: {
      fontSize: 16,
      color: colors.primary,
      marginLeft: 12,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      padding: 20,
      paddingTop: 0,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    saveButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background,
    },
  });
