// src/Features/Apis/Projects.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TProjectStatus = "draft" | "published" | "archived";

export type TLinkType =
  | "github_frontend"
  | "github_backend"
  | "github_fullstack"
  | "live_demo"
  | "documentation"
  | "design";

export type TProjectLink = {
  id: string;
  projectId: string;
  label: string;
  url: string;
  type: TLinkType;
};

export type TProjectSection = {
  id: string;
  projectId: string;
  mediaId: string | null;
  sectionTitle: string | null;
  explanation: string | null;
  order: number;
  media?: { id: string; fileUrl: string; fileName: string } | null;
};

export type TProjectTimeline = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  date: string;
};

export type TProjectTech = {
  projectId: string;
  technologyId: string;
  role: string | null;
  yearsUsed: number | null;
  technology: {
    id: string;
    name: string;
    category:
      | "frontend"
      | "backend"
      | "database"
      | "devops"
      | "mobile"
      | "ai";
    iconName: string | null;
  };
};

export type TProject = {
  id: string;
  title: string;
  slug: string;
  mainDescription: string;
  mainThumbnailId: string | null;
  status: TProjectStatus;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  thumbnail?: { id: string; fileUrl: string; fileName: string } | null;
  techs?: TProjectTech[];
  links?: TProjectLink[];
  sections?: TProjectSection[];
  timeline?: TProjectTimeline[];
};

export type TPaginatedProjects = {
  data: TProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type TProjectFilters = {
  status?: TProjectStatus;
  featured?: boolean;
  search?: string;
  techIds?: string[];
  includeDeleted?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "viewCount" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type TProjectLinkInput = {
  label: string;
  url: string;
  type?: TLinkType;
};

export type TProjectSectionInput = {
  sectionTitle?: string | null;
  explanation?: string | null;
  mediaId?: string | null;
  order?: number;
};

export type TProjectTimelineInput = {
  title: string;
  description?: string | null;
  date?: string;
};

export type TCreateProjectInput = {
  title: string;
  slug?: string;
  mainDescription: string;
  mainThumbnailId?: string | null;
  status?: TProjectStatus;
  isFeatured?: boolean;
  links?: TProjectLinkInput[];
  sections?: TProjectSectionInput[];
  techIds?: string[];
  timeline?: TProjectTimelineInput[];
};

export type TUpdateProjectInput = Partial<TCreateProjectInput>;

export type TProjectStats = {
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
  totalViews: number;
};

export interface ProjectsApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API — same style as AuthApi.ts
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/projects`, // 👈 backend mounts projects under /projects
    credentials: "include",          // 👈 send HttpOnly session cookie
  }),
  tagTypes: ["Project", "ProjectStats"],

  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC — LIST  (GET /api/projects)
    // ==========================================
    getProjects: builder.query<TPaginatedProjects, TProjectFilters | void>({
      query: (filters) => ({
        url: "/",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Project" as const,
                id,
              })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),

    // ==========================================
    // PUBLIC — BY SLUG  (GET /api/projects/slug/:slug)
    // ==========================================
    getProjectBySlug: builder.query<{ data: TProject }, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Project", id: `slug-${slug}` }],
    }),

    // ==========================================
    // ADMIN — STATS  (GET /api/projects/admin/stats)
    // ==========================================
    getProjectStats: builder.query<{ data: TProjectStats }, void>({
      query: () => "/admin/stats",
      providesTags: ["ProjectStats"],
    }),

    // ==========================================
    // ADMIN — GET BY ID  (GET /api/projects/:id)
    // ==========================================
    getProjectDetails: builder.query<{ data: TProject }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Project", id }],
    }),

    // ==========================================
    // ADMIN — CREATE  (POST /api/projects)
    // ==========================================
    createProject: builder.mutation<
      { message: string; data: TProject },
      TCreateProjectInput
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Project", id: "LIST" },
        "ProjectStats",
      ],
    }),

    // ==========================================
    // ADMIN — UPDATE  (PUT /api/projects/:id)
    // ==========================================
    updateProject: builder.mutation<
      { message: string; data: TProject },
      { id: string; updates: TUpdateProjectInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
        "ProjectStats",
      ],
    }),

    // ==========================================
    // ADMIN — TOGGLE FEATURED  (PATCH /api/projects/:id/featured)
    // ==========================================
    toggleProjectFeatured: builder.mutation<
      { message: string; data: TProject },
      string
    >({
      query: (id) => ({
        url: `/${id}/featured`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
        "ProjectStats",
      ],
    }),

    // ==========================================
    // ADMIN — UPDATE STATUS  (PATCH /api/projects/:id/status)
    // ==========================================
    updateProjectStatus: builder.mutation<
      { message: string; data: TProject },
      { id: string; status: TProjectStatus }
    >({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
        "ProjectStats",
      ],
    }),

    // ==========================================
    // ADMIN — SOFT DELETE  (DELETE /api/projects/:id)
    // ==========================================
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
        "ProjectStats",
      ],
    }),

    // ==========================================
    // ADMIN — RESTORE  (POST /api/projects/:id/restore)
    // ==========================================
    restoreProject: builder.mutation<
      { message: string; data: TProject },
      string
    >({
      query: (id) => ({
        url: `/${id}/restore`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
        "ProjectStats",
      ],
    }),

    // ==========================================
    // ADMIN — HARD DELETE  (DELETE /api/projects/:id/hard)
    // ==========================================
    hardDeleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}/hard`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
        "ProjectStats",
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetProjectsQuery,
  useLazyGetProjectsQuery,
  useGetProjectBySlugQuery,
  useLazyGetProjectBySlugQuery,
  useGetProjectStatsQuery,
  useGetProjectDetailsQuery,
  useLazyGetProjectDetailsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useToggleProjectFeaturedMutation,
  useUpdateProjectStatusMutation,
  useDeleteProjectMutation,
  useRestoreProjectMutation,
  useHardDeleteProjectMutation,
} = projectsApi;

// ==========================================
// ERROR HELPER — same shape as AuthApi.getErrorMessage
// ==========================================
export const getProjectErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as ProjectsApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};