// src/Features/Apis/Services.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TPricingType = "fixed" | "hourly" | "contact";

export type TService = {
  id: string;
  title: string;
  slug: string;
  description: string;
  iconName: string | null;
  pricingType: TPricingType;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TServiceFilters = {
  pricingType?: TPricingType;
  isAvailable?: boolean;
  search?: string;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type TCreateServiceInput = {
  title: string;
  description: string;
  iconName?: string | null;
  pricingType?: TPricingType;
  isAvailable?: boolean;
};

export type TUpdateServiceInput = Partial<TCreateServiceInput>;

export interface ServicesApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API — same style as the other slices
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/services`,
    credentials: "include",
  }),
  tagTypes: ["Service"],

  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC — LIST  (GET /api/services)
    // ==========================================
    getServices: builder.query<{ data: TService[] }, TServiceFilters | void>({
      query: (filters) => ({
        url: "/",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Service" as const,
                id,
              })),
              { type: "Service", id: "LIST" },
            ]
          : [{ type: "Service", id: "LIST" }],
    }),

    // ==========================================
    // PUBLIC — BY SLUG  (GET /api/services/slug/:slug)
    // ==========================================
    getServiceBySlug: builder.query<{ data: TService }, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Service", id: `slug-${slug}` }],
    }),

    // ==========================================
    // PUBLIC — BULK BY IDS  (GET /api/services/bulk?ids=id1,id2)
    // ==========================================
    getServicesBulk: builder.query<{ data: TService[] }, string[]>({
      query: (ids) => ({
        url: "/bulk",
        params: { ids: ids.join(",") },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Service" as const,
                id,
              })),
              { type: "Service", id: "LIST" },
            ]
          : [{ type: "Service", id: "LIST" }],
    }),

    // ==========================================
    // ADMIN — GET BY ID  (GET /api/services/:id)
    // ==========================================
    getServiceById: builder.query<{ data: TService }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Service", id }],
    }),

    // ==========================================
    // ADMIN — CREATE  (POST /api/services)
    // ==========================================
    createService: builder.mutation<
      { message: string; data: TService },
      TCreateServiceInput
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Service", id: "LIST" }],
    }),

    // ==========================================
    // ADMIN — UPDATE  (PUT /api/services/:id)
    // ==========================================
    updateService: builder.mutation<
      { message: string; data: TService },
      { id: string; updates: TUpdateServiceInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Service", id },
        { type: "Service", id: "LIST" },
      ],
    }),

    // ==========================================
    // ADMIN — TOGGLE AVAILABILITY  (PATCH /api/services/:id/availability)
    // ==========================================
    toggleServiceAvailability: builder.mutation<
      { message: string; data: TService },
      string
    >({
      query: (id) => ({
        url: `/${id}/availability`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Service", id },
        { type: "Service", id: "LIST" },
      ],
    }),

    // ==========================================
    // ADMIN — DELETE  (DELETE /api/services/:id)
    // ==========================================
    deleteService: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Service", id },
        { type: "Service", id: "LIST" },
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetServicesQuery,
  useLazyGetServicesQuery,
  useGetServiceBySlugQuery,
  useLazyGetServiceBySlugQuery,
  useGetServicesBulkQuery,
  useLazyGetServicesBulkQuery,
  useGetServiceByIdQuery,
  useLazyGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useToggleServiceAvailabilityMutation,
  useDeleteServiceMutation,
} = servicesApi;

// ==========================================
// ERROR HELPER
// ==========================================
export const getServiceErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as ServicesApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};