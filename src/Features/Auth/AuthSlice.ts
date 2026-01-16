import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    role: string | null;
}

// Check localStorage so the user stays logged in on page refresh
const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem("user_data") || "null"),
    token: localStorage.getItem("access_token"),
    isAuthenticated: !!localStorage.getItem("access_token"),
    role: localStorage.getItem("user_role"),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: any, token: string, role: string }>) => {
            const { user, token, role } = action.payload;
            
            // 1. Update Redux State
            state.user = user;
            state.token = token;
            state.role = role;
            state.isAuthenticated = true;

            // 2. Update LocalStorage for persistence
            localStorage.setItem("access_token", token);
            localStorage.setItem("user_role", role);
            localStorage.setItem("user_data", JSON.stringify(user));
        },
        clearCredentials: (state) => {
            // 1. Reset Redux State
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;

            // 2. Clear LocalStorage
            localStorage.removeItem("access_token");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_data");
        },
    }
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;