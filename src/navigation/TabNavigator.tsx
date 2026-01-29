import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Calendar, Home, User } from "lucide-react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TimelineScreen from "../screens/TimelineScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#48BB78",
        tabBarInactiveTintColor: "#A0AEC0",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          backgroundColor: "#FFF",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TimelineTab"
        component={TimelineScreen}
        options={{
          tabBarLabel: "Timeline",
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Me",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
