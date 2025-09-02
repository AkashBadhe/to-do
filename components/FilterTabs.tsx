import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, ThemeColors } from '../constants/Colors';
import { TodoFilter } from '../types/Todo';

interface FilterTabsProps {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  isDark: boolean;
  currentCategory?: string | null;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  totalTodos,
  completedTodos,
  pendingTodos,
  isDark,
  currentCategory,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  // Determine the current status filter within the category
  const getCurrentStatusFilter = (): string => {
    if (currentFilter === 'all' || currentFilter === 'pending' || currentFilter === 'completed') {
      return currentFilter;
    }
    // If it's a category filter, extract the status part
    if (currentFilter.startsWith('category:') && currentFilter.includes(':')) {
      const parts = currentFilter.split(':');
      return parts[2] || 'all';
    }
    return 'all';
  };

  const currentStatusFilter = getCurrentStatusFilter();

  const filters: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalTodos },
    { key: 'pending', label: 'Pending', count: pendingTodos },
    { key: 'completed', label: 'Completed', count: completedTodos },
  ];

  const handleFilterChange = (statusFilter: string) => {
    if (currentCategory) {
      // Create combined filter: category:CategoryName:status
      const combinedFilter = `category:${currentCategory}:${statusFilter}`;
      onFilterChange(combinedFilter as TodoFilter);
    } else {
      // Fallback to simple status filter
      onFilterChange(statusFilter as TodoFilter);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterTabs}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.tab,
              currentStatusFilter === filter.key && styles.activeTab,
            ]}
            onPress={() => handleFilterChange(filter.key)}
          >
            <Text
              style={[
                styles.tabText,
                currentStatusFilter === filter.key && styles.activeTabText,
              ]}
            >
              {filter.label}
            </Text>
            <Text
              style={[
                styles.tabCount,
                currentStatusFilter === filter.key && styles.activeTabCount,
              ]}
            >
              {filter.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      marginVertical: 16,
      alignItems: 'center',
    },
    filterTabs: {
      flex: 1,
      flexDirection: 'row',
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginRight: 4,
    },
    activeTabText: {
      color: colors.background,
    },
    tabCount: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      backgroundColor: colors.border,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 8,
      minWidth: 18,
      textAlign: 'center',
    },
    activeTabCount: {
      color: colors.primary,
      backgroundColor: colors.background,
    },
  });
