// src/Features/Apis/Contact.Api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ==========================================
// TYPES
// ==========================================
export type TMessageStatus = "new" | "read" | "replied" | "archived";

export type TMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: TMessageStatus;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TMessageFilters = {
  status?: TMessageStatus;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type TCreateMessageInput = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export type TMessageStats = {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
};

export interface ContactApiErrorBody {
  message?: string;
  error?: string;
}

// ==========================================
// API
// ==========================================
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
  }),
  tagTypes: ["Message", "MessageStats"],

  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC — SUBMIT CONTACT FORM  (POST /api/contact)
    // ==========================================
    submitContact: builder.mutation<
      { message: string; data: TMessage },
      TCreateMessageInput
    >({
      query: (body) => ({
        url: "/contact",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Message", id: "LIST" }, "MessageStats"],
    }),

    // ==========================================
    // ADMIN — LIST MESSAGES  (GET /api/messages)
    // ==========================================
    getMessages: builder.query<{ data: TMessage[] }, TMessageFilters | void>({
      query: (filters) => ({
        url: "/messages",
        params: filters || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Message" as const,
                id,
              })),
              { type: "Message", id: "LIST" },
            ]
          : [{ type: "Message", id: "LIST" }],
    }),

    // ==========================================
    // ADMIN — STATS  (GET /api/messages/admin/stats)
    // ==========================================
    getMessageStats: builder.query<{ data: TMessageStats }, void>({
      query: () => "/messages/admin/stats",
      providesTags: ["MessageStats"],
    }),

    // ==========================================
    // ADMIN — GET BY ID  (GET /api/messages/:id)
    // ==========================================
    getMessageById: builder.query<{ data: TMessage }, string>({
      query: (id) => `/messages/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Message", id }],
    }),

    // ==========================================
    // ADMIN — MARK AS READ  (PUT /api/messages/:id/read)
    // ==========================================
    markMessageRead: builder.mutation<{ message: string; data: TMessage }, string>({
      query: (id) => ({
        url: `/messages/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Message", id },
        { type: "Message", id: "LIST" },
        "MessageStats",
      ],
    }),

    // ==========================================
    // ADMIN — MARK AS REPLIED  (PUT /api/messages/:id/replied)
    // ==========================================
    markMessageReplied: builder.mutation<
      { message: string; data: TMessage },
      string
    >({
      query: (id) => ({
        url: `/messages/${id}/replied`,
        method: "PUT",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Message", id },
        { type: "Message", id: "LIST" },
        "MessageStats",
      ],
    }),

    // ==========================================
    // ADMIN — UPDATE STATUS  (PUT /api/messages/:id/status)
    // ==========================================
    updateMessageStatus: builder.mutation<
      { message: string; data: TMessage },
      { id: string; status: TMessageStatus }
    >({
      query: ({ id, status }) => ({
        url: `/messages/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Message", id },
        { type: "Message", id: "LIST" },
        "MessageStats",
      ],
    }),

    // ==========================================
    // ADMIN — DELETE  (DELETE /api/messages/:id)
    // ==========================================
    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Message", id },
        { type: "Message", id: "LIST" },
        "MessageStats",
      ],
    }),
  }),
});

// ==========================================
// HOOKS
// ==========================================
export const {
  useSubmitContactMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useGetMessageStatsQuery,
  useLazyGetMessageStatsQuery,
  useGetMessageByIdQuery,
  useLazyGetMessageByIdQuery,
  useMarkMessageReadMutation,
  useMarkMessageRepliedMutation,
  useUpdateMessageStatusMutation,
  useDeleteMessageMutation,
} = contactApi;

// ==========================================
// ERROR HELPER
// ==========================================
export const getContactErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    if (error.status === 429)
      return "Too many messages sent. Please wait a moment and try again.";
    const data = error.data as ContactApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};