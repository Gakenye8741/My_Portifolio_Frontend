import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
export interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  fullName: string;
}

/** Backend may answer `{ user }` or the user directly. */
export type UserResponse = { user: User } | User;

export interface ApiErrorBody {
  message?: string;
  error?: string;
}

/**
 * Auth API (RTK Query)
 * ---------------------------------------------------------------
 * - baseUrl comes from the frontend .env (VITE_API_URL)
 * - credentials: "include" makes the browser SEND and SAVE the
 *   HttpOnly `session` cookie. Without it, Set-Cookie is ignored.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const unwrapUser = (res: UserResponse): User => ("user" in res ? res.user : res);

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/auth`,
    credentials: "include", // <-- the important line for cookies
  }),
  tagTypes: ["Me"],
  endpoints: (builder) => ({
    // POST /register -> 201 | 400 | 409
    register: builder.mutation<User, RegisterRequest>({
      query: (body) => ({ url: "/register", method: "POST", body }),
      transformResponse: unwrapUser,
      invalidatesTags: ["Me"],
    }),

    // POST /login -> 200 + Set-Cookie | 401
    login: builder.mutation<User, LoginRequest>({
      query: (body) => ({ url: "/login", method: "POST", body }),
      transformResponse: unwrapUser,
      invalidatesTags: ["Me"],
    }),

    // GET /me -> 200 | 401 (uses the session cookie)
    me: builder.query<User, void>({
      query: () => "/me",
      transformResponse: unwrapUser,
      providesTags: ["Me"],
    }),

    // POST /logout -> 204
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/logout", method: "POST" }),
      async onQueryStarted(_arg: void, { dispatch, queryFulfilled }): Promise<void> {
        try {
          await queryFulfilled;
        } finally {
          // wipe every cached response so no stale user data survives
          dispatch(authApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useLogoutMutation,
} = authApi;

/** Turn an RTK Query error into a readable message. */
export const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR") return "Cannot reach the server.";
    const data = error.data as ApiErrorBody | undefined;
    return data?.message ?? data?.error ?? `Request failed (${error.status})`;
  }
  return error.message ?? "Something went wrong.";
};