import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface JourneyData {
  distance: number;
  duration: number;
  coordinates: { latitude: number; longitude: number; timestamp?: number }[];
  activityType: string;
  maxSpeed?: number;
}

export const useSummaryLogic = (navigation: any) => {
  const { user } = useAuth();
  const [memory, setMemory] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(
    async (data: JourneyData) => {
      if (!user) return;
      setSaving(true);

      try {
        const polylineString = JSON.stringify(data.coordinates);

        const { error } = await supabase.from("journeys").insert({
          user_id: user.id,
          distance_meters: data.distance,
          duration_seconds: data.duration,
          polyline: polylineString,
          memory_text: memory,
          activity_type: data.activityType,
          max_speed: data.maxSpeed || 0,
          start_time: new Date(
            data.coordinates[0]?.timestamp || Date.now(),
          ).toISOString(),
          end_time: new Date().toISOString(),
          title: "Journey on " + new Date().toLocaleDateString(),
          mood_score: 5,
        });

        if (error) throw error;

        Alert.alert(
          "Memory Enscribed",
          "Your journey has been woven into time.",
          [
            {
              text: "Farewell",
              onPress: () =>
                navigation.navigate("MainTabs", { screen: "HomeTab" }),
            },
          ],
        );
      } catch (e: any) {
        Alert.alert("Error saving memory", e.message);
      } finally {
        setSaving(false);
      }
    },
    [user, memory, navigation],
  );

  return {
    memory,
    setMemory,
    saving,
    handleSave,
  };
};
