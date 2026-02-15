import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

interface Journey {
  id: string;
  title: string;
  distance_meters: number;
  duration_seconds: number;
  created_at: string;
  start_time: string;
}

interface HomeStats {
  totalDistance: number;
  totalJourneys: number;
}

export const useHomeLogic = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<HomeStats>({
    totalDistance: 0,
    totalJourneys: 0,
  });
  const [recentJourneys, setRecentJourneys] = useState<Journey[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch Stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_statistics")
        .select("total_distance_meters, total_journeys")
        .eq("user_id", user.id)
        .single();

      if (!statsError && statsData) {
        setStats({
          totalDistance: statsData.total_distance_meters || 0,
          totalJourneys: statsData.total_journeys || 0,
        });
      } else if (statsError && statsError.code === "PGRST116") {
        // No stats found (new user), set defaults
        setStats({
          totalDistance: 0,
          totalJourneys: 0,
        });
      }

      // Fetch Recent Journeys
      const { data: recent, error: recentError } = await supabase
        .from("journeys")
        .select(
          "id, title, distance_meters, duration_seconds, created_at, start_time",
        )
        .eq("user_id", user.id)
        .order("start_time", { ascending: false })
        .limit(3);

      if (!recentError && recent) {
        setRecentJourneys(recent);
      }
    } catch (e) {
      console.error("Error fetching home data:", e);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const getSubtitle = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "A new day for adventure";
    if (hour >= 12 && hour < 17) return "The path continues forward";
    if (hour >= 17 && hour < 21) return "Recording the day's tales";
    return "Rest well, traveler";
  };

  return {
    stats,
    recentJourneys,
    refreshing,
    onRefresh,
    refetch: fetchData,
    greeting: getGreeting(),
    subtitle: getSubtitle(),
  };
};
