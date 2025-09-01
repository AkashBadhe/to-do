import { Tabs } from 'expo-router';
import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const insets = useSafeAreaInsets();

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background, paddingTop: (insets.top || 0)}}>
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,  // ensure labels are visible
        tabBarStyle: {
          height: 65,           // reduced height for more compact tabs
          paddingBottom: 3,
          paddingTop: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,         // smaller text but still readable
        },
        tabBarIconStyle: {
          marginBottom: 2,     // better spacing between icon and text
        },
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
