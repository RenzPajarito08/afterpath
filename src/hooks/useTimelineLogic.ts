import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface Journey {
  id: string;
  title: string;
  distance_meters: number;
  start_time: string;
}

export const useTimelineLogic = () => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJourneys = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("journeys")
        .select("id, title, distance_meters, start_time")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });

      if (data) setJourneys(data);
    } catch (e) {
      console.error("Error fetching timeline:", e);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJourneys();
  }, [fetchJourneys]);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  return {
    journeys,
    refreshing,
    onRefresh,
    refetch: fetchJourneys,
  };
};
