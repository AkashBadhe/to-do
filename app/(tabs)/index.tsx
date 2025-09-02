import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TodoItem } from '@/components/TodoItem';
import { DEFAULT_CATEGORIES } from '@/constants/Categories';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/ThemeContext';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/types/Todo';

export default function TodoListScreen() {
  const {
    todos,
    filter,
    isLoading,
    totalTodos,
    completedTodos,
    pendingTodos,
    getCategoryStats,
    setFilter,
    toggleTodo,
    deleteTodo,
    refreshTodos,
  } = useTodos();

  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Scroll to top when switching to empty list or changing filters
  React.useEffect(() => {
    if (flatListRef.current) {
      // Always scroll to top when filter changes to ensure consistent behavior
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 0);
    }
  }, [filter]); // Trigger on filter changes

  const availableCategories = Array.from(new Set(todos.map(todo => todo.category).filter(Boolean))) as string[];

  // Refresh todos when screen comes into focus (e.g., when returning from add-todo modal)
  useFocusEffect(
    useCallback(() => {
      // Force a refresh of todos when screen is focused
      refreshTodos();
    }, [refreshTodos]) // Now safe to include since refreshTodos is memoized
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTodos();
    setRefreshing(false);
  };

  const getCurrentCategory = (): string | null => {
    if (filter.startsWith('category:')) {
      const parts = filter.split(':');
      return parts[1] || null; // Return the category name (second part)
    }
    return null;
  };

  const currentCategory = getCurrentCategory();

  // Get category-specific counts for header
  const getCategoryCounts = () => {
    if (!currentCategory) {
      // Show all todos count
      return {
        total: totalTodos,
        completed: completedTodos,
      };
    }

    // Show category-specific counts for the selected category
    const categoryTodos = todos.filter(todo => todo.category === currentCategory);
    const categoryCompleted = categoryTodos.filter(todo => todo.completed).length;

    return {
      total: categoryTodos.length,
      completed: categoryCompleted,
    };
  };

  const categoryCounts = getCategoryCounts();

  // Get all categories with their pending counts
  const getAllCategoriesWithCounts = () => {
    const allCategories = ['All', ...DEFAULT_CATEGORIES];
    const categoriesWithCounts = allCategories.map(category => {
      let stats;
      if (category === 'All') {
        // Always show total count for "All" regardless of current filter
        stats = {
          total: totalTodos, // Use totalTodos from useTodos hook
          pending: pendingTodos, // Use pendingTodos from useTodos hook  
          completed: completedTodos, // Use completedTodos from useTodos hook
        };
      } else {
        stats = getCategoryStats(category);
      }
      return {
        name: category,
        pendingCount: stats.pending,
        totalCount: stats.total,
      };
    });

    return categoriesWithCounts;
  };

  const categoriesWithCounts = getAllCategoriesWithCounts();

  const handleEdit = (todo: Todo) => {
    // Navigate to edit screen with todo data
    router.push({
      pathname: '/add-todo',
      params: { editTodo: JSON.stringify(todo) },
    });
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      onToggle={toggleTodo}
      onEdit={handleEdit}
      onDelete={deleteTodo}
      isDark={isDark}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="checkmark-circle-outline" 
        size={64} 
        color={colors.textSecondary} 
      />
      <Text style={styles.emptyTitle}>
        {(() => {
          // Handle category filters
          if (filter.startsWith('category:')) {
            const category = filter.replace('category:', '');
            return `No tasks in ${category} category`;
          }

          // Handle "All" filter
          return 'No tasks yet';
        })()}
      </Text>
      <Text style={styles.emptySubtitle}>
        {(() => {
          // Handle category filters
          if (filter.startsWith('category:')) {
            const category = filter.replace('category:', '');
            return `Add tasks to the ${category} category`;
          }

          // Handle "All" filter
          return 'Add your first task to get started!';
        })()}
      </Text>
      {(() => {
        // Show add button for all empty categories and "All" filter
        if (filter.startsWith('category:')) {
          return true; // Show for any category filter
        }
        // Show for "All" filter
        return filter === 'all';
      })() && (
        <TouchableOpacity
          style={styles.addFirstTaskButton}
          onPress={() => {
            const params: any = {};
            if (currentCategory) {
              params.defaultCategory = currentCategory;
            }
            router.push({
              pathname: '/add-todo',
              params,
            });
          }}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.addFirstTaskText}>Add Your First Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {currentCategory ? `${currentCategory} Tasks` : 'Time Box'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {categoryCounts.total === 0 
              ? 'No tasks yet'
              : `${categoryCounts.completed} of ${categoryCounts.total} completed`
            }
          </Text>
        </View>
      </View>

      {/* Category Selector */}
      <View style={styles.categorySelector}>
        <FlatList
          horizontal
          data={categoriesWithCounts}
          keyExtractor={(item) => item.name}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                (item.name === 'All' && !currentCategory) || (currentCategory === item.name) ? styles.categoryTabActive : null,
              ]}
              onPress={() => {
                if (item.name === 'All') {
                  setFilter('all');
                } else {
                  setFilter(`category:${item.name}`);
                }
              }}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  (item.name === 'All' && !currentCategory) || (currentCategory === item.name) ? styles.categoryTabTextActive : null,
                ]}
              >
                {item.name}
              </Text>
              {item.pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{item.pendingCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <View style={styles.listWrapper}>
        <FlatList
          ref={flatListRef}
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodoItem}
          style={todos.length === 0 ? styles.emptyFlatList : undefined}
          contentContainerStyle={[
            styles.listContainer,
            todos.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={todos.length > 0} // Disable scrolling when empty
          extraData={todos.length} // Force re-render when todo count changes
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {/* Floating Action Button - Only show when there are tasks */}
      {todos.length > 0 && (
        <TouchableOpacity
          style={styles.floatingActionButton}
          onPress={() => {
            const params: any = {};
            if (currentCategory) {
              params.defaultCategory = currentCategory;
            }
            router.push({
              pathname: '/add-todo',
              params,
            });
          }}
        >
          <Ionicons name="add" size={28} color={colors.background} />
        </TouchableOpacity>
      )}

    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    categorySelector: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    categoryList: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    categoryTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    categoryTabTextActive: {
      color: colors.background,
    },
    pendingBadge: {
      marginLeft: 6,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pendingBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.background,
    },
    categoryFilterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      maxWidth: 120,
    },
    categoryFilterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryFilterText: {
      fontSize: 13,
      fontWeight: '600',
      marginHorizontal: 4,
      flex: 1,
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 100, // Account for FAB (60px height + 20px margin + extra space)
    },
    listWrapper: {
      flex: 1,
      paddingTop: 10
    },
    emptyFlatList: {
      flex: 1,
    },
    emptyListContainer: {
      flex: 1,
      paddingTop: 50,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 20,
      minHeight: Dimensions.get('window').height * 1, // Ensure minimum height for centering
    },
    noFabContainer: {
      paddingBottom: 20, // Reduced padding when no FAB is shown
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    addFirstTaskButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
    },
    addFirstTaskText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background,
      marginLeft: 8,
    },
    floatingActionButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        },
        android: {
          elevation: 12,
        },
        web: {
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.3)',
        },
        default: {
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.3)',
        },
      }),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: '70%',
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    categoryOptions: {
      marginBottom: 20,
    },
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    categoryOptionSelected: {
      backgroundColor: colors.primary,
    },
    categoryOptionText: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 12,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1,
      minWidth: 100,
      alignItems: 'center',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
