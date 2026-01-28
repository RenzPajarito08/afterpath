import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { ArrowLeft, Clock, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { supabase } from "../lib/supabase";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "JourneyDetail">;

interface Journey {
  id: string;
  title: string;
  distance_meters: number;
  duration_seconds: number;
  created_at: string;
  start_time: string;
  memory_text: string;
  polyline: string;
  coordinates?: { latitude: number; longitude: number }[];
}

export default function JourneyDetailScreen({ navigation, route }: Props) {
  const { journeyId } = route.params;
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJourney() {
      const { data, error } = await supabase
        .from("journeys")
        .select("*")
        .eq("id", journeyId)
        .single();

      if (error) {
        Alert.alert("Error", "Could not load memory.");
        navigation.goBack();
        return;
      }

      if (data) {
        try {
          // Parse coordinates
          const coords = data.polyline ? JSON.parse(data.polyline) : [];
          setJourney({ ...data, coordinates: coords });
        } catch (e) {
          setJourney({ ...data, coordinates: [] });
        }
      }
      setLoading(false);
    }
    fetchJourney();
  }, [journeyId, navigation]);

  if (loading || !journey) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#48BB78" size="large" />
        <Text style={{ marginTop: 16, color: "#718096" }}>
          Recalling memory...
        </Text>
      </View>
    );
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? h + "h " : ""}${m}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={
            journey.coordinates && journey.coordinates.length > 0
              ? {
                  latitude: journey.coordinates[0].latitude,
                  longitude: journey.coordinates[0].longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : undefined
          }
          scrollEnabled={false}
          zoomEnabled={false}
        >
          {journey.coordinates && (
            <Polyline
              coordinates={journey.coordinates}
              strokeColor="#48BB78"
              strokeWidth={4}
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#2D3748" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.date}>
          {format(new Date(journey.start_time), "MMMM do, yyyy")}
        </Text>
        <Text style={styles.title}>{journey.title || "Untitled Journey"}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MapPin size={20} color="#718096" />
            <Text style={styles.statText}>
              {(journey.distance_meters / 1000).toFixed(2)} km
            </Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color="#718096" />
            <Text style={styles.statText}>
              {formatDuration(journey.duration_seconds)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>Memory</Text>
        <Text style={styles.memoryText}>
          "{journey.memory_text || "No words written."}"
        </Text>

        <View style={styles.reflectionPrompt}>
          <Text style={styles.promptText}>
            You walked this path {format(new Date(journey.start_time), "PP")}.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    height: 300,
    width: "100%",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 8,
    borderRadius: 20,
  },
  content: {
    padding: 24,
    marginTop: -20, // Overlap map
    backgroundColor: "#F7F7F2",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 500,
  },
  date: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    color: "#2D3748",
    marginBottom: 24,
    lineHeight: 32,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  memoryText: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#4A5568",
    lineHeight: 28,
    marginBottom: 32,
  },
  reflectionPrompt: {
    backgroundColor: "#EDF2F7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  promptText: {
    color: "#718096",
    fontSize: 14,
  },
});
