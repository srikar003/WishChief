import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const tab = (name: string, title: string, icon: IconName) => (
  <Tabs.Screen
    key={name}
    name={name}
    options={{
      title,
      tabBarIcon: ({ color, size }) => <Ionicons name={icon} size={size} color={color as string} />,
    }}
  />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      {tab('index', 'Home', 'home-outline')}
      {tab('add', 'Add', 'add-circle-outline')}
    </Tabs>
  );
}
