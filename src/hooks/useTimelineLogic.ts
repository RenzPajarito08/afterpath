import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface Journey {
  id: string;
  title: string;
  distance_meters: number;
  start_time: string;
}

const PAGE_SIZE = 10;

export const useTimelineLogic = () => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchJourneys = useCallback(
    async (pageNum: number, isRefreshing = false) => {
      if (!user) return;

      try {
        const from = pageNum * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
          .from("journeys")
          .select("id, title, distance_meters, start_time")
          .eq("user_id", user.id)
          .order("start_time", { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (data) {
          if (isRefreshing) {
            setJourneys(data);
          } else {
            setJourneys((prev) => [...prev, ...data]);
          }
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (e) {
        console.error("Error fetching timeline:", e);
      } finally {
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    fetchJourneys(0, true);
  }, [fetchJourneys]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJourneys(nextPage);
  }, [loadingMore, hasMore, page, fetchJourneys]);

  useEffect(() => {
    fetchJourneys(0, true);
  }, [fetchJourneys]);

  return {
    journeys,
    refreshing,
    loadingMore,
    hasMore,
    onRefresh,
    loadMore,
    refetch: onRefresh,
  };
};
