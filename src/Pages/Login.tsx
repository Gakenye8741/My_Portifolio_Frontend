import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  getErrorMessage,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
} from "../Features/Apis/AuthApi";
import { clearCredentials, setCredentials } from "../Features/Auth/AuthSlice";


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: user, isLoading: checkingSession } = useMeQuery();
  const [login, { isLoading, error }] = useLoginMutation();
  const [logout] = useLogoutMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // 1) login → sets HttpOnly cookie, returns the User
      const loggedInUser = await login({ email, password }).unwrap();

      // 2) store the user in Redux + localStorage
      dispatch(setCredentials(loggedInUser));

      // 3) only NOW redirect — after a real successful login
      navigate("/", { replace: true });
    } catch {
      /* error shown below */
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();     // server clears the cookie
    } finally {
      dispatch(clearCredentials()); // wipe Redux + localStorage
      navigate("/login", { replace: true });
    }
  };

  if (checkingSession && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zm0 0V7a4 4 0 118 0v4m-8 0h8m-8 0v6a2 2 0 002 2h4a2 2 0 002-2v-6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to continue to your portfolio</p>
          </div>

          {/* If a user is already logged in, show a friendly state */}
          {user ? (
            <div className="space-y-4 text-center">
              <p className="text-slate-300">
                You're signed in as{" "}
                <span className="font-semibold text-white">{user.fullName}</span>
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30"
              >
                Go to homepage
              </button>
              <button
                onClick={handleLogout}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5"
              >
                Log out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-indigo-400 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-indigo-400 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {getErrorMessage(error)}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {isLoading ? "Signing in…" : "Log in"}
                </span>
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Secure authentication · Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
}