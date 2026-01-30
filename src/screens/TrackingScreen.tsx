import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { Pause, Play, Square } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LOCATION_TRACKING_TASK,
  LOCATION_UPDATED_EVENT,
} from "../lib/locationTasks";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Tracking">;

export interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const HAAVERSINE_R = 6371e3; // Earth radius in meters

function getDistance(coord1: Coordinate, coord2: Coordinate) {
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return HAAVERSINE_R * c;
}

export default function TrackingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { activityType } = route.params;
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0); // in meters
  const [duration, setDuration] = useState(0); // in seconds
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedDuration, setAccumulatedDuration] = useState(0); // in seconds
  const [isSaving, setIsSaving] = useState(false);

  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      let { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        Alert.alert("Permission to access location was denied");
        setLocationPermission(false);
        return;
      }

      let { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        // We'll proceed with foreground tracking only if background is denied
        Alert.alert(
          "Background location permission denied",
          "The app will only track your journey while it's in the foreground.",
        );
      }

      setLocationPermission(true);
      startTracking();
    })();

    const subscription = DeviceEventEmitter.addListener(
      LOCATION_UPDATED_EVENT,
      (locations: Location.LocationObject[]) => {
        locations.forEach((location, index) =>
          handleNewLocation(location, index === locations.length - 1),
        );
      },
    );

    return () => {
      stopTracking();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isTracking && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setDuration(accumulatedDuration + elapsed);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, startTime, accumulatedDuration]);

  const startTracking = async () => {
    setIsTracking(true);
    setStartTime(Date.now());

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
      },
      (newLocation) => {
        handleNewLocation(newLocation);
      },
    );

    const isBackgroundStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING_TASK,
    );
    if (!isBackgroundStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
        foregroundService: {
          notificationTitle: "Navigating the Path",
          notificationBody:
            "Afterpath is tracing your chronicle in the background",
          notificationColor: "#2F4F4F",
        },
      });
    }
  };

  const MIN_DISTANCE_THRESHOLD = 10; // meters
  const MIN_ACCURACY_THRESHOLD = 15; // meters (Tightened from 25m)
  const MAX_SPEED_THRESHOLD = 35; // meters per second (~126 km/h)

  const handleNewLocation = (
    newLocation: Location.LocationObject,
    shouldAnimate = true,
  ) => {
    // 1. Filter out points with poor accuracy
    if (
      newLocation.coords.accuracy &&
      newLocation.coords.accuracy > MIN_ACCURACY_THRESHOLD
    ) {
      console.log(
        "Ignored point due to poor accuracy:",
        newLocation.coords.accuracy,
      );
      return;
    }

    const { latitude, longitude } = newLocation.coords;
    const newCoord: Coordinate = {
      latitude,
      longitude,
      timestamp: newLocation.timestamp,
    };

    setCurrentLocation(newLocation);

    setRouteCoordinates((prevCoords) => {
      const lastCoord = prevCoords[prevCoords.length - 1];
      if (lastCoord) {
        // 2. Filter out duplicate timestamps or identical coordinates
        // Removed timestamp check to avoid saving same GPS point just because time advanced
        if (
          lastCoord.latitude === newCoord.latitude &&
          lastCoord.longitude === newCoord.longitude
        ) {
          return prevCoords;
        }

        // 3. Calculate distance and time delta
        const dist = getDistance(lastCoord, newCoord);
        const timeDelta = (newCoord.timestamp - lastCoord.timestamp) / 1000; // seconds

        // 4. Filter out small movements (drift)
        if (dist < MIN_DISTANCE_THRESHOLD) {
          console.log("Ignored point due to small distance:", dist);
          return prevCoords;
        }

        // 5. Speed Filter: Ignore impossible jumps
        if (timeDelta > 0) {
          const speed = dist / timeDelta;
          if (speed > MAX_SPEED_THRESHOLD) {
            console.log("Ignored point due to impossible speed:", speed, "m/s");
            return prevCoords;
          }
        }

        setDistance((d) => d + dist);
      }
      return [...prevCoords, newCoord];
    });

    if (shouldAnimate) {
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const stopTracking = async () => {
    if (isTracking && startTime) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setAccumulatedDuration((prev) => prev + elapsed);
      setDuration(accumulatedDuration + elapsed);
    }
    setIsTracking(false);
    setStartTime(null);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleEndJourney = async () => {
    stopTracking();

    // Preliminary check to see if we have enough points to snap
    // user might cancel, so we don't snap yet.

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

              // Attempt to snap to roads if API key is present
              // We can show a small loading indicator if this takes time,
              // but for now we'll do it optimistically or block slightly.
              // Ideally this should be a proper async loading state in UI.
              try {
                // Only snap if we have significant movement to avoid API waste on empty tests
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

              // Recalculate distance if we have a new path (snapped)
              // Even if we didn't snap, we can maintain the original distance or recalc it.
              // But if we snapped, we MUST recalc to match the new visual path.
              let finalDistance = distance;
              if (finalCoordinates !== routeCoordinates) {
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

  const togglePause = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
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
            <Text style={styles.statValue}>{(distance / 1000).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Distance (km)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            <Text style={styles.statLabel}>Journey Time</Text>
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
  },
  statValue: {
    fontSize: 36,
    fontWeight: "300",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: 2,
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
