import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useGlobalContext } from '@/context/GlobalProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { loading, isLogged } = useGlobalContext();
  if (loading || !isLogged) return <Redirect href="/signIn" />;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} /> }} />
      <Tabs.Screen name="deerForm" options={{ title: 'New Record', tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'duplicate' : 'duplicate-outline'} color={color} /> }} />
      <Tabs.Screen name="deerList" options={{ title: 'All Records', tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'list' : 'list-outline'} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} /> }} />
    </Tabs>
  );
}
