import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, StickyNote, Bell, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { HomeScreen } from './HomeScreen';
import { NotesScreen } from './NotesScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { ProfileScreen } from './ProfileScreen';
import { COLORS } from '../config';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          // Чуть темнее: intensity 90 + тёмный tint + тонкая обводка
          <BlurView
            intensity={Platform.OS === 'ios' ? 90 : 75}
            tint="systemChromeMaterialLight"
            style={styles.tabBarBg}
          >
            {/* Тёмный полупрозрачный слой — «чуть темнее» */}
            <BlurView
              intensity={0}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.06)' },
              ]}
            />
          </BlurView>
        ),
        tabBarActiveTintColor: COLORS.black,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 6 },
      }}
    >
      <Tab.Screen
        name="Главная"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Заметки"
        component={NotesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <StickyNote size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Уведомления"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Bell size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.danger,
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
          },
        }}
      />
      <Tab.Screen
        name="Профиль"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  tabBarBg: {
    flex: 1,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});
