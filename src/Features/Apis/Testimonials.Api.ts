// src/Features/Apis/Testimonials.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TTestimonialSource =
  | "linkedin"
  | "twitter"
  | "email"
  | "upwork"
  | "fiverr"
  | "website"
  | "other";

export type TTestimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  company: string | null;
  content: string;
  rating: number | null;           // 1–5, may be null
  sourceUrl: string | null;
  authorAvatarId: string | null;
  authorAvatar?: { id: string; fileUrl: string; fileName: string } | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TTestimonialAdminFilters = {
  isPublished?: boolean;
  minRating?: number;              // 1–5
  search?: string;
  sortBy?: "rating" | "authorName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type TCreateTestimonialInput = {
  authorName: string;
  content: string;
  authorRole?: string | null;
  company?: string | null;
  rating?: number | null;          // 1–5
  sourceUrl?: string | null;
  authorAvatarId?: string | null;
  isPublished?: boolean;
};

export type TUpdateTestimonialInput = Partial<TCreateTestimonialInput>;

export type TTestimonialStats = {
  total: number;
  published: number;
  unpublished: number;
  avgRating: number | null;
};

export interface TestimonialsApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API — same style as Projects/Skills/Technologies
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const testimonialsApi = createApi({
  reducerPath: "testimonialsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/testimonials`,
    credentials: "include",
  }),
  tagTypes: ["Testimonial", "TestimonialStats"],

  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC — LIST PUBLISHED  (GET /api/testimonials)
    // ==========================================
    getTestimonials: builder.query<{ data: TTestimonial[] }, void>({
      query: () => "/",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Testimonial" as const,
                id,
              })),
              { type: "Testimonial", id: "LIST" },
            ]
          : [{ type: "Testimonial", id: "LIST" }],
    }),

    // ==========================================
    // ADMIN — LIST ALL  (GET /api/testimonials/admin)
    // ==========================================
    getTestimonialsAdmin: builder.query<
      { data: TTestimonial[] },
      TTestimonialAdminFilters | void
    >({
      query: (filters) => ({
        url: "/admin",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Testimonial" as const,
                id,
              })),
              { type: "Testimonial", id: "ADMIN_LIST" },
            ]
          : [{ type: "Testimonial", id: "ADMIN_LIST" }],
    }),

    // ==========================================
    // ADMIN — STATS  (GET /api/testimonials/admin/stats)
    // ==========================================
    getTestimonialStats: builder.query<{ data: TTestimonialStats }, void>({
      query: () => "/admin/stats",
      providesTags: ["TestimonialStats"],
    }),

    // ==========================================
    // PUBLIC — GET BY ID  (GET /api/testimonials/:id)
    // (admin also uses this — same endpoint, cookie decides access)
    // ==========================================
    getTestimonialById: builder.query<{ data: TTestimonial }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Testimonial", id }],
    }),

    // ==========================================
    // ADMIN — CREATE  (POST /api/testimonials)
    // ==========================================
    createTestimonial: builder.mutation<
      { message: string; data: TTestimonial },
      TCreateTestimonialInput
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Testimonial", id: "LIST" },
        { type: "Testimonial", id: "ADMIN_LIST" },
        "TestimonialStats",
      ],
    }),

    // ==========================================
    // ADMIN — UPDATE  (PUT /api/testimonials/:id)
    // ==========================================
    updateTestimonial: builder.mutation<
      { message: string; data: TTestimonial },
      { id: string; updates: TUpdateTestimonialInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Testimonial", id },
        { type: "Testimonial", id: "LIST" },
        { type: "Testimonial", id: "ADMIN_LIST" },
        "TestimonialStats",
      ],
    }),

    // ==========================================
    // ADMIN — TOGGLE PUBLISH  (PATCH /api/testimonials/:id/publish)
    // Flips isPublished true ↔ false
    // ==========================================
    toggleTestimonialPublish: builder.mutation<
      { message: string; data: TTestimonial },
      string
    >({
      query: (id) => ({
        url: `/${id}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Testimonial", id },
        { type: "Testimonial", id: "LIST" },
        { type: "Testimonial", id: "ADMIN_LIST" },
        "TestimonialStats",
      ],
    }),

    // ==========================================
    // ADMIN — DELETE  (DELETE /api/testimonials/:id)
    // ==========================================
    deleteTestimonial: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Testimonial", id },
        { type: "Testimonial", id: "LIST" },
        { type: "Testimonial", id: "ADMIN_LIST" },
        "TestimonialStats",
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetTestimonialsQuery,
  useLazyGetTestimonialsQuery,
  useGetTestimonialsAdminQuery,
  useLazyGetTestimonialsAdminQuery,
  useGetTestimonialStatsQuery,
  useLazyGetTestimonialStatsQuery,
  useGetTestimonialByIdQuery,
  useLazyGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useToggleTestimonialPublishMutation,
  useDeleteTestimonialMutation,
} = testimonialsApi;

// ==========================================
// ERROR HELPER — same shape as getSkillErrorMessage
// ==========================================
export const getTestimonialErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as TestimonialsApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};