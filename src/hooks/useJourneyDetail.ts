import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

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
  journey_images?: { id: string; image_url: string }[];
}

export const useJourneyDetail = (journeyId: string) => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJourney() {
      const { data, error } = await supabase
        .from("journeys")
        .select(
          `
          *,
          journey_images (
            id,
            image_url
          )
        `,
        )
        .eq("id", journeyId)
        .single();

      if (error) {
        Alert.alert("Error", "Could not load chronicle.");
        setLoading(false);
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
  }, [journeyId]);

  return { journey, loading };
};
