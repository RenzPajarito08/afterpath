import { useNavigation } from "@react-navigation/native";
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
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatRow } from "@/features/profile/components/StatRow";
import { useProfileLogic } from "@/features/profile/hooks/useProfileLogic";
import { RootStackParamList } from "@/navigation/types";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfileTab"
>;

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    user,
    loading,
    firstName,
    lastName,
    username,
    avatarUrl,
    stats,
    refreshing,
    onRefresh,
  } = useProfileLogic();

  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      { paddingBottom: Math.max(insets.bottom, 24) },
    ],
    [insets.bottom],
  );

  const headerOverlayStyle = useMemo(
    () => [styles.headerOverlay, { paddingTop: insets.top + 20 }],
    [insets.top],
  );

  if (loading && !firstName) {
    return (
      <ImageBackground
        source={require("../../../../assets/parchment_texture.png")}
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
        contentContainerStyle={scrollContentStyle}
        bounces={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ImageBackground
          source={require("../../../../assets/fantasy_header.png")}
          style={styles.headerBg}
          resizeMode="cover"
        >
          <View style={headerOverlayStyle}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Adventurer's Card</Text>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate("Settings")}
                accessibilityLabel="Settings"
                accessibilityRole="button"
              >
                <Settings size={28} color="#F7F7F2" />
              </TouchableOpacity>
            </View>

            <ImageBackground
              source={require("../../../../assets/parchment_texture.png")}
              style={styles.identityCard}
              imageStyle={styles.parchmentImage}
            >
              <View style={styles.identityWrapper}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri:
                        avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.email}`,
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
                  <Text style={styles.rankText}>@{username || "Wayfarer"}</Text>
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
              value={stats.totalDistance}
            />
            <StatRow
              icon={MapIcon}
              label="Quests Completed"
              value={stats.questsCompleted}
            />
            <StatRow
              icon={Clock}
              label="Time in Motion"
              value={stats.timeInMotion}
            />
            <StatRow icon={Zap} label="Max Speed" value={stats.maxSpeed} />
            <StatRow
              icon={Activity}
              label="Avg Speed"
              value={stats.avgSpeed}
              subtext="Highest average speed"
            />
            <StatRow
              icon={Calendar}
              label="Chronicle Status"
              value="Active"
              subtext={`Tracing paths since ${stats.activeSince || "2026"}`}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

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
    height: 240,
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
});

export default ProfileScreen;
