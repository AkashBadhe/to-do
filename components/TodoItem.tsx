import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, ThemeColors } from '../constants/Colors';
import { Todo } from '../types/Todo';

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('work') || lowerCategory.includes('office')) return 'briefcase';
  if (lowerCategory.includes('personal')) return 'person';
  if (lowerCategory.includes('shopping') || lowerCategory.includes('groceries')) return 'basket';
  if (lowerCategory.includes('health') || lowerCategory.includes('fitness')) return 'fitness';
  if (lowerCategory.includes('finance') || lowerCategory.includes('bills')) return 'card';
  if (lowerCategory.includes('family') || lowerCategory.includes('home')) return 'home';
  if (lowerCategory.includes('study') || lowerCategory.includes('learning')) return 'school';
  if (lowerCategory.includes('travel') || lowerCategory.includes('plans')) return 'airplane';
  if (lowerCategory.includes('important') || lowerCategory.includes('priority')) return 'star';
  return 'folder';
};

const getPriorityColor = (priority: string, colors: ThemeColors): string => {
  switch (priority) {
    case 'low':
      return colors.success;
    case 'medium':
      return colors.warning;
    case 'high':
      return colors.error;
    default:
      return colors.textSecondary;
  }
};

const getPriorityIcon = (priority: string): keyof typeof Ionicons.glyphMap => {
  switch (priority) {
    case 'low':
      return 'flag-outline';
    case 'medium':
  return 'flag';
    case 'high':
  return 'flag';
    default:
      return 'help-outline';
  }
};

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  isDark: boolean;
  showCategory?: boolean; // Only show category when viewing all tasks
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
  isDark,
  showCategory = true, // Default to true for backward compatibility
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this task?')) {
        onDelete(todo.id);
      }
    } else {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
        ]
      );
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} day(s)`;
    }
  };

  const isOverdue = todo.dueDate && todo.dueDate < new Date() && !todo.completed;

  return (
    <View style={[styles.container, todo.completed && styles.completedContainer]}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onToggle(todo.id)}
      >
        <View style={[styles.checkbox, todo.completed && styles.checkboxChecked]}>
          {todo.completed && (
            <Ionicons name="checkmark" size={16} color={colors.background} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, todo.completed && styles.completedText]}>
          {todo.title}
        </Text>
        {todo.description && (
          <Text style={[styles.description, todo.completed && styles.completedText]}>
            {todo.description}
          </Text>
        )}
        {todo.category && showCategory && (
          <View style={styles.categoryBadge}>
            <Ionicons name={getCategoryIcon(todo.category)} size={12} color={colors.primary} />
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {todo.category}
            </Text>
          </View>
        )}
        {todo.dueDate && (
          <Text style={[
            styles.dueDate,
            isOverdue && styles.overdue,
            todo.completed && styles.completedText
          ]}>
            {formatDueDate(todo.dueDate)} • {formatDate(todo.dueDate)}
          </Text>
        )}
        {todo.endDate && (
          <Text style={[styles.dueDate, todo.completed && styles.completedText]}>
            Ends: {formatDate(todo.endDate)}
          </Text>
        )}
        {todo.hasReminder && (
          <Text style={[styles.dueDate, todo.completed && styles.completedText]}>
            Reminder: {todo.reminderTime}
          </Text>
        )}
        <View style={styles.priorityContainer}>
          <Ionicons
            name={getPriorityIcon(todo.priority)}
            size={16}
            color={getPriorityColor(todo.priority, colors)}
          />
          {todo.recurrence && todo.recurrence !== 'none' && (
            <View style={styles.recurrenceBadge}>
              <Ionicons name="repeat" size={14} color={colors.textSecondary} />
              <Text style={[styles.recurrenceText, { color: colors.textSecondary }]}>
                {todo.recurrence === 'daily' ? 'Daily' :
                 todo.recurrence === 'weekly' ? 'Weekly' :
                 todo.recurrence === 'monthly' ? 'Monthly' :
                 `Every ${todo.customInterval} days`}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(todo)}
        >
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    completedContainer: {
      opacity: 0.7,
    },
    checkboxContainer: {
      marginRight: 12,
      paddingTop: 2,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    dueDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    overdue: {
      color: colors.error,
      fontWeight: '600',
    },
    completedText: {
      textDecorationLine: 'line-through',
      opacity: 0.6,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 8,
      marginLeft: 4,
    },
    priorityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    recurrenceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    recurrenceText: {
      fontSize: 12,
      marginLeft: 4,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    categoryText: {
      fontSize: 12,
      marginLeft: 4,
      fontWeight: '500',
    },
  });
