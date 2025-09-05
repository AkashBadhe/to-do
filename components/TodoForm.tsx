import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
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
import { DEFAULT_CATEGORIES, DEFAULT_CATEGORY } from '../constants/Categories';
import { Colors, ThemeColors } from '../constants/Colors';
import { Todo, TodoPriority, TodoRecurrence } from '../types/Todo';

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
  return 'folder-outline';
};

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
  defaultCategory?: string;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  todo,
  onSave,
  onCancel,
  isDark,
  defaultCategory,
}) => {
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);
  const titleInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const customIntervalInputRef = useRef<TextInput>(null);
  const newCategoryInputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [category, setCategory] = useState(todo?.category || defaultCategory || (!todo ? DEFAULT_CATEGORY : ''));
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    todo ? (todo.dueDate ? new Date(todo.dueDate) : undefined) : new Date()
  );
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority || 'medium');
  const [recurrence, setRecurrence] = useState<TodoRecurrence>(todo?.recurrence || 'none');
  const [isRepeat, setIsRepeat] = useState<boolean>(todo?.recurrence !== 'none' && todo?.recurrence !== undefined);
  const [customInterval, setCustomInterval] = useState<number>(todo?.customInterval || 1);
  const [endDate, setEndDate] = useState<Date | undefined>(todo?.endDate);
  const [hasReminder, setHasReminder] = useState<boolean>(todo?.hasReminder || false);
  const [reminderTime, setReminderTime] = useState<string>(todo?.reminderTime || '09:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [datePickerType, setDatePickerType] = useState<'due' | 'end'>('due');

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

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const createTimeFromString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setReminderTime(`${hours}:${minutes}`);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    // Dismiss keyboard before saving
    Keyboard.dismiss();

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || undefined,
      dueDate,
      priority,
      recurrence: isRepeat ? recurrence : 'none',
      customInterval: (isRepeat && recurrence === 'custom') ? customInterval : undefined,
      endDate,
      hasReminder,
      reminderTime: hasReminder ? reminderTime : undefined,
      completed: todo?.completed || false,
    });
  };

  const addDueDate = () => {
    const today = new Date();
    setTempDate(dueDate && dueDate instanceof Date && !isNaN(dueDate.getTime()) ? dueDate : today);
    setDatePickerType('due');
    setShowDatePicker(true);
  };

  const confirmDateSelection = () => {
    if (datePickerType === 'due') {
      setDueDate(tempDate);
    } else if (datePickerType === 'end') {
      setEndDate(tempDate);
    }
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

  const selectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  const addNewCategory = () => {
    if (newCategoryText.trim()) {
      setCategory(newCategoryText.trim());
      setNewCategoryText('');
      setShowCategoryModal(false);
    }
  };

  const clearCategory = () => {
    setCategory('');
    setShowCategoryModal(false);
  };

  useEffect(() => {
    if (title.trim()) {
      setTitleError('');
    }
  }, [title]);

  // Auto-focus title input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (titleInputRef.current && !todo) {
        titleInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [todo]);

  return (
    <View style={[styles.container, { paddingTop: (insets.top || 0) + 12 }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false} 
          contentInset={{ bottom: (insets.bottom || 0) + 100 }}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {todo ? 'Edit Task' : 'Add New Task'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                ref={titleInputRef}
                style={[styles.input, titleError && styles.inputError]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => descriptionInputRef.current?.focus()}
              />
              {titleError && <Text style={styles.errorText}>{titleError}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                ref={descriptionInputRef}
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter task description (optional)"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
                returnKeyType="default"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Ionicons name={category ? getCategoryIcon(category) : 'folder-outline'} size={20} color={colors.primary} />
                <Text style={[styles.categoryButtonText, { color: category ? colors.text : colors.textSecondary }]}>
                  {category || 'Select category'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
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
              <Text style={styles.label}>Repeat</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[styles.switch, isRepeat && styles.switchActive]}
                  onPress={() => {
                    setIsRepeat(!isRepeat);
                    if (!isRepeat) {
                      // When enabling repeat, set to daily if none
                      if (recurrence === 'none') setRecurrence('daily');
                    } else {
                      // When disabling, set to none
                      setRecurrence('none');
                    }
                  }}
                >
                  <View style={[styles.switchKnob, isRepeat && styles.switchKnobActive]} />
                </TouchableOpacity>
                <Text style={styles.switchLabel}>Enable repeat</Text>
              </View>
              {isRepeat && (
                <View style={styles.recurrenceContainer}>
                  {(['daily', 'weekly', 'monthly', 'custom'] as TodoRecurrence[]).map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.recurrenceButton, recurrence === r && styles.recurrenceButtonActive]}
                      onPress={() => setRecurrence(r)}
                    >
                      <Text style={[styles.recurrenceText, recurrence === r && styles.recurrenceTextActive]}>
                        {r === 'custom' ? 'Custom' : r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {isRepeat && recurrence === 'custom' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Custom Interval (days)</Text>
                  <TextInput
                    ref={customIntervalInputRef}
                    style={styles.input}
                    value={customInterval.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text, 10);
                      if (!isNaN(num) && num > 0) {
                        setCustomInterval(num);
                      }
                    }}
                    placeholder="Enter number of days"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Due Date {isRepeat ? '(First occurrence)' : ''}
              </Text>
              {dueDate ? (
                <View style={styles.dueDateContainer}>
                  <TouchableOpacity
                    style={styles.dueDateButton}
                    onPress={() => {
                      const dateToEdit = dueDate && dueDate instanceof Date && !isNaN(dueDate.getTime())
                        ? dueDate
                        : new Date();
                      setTempDate(dateToEdit);
                      setDatePickerType('due');
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

            {isRepeat && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>End Date (optional)</Text>
                  <TouchableOpacity
                    style={styles.addDateButton}
                    onPress={() => {
                      setTempDate(endDate || new Date());
                      setDatePickerType('end');
                      setShowDatePicker(true);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={styles.addDateText}>
                      {endDate ? formatDate(endDate) : 'Set end date'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reminder</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[styles.switch, hasReminder && styles.switchActive]}
                  onPress={() => setHasReminder(!hasReminder)}
                >
                  <View style={[styles.switchKnob, hasReminder && styles.switchKnobActive]} />
                </TouchableOpacity>
                <Text style={styles.switchLabel}>Enable reminder</Text>
              </View>
              {hasReminder && (
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={styles.timePickerText}>
                    {formatTime(reminderTime)}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={[styles.actions, { paddingBottom: (insets.bottom || 0) + 20 }]}>
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

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
            </View>

            <ScrollView style={styles.categoryScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.categoryGrid}>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      category === cat && styles.categoryOptionSelected,
                      { backgroundColor: category === cat ? colors.primary : colors.surface }
                    ]}
                    onPress={() => selectCategory(cat)}
                  >
                    <Ionicons name={getCategoryIcon(cat)} size={16} color={category === cat ? colors.background : colors.primary} />
                    <Text style={[
                      styles.categoryOptionText,
                      { color: category === cat ? colors.background : colors.text }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.addCategorySection}>
                <Text style={[styles.addCategoryLabel, { color: colors.text }]}>Add New Category</Text>
                <TextInput
                  ref={newCategoryInputRef}
                  style={styles.addCategoryInput}
                  value={newCategoryText}
                  onChangeText={setNewCategoryText}
                  placeholder="Enter new category name"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
            </ScrollView>

            <View style={styles.categoryModalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton, { borderColor: colors.border }]}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              {newCategoryText.trim() && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmModalButton, { backgroundColor: colors.primary }]}
                  onPress={addNewCategory}
                >
                  <Text style={[styles.modalButtonText, { color: colors.background }]}>Add Category</Text>
                </TouchableOpacity>
              )}

              {category && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.clearModalButton, { borderColor: colors.error }]}
                  onPress={clearCategory}
                >
                  <Text style={[styles.modalButtonText, { color: colors.error }]}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={createTimeFromString(reminderTime)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
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
      minWidth: 100,
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
    recurrenceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    recurrenceButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    recurrenceButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    recurrenceText: {
      color: colors.text,
      fontWeight: '500',
    },
    recurrenceTextActive: {
      color: colors.background,
      fontWeight: '600',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    switch: {
      width: 50,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    switchActive: {
      backgroundColor: colors.primary,
    },
    switchKnob: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    switchKnobActive: {
      transform: [{ translateX: 22 }],
    },
    switchLabel: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    categoryButtonText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    categoryScrollView: {
      maxHeight: 300,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: '45%',
      marginBottom: 8,
    },
    categoryOptionSelected: {
      borderColor: colors.primary,
    },
    categoryOptionText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },
    addCategorySection: {
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    addCategoryLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    addCategoryInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    categoryModalActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 20,
      flexWrap: 'wrap',
    },
    clearModalButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
    },
    timePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      marginTop: 8,
    },
    timePickerText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
  });
