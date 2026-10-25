// ONE base URL for the whole app
export const API_BASE_URL: string =
  import.meta.env?.VITE_API_URL ?? 'http://localhost:5000/api';

// Per-resource paths — append to the base
export const ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  projects: `${API_BASE_URL}/projects`,
  // add more here as you build them:
  // tasks: `${API_BASE_URL}/tasks`,
  // users: `${API_BASE_URL}/users`,
} as const;