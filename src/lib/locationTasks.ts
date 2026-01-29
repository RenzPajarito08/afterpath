import * as TaskManager from "expo-task-manager";
import { DeviceEventEmitter } from "react-native";

export const LOCATION_TRACKING_TASK = "BACKGROUND_LOCATION_TRACKING";
export const LOCATION_UPDATED_EVENT = "BACKGROUND_LOCATION_UPDATED";

TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: any[] };
    console.log("Received new locations in background:", locations);
    DeviceEventEmitter.emit(LOCATION_UPDATED_EVENT, locations);
  }
});
