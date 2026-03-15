"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface FooterSettings {
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export interface HomeCacheState {
  footer: FooterSettings;
  categories: unknown[];
  governorates: unknown[];
  cities: unknown[];
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: HomeCacheState = {
  footer: {},
  categories: [],
  governorates: [],
  cities: [],
  fetchedAt: null,
  loading: false,
  error: null,
};
async function get(url: string) {
  const URL = `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  const res = await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });
  const json = res.json();
  return json;
}

export const fetchHomeCacheData = createAsyncThunk(
  "home/fetchCache",
  async (_, { rejectWithValue }) => {
    try {
      const [titleAr, titleEn, descAr, descEn, categoriesRes, governoratesRes, citiesRes] =
        await Promise.all([
          get("/general/settings/footer-title-ar"),
          get("/general/settings/footer-title-en"),
          get("/general/settings/footer-description-ar"),
          get("/general/settings/footer-description-en"),
          get("/user/categories"),
          get("/user/governorates"),
          get("/user/cities"),
        ]);


      const getValue = (res: { data?: { value?: string; data?: { value?: string } } }) =>
        res.data && typeof res.data === "object"
          ? (res.data as { value?: string }).value ?? (res.data as { data?: { value?: string } }).data?.value
          : undefined;

      const footer: FooterSettings = {
        titleAr: getValue(titleAr as { data?: { value?: string; data?: { value?: string } } }),
        titleEn: getValue(titleEn as { data?: { value?: string; data?: { value?: string } } }),
        descriptionAr: getValue(descAr as { data?: { value?: string; data?: { value?: string } } }),
        descriptionEn: getValue(descEn as { data?: { value?: string; data?: { value?: string } } }),
      };

      const toArray = (res: unknown): unknown[] => {
        const d = (res as { data?: unknown })?.data;
        return Array.isArray(d) ? d : [];
      };

      const categories = toArray(categoriesRes);
      const governorates = toArray(governoratesRes);
      const cities = toArray(citiesRes);

      const payload = {
        footer,
        categories,
        governorates,
        cities,
        fetchedAt: Date.now(),
      };
      return payload;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load home cache";
      return rejectWithValue(message);
    }
  }
);

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    clearHomeCache: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeCacheData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchHomeCacheData.fulfilled,
        (state, action: PayloadAction<{ footer: FooterSettings; categories: unknown[]; governorates: unknown[]; cities: unknown[]; fetchedAt: number }>) => {
          state.footer = action.payload.footer;
          state.categories = action.payload.categories;
          state.governorates = action.payload.governorates;
          state.cities = action.payload.cities;
          state.fetchedAt = action.payload.fetchedAt;
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(fetchHomeCacheData.rejected, (state, action) => {
        const errorMsg = (action.payload as string) || "Unknown error";
        state.loading = false;
        state.error = errorMsg;
      });
  },
});

export const { clearHomeCache } = homeSlice.actions;
export default homeSlice.reducer;

/** Check if cache is empty or older than TTL */
export function isHomeCacheExpiredOrEmpty(state: HomeCacheState): boolean {
  if (!state.fetchedAt) {
    return true;
  }
  const isEmpty =
    state.categories.length === 0 &&
    state.governorates.length === 0 &&
    state.cities.length === 0 &&
    !state.footer.titleAr &&
    !state.footer.titleEn;
  if (isEmpty) {
    return true;
  }
  const expired = Date.now() - state.fetchedAt > CACHE_TTL_MS;
  if (expired) {
    console.info("[homeSlice] isHomeCacheExpiredOrEmpty: true (TTL expired)", {
      ageMs: Date.now() - state.fetchedAt,
      ttlMs: CACHE_TTL_MS,
    });
  }
  return expired;
}

export const CACHE_TTL_MS_EXPORT = CACHE_TTL_MS;
