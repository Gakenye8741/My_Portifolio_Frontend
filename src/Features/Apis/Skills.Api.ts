// src/Features/Apis/Skills.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import type { TTechnology } from "./Technologies.Api";

// ✅ re-export so existing consumers can keep importing from Skills.Api
export type { TTechnology } from "./Technologies.Api";

// ==========================================
// TYPES
// ==========================================
export type TSkillCategory =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "mobile"
  | "ai";

export type TSkill = {
  id: string;
  techId: string;
  proficiency: number;        // 0–100
  yearsExperience: number;
  technology: TTechnology;    // 👈 imported from Technologies.Api
};

export type TSkillFilters = {
  category?: TSkillCategory;
  minProficiency?: number;    // 0–100
  search?: string;
  sortBy?: "proficiency" | "yearsExperience" | "name";
  sortOrder?: "asc" | "desc";
};

export type TSkillsGrouped = Partial<Record<TSkillCategory, TSkill[]>>;

export type TCreateSkillInput = {
  techId: string;
  proficiency: number;        // 0–100
  yearsExperience?: number;   // ≥ 0
};

export type TUpdateSkillInput = {
  proficiency?: number;
  yearsExperience?: number;
};

export type TUpsertSkillByTechInput = {
  proficiency: number;
  yearsExperience?: number;
};

export interface SkillsApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const skillsApi = createApi({
  reducerPath: "skillsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/skills`,
    credentials: "include",
  }),
  tagTypes: ["Skill", "SkillGrouped"],

  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC — LIST  (GET /api/skills)
    // ==========================================
    getSkills: builder.query<{ data: TSkill[] }, TSkillFilters | void>({
      query: (filters) => ({
        url: "/",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Skill" as const, id })),
              { type: "Skill", id: "LIST" },
            ]
          : [{ type: "Skill", id: "LIST" }],
    }),

    // ==========================================
    // PUBLIC — GROUPED  (GET /api/skills/grouped)
    // ==========================================
    getSkillsGrouped: builder.query<{ data: TSkillsGrouped }, void>({
      query: () => "/grouped",
      providesTags: ["SkillGrouped"],
    }),

    // ==========================================
    // PUBLIC — BY TECH ID  (GET /api/skills/by-tech/:techId)
    // ==========================================
    getSkillByTechId: builder.query<{ data: TSkill }, string>({
      query: (techId) => `/by-tech/${techId}`,
      providesTags: (_r, _e, techId) => [{ type: "Skill", id: `tech-${techId}` }],
    }),

    // ==========================================
    // PUBLIC — GET BY ID  (GET /api/skills/:id)
    // ==========================================
    getSkillById: builder.query<{ data: TSkill }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Skill", id }],
    }),

    // ==========================================
    // ADMIN — CREATE  (POST /api/skills)
    // ==========================================
    createSkill: builder.mutation<
      { message: string; data: TSkill },
      TCreateSkillInput
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Skill", id: "LIST" },
        "SkillGrouped",
      ],
    }),

    // ==========================================
    // ADMIN — UPDATE  (PUT /api/skills/:id)
    // ==========================================
    updateSkill: builder.mutation<
      { message: string; data: TSkill },
      { id: string; updates: TUpdateSkillInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Skill", id },
        { type: "Skill", id: "LIST" },
        "SkillGrouped",
      ],
    }),

    // ==========================================
    // ADMIN — UPSERT BY TECH  (PUT /api/skills/by-tech/:techId)
    // ==========================================
    upsertSkillByTech: builder.mutation<
      { message: string; data: TSkill },
      { techId: string; updates: TUpsertSkillByTechInput }
    >({
      query: ({ techId, updates }) => ({
        url: `/by-tech/${techId}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { techId }) => [
        { type: "Skill", id: `tech-${techId}` },
        { type: "Skill", id: "LIST" },
        "SkillGrouped",
      ],
    }),

    // ==========================================
    // ADMIN — DELETE  (DELETE /api/skills/:id)
    // ==========================================
    deleteSkill: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Skill", id },
        { type: "Skill", id: "LIST" },
        "SkillGrouped",
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetSkillsQuery,
  useLazyGetSkillsQuery,
  useGetSkillsGroupedQuery,
  useLazyGetSkillsGroupedQuery,
  useGetSkillByTechIdQuery,
  useLazyGetSkillByTechIdQuery,
  useGetSkillByIdQuery,
  useLazyGetSkillByIdQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useUpsertSkillByTechMutation,
  useDeleteSkillMutation,
} = skillsApi;

// ==========================================
// ERROR HELPER
// ==========================================
export const getSkillErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as SkillsApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};