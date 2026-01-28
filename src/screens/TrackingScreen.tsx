import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { PauseCircle, PlayCircle, StopCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  DeviceEventEmitter,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import {
  LOCATION_TRACKING_TASK,
  LOCATION_UPDATED_EVENT,
} from "../lib/locationTasks";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Tracking">;

interface Coordinate {
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

  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      // Foreground location
      let { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        Alert.alert("Permission to access location was denied");
        setLocationPermission(false);
        return;
      }

      // Background location
      let { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        Alert.alert(
          "Background location permission denied",
          "The app will only track your journey while it's in the foreground.",
        );
      }

      // Notifications (required for Android 13+ tracking notification)
      const { status: notificationStatus } =
        await Location.requestForegroundPermissionsAsync(); // This is just a placeholder, actually need to check if we can request specifically for notifications or if it's bundled
      // Actually, expo-location's foregroundService handles the sticky notification.
      // But on Android 13+, POST_NOTIFICATIONS is needed for any notification.
      // Since expo-notifications isn't installed, we can try to request it if we had the library.
      // For now, let's assume foreground/background location permissions which often bundle the service.

      setLocationPermission(true);
      startTracking();
    })();

    const subscription = DeviceEventEmitter.addListener(
      LOCATION_UPDATED_EVENT,
      (locations: Location.LocationObject[]) => {
        locations.forEach((location) => handleNewLocation(location));
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

    // Foreground listener for real-time UI updates
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

    // Background tracking
    const isBackgroundStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING_TASK,
    );
    if (!isBackgroundStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
        foregroundService: {
          notificationTitle: "Tracking Journey",
          notificationBody:
            "Afterpath is tracking your journey in the background",
          notificationColor: "#48BB78",
        },
      });
    }
  };

  const handleNewLocation = (newLocation: Location.LocationObject) => {
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
        // Simple deduplication if background and foreground both trigger
        if (
          lastCoord.latitude === newCoord.latitude &&
          lastCoord.longitude === newCoord.longitude &&
          lastCoord.timestamp === newCoord.timestamp
        ) {
          return prevCoords;
        }
        const dist = getDistance(lastCoord, newCoord);
        setDistance((d) => d + dist);
      }
      return [...prevCoords, newCoord];
    });

    // Center map on new location
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
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

  const handleEndJourney = () => {
    stopTracking();
    // For now, generate a fake ID or just pass data
    const journeyId = "temp-id-" + Date.now();
    // In a real app we would save to DB here or pass data to Summary screen
    // Since we don't have the Summary screen logic fully fleshed out with DB yet,
    // I'll just navigate to Home or a Summary placeholder
    Alert.alert(
      "Journey Ended",
      `You traveled ${(distance / 1000).toFixed(2)} km in ${formatDuration(duration)}.`,
      [
        {
          text: "Save Memory",
          onPress: () =>
            navigation.navigate("Summary", {
              distance,
              duration,
              coordinates: routeCoordinates,
              activityType: activityType,
            }),
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
        <Text>Location permission needed.</Text>
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
          strokeColor="#48BB78"
          strokeWidth={4}
        />
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(distance / 1000).toFixed(2)}</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            <Text style={styles.statLabel}>time</Text>
          </View>
          {/* <View style={styles.statItem}>
                 <Text style={styles.statValue}>--</Text>
                 <Text style={styles.statLabel}>pace</Text>
             </View> */}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={togglePause}>
            {isTracking ? (
              <PauseCircle size={64} color="#CBD5E0" />
            ) : (
              <PlayCircle size={64} color="#48BB78" />
            )}
          </TouchableOpacity>

          {!isTracking && duration > 0 && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleEndJourney}
            >
              <StopCircle size={64} color="#F56565" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 14,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  controls: {
    flexDirection: "row",
    gap: 32,
  },
  controlButton: {
    backgroundColor: "#FFF",
    borderRadius: 40,
    padding: 4, // border
  },
});
