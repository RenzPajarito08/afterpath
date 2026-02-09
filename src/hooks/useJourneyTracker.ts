import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import {
  LOCATION_TRACKING_TASK,
  LOCATION_UPDATED_EVENT,
} from "../lib/locationTasks";
import { showErrorAlert } from "../utils/alertHelper";

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
  const [status, setStatus] = useState({
    locationPermission: null as boolean | null,
    isTracking: false,
    startTime: null as number | null,
    accumulatedDuration: 0,
  });

  const [metrics, setMetrics] = useState({
    distance: 0, // meters
    duration: 0, // seconds
    maxSpeed: 0, // m/s
    smoothedSpeed: 0, // m/s
  });

  const [locationData, setLocationData] = useState({
    routeCoordinates: [] as Coordinate[],
    currentLocation: null as Location.LocationObject | null,
  });

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationTime = useRef<number>(0);
  const latestInstantSpeed = useRef<number>(0);

  const MIN_DISTANCE_THRESHOLD = 5;
  const MIN_ACCURACY_THRESHOLD = 12;
  const INITIAL_ACCURACY_THRESHOLD = 30;
  const MAX_SPEED_THRESHOLD = 50;
  const SPEED_DISCREPANCY_THRESHOLD = 7;
  const SMOOTHING_ALPHA = 0.25;
  const DECAY_THRESHOLD_MS = 10000;

  const handleNewLocation = useCallback(
    (newLocation: Location.LocationObject) => {
      setLocationData((prev) => {
        const prevCoords = prev.routeCoordinates;
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
          return prev;
        }

        const { latitude, longitude } = newLocation.coords;
        const newCoord: Coordinate = {
          latitude,
          longitude,
          timestamp: newLocation.timestamp,
        };

        const lastCoord = prevCoords[prevCoords.length - 1];

        if (lastCoord && newCoord.timestamp <= lastCoord.timestamp) {
          console.log("Ignored out-of-order timestamp");
          return prev;
        }

        if (lastCoord) {
          if (
            lastCoord.latitude === newCoord.latitude &&
            lastCoord.longitude === newCoord.longitude
          ) {
            return prev;
          }

          const dist = getDistance(lastCoord, newCoord);
          const timeDelta = (newCoord.timestamp - lastCoord.timestamp) / 1000;

          if (timeDelta <= 0) return prev;

          const calculatedSpeed = dist / timeDelta;

          if (dist < MIN_DISTANCE_THRESHOLD) {
            console.log(`Ignored small movement: ${dist.toFixed(1)}m`);
            return prev;
          }

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
              return prev;
            }
            instantSpeed = providedSpeed;
          }

          if (calculatedSpeed > MAX_SPEED_THRESHOLD) {
            console.log(
              `Ignored impossible speed: ${calculatedSpeed.toFixed(1)} m/s`,
            );
            return prev;
          }

          setMetrics((m) => ({
            ...m,
            distance: m.distance + dist,
            maxSpeed: Math.max(m.maxSpeed, instantSpeed),
          }));
          latestInstantSpeed.current = instantSpeed;
          lastLocationTime.current = Date.now();
        }

        return {
          routeCoordinates: [...prevCoords, newCoord],
          currentLocation: newLocation,
        };
      });
    },
    [],
  );

  const startTracking = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isTracking: true, startTime: Date.now() }));

    try {
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) {
        const timeDiff = Date.now() - lastKnown.timestamp;
        if (timeDiff < 2 * 60 * 1000) {
          handleNewLocation(lastKnown);
        }
      }
    } catch (e) {
      console.log("Failed to get last known location", e);
    }

    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 3,
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
          timeInterval: 1000,
          distanceInterval: 3,
          foregroundService: {
            notificationTitle: "Navigating the Path",
            notificationBody:
              "Afterpath is tracing your chronicle in the background",
            notificationColor: "#2F4F4F",
          },
        });
      }
    } catch (err: any) {
      showErrorAlert(err.message, "Tracking Error");
    }
  }, [handleNewLocation]);

  const stopTracking = useCallback(async () => {
    setStatus((prev) => {
      const { isTracking, startTime, accumulatedDuration } = prev;
      let newDuration = metrics.duration;
      let newAcc = accumulatedDuration;

      if (isTracking && startTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        newAcc = accumulatedDuration + elapsed;
        newDuration = newAcc;
      }

      setMetrics((m) => ({ ...m, duration: newDuration }));

      return {
        ...prev,
        isTracking: false,
        startTime: null,
        accumulatedDuration: newAcc,
      };
    });

    try {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    } catch (e) {
      console.error("Error stopping tracking:", e);
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [metrics.duration]);

  const togglePause = useCallback(() => {
    if (status.isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [status.isTracking, stopTracking, startTracking]);

  useEffect(() => {
    (async () => {
      try {
        let { status: foregroundStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== "granted") {
          showErrorAlert("Permission to access location was denied");
          setStatus((prev) => ({ ...prev, locationPermission: false }));
          return;
        }

        let { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== "granted") {
          showErrorAlert(
            "Background location permission denied",
            "The app will only track your journey while it's in the foreground.",
          );
        }

        setStatus((prev) => ({ ...prev, locationPermission: true }));
        startTracking();
      } catch (err: any) {
        showErrorAlert(err.message);
      }
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
    if (status.isTracking && status.startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - (status.startTime || 0)) / 1000);

        setMetrics((m) => {
          const timeSinceLast = now - lastLocationTime.current;
          let newSmoothed = m.smoothedSpeed;
          let currentInstant = latestInstantSpeed.current;

          if (timeSinceLast > DECAY_THRESHOLD_MS) {
            currentInstant = 0;
            newSmoothed = m.smoothedSpeed * 0.85;
          }

          newSmoothed =
            SMOOTHING_ALPHA * currentInstant +
            (1 - SMOOTHING_ALPHA) * newSmoothed;

          return {
            ...m,
            duration: status.accumulatedDuration + elapsed,
            smoothedSpeed: newSmoothed,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status.isTracking, status.startTime, status.accumulatedDuration]);

  return {
    locationPermission: status.locationPermission,
    isTracking: status.isTracking,
    routeCoordinates: locationData.routeCoordinates,
    distance: metrics.distance,
    duration: metrics.duration,
    currentLocation: locationData.currentLocation,
    togglePause,
    stopTracking,
    speed: (metrics.smoothedSpeed * 3.6).toFixed(2),
    maxSpeed: metrics.maxSpeed,
  };
};
