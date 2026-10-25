// src/Features/Apis/Posts.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TReactionType = "like" | "fire";

export type TReactionCounts = Partial<Record<TReactionType, number>>;

export type TRatingSummary = {
  avg: number;
  count: number;
};

export type TTag = {
  id: string;
  name: string;
  slug: string;
};

export type TAuthor = {
  id: string;
  fullName: string;
  email: string;
};

export type TRevision = {
  id: string;
  postId: string;
  title: string;
  content: string;
  createdAt: string;
};

export type TPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  readingTime: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  authorId: string | null;
  author?: TAuthor | null;
  tags?: TTag[];
  reactions?: TReactionCounts;
  ratings?: TRatingSummary;
};

export type TPostFilters = {
  status?: "published" | "draft" | "archived" | "all";
  featured?: boolean;
  tagSlug?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "viewCount" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type TCreatePostInput = {
  title: string;
  content: string;
  excerpt?: string;
  readingTime?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  tagSlugs?: string[];
};

export type TUpdatePostInput = Partial<TCreatePostInput>;

export type TPostStats = {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  totalViews: number;
};

export interface PostsApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/posts`,
    credentials: "include",
  }),
  tagTypes: ["Post", "PostStats", "PostRevisions"],

  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC — LIST  (GET /api/posts)
    // ==========================================
    getPosts: builder.query<{ data: TPost[] }, TPostFilters | void>({
      query: (filters) => ({
        url: "/",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    // ==========================================
    // PUBLIC — BY SLUG  (GET /api/posts/slug/:slug)
    // ==========================================
    getPostBySlug: builder.query<{ data: TPost }, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: "Post", id: `slug-${slug}` }],
    }),

    // ==========================================
    // ADMIN — STATS  (GET /api/posts/admin/stats)
    // ==========================================
    getPostStats: builder.query<{ data: TPostStats }, void>({
      query: () => "/admin/stats",
      providesTags: ["PostStats"],
    }),

    // ==========================================
    // ADMIN — GET BY ID  (GET /api/posts/:id)
    // ==========================================
    getPostById: builder.query<{ data: TPost }, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Post", id }],
    }),

    // ==========================================
    // ADMIN — CREATE  (POST /api/posts)
    // ==========================================
    createPost: builder.mutation<
      { message: string; data: TPost },
      TCreatePostInput
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Post", id: "LIST" },
        "PostStats",
      ],
    }),

    // ==========================================
    // ADMIN — UPDATE  (PUT /api/posts/:id)
    // Auto-creates a revision when title or content changes
    // ==========================================
    updatePost: builder.mutation<
      { message: string; data: TPost },
      { id: string; updates: TUpdatePostInput }
    >({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        { type: "PostRevisions", id },
        "PostStats",
      ],
    }),

    // ==========================================
    // ADMIN — TOGGLE FEATURED  (PATCH /api/posts/:id/featured)
    // ==========================================
    togglePostFeatured: builder.mutation<
      { message: string; data: TPost },
      string
    >({
      query: (id) => ({
        url: `/${id}/featured`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        "PostStats",
      ],
    }),

    // ==========================================
    // ADMIN — TOGGLE PUBLISH  (PATCH /api/posts/:id/publish)
    // ==========================================
    togglePostPublish: builder.mutation<
      { message: string; data: TPost },
      string
    >({
      query: (id) => ({
        url: `/${id}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        "PostStats",
      ],
    }),

    // ==========================================
    // ADMIN — SOFT DELETE  (DELETE /api/posts/:id)
    // ==========================================
    deletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        "PostStats",
      ],
    }),

    // ==========================================
    // ADMIN — RESTORE  (POST /api/posts/:id/restore)
    // ==========================================
    restorePost: builder.mutation<
      { message: string; data: TPost },
      string
    >({
      query: (id) => ({
        url: `/${id}/restore`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        "PostStats",
      ],
    }),

    // ==========================================
    // ADMIN — HARD DELETE  (DELETE /api/posts/:id/hard)
    // ==========================================
    hardDeletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}/hard`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
        "PostStats",
      ],
    }),

    // ==========================================
    // ADMIN — LIST REVISIONS  (GET /api/posts/:id/revisions)
    // ==========================================
    getPostRevisions: builder.query<{ data: TRevision[] }, string>({
      query: (id) => `/${id}/revisions`,
      providesTags: (_r, _e, id) => [{ type: "PostRevisions", id }],
    }),

    // ==========================================
    // PUBLIC — GET REACTION COUNTS  (GET /api/posts/:id/reactions)
    // ==========================================
    getPostReactions: builder.query<
      { data: TReactionCounts },
      string
    >({
      query: (id) => `/${id}/reactions`,
      providesTags: (_r, _e, id) => [{ type: "Post", id: `reactions-${id}` }],
    }),

    // ==========================================
    // PUBLIC — ADD REACTION  (POST /api/posts/:id/reactions)
    // ==========================================
    addPostReaction: builder.mutation<
      { data: TPost; counts: TReactionCounts },
      { id: string; reaction: TReactionType }
    >({
      query: ({ id, reaction }) => ({
        url: `/${id}/reactions`,
        method: "POST",
        body: { reaction },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Post", id },
        { type: "Post", id: `reactions-${id}` },
      ],
    }),

    // ==========================================
    // PUBLIC — GET RATINGS SUMMARY  (GET /api/posts/:id/ratings)
    // ==========================================
    getPostRatings: builder.query<
      { data: TRatingSummary },
      string
    >({
      query: (id) => `/${id}/ratings`,
      providesTags: (_r, _e, id) => [{ type: "Post", id: `ratings-${id}` }],
    }),

    // ==========================================
    // PUBLIC — RATE POST  (POST /api/posts/:id/ratings)
    // Same visitorId updates the existing rating
    // ==========================================
    ratePost: builder.mutation<
      { data: { visitorId: string; rating: number }; summary: TRatingSummary },
      { id: string; visitorId: string; rating: number }
    >({
      query: ({ id, visitorId, rating }) => ({
        url: `/${id}/ratings`,
        method: "POST",
        body: { visitorId, rating },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Post", id },
        { type: "Post", id: `ratings-${id}` },
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useGetPostsQuery,
  useLazyGetPostsQuery,
  useGetPostBySlugQuery,
  useLazyGetPostBySlugQuery,
  useGetPostStatsQuery,
  useLazyGetPostStatsQuery,
  useGetPostByIdQuery,
  useLazyGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useTogglePostFeaturedMutation,
  useTogglePostPublishMutation,
  useDeletePostMutation,
  useRestorePostMutation,
  useHardDeletePostMutation,
  useGetPostRevisionsQuery,
  useLazyGetPostRevisionsQuery,
  useGetPostReactionsQuery,
  useLazyGetPostReactionsQuery,
  useAddPostReactionMutation,
  useGetPostRatingsQuery,
  useLazyGetPostRatingsQuery,
  useRatePostMutation,
} = postsApi;

// ==========================================
// ERROR HELPER
// ==========================================
export const getPostErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as PostsApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};