import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, DeviceEventEmitter } from "react-native";
import {
  LOCATION_TRACKING_TASK,
  LOCATION_UPDATED_EVENT,
} from "../lib/locationTasks";

export interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const HAVERSINE_R = 6371e3; // Earth radius in meters

export function getDistance(coord1: Coordinate, coord2: Coordinate) {
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

  return HAVERSINE_R * c;
}

export const useJourneyTracker = () => {
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0); // meters
  const [duration, setDuration] = useState(0); // seconds
  const [maxSpeed, setMaxSpeed] = useState(0); // m/s
  const [smoothedSpeed, setSmoothedSpeed] = useState(0); // m/s, for display
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedDuration, setAccumulatedDuration] = useState(0);

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationTime = useRef<number>(0); // for decay

  const MIN_DISTANCE_THRESHOLD = 8; // meters
  const MIN_ACCURACY_THRESHOLD = 12; // meters
  const INITIAL_ACCURACY_THRESHOLD = 30; // meters, more lenient for first fix
  const MAX_SPEED_THRESHOLD = 50; // m/s (~180 km/h, very safe)
  const SPEED_DISCREPANCY_THRESHOLD = 7; // m/s (~25 km/h)
  const SMOOTHING_ALPHA = 0.18; // lower = smoother, higher = more responsive
  const DECAY_THRESHOLD_MS = 15000; // start decaying after 15s no valid fix

  const handleNewLocation = useCallback(
    (newLocation: Location.LocationObject) => {
      setRouteCoordinates((prevCoords) => {
        const isFirstPoint = prevCoords.length === 0;
        const accuracyThreshold = isFirstPoint
          ? INITIAL_ACCURACY_THRESHOLD
          : MIN_ACCURACY_THRESHOLD;

        if (
          newLocation.coords.accuracy &&
          newLocation.coords.accuracy > accuracyThreshold
        ) {
          console.log(
            `Ignored poor accuracy: ${newLocation.coords.accuracy}m > ${accuracyThreshold}m`,
          );
          return prevCoords;
        }

        setCurrentLocation(newLocation);

        const { latitude, longitude } = newLocation.coords;
        const newCoord: Coordinate = {
          latitude,
          longitude,
          timestamp: newLocation.timestamp,
        };

        const lastCoord = prevCoords[prevCoords.length - 1];

        // Timestamp ordering (defensive)
        if (lastCoord && newCoord.timestamp <= lastCoord.timestamp) {
          console.log("Ignored out-of-order timestamp");
          return prevCoords;
        }

        if (lastCoord) {
          // Duplicate coordinate check
          if (
            lastCoord.latitude === newCoord.latitude &&
            lastCoord.longitude === newCoord.longitude
          ) {
            return prevCoords;
          }

          const dist = getDistance(lastCoord, newCoord);
          const timeDelta = (newCoord.timestamp - lastCoord.timestamp) / 1000;

          if (timeDelta <= 0) return prevCoords;

          const calculatedSpeed = dist / timeDelta;

          // Min distance filter (noise/drift)
          if (dist < MIN_DISTANCE_THRESHOLD) {
            console.log(`Ignored small movement: ${dist.toFixed(1)}m`);
            return prevCoords;
          }

          // Provided speed cross-validation
          let instantSpeed = calculatedSpeed;
          if (
            newLocation.coords.speed != null &&
            newLocation.coords.speed >= 0
          ) {
            const providedSpeed = newLocation.coords.speed;
            const discrepancy = Math.abs(providedSpeed - calculatedSpeed);
            if (discrepancy > SPEED_DISCREPANCY_THRESHOLD) {
              console.log(
                `Ignored speed discrepancy: calculated ${calculatedSpeed.toFixed(
                  1,
                )} m/s, provided ${providedSpeed.toFixed(1)} m/s`,
              );
              return prevCoords;
            }
            instantSpeed = providedSpeed; // prefer device-provided
          }

          // Absolute speed sanity (uses calculated — catches impossible even if provided missing)
          if (calculatedSpeed > MAX_SPEED_THRESHOLD) {
            console.log(
              `Ignored impossible speed: ${calculatedSpeed.toFixed(1)} m/s`,
            );
            return prevCoords;
          }

          // All filters passed → accept point
          setDistance((d) => d + dist);
          setMaxSpeed((prev) => Math.max(prev, instantSpeed));
          setSmoothedSpeed(
            (prev) =>
              SMOOTHING_ALPHA * instantSpeed + (1 - SMOOTHING_ALPHA) * prev,
          );
          lastLocationTime.current = Date.now();
        }

        return [...prevCoords, newCoord];
      });
    },
    [],
  );

  const startTracking = useCallback(async () => {
    setIsTracking(true);
    setStartTime(Date.now());

    // OPTIMIZATION: Try to get the last known location immediately
    try {
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) {
        const timeDiff = Date.now() - lastKnown.timestamp;
        if (timeDiff < 2 * 60 * 1000) {
          console.log("Using last known location for quick start");
          handleNewLocation(lastKnown);
        }
      }
    } catch (e) {
      console.log("Failed to get last known location", e);
    }

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
  }, [handleNewLocation]);

  const stopTracking = useCallback(async () => {
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
  }, [isTracking, startTime, accumulatedDuration]);

  const togglePause = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, stopTracking, startTracking]);

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

        // Decay smoothed speed if no recent valid fixes
        const timeSinceLast = now - lastLocationTime.current;
        if (timeSinceLast > DECAY_THRESHOLD_MS) {
          setSmoothedSpeed((prev) => prev * 0.95);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, startTime, accumulatedDuration]);

  return {
    locationPermission,
    isTracking,
    routeCoordinates,
    distance,
    duration,
    currentLocation,
    togglePause,
    stopTracking,
    speed: (smoothedSpeed * 3.6).toFixed(2), // stable current speed in km/h
    maxSpeed, // m/s, now cleaner
  };
};
