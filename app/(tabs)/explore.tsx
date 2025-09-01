import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/ThemeContext';
import { useTodos } from '@/hooks/useTodos';
import { ColorScheme } from '@/types/App';

export default function SettingsScreen() {
  const { isDark, colorScheme, updateColorScheme } = useTheme();
  const { clearCompleted, totalTodos, completedTodos, refreshTodos } = useTodos();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
  // Ensure statistics are refreshed when the screen gains focus
  refreshTodos();
    }, [])
  );

  const handleThemeChange = (newColorScheme: ColorScheme) => {
    updateColorScheme(newColorScheme);
  };

  const handleClearCompleted = () => {
    if (completedTodos === 0) {
      if (Platform.OS === 'web') {
        window.alert('No completed tasks to clear');
      } else {
        Alert.alert('No completed tasks to clear');
      }
      return;
    }

    if (Platform.OS === 'web') {
      if (window.confirm(`Clear ${completedTodos} completed task(s)?`)) {
        clearCompleted();
        // Immediately refresh stats
        refreshTodos();
      }
    } else {
      Alert.alert(
        'Clear Completed Tasks',
        `Are you sure you want to clear ${completedTodos} completed task(s)?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: () => { clearCompleted(); refreshTodos(); } },
        ]
      );
    }
  };

  const themeOptions: { key: ColorScheme; label: string; icon: string }[] = [
    { key: 'light', label: 'Light', icon: 'sunny' },
    { key: 'dark', label: 'Dark', icon: 'moon' },
    { key: 'auto', label: 'System', icon: 'phone-portrait' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionItem,
                  option.key === themeOptions[themeOptions.length - 1].key && styles.lastOptionItem,
                ]}
                onPress={() => handleThemeChange(option.key)}
              >
                <View style={styles.optionLeft}>
                  <View style={[
                    styles.optionIcon,
                    colorScheme === option.key && styles.selectedOptionIcon,
                  ]}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={20} 
                      color={colorScheme === option.key ? colors.background : colors.textSecondary} 
                    />
                  </View>
                  <Text style={[
                    styles.optionLabel,
                    colorScheme === option.key && styles.selectedOptionLabel,
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {colorScheme === option.key && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <View style={styles.statsItem}>
              <View style={styles.statsLeft}>
                <View style={styles.statsIcon}>
                  <Ionicons name="list" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.statsLabel}>Total Tasks</Text>
                  <Text style={styles.statsSubLabel}>All tasks created</Text>
                </View>
              </View>
              <Text style={styles.statsValue}>{totalTodos}</Text>
            </View>
            
            <View style={styles.statsItem}>
              <View style={styles.statsLeft}>
                <View style={styles.statsIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <View>
                  <Text style={styles.statsLabel}>Completed Tasks</Text>
                  <Text style={styles.statsSubLabel}>Tasks you've finished</Text>
                </View>
              </View>
              <Text style={styles.statsValue}>{completedTodos}</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionItem, styles.lastOptionItem]}
              onPress={handleClearCompleted}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: colors.error + '20' }]}>
                  <Ionicons name="trash" size={20} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.optionLabel, { color: colors.error }]}>
                    Clear Completed Tasks
                  </Text>
                  <Text style={styles.optionSubLabel}>
                    Remove all completed tasks
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={[styles.aboutItem, styles.lastOptionItem]}>
              <Text style={styles.aboutLabel}>Platform</Text>
              <Text style={styles.aboutValue}>{Platform.OS}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 24,
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
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastOptionItem: {
      borderBottomWidth: 0,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    selectedOptionIcon: {
      backgroundColor: colors.primary,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    selectedOptionLabel: {
      color: colors.text,
      fontWeight: '600',
    },
    optionSubLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statsIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    statsLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    statsSubLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statsValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    aboutItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    aboutLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    aboutValue: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
