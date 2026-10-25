// src/Features/Apis/Media.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TMediaFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  publicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TMediaUsageCount = {
  totalUsages: number;
  usage: {
    projects?: { id: string; title: string; slug: string }[];
    sections?: { id: string; projectId: string; sectionTitle: string | null }[];
  };
};

export type TMediaFilters = {
  search?: string;
  fileType?: string;
  sortBy?: "createdAt" | "fileName" | "fileSize";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type TMediaPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type TMediaResponse = {
  data: TMediaFile[];
  pagination: TMediaPagination;
};

export type TCreateMediaInput = {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  publicId?: string;
};

export type TUpdateMediaInput = {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  publicId?: string;
};

export interface MediaApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const mediaApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/media`,
    credentials: "include",
  }),
  tagTypes: ["Media", "MediaUsage"],

  endpoints: (builder) => ({
    // ==========================================
    // ADMIN — LIST  (GET /api/media?page=&limit=&search=&fileType=&sortBy=&sortOrder=)
    // ==========================================
    getMediaAssets: builder.query<TMediaResponse, TMediaFilters | void>({
      query: (filters) => ({
        url: "/",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Media" as const, id })),
              { type: "Media", id: "LIST" },
            ]
          : [{ type: "Media", id: "LIST" }],
    }),

    // ==========================================
    // PUBLIC — GET BY ID  (GET /api/media/:id)
    // ==========================================
    getMediaById: builder.query<{ data: TMediaFile }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Media", id }],
    }),

    // ==========================================
    // PUBLIC — BULK BY IDS  (GET /api/media/bulk?ids=a,b)
    // ==========================================
    getMediaBulk: builder.query<{ data: TMediaFile[] }, string[]>({
      query: (ids) => ({
        url: "/bulk",
        params: { ids: ids.join(",") },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Media" as const, id })),
              { type: "Media", id: "LIST" },
            ]
          : [{ type: "Media", id: "LIST" }],
    }),

    // ==========================================
    // ADMIN — USAGE  (GET /api/media/:id/usage)
    // ==========================================
    getMediaUsage: builder.query<{ data: TMediaUsageCount }, string>({
      query: (id) => `/${id}/usage`,
      providesTags: (_r, _e, id) => [{ type: "MediaUsage", id }],
    }),

    // ==========================================
    // ADMIN — CREATE  (POST /api/media)
    // ==========================================
    createMedia: builder.mutation<
      { message: string; data: TMediaFile },
      TCreateMediaInput
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Media", id: "LIST" }],
    }),

    // ==========================================
    // ADMIN — UPDATE METADATA  (PUT /api/media/:id)
    // ==========================================
    updateMedia: builder.mutation<
      { message: string; data: TMediaFile },
      { id: string; updates: TUpdateMediaInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Media", id },
        { type: "Media", id: "LIST" },
      ],
    }),

    // ==========================================
    // ADMIN — DELETE  (DELETE /api/media/:id)
    // Automatically nulls any project thumbnail / section media that used it
    // ==========================================
    deleteMedia: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Media", id },
        { type: "Media", id: "LIST" },
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetMediaAssetsQuery,
  useLazyGetMediaAssetsQuery,
  useGetMediaByIdQuery,
  useLazyGetMediaByIdQuery,
  useGetMediaBulkQuery,
  useLazyGetMediaBulkQuery,
  useGetMediaUsageQuery,
  useLazyGetMediaUsageQuery,
  useCreateMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} = mediaApi;

// ==========================================
// ERROR HELPER
// ==========================================
export const getMediaErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as MediaApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};