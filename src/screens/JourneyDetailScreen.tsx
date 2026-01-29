import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { ArrowLeft, Clock, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
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
        Alert.alert("Error", "Could not load chronicle.");
        navigation.goBack();
        return;
      }

      if (data) {
        try {
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
      <ImageBackground
        source={require("../assets/parchment_texture.png")}
        style={styles.loadingContainer}
      >
        <ActivityIndicator color="#2F4F4F" size="large" />
        <Text style={styles.loadingText}>Recalling chronicle...</Text>
      </ImageBackground>
    );
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? h + "h " : ""}${m}m`;
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
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
          style={[styles.backButton, { top: Math.max(insets.top, 10) }]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#2D3748" size={24} />
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={require("../assets/parchment_texture.png")}
        style={styles.contentParchment}
        imageStyle={styles.parchmentImage}
      >
        <View style={styles.content}>
          <Text style={styles.date}>
            {format(new Date(journey.start_time), "MMMM do, yyyy")}
          </Text>
          <Text style={styles.title}>{journey.title || "Untold Fragment"}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MapPin size={20} color="#718096" />
              <View>
                <Text style={styles.statValue}>
                  {(journey.distance_meters / 1000).toFixed(2)} km
                </Text>
                <Text style={styles.statLabel}>Traversed</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={20} color="#718096" />
              <View>
                <Text style={styles.statValue}>
                  {formatDuration(journey.duration_seconds)}
                </Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Enscribed Memory</Text>
          <View style={styles.memoryContainer}>
            <Text style={styles.memoryText}>
              "{journey.memory_text || "No words were written for this day."}"
            </Text>
          </View>

          <View
            style={[
              styles.reflectionPrompt,
              { marginBottom: Math.max(insets.bottom, 40) },
            ]}
          >
            <Text style={styles.promptText}>
              A fragment of time from{" "}
              {format(new Date(journey.start_time), "PP")}.
            </Text>
          </View>
        </View>
      </ImageBackground>
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
    backgroundColor: "#F7F7F2",
  },
  loadingText: {
    marginTop: 16,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
    fontSize: 16,
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
    left: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentParchment: {
    marginTop: -30,
    minHeight: 500,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  parchmentImage: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  content: {
    padding: 32,
  },
  date: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: "#2D3748",
    marginBottom: 32,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    lineHeight: 40,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.4)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statValue: {
    fontSize: 18,
    color: "#2D3748",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(226, 232, 240, 0.8)",
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  memoryContainer: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: "#2F4F4F",
  },
  memoryText: {
    fontSize: 20,
    fontStyle: "italic",
    color: "#2D3748",
    lineHeight: 32,
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  reflectionPrompt: {
    alignItems: "center",
    marginTop: 20,
  },
  promptText: {
    color: "#A0AEC0",
    fontSize: 14,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
});
