import HomeScreen from "@/features/home/screens/HomeScreen";
import TimelineScreen from "@/features/journey/screens/TimelineScreen";
import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Map, Scroll, User } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2F4F4F", // Deep Forest Green
        tabBarInactiveTintColor: "#8B7355", // Bronze/Parchment Brown
        tabBarStyle: {
          borderTopWidth: 2,
          borderTopColor: "#8B7355", // Bronze border
          backgroundColor: "#F7F7F2", // Parchment
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Journey",
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TimelineTab"
        component={TimelineScreen}
        options={{
          tabBarLabel: "Grimoire",
          tabBarIcon: ({ color, size }) => <Scroll color={color} size={size} />,
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
