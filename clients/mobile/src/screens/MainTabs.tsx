import { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, StickyNote, MessageCircle, Users, Bell, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';

import { HomeScreen } from './HomeScreen';
import { NotesScreen } from './NotesScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { ProfileScreen } from './ProfileScreen';
import { ChatListScreen } from './ChatListScreen';
import { ChatScreen } from './ChatScreen';
import { MatchesScreen } from './MatchesScreen';
import { UserProfileScreen } from './UserProfileScreen';
import { useStore } from '../store/useStore';
import { Chat, User as UserType } from '../types';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const { unreadChats, selectedChat, setSelectedChat } = useStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={90} tint="light" style={styles.tabBarBg} />
          ) : (
            <View style={[styles.tabBarBg, { backgroundColor: 'rgba(255,255,255,0.96)' }]} />
          ),
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 4 },
        lazy: false,
      }}
    >
      <Tab.Screen
        name="Главная"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Заметки"
        component={NotesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <StickyNote size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Чаты"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
          tabBarBadge: unreadChats > 0 ? unreadChats : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            fontSize: 9,
            fontWeight: '700',
            minWidth: 16,
            height: 16,
          },
        }}
      >
        {() =>
          selectedChat ? (
            <ChatScreen chat={selectedChat} onBack={() => setSelectedChat(null)} />
          ) : (
            <ChatListScreen onOpenChat={(chat: Chat) => setSelectedChat(chat.id)} />
          )
        }
      </Tab.Screen>
      <Tab.Screen
        name="Знакомства"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Users size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      >
        {() =>
          selectedUser ? (
            <UserProfileScreen user={selectedUser} onBack={() => setSelectedUser(null)} />
          ) : (
            <MatchesScreen onOpenUser={(user) => setSelectedUser(user)} />
          )
        }
      </Tab.Screen>
      <Tab.Screen
        name="Уведомления"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Bell size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Профиль"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <User size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
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
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  tabBarBg: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});
