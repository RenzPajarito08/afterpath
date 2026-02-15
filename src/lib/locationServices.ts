import { showErrorAlert } from "../utils/alertHelper";
import { Coordinate } from "./geometry";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Google Maps Roads API limit is 100 points per request
const BATCH_SIZE = 100;

export async function snapToRoads(
  coordinates: Coordinate[],
): Promise<Coordinate[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    showErrorAlert(
      "Google Maps API Key is missing at runtime. Skipping Snap to Roads.",
      "Roads API Error",
    );
    console.warn("Google Maps API Key is missing. Skipping Snap to Roads.");
    return coordinates;
  }

  if (coordinates.length === 0) return [];

  const snappedCoordinates: Coordinate[] = [];

  // Process in batches with overlapping to prevent gaps at seams
  // The API limit is 100 points. We'll use 100 points, but for subsequent batches
  // we start from the last point of the previous batch to provide context.

  for (let i = 0; i < coordinates.length; i += BATCH_SIZE - 1) {
    if (i >= coordinates.length) break;

    const end = Math.min(i + BATCH_SIZE, coordinates.length);
    const batch = coordinates.slice(i, end);

    // If the batch is too small (e.g. just 1 point overlapping), skip it unless it's the only content
    if (batch.length < 2 && coordinates.length > 1) break;
    const path = batch.map((c) => `${c.latitude},${c.longitude}`).join("|");

    try {
      console.log(`[SnapToRoads] Requesting batch ${i / BATCH_SIZE + 1}...`);
      const response = await fetch(
        `https://roads.googleapis.com/v1/snapToRoads?path=${path}&interpolate=true&key=${GOOGLE_MAPS_API_KEY}`,
      );

      console.log(`[SnapToRoads] Response status: ${response.status}`);
      const data = await response.json();
      console.log(
        `[SnapToRoads] Data received:`,
        JSON.stringify(data).substring(0, 200) + "...",
      );

      if (data.snappedPoints) {
        // Reconstruct coordinates with timestamps
        const batchSnapped: Coordinate[] = [];

        data.snappedPoints.forEach((point: any, index: number) => {
          // If this is NOT the first batch AND this is the first point returned,
          // skip it to avoid duplicating the point we used for overlap context.
          if (i > 0 && index === 0) return;

          let timestamp = 0;

          if (point.originalIndex !== undefined) {
            // Direct match to original point
            timestamp = batch[point.originalIndex].timestamp;
          } else {
            // Interpolated point. We need to estimate timestamp.
            // Find previous known timestamp
            let prevTime = 0;
            let nextTime = 0;
            let prevIdx = -1;
            let nextIdx = -1;

            // Look backwards in THIS batch of snapped points
            for (let j = index - 1; j >= 0; j--) {
              if (data.snappedPoints[j].originalIndex !== undefined) {
                prevIdx = j;
                prevTime = batch[data.snappedPoints[j].originalIndex].timestamp;
                break;
              }
            }

            // Look forwards
            for (let j = index + 1; j < data.snappedPoints.length; j++) {
              if (data.snappedPoints[j].originalIndex !== undefined) {
                nextIdx = j;
                nextTime = batch[data.snappedPoints[j].originalIndex].timestamp;
                break;
              }
            }

            // If we are between two original points, interpolate
            if (prevIdx !== -1 && nextIdx !== -1) {
              const totalSteps = nextIdx - prevIdx;
              const currentStep = index - prevIdx;
              const timeDiff = nextTime - prevTime;
              timestamp = Math.round(
                prevTime + (timeDiff * currentStep) / totalSteps,
              );
            } else if (prevIdx !== -1 && nextIdx === -1) {
              // Trailing interpolated point - use last known
              timestamp = prevTime;
            } else if (nextIdx !== -1 && prevIdx === -1) {
              // Leading interpolated point - use next known
              timestamp = nextTime;
            }
          }

          batchSnapped.push({
            latitude: point.location.latitude,
            longitude: point.location.longitude,
            timestamp: timestamp,
          });
        });

        snappedCoordinates.push(...batchSnapped);
      } else {
        console.warn("Snap to Roads API returned no points:", data);
        // Fallback: keep original points for this batch if snapping fails
        snappedCoordinates.push(...batch);
      }
    } catch (error) {
      console.error("Error snapping to roads:", error);
      // Fallback: keep original points
      snappedCoordinates.push(...batch);
    }
  }

  return snappedCoordinates;
}
