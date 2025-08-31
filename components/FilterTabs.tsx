import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { TodoFilter } from '../types/Todo';
import { Colors, ThemeColors } from '../constants/Colors';

interface FilterTabsProps {
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  isDark: boolean;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  totalTodos,
  completedTodos,
  pendingTodos,
  isDark,
}) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  const filters: { key: TodoFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalTodos },
    { key: 'pending', label: 'Pending', count: pendingTodos },
    { key: 'completed', label: 'Completed', count: completedTodos },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.tab,
            currentFilter === filter.key && styles.activeTab,
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text
            style={[
              styles.tabText,
              currentFilter === filter.key && styles.activeTabText,
            ]}
          >
            {filter.label}
          </Text>
          <Text
            style={[
              styles.tabCount,
              currentFilter === filter.key && styles.activeTabCount,
            ]}
          >
            {filter.count}
          </Text>
        </TouchableOpacity>
      ))}
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
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginRight: 6,
    },
    activeTabText: {
      color: colors.background,
    },
    tabCount: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      backgroundColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 20,
      textAlign: 'center',
    },
    activeTabCount: {
      color: colors.primary,
      backgroundColor: colors.background,
    },
  });
