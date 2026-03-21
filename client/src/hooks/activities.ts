import { useMemo } from "react";
import { Activities, type ActivityRow } from "@/api/torii/activities";
import { useInfiniteQuery } from "@tanstack/react-query";

export type Activity = ActivityRow;

const PAGE_SIZE = 50;
const LOAD_MORE_SIZE = 10;

export const useActivities = () => {
  const query = useInfiniteQuery({
    queryKey: Activities.keys(),
    queryFn: ({ pageParam = 0 }) =>
      Activities.fetch(pageParam === 0 ? PAGE_SIZE : LOAD_MORE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const expectedSize = allPages.length === 1 ? PAGE_SIZE : LOAD_MORE_SIZE;
      if (lastPage.length < expectedSize) return undefined;
      return allPages.reduce((acc, page) => acc + page.length, 0);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const activities = useMemo(
    () => query.data?.pages.flat() ?? [],
    [query.data],
  );

  return {
    activities,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  };
};
