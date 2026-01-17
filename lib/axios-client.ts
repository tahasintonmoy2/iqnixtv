import { AuthResponse, User } from "@/types/auth";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getToken } from "./auth-actions";
import { authRefreshToken } from "./auth-refresh-token";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_SERVER_URL || "http://localhost:8080/api";

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// axiosClient.interceptors.request.use(async (config) => {
//   try {
//     const token = await getToken();
//     if (token) {
//       if (config.headers) {
//         (config.headers as unknown as Record<string, string>)["Authorization"] = `Bearer ${token}`;
//       } else {
//         config.headers = ({ Authorization: `Bearer ${token}` } as unknown) as typeof config.headers;
//       }
//     }
//   } catch (err) {
//     // ignore token retrieval errors
//     console.error(err);
//   }
//   return config;
// });

// Request interceptor to add token
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip adding token for login and signup endpoints
    const isAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/signup");

    if (!isAuthEndpoint) {
      const token = await authRefreshToken.getToken("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await authRefreshToken.getToken("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post<AuthResponse>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { token, refreshToken: newRefreshToken } = response.data;

        await authRefreshToken.setToken(token, "accessToken");
        await authRefreshToken.setToken(newRefreshToken, "refreshToken");

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Clear all auth data on refresh failure
        await authRefreshToken.remove("accessToken");
        await authRefreshToken.remove("refreshToken");
        await authRefreshToken.remove("user");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // automatically include Authorization header from cookie if available
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "An unknown error occurred",
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
    return fetchApi<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async (): Promise<User> => {
    return fetchApi<User>(`/auth/user`);
  },
};
