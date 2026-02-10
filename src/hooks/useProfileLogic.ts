import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { showErrorAlert } from "../utils/alertHelper";

export const useProfileLogic = () => {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalDistance: "0",
    questsCompleted: "0",
    timeInMotion: "0",
    highestPace: "0",
    avgRhythm: "0",
    activeSince: "",
  });

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    avatarUrl: "",
  });

  const getProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch Profile Data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`username, first_name, last_name, created_at, avatar_url`)
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setUserData({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          username: profileData.username || "",
          avatarUrl: profileData.avatar_url || "",
        });

        // Format Active Since (Year)
        if (profileData.created_at || user.created_at) {
          const date = new Date(profileData.created_at || user.created_at);
          setStats((prev) => ({
            ...prev,
            activeSince: date.getFullYear().toString(),
          }));
        }
      }

      // Fetch User Statistics
      const { data: statsData, error: statsError } = await supabase
        .from("user_statistics")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (statsData) {
        // Formats
        const totalDistKm = (statsData.total_distance_meters / 1000).toFixed(1);
        const totalJourneys = statsData.total_journeys.toString();
        const timeInHrs = (statsData.total_duration_seconds / 3600).toFixed(1);
        const maxSpeedKmh = (statsData.max_speed * 3.6).toFixed(1);

        // Average Rhythm (Speed km/h) = Total Dist / Total Time
        let avgSpeedKmh = "0.0";
        if (statsData.total_duration_seconds > 0) {
          const distKm = statsData.total_distance_meters / 1000;
          const timeHr = statsData.total_duration_seconds / 3600;
          avgSpeedKmh = (distKm / timeHr).toFixed(1);
        }

        setStats((prev) => ({
          ...prev,
          totalDistance: `${totalDistKm} km`,
          questsCompleted: totalJourneys,
          timeInMotion: `${timeInHrs} Hrs`,
          highestPace: `${maxSpeedKmh} km/h`,
          avgRhythm: `${avgSpeedKmh} km/h`,
        }));
      }
    } catch (error: any) {
      console.log("Error loading profile", error.message);
      showErrorAlert(error.message, "Load Error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (user && isFocused) {
      getProfile();
    }
  }, [user, isFocused, getProfile]);

  return {
    user,
    loading,
    ...userData,
    stats,
    refreshing,
    onRefresh,
    refetch: getProfile,
  };
};
