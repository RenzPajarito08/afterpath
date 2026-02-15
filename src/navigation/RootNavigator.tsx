import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import WelcomeScreen from "../features/auth/screens/WelcomeScreen";
import { RootStackParamList } from "./types";

import StartJourneyScreen from "@/screens/StartJourneyScreen";

import TrackingScreen from "@/screens/TrackingScreen";

import SummaryScreen from "@/screens/SummaryScreen";

import JourneyDetailScreen from "@/screens/JourneyDetailScreen";

import EditProfileScreen from "@/screens/EditProfileScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#48BB78" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            {/* Main Tabs */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            {/* Modals / Stacks on top of tabs */}
            <Stack.Screen name="StartJourney" component={StartJourneyScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="Summary" component={SummaryScreen} />
            <Stack.Screen
              name="JourneyDetail"
              component={JourneyDetailScreen}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
