import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Calendar,
  Clock,
  Compass,
  Map,
  Settings,
  Waves,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfileTab"
>;

const StatRow = ({ icon: Icon, label, value, subtext }: any) => (
  <View style={styles.statRow}>
    <View style={styles.statIconContainer}>
      <Icon size={22} color="#4A5D4E" />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statLabel}>{label}</Text>
      {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    </View>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile Display State (The "Saved" data)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (user && isFocused) {
      getProfile();
    }
  }, [user, isFocused]);

  const getProfile = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, first_name, last_name`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setUsername(data.username || "");
      }
    } catch (error: any) {
      console.log("Error loading profile", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !firstName) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#A8BFA5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.identityWrapper}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
                }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.identityInfo}>
              <Text
                style={styles.fullName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {firstName || lastName
                  ? `${firstName} ${lastName}`
                  : username || user?.email}
              </Text>
              <Text
                style={styles.emailText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Settings size={28} color="#2D3748" opacity={0.7} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Your Journey Card with Background Image */}
          <View style={styles.journeyCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800",
              }}
              style={styles.journeyImage}
            />
            <View style={styles.journeyOverlay}>
              <Text style={styles.journeyTitle}>Your Journey</Text>
            </View>
          </View>

          {/* Linear Stats List */}
          <View style={styles.statsList}>
            <StatRow
              icon={Compass}
              label="Total Distance"
              value="1,420 km"
              subtext="Equivalent to walking across Japan"
            />
            <StatRow icon={Map} label="Journeys" value="84" />
            <StatRow icon={Clock} label="Time Moving" value="120 Hrs" />
            <StatRow icon={Waves} label="Top Speed" value="12 km/h" />
            <StatRow
              icon={Waves} // Using Waves for rhythm/avg as it looks like the icon in image
              label="Avg. Rhythm"
              value="6 km/h"
            />
            <StatRow
              icon={Calendar}
              label="On this day"
              value="" // Value empty to show subtext properly if needed or handled inside
              subtext="July 8, 2024. Morning Walk in Manila"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5EF", // Creamy background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F5EF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  identityWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  identityInfo: {
    flex: 1,
    justifyContent: "center",
  },
  fullName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  emailText: {
    fontSize: 14,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  settingsButton: {
    padding: 8,
  },
  contentContainer: {
    gap: 20,
  },
  journeyCard: {
    height: 220,
    backgroundColor: "#E9EFEC",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  journeyImage: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  journeyOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
  },
  journeyTitle: {
    color: "#2D3748",
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    fontWeight: "300",
  },
  statsList: {
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9EFEC", // Sage green light background
    borderRadius: 30,
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C5D0C6", // Darker sage for icon bg
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 18,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  statSubtext: {
    fontSize: 13,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
});
