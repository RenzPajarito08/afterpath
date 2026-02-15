import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { showErrorAlert } from "../utils/alertHelper";

interface Journey {
  id: string;
  title: string;
  distance_meters: number;
  start_time: string;
  activity_type: string;
}

const PAGE_SIZE = 10;

export const useTimelineLogic = () => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [paginationState, setPaginationState] = useState({
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    page: 0,
  });

  const updatePagination = (updates: Partial<typeof paginationState>) => {
    setPaginationState((prev) => ({ ...prev, ...updates }));
  };

  const fetchJourneys = useCallback(
    async (pageNum: number, isRefreshing = false) => {
      if (!user) return;

      try {
        const from = pageNum * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
          .from("journeys")
          .select("id, title, distance_meters, start_time, activity_type")
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
          updatePagination({ hasMore: data.length === PAGE_SIZE });
        }
      } catch (e: any) {
        console.error("Error fetching timeline:", e);
        showErrorAlert(e.message || "Failed to fetch journeys");
      } finally {
        updatePagination({ refreshing: false, loadingMore: false });
      }
    },
    [user],
  );

  const onRefresh = useCallback(() => {
    updatePagination({ refreshing: true, page: 0, hasMore: true });
    fetchJourneys(0, true);
  }, [fetchJourneys]);

  const loadMore = useCallback(() => {
    if (paginationState.loadingMore || !paginationState.hasMore) return;

    updatePagination({ loadingMore: true });
    const nextPage = paginationState.page + 1;
    updatePagination({ page: nextPage });
    fetchJourneys(nextPage);
  }, [paginationState, fetchJourneys]);

  useEffect(() => {
    fetchJourneys(0, true);
  }, [fetchJourneys]);

  return {
    journeys,
    ...paginationState,
    onRefresh,
    loadMore,
    refetch: onRefresh,
  };
};
