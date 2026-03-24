"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchHomeCacheData,
  isHomeCacheExpiredOrEmpty,
} from "@/lib/redux/slices/homeSlice";

export function useHomeCache() {
  const dispatch = useAppDispatch();
  const home = useAppSelector((state) => state.home);
  const shouldRefetch = isHomeCacheExpiredOrEmpty(home);

  const refetch = useCallback(() => {
    dispatch(fetchHomeCacheData());
  }, [dispatch]);

  return {
    footer: home.footer,
    categories: home.categories,
    governorates: home.governorates,
    cities: home.cities,
    loading: home.loading,
    error: home.error,
    refetch,
    isExpiredOrEmpty: shouldRefetch,
  };
}
