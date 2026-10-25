// src/Features/Apis/FAQs.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TFaq = {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type TFaqFilters = {
  search?: string;
  page?: number;
  limit?: number;
};

export type TFaqStats = {
  total: number;
  maxOrder: number;
};

export type TCreateFaqInput = {
  question: string;
  answer: string;
  order?: number;              // ≥ 0
};

export type TUpdateFaqInput = Partial<TCreateFaqInput>;

export type TReorderFaqsInput = {
  items: { id: string; order: number }[];
};

export interface FaqsApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const faqsApi = createApi({
  reducerPath: "faqsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/faqs`,
    credentials: "include",
  }),
  tagTypes: ["Faq", "FaqStats"],

  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC — LIST  (GET /api/faqs)
    // ==========================================
    getFaqs: builder.query<{ data: TFaq[] }, TFaqFilters | void>({
      query: (filters) => ({
        url: "/",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Faq" as const, id })),
              { type: "Faq", id: "LIST" },
            ]
          : [{ type: "Faq", id: "LIST" }],
    }),

    // ==========================================
    // PUBLIC — GET BY ID  (GET /api/faqs/:id)
    // ==========================================
    getFaqById: builder.query<{ data: TFaq }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Faq", id }],
    }),

    // ==========================================
    // ADMIN — STATS  (GET /api/faqs/admin/stats)
    // ==========================================
    getFaqStats: builder.query<{ data: TFaqStats }, void>({
      query: () => "/admin/stats",
      providesTags: ["FaqStats"],
    }),

    // ==========================================
    // ADMIN — CREATE  (POST /api/faqs)
    // ==========================================
    createFaq: builder.mutation<{ message: string; data: TFaq }, TCreateFaqInput>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Faq", id: "LIST" },
        "FaqStats",
      ],
    }),

    // ==========================================
    // ADMIN — UPDATE  (PUT /api/faqs/:id)
    // ==========================================
    updateFaq: builder.mutation<
      { message: string; data: TFaq },
      { id: string; updates: TUpdateFaqInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Faq", id },
        { type: "Faq", id: "LIST" },
        "FaqStats",
      ],
    }),

    // ==========================================
    // ADMIN — REORDER (bulk)  (PATCH /api/faqs/reorder)
    // ==========================================
    reorderFaqs: builder.mutation<{ message: string; data: TFaq[] }, TReorderFaqsInput>({
      query: (body) => ({
        url: "/reorder",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [
        { type: "Faq", id: "LIST" },
        "FaqStats",
      ],
    }),

    // ==========================================
    // ADMIN — DELETE  (DELETE /api/faqs/:id)
    // ==========================================
    deleteFaq: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Faq", id },
        { type: "Faq", id: "LIST" },
        "FaqStats",
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetFaqsQuery,
  useLazyGetFaqsQuery,
  useGetFaqByIdQuery,
  useLazyGetFaqByIdQuery,
  useGetFaqStatsQuery,
  useLazyGetFaqStatsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useReorderFaqsMutation,
  useDeleteFaqMutation,
} = faqsApi;

// ==========================================
// ERROR HELPER
// ==========================================
export const getFaqErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as FaqsApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};