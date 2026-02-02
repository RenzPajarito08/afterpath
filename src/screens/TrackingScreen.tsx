import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pause, Play, Square } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDistance, useJourneyTracker } from "../hooks/useJourneyTracker";
import { retroMapStyle } from "../lib/mapStyles";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Tracking">;

export default function TrackingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { activityType } = route.params;
  const [isSaving, setIsSaving] = useState(false);
  const mapRef = useRef<MapView>(null);

  const {
    locationPermission,
    isTracking,
    routeCoordinates,
    distance,
    duration,
    currentLocation,
    togglePause,
    stopTracking,
    speed,
    maxSpeed,
  } = useJourneyTracker();

  // Animate map to new location
  useEffect(() => {
    if (currentLocation) {
      mapRef.current?.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [currentLocation]);

  const handleEndJourney = async () => {
    stopTracking();

    Alert.alert(
      "Chronicle Complete",
      `Your path covered ${(distance / 1000).toFixed(2)} km over ${formatDuration(duration)}.`,
      [
        {
          text: "Enscribe Memory",
          onPress: async () => {
            setIsSaving(true);
            try {
              let finalCoordinates = routeCoordinates;

              try {
                if (routeCoordinates.length > 5) {
                  const { snapToRoads } =
                    await import("../lib/locationServices");
                  const snapped = await snapToRoads(routeCoordinates);
                  if (snapped.length > 0) {
                    finalCoordinates = snapped;
                  }
                }
              } catch (e) {
                console.log("Failed to snap path: ", e);
              }

              let finalDistance = distance;
              if (finalCoordinates !== routeCoordinates) {
                // If we have snapped coordinates, we should recalculate the distance
                // We need getDistance exposed or copied. I exported it from the hook file.
                finalDistance = 0;
                for (let i = 0; i < finalCoordinates.length - 1; i++) {
                  finalDistance += getDistance(
                    finalCoordinates[i],
                    finalCoordinates[i + 1],
                  );
                }
              }

              navigation.navigate("Summary", {
                distance: finalDistance,
                duration,
                coordinates: finalCoordinates,
                activityType: activityType,
                maxSpeed,
              });
            } catch (e) {
              console.log("Failed to end journey: ", e);
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
    );
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (locationPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Navigation permission required for the path.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        customMapStyle={retroMapStyle}
        showsUserLocation
        followsUserLocation
      >
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#2F4F4F"
          strokeWidth={5}
        />
      </MapView>

      <View style={[styles.overlay, { bottom: Math.max(insets.bottom, 20) }]}>
        <ImageBackground
          source={require("../../assets/parchment_texture.png")}
          style={styles.statsCard}
          imageStyle={styles.cardParchment}
          resizeMode="cover"
        >
          <View style={styles.statItem}>
            <Text style={styles.unitText}>km</Text>
            <Text style={styles.smallStatValue}>
              {(distance / 1000).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.unitText}>km/h</Text>
            <Text style={styles.statValue}>{speed}</Text>
            <Text style={styles.statLabel}>Speed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.unitText}>journey</Text>
            <Text style={styles.smallStatValue}>
              {formatDuration(duration)}
            </Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </ImageBackground>

        <View style={styles.controls}>
          <TouchableOpacity onPress={togglePause} activeOpacity={0.8}>
            <ImageBackground
              source={require("../../assets/parchment_texture.png")}
              style={[styles.sealButton, styles.playPauseSeal]}
              imageStyle={styles.sealParchment}
            >
              {isTracking ? (
                <Pause size={32} color="#2F4F4F" />
              ) : (
                <Play size={32} color="#2F4F4F" />
              )}
            </ImageBackground>
          </TouchableOpacity>

          {!isTracking && duration > 0 && (
            <TouchableOpacity onPress={handleEndJourney} activeOpacity={0.8}>
              <View style={[styles.sealButton, styles.stopSeal]}>
                <Square size={28} color="#F7F7F2" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isSaving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2F4F4F" />
          <Text style={styles.loadingText}>Annotating Map...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  errorText: {
    marginTop: 100,
    textAlign: "center",
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 24,
    alignSelf: "stretch",
    justifyContent: "space-around",
    marginBottom: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden", // Ensure children/background don't bleed out
  },
  cardParchment: {
    borderRadius: 24,
    opacity: 0.95,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "300",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    fontVariant: ["tabular-nums"],
  },
  smallStatValue: {
    fontSize: 20,
    fontWeight: "300",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    fontVariant: ["tabular-nums"],
  },
  unitText: {
    fontSize: 10,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
    textTransform: "lowercase",
  },
  statLabel: {
    fontSize: 10,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignSelf: "center",
  },
  controls: {
    flexDirection: "row",
    gap: 32,
    alignItems: "center",
  },
  sealButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 3,
  },
  sealParchment: {
    borderRadius: 42,
  },
  playPauseSeal: {
    borderColor: "#8B7355", // Bronze/Gold border
  },
  stopSeal: {
    backgroundColor: "#2F4F4F", // Forest Green
    borderColor: "rgba(255,255,255,0.2)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(247, 247, 242, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    color: "#2F4F4F",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
    fontSize: 16,
  },
});
