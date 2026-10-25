import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: "admin" | "user" | null;
}

/** Safe reader — never trusts a string "null" from old persisted data */
function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw || raw === "null" || raw === "undefined") return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.id === "string") {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

const persistedUser = readStoredUser();

const initialState: AuthState = {
  user: persistedUser,
  isAuthenticated: !!persistedUser,
  role: persistedUser ? (persistedUser.isAdmin ? "admin" : "user") : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthUser>) => {
      const user = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.role = user.isAdmin ? "admin" : "user";
      localStorage.setItem("user_data", JSON.stringify(user));
    },

    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("user_data");
      localStorage.removeItem("access_token"); // legacy cleanup
      localStorage.removeItem("user_role");    // legacy cleanup
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export const selectUser = (s: { auth: AuthState }) => s.auth.user;
export const selectIsAuthenticated = (s: { auth: AuthState }) => s.auth.isAuthenticated;
export const selectRole = (s: { auth: AuthState }) => s.auth.role;
export const selectIsAdmin = (s: { auth: AuthState }) => s.auth.role === "admin";

export default authSlice.reducer;