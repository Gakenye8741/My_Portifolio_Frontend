// src/Features/Apis/Technologies.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TTechnologyCategory =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "mobile"
  | "ai";

export type TTechnology = {
  id: string;
  name: string;
  category: TTechnologyCategory;
  iconName: string | null;
};

export type TTechnologyFilters = {
  category?: TTechnologyCategory;
  search?: string;
  sortBy?: "name" | "category" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type TTechnologiesGrouped = Partial<
  Record<TTechnologyCategory, TTechnology[]>
>;

export type TTechnologyUsage = {
  projects: number;
  services: number;
  hasSkill: boolean;
};

export type TCreateTechnologyInput = {
  name: string;
  category: TTechnologyCategory;
  iconName?: string | null;
};

export type TUpdateTechnologyInput = Partial<TCreateTechnologyInput>;

export interface TechnologiesApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const technologiesApi = createApi({
  reducerPath: "technologiesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/technologies`,
    credentials: "include",
  }),
  tagTypes: ["Technology", "TechnologyUsage"],

  endpoints: (builder) => ({
    // GET /api/technologies
    getTechnologies: builder.query<
      { data: TTechnology[] },
      TTechnologyFilters | void
    >({
      query: (filters) => ({
        url: "/",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Technology" as const,
                id,
              })),
              { type: "Technology", id: "LIST" },
            ]
          : [{ type: "Technology", id: "LIST" }],
    }),

    // GET /api/technologies/by-category
    getTechnologiesByCategory: builder.query<
      { data: TTechnologiesGrouped },
      void
    >({
      query: () => "/by-category",
      providesTags: [{ type: "Technology", id: "GROUPED" }],
    }),

    // GET /api/technologies/bulk?ids=a,b
    getTechnologiesBulk: builder.query<{ data: TTechnology[] }, string[]>({
      query: (ids) => ({
        url: "/bulk",
        params: { ids: ids.join(",") },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Technology" as const,
                id,
              })),
              { type: "Technology", id: "LIST" },
            ]
          : [{ type: "Technology", id: "LIST" }],
    }),

    // GET /api/technologies/:id
    getTechnologyById: builder.query<{ data: TTechnology }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Technology", id }],
    }),

    // GET /api/technologies/:id/usage
    getTechnologyUsage: builder.query<{ data: TTechnologyUsage }, string>({
      query: (id) => `/${id}/usage`,
      providesTags: (_r, _e, id) => [{ type: "TechnologyUsage", id }],
    }),

    // POST /api/technologies
    createTechnology: builder.mutation<
      { message: string; data: TTechnology },
      TCreateTechnologyInput
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Technology", id: "LIST" },
        { type: "Technology", id: "GROUPED" },
      ],
    }),

    // PUT /api/technologies/:id
    updateTechnology: builder.mutation<
      { message: string; data: TTechnology },
      { id: string; updates: TUpdateTechnologyInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Technology", id },
        { type: "Technology", id: "LIST" },
        { type: "Technology", id: "GROUPED" },
      ],
    }),

    // DELETE /api/technologies/:id
    deleteTechnology: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Technology", id },
        { type: "Technology", id: "LIST" },
        { type: "Technology", id: "GROUPED" },
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetTechnologiesQuery,
  useLazyGetTechnologiesQuery,
  useGetTechnologiesByCategoryQuery,
  useLazyGetTechnologiesByCategoryQuery,
  useGetTechnologiesBulkQuery,
  useLazyGetTechnologiesBulkQuery,
  useGetTechnologyByIdQuery,
  useLazyGetTechnologyByIdQuery,
  useGetTechnologyUsageQuery,
  useLazyGetTechnologyUsageQuery,
  useCreateTechnologyMutation,
  useUpdateTechnologyMutation,
  useDeleteTechnologyMutation,
} = technologiesApi;

// ==========================================
// ERROR HELPER
// ==========================================
export const getTechnologyErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as TechnologiesApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};