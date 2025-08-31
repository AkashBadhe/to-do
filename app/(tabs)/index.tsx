import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTodos } from '@/hooks/useTodos';
import { useTheme } from '@/hooks/useTheme';
import { TodoItem } from '@/components/TodoItem';
import { FilterTabs } from '@/components/FilterTabs';
import { Colors } from '@/constants/Colors';
import { Todo } from '@/types/Todo';

export default function TodoListScreen() {
  const {
    todos,
    filter,
    isLoading,
    totalTodos,
    completedTodos,
    pendingTodos,
    setFilter,
    toggleTodo,
    deleteTodo,
    refreshTodos,
  } = useTodos();

  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTodos();
    setRefreshing(false);
  };

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
        {filter === 'completed' 
          ? 'No completed tasks yet'
          : filter === 'pending'
          ? 'No pending tasks'
          : 'No tasks yet'
        }
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all' 
          ? 'Add your first task to get started!'
          : filter === 'pending'
          ? 'All tasks are completed! 🎉'
          : 'Complete some tasks to see them here'
        }
      </Text>
      {filter === 'all' && (
        <TouchableOpacity
          style={styles.addFirstTaskButton}
          onPress={() => router.push('/add-todo')}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.addFirstTaskText}>Add Your First Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {totalTodos === 0 
              ? 'No tasks yet'
              : `${completedTodos} of ${totalTodos} completed`
            }
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-todo')}
        >
          <Ionicons name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <FilterTabs
        currentFilter={filter}
        onFilterChange={setFilter}
        totalTodos={totalTodos}
        completedTodos={completedTodos}
        pendingTodos={pendingTodos}
        isDark={isDark}
      />

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
        contentContainerStyle={[
          styles.listContainer,
          todos.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
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
      paddingVertical: 16,
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
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
        },
      }),
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    emptyListContainer: {
      flex: 1,
      justifyContent: 'center',
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
  });
