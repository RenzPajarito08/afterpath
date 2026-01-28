import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatDistanceToNow } from "date-fns";
import { Clock, Footprints, MapPin } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { RootStackParamList } from "../navigation/types";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "HomeTab"
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface Journey {
  id: string;
  title: string;
  distance_meters: number;
  duration_seconds: number;
  created_at: string;
  start_time: string;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalDistance: 0, totalJourneys: 0 });
  const [recentJourneys, setRecentJourneys] = useState<Journey[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    // Fetch stats
    const { data: journeys, error } = await supabase
      .from("journeys")
      .select("distance_meters")
      .eq("user_id", user.id);

    if (!error && journeys) {
      const totalDist = journeys.reduce(
        (acc, curr) => acc + (curr.distance_meters || 0),
        0,
      );
      setStats({
        totalDistance: totalDist,
        totalJourneys: journeys.length,
      });
    }

    // Fetch recent
    const { data: recent, error: recentError } = await supabase
      .from("journeys")
      .select(
        "id, title, distance_meters, duration_seconds, created_at, start_time",
      )
      .eq("user_id", user.id)
      .order("start_time", { ascending: false })
      .limit(3);

    if (!recentError && recent) {
      setRecentJourneys(recent);
    }

    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh when focusing screen (e.g. returning from Summary)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning</Text>
        <Text style={styles.subtitle}>Ready for a new memory?</Text>
      </View>

      <TouchableOpacity
        style={styles.startCard}
        onPress={() => navigation.navigate("StartJourney")}
      >
        <View style={styles.iconContainer}>
          <Footprints color="#FFF" size={32} />
        </View>
        <Text style={styles.startCardText}>Start Journey</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {(stats.totalDistance / 1000).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Total km</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalJourneys}</Text>
          <Text style={styles.statLabel}>Journeys</Text>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Memories</Text>
        <TouchableOpacity onPress={() => navigation.navigate("TimelineTab")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {recentJourneys.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No journeys yet.</Text>
        </View>
      ) : (
        recentJourneys.map((journey) => (
          <TouchableOpacity
            key={journey.id}
            style={styles.journeyCard}
            onPress={() =>
              navigation.navigate("JourneyDetail", { journeyId: journey.id })
            }
          >
            <View style={styles.journeyHeader}>
              <Text style={styles.journeyTitle}>
                {journey.title || "Untitled Journey"}
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
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "300",
    color: "#2D3748",
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    marginTop: 4,
  },
  startCard: {
    backgroundColor: "#48BB78",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 32,
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  startCardText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    marginTop: 4,
  },
  divider: {
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
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
  },
  viewAllText: {
    color: "#48BB78",
    fontSize: 14,
    fontWeight: "600",
  },
  journeyCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  journeyHeader: {
    marginBottom: 12,
  },
  journeyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  journeyDate: {
    fontSize: 12,
    color: "#A0AEC0",
  },
  journeyFooter: {
    flexDirection: "row",
    gap: 16,
  },
  journeyStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  journeyStatText: {
    fontSize: 12,
    color: "#718096",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CBD5E0",
  },
  emptyStateText: {
    color: "#A0AEC0",
  },
});
