// src/Features/Apis/Certifications.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TCertification = {
  id: string;
  name: string;
  issuer: string;
  badgeMediaId: string | null;
  badge?: { id: string; fileUrl: string; fileName: string } | null;
};

export type TCertificationsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type TCertificationsResponse = {
  data: TCertification[];
  pagination: TCertificationsPagination;
};

export type TCertificationFilters = {
  issuer?: string;
  search?: string;
  sortBy?: "name" | "issuer";                 // ✅ matches backend enum
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type TCreateCertificationInput = {
  name: string;
  issuer: string;
  badgeMediaId?: string | null;
};

export type TUpdateCertificationInput = Partial<TCreateCertificationInput>;

export type TCertificationStats = {
  total: number;
  withBadge: number;
  withoutBadge: number;
  issuers: string[];
};

export interface CertificationsApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const certificationsApi = createApi({
  reducerPath: "certificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/certifications`,
    credentials: "include",
  }),
  tagTypes: ["Certification", "CertificationStats"],

  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC — LIST  (GET /api/certifications)
    // ==========================================
    getCertifications: builder.query<
      TCertificationsResponse,
      TCertificationFilters | void
    >({
      query: (filters) => ({
        url: "/",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Certification" as const,
                id,
              })),
              { type: "Certification", id: "LIST" },
            ]
          : [{ type: "Certification", id: "LIST" }],
    }),

    // ==========================================
    // PUBLIC — GET BY ID  (GET /api/certifications/:id)
    // ==========================================
    getCertificationById: builder.query<{ data: TCertification }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Certification", id }],
    }),

    // ==========================================
    // ADMIN — STATS  (GET /api/certifications/admin/stats)
    // ==========================================
    getCertificationStats: builder.query<{ data: TCertificationStats }, void>({
      query: () => "/admin/stats",
      providesTags: ["CertificationStats"],
    }),

    // ==========================================
    // ADMIN — CREATE  (POST /api/certifications)
    // ==========================================
    createCertification: builder.mutation<
      { message: string; data: TCertification },
      TCreateCertificationInput
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Certification", id: "LIST" },
        "CertificationStats",
      ],
    }),

    // ==========================================
    // ADMIN — UPDATE  (PUT /api/certifications/:id)
    // ==========================================
    updateCertification: builder.mutation<
      { message: string; data: TCertification },
      { id: string; updates: TUpdateCertificationInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Certification", id },
        { type: "Certification", id: "LIST" },
        "CertificationStats",
      ],
    }),

    // ==========================================
    // ADMIN — DELETE  (DELETE /api/certifications/:id)
    // ==========================================
    deleteCertification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Certification", id },
        { type: "Certification", id: "LIST" },
        "CertificationStats",
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetCertificationsQuery,
  useLazyGetCertificationsQuery,
  useGetCertificationByIdQuery,
  useLazyGetCertificationByIdQuery,
  useGetCertificationStatsQuery,
  useLazyGetCertificationStatsQuery,
  useCreateCertificationMutation,
  useUpdateCertificationMutation,
  useDeleteCertificationMutation,
} = certificationsApi;

// ==========================================
// ERROR HELPER
// ==========================================
export const getCertificationErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as CertificationsApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};