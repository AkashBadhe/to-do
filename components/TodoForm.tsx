import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, ThemeColors } from '../constants/Colors';
import { Todo, TodoPriority } from '../types/Todo';

const getPriorityIcon = (priority: TodoPriority): keyof typeof Ionicons.glyphMap => {
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

const getPriorityColor = (priority: TodoPriority, colors: ThemeColors): string => {
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
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    todo ? (todo.dueDate ? new Date(todo.dueDate) : undefined) : new Date()
  );
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority || 'medium');
  const [titleError, setTitleError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
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
      priority,
      completed: todo?.completed || false,
    });
  };

  const addDueDate = () => {
    const today = new Date();
    setTempDate(dueDate && dueDate instanceof Date && !isNaN(dueDate.getTime()) ? dueDate : today);
    setShowDatePicker(true);
  };

  const confirmDateSelection = () => {
    setDueDate(tempDate);
    setShowDatePicker(false);
  };

  const cancelDateSelection = () => {
    setShowDatePicker(false);
  };

  const changeDate = (date: Date) => {
    if (date && date instanceof Date && !isNaN(date.getTime())) {
      setTempDate(date);
    } else {
      setTempDate(new Date());
    }
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
    <View style={[styles.container, { paddingTop: (insets.top || 0) + 12 }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
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
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(['low', 'medium', 'high'] as TodoPriority[]).map((priorityLevel) => {
                  const isActive = priority === priorityLevel;
                  const pColor = getPriorityColor(priorityLevel, colors);
                  return (
                    <TouchableOpacity
                      key={priorityLevel}
                      style={[
                        styles.priorityButton,
                        { borderColor: pColor },
                        isActive ? { backgroundColor: pColor } : { backgroundColor: 'transparent' },
                        isActive && styles.priorityButtonActive,
                      ]}
                      onPress={() => setPriority(priorityLevel)}
                    >
                      <Ionicons
                        name={getPriorityIcon(priorityLevel)}
                        size={20}
                        color={isActive ? colors.background : pColor}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date</Text>
              {dueDate ? (
                <View style={styles.dueDateContainer}>
                  <TouchableOpacity
                    style={styles.dueDateButton}
                    onPress={() => {
                      const dateToEdit = dueDate && dueDate instanceof Date && !isNaN(dueDate.getTime())
                        ? dueDate
                        : new Date();
                      setTempDate(dateToEdit);
                      setShowDatePicker(true);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={styles.dueDateText}>
                      {dueDate && dueDate instanceof Date && !isNaN(dueDate.getTime())
                        ? formatDate(dueDate)
                        : 'Invalid Date'
                      }
                    </Text>
                  </TouchableOpacity>
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelDateSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Due Date</Text>
            </View>

            <View style={styles.datePickerContainer}>
              <View style={styles.dateDisplay}>
                <Text style={[styles.selectedDateText, { color: colors.text }]}>
                  {formatDate(tempDate)}
                </Text>
              </View>

              <View style={styles.dateControls}>
                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: colors.primary }]}
                  onPress={() => changeDate(new Date())}
                >
                  <Text style={[styles.dateButtonText, { color: colors.background }]}>Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    changeDate(tomorrow);
                  }}
                >
                  <Text style={[styles.dateButtonText, { color: colors.background }]}>Tomorrow</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    changeDate(nextWeek);
                  }}
                >
                  <Text style={[styles.dateButtonText, { color: colors.background }]}>Next Week</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.monthYearControls}>
                <TouchableOpacity
                  style={[styles.monthButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    if (tempDate && tempDate instanceof Date && !isNaN(tempDate.getTime())) {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      changeDate(newDate);
                    }
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.monthYearText, { color: colors.text }]}>
                  {tempDate && tempDate instanceof Date && !isNaN(tempDate.getTime())
                    ? tempDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'Invalid Date'
                  }
                </Text>

                <TouchableOpacity
                  style={[styles.monthButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    if (tempDate && tempDate instanceof Date && !isNaN(tempDate.getTime())) {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      changeDate(newDate);
                    }
                  }}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.dayGrid}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  if (!tempDate || !(tempDate instanceof Date) || isNaN(tempDate.getTime())) {
                    return null;
                  }

                  const currentMonth = tempDate.getMonth();
                  const currentYear = tempDate.getFullYear();
                  const date = new Date(currentYear, currentMonth, day);
                  const isSelected = date.toDateString() === tempDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();

                  // Only show days that exist in the current month
                  if (date.getMonth() !== currentMonth) return null;

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isToday ? colors.primary : colors.border,
                          borderWidth: isToday ? 2 : 1,
                        }
                      ]}
                      onPress={() => changeDate(date)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        {
                          color: isSelected ? colors.background : colors.text,
                          fontWeight: isToday ? 'bold' : 'normal',
                        }
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton, { borderColor: colors.border }]}
                onPress={cancelDateSelection}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton, { backgroundColor: colors.primary }]}
                onPress={confirmDateSelection}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    datePickerContainer: {
      marginBottom: 20,
    },
    dateDisplay: {
      alignItems: 'center',
      marginBottom: 20,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedDateText: {
      fontSize: 18,
      fontWeight: '600',
    },
    dateControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    dateButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    dateButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    monthYearControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    monthButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthYearText: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
    },
    dayGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    dayButton: {
      width: '13%',
      aspectRatio: 1,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4,
    },
    dayButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelModalButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
    },
    confirmModalButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    priorityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    priorityButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    priorityButtonActive: {
      // active background will be set per-priority where used;
      paddingVertical: 14,
      paddingHorizontal: 8,
      // subtle elevation / shadow
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
        web: {
          boxShadow: '0px 2px 6px rgba(0,0,0,0.12)',
        },
      }),
    },
  });
