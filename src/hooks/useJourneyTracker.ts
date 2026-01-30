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

const HAAVERSINE_R = 6371e3; // Earth radius in meters

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

  return HAAVERSINE_R * c;
}

export const useJourneyTracker = () => {
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0); // in meters
  const [duration, setDuration] = useState(0); // in seconds
  const [maxSpeed, setMaxSpeed] = useState(0); // in meters/second
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedDuration, setAccumulatedDuration] = useState(0); // in seconds

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MIN_DISTANCE_THRESHOLD = 10; // meters
  const MIN_ACCURACY_THRESHOLD = 15; // meters
  const INITIAL_ACCURACY_THRESHOLD = 50; // meters
  const MAX_SPEED_THRESHOLD = 35; // meters per second

  const handleNewLocation = useCallback(
    (newLocation: Location.LocationObject) => {
      // 1. Filter out points with poor accuracy
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
            "Ignored point due to poor accuracy:",
            newLocation.coords.accuracy,
            "Threshold:",
            accuracyThreshold,
          );
          return prevCoords;
        }

        const { latitude, longitude } = newLocation.coords;
        const newCoord: Coordinate = {
          latitude,
          longitude,
          timestamp: newLocation.timestamp,
        };

        setCurrentLocation(newLocation);

        const lastCoord = prevCoords[prevCoords.length - 1];
        if (lastCoord) {
          // 2. Filter out duplicate timestamps or identical coordinates
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
              console.log(
                "Ignored point due to impossible speed:",
                speed,
                "m/s",
              );
              return prevCoords;
            }

            setMaxSpeed((prev) => Math.max(prev, speed));
          }

          setDistance((d) => d + dist);
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
  }, []); // Empty dependency array as we want this to run once on mount

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

  return {
    locationPermission,
    isTracking,
    routeCoordinates,
    distance,
    duration,
    currentLocation,
    togglePause,
    stopTracking,
    speed:
      distance > 0 ? (distance / 1000 / (duration / 3600)).toFixed(2) : "0.00",
    maxSpeed,
  };
};
