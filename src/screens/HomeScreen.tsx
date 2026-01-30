import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Clock, Footprints, MapPin } from "lucide-react-native";
import React, { useEffect } from "react";
import {
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
import { useHomeLogic } from "../hooks/useHomeLogic";
import { RootStackParamList } from "../navigation/types";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "HomeTab"
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { stats, recentJourneys, refreshing, onRefresh, refetch, greeting } =
    useHomeLogic();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ImageBackground
        source={require("../../assets/fantasy_header.png")}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <View style={[styles.headerOverlay, { paddingTop: insets.top + 40 }]}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>Beyond the Journey</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <ImageBackground
          source={require("../../assets/parchment_texture.png")}
          style={styles.startCard}
          imageStyle={styles.cardParchment}
        >
          <TouchableOpacity
            style={styles.startCardInternal}
            onPress={() => navigation.navigate("StartJourney")}
          >
            <View style={styles.iconContainer}>
              <Footprints color="#F7F7F2" size={32} />
            </View>
            <View>
              <Text style={styles.startCardTitle}>New Quest</Text>
              <Text style={styles.startCardSub}>Begin a new memory</Text>
            </View>
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(stats.totalDistance / 1000).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Total km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalJourneys}</Text>
            <Text style={styles.statLabel}>Journeys</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Memories</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("TimelineTab")}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>View Logbook</Text>
            <ChevronRight size={16} color="#48BB78" />
          </TouchableOpacity>
        </View>

        {recentJourneys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No memories recorded yet.</Text>
          </View>
        ) : (
          recentJourneys.map((journey) => (
            <TouchableOpacity
              key={journey.id}
              onPress={() =>
                navigation.navigate("JourneyDetail", { journeyId: journey.id })
              }
              style={styles.journeyCardContainer}
            >
              <ImageBackground
                source={require("../../assets/parchment_texture.png")}
                style={styles.journeyCard}
                imageStyle={styles.cardParchment}
              >
                <View style={styles.journeyHeader}>
                  <Text style={styles.journeyTitle}>
                    {journey.title || "Untitled Fragment"}
                  </Text>
                  <Text style={styles.journeyDate}>
                    {formatDistanceToNow(new Date(journey.start_time), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
                <View style={styles.journeyFooter}>
                  <View style={styles.journeyStat}>
                    <MapPin size={14} color="#718096" />
                    <Text style={styles.journeyStatText}>
                      {(journey.distance_meters / 1000).toFixed(2)} km
                    </Text>
                  </View>
                  <View style={styles.journeyStat}>
                    <Clock size={14} color="#718096" />
                    <Text style={styles.journeyStatText}>
                      {Math.floor(journey.duration_seconds / 60)} mins
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  headerImage: {
    height: 220,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)", // Slightly darker for better contrast
    padding: 24,
    justifyContent: "flex-end",
    paddingBottom: 40, // More bottom padding for content overlap
  },
  greeting: {
    fontSize: 32,
    fontWeight: "300",
    color: "#F7F7F2",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#E2E8F0",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  content: {
    padding: 24,
    marginTop: -20,
    backgroundColor: "#F7F7F2",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cardParchment: {
    borderRadius: 16,
    opacity: 0.9,
  },
  startCard: {
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  startCardInternal: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#2F4F4F",
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  startCardTitle: {
    color: "#2D3748",
    fontSize: 20,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  startCardSub: {
    color: "#4A5568",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    justifyContent: "space-around",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "300",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    color: "#48BB78",
    fontSize: 14,
    fontWeight: "600",
  },
  journeyCardContainer: {
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  journeyCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  journeyHeader: {
    marginBottom: 12,
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2D3748",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  journeyDate: {
    fontSize: 12,
    color: "#A0AEC0",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  journeyFooter: {
    flexDirection: "row",
    gap: 16,
  },
  journeyStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  journeyStatText: {
    fontSize: 13,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CBD5E0",
  },
  emptyStateText: {
    color: "#A0AEC0",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
});
