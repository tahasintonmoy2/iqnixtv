import { AuthResponse, User } from "@/types/auth";
import axios from "axios";
import { getToken } from "./auth-actions";

export const axiosClient = axios.create({
  baseURL: "http://localhost:8080",
});

axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      if (config.headers) {
        (config.headers as unknown as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      } else {
        config.headers = ({ Authorization: `Bearer ${token}` } as unknown) as typeof config.headers;
      }
    }
  } catch (err) {
    // ignore token retrieval errors
    console.error(err);
  }
  return config;
});

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL || "http://localhost:8080";

  // automatically include Authorization header from cookie if available
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${base}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'An unknown error occurred',
    }));
    throw error;
  }

  return response.json();
}

export const api = {
  signup: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async (): Promise<User> => {
    return fetchApi<User>(`/api/auth/user`);
  },
};