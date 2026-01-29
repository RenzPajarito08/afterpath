import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Activity,
  Calendar,
  Clock,
  Compass,
  Map as MapIcon,
  Settings,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
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
  <View style={styles.statContainer}>
    <ImageBackground
      source={require("../assets/parchment_texture.png")}
      style={styles.statParchment}
      imageStyle={styles.parchmentImage}
    >
      <View style={styles.statContent}>
        <View style={styles.statIconContainer}>
          <Icon size={20} color="#2F4F4F" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statLabel}>{label}</Text>
          {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </ImageBackground>
  </View>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

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
      <ImageBackground
        source={require("../assets/parchment_texture.png")}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color="#2F4F4F" />
        <Text style={styles.loadingText}>Reading your chronicle...</Text>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        bounces={false}
      >
        <ImageBackground
          source={require("../assets/fantasy_header.png")}
          style={[styles.headerBg, { paddingTop: insets.top + 20 }]}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Adventurer's Card</Text>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate("Settings")}
              >
                <Settings size={28} color="#F7F7F2" />
              </TouchableOpacity>
            </View>

            <ImageBackground
              source={require("../assets/parchment_texture.png")}
              style={styles.identityCard}
              imageStyle={styles.parchmentImage}
            >
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
                  <Text style={styles.fullName} numberOfLines={1}>
                    {firstName || lastName
                      ? `${firstName} ${lastName}`
                      : username || user?.email}
                  </Text>
                  <Text style={styles.rankText}>Master Wayfarer</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        </ImageBackground>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Journey Statistics</Text>
          <View style={styles.statsList}>
            <StatRow
              icon={Compass}
              label="Total Distance"
              value="1,420 km"
              subtext="Equivalent to crossing many borders"
            />
            <StatRow icon={MapIcon} label="Quests Completed" value="84" />
            <StatRow icon={Clock} label="Time in Motion" value="120 Hrs" />
            <StatRow icon={Zap} label="Highest Pace" value="12 km/h" />
            <StatRow icon={Activity} label="Average Rhythm" value="6 km/h" />
            <StatRow
              icon={Calendar}
              label="Chronicle Status"
              value="Active"
              subtext="Tracing paths since 2024"
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
    backgroundColor: "#F7F7F2",
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  headerBg: {
    height: 300,
    width: "100%",
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 24,
    justifyContent: "space-between",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    color: "#F7F7F2",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  settingsButton: {
    padding: 4,
  },
  identityCard: {
    marginBottom: -60,
    borderRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  parchmentImage: {
    borderRadius: 24,
  },
  identityWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#2F4F4F",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  identityInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  rankText: {
    fontSize: 14,
    color: "#2F4F4F",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
    marginTop: 4,
    letterSpacing: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 80,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  statsList: {
    gap: 16,
  },
  statContainer: {
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statParchment: {
    borderRadius: 24,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(47, 79, 79, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 16,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    fontWeight: "500",
  },
  statSubtext: {
    fontSize: 12,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    marginTop: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F4F4F",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
});
