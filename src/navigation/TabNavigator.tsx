import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import TimelineScreen from '../screens/TimelineScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#48BB78',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            backgroundColor: '#FFF',
            paddingTop: 8,
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="TimelineTab" 
        component={TimelineScreen} 
        options={{
            tabBarLabel: 'Timeline',
            tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
            tabBarLabel: 'Me',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}
