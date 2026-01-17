"use client";

import { authRefreshToken } from "@/lib/auth-refresh-token";
import { authStorage } from "@/lib/auth-token";
import { api } from "@/lib/axios-client";
import { User } from "@/types/auth";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  onClearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setError] = useState<string | null>(null);
  const router = useRouter();

  // Reusable function to fetch profile using a token (or stored token)
  const fetchAndSetUser = useCallback(async (token?: string) => {
    const t = token ?? (await authStorage.getToken());
    if (!t) {
      setUser(null);
      return null;
    }

    try {
      const userData = await api.getProfile();
      // const profile = Array.isArray(userData)
      //   ? userData.length
      //     ? userData[0]
      //     : null
      //   : userData;
      setUser(userData);
      return userData;
    } catch (error) {
      console.log(error);
      // Only remove token if the error is an authentication error (401/403).
      // Network errors or server downtime should not clear the stored token.
      const err = error as { response?: { status?: number } } | undefined;
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        await authStorage.remove();
        setUser(null);
      } else {
        // Keep the token in storage; just clear the in-memory user.
        setUser(null);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      await fetchAndSetUser();
      setLoading(false);
    };

    loadUser();
  }, [fetchAndSetUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    setLoading(true);
    // Clear any existing authentication state before login
    setUser(null);

    try {
      const response = await api.login(email, password);
      if (response) {
        // persist both access and refresh tokens for axios interceptors
        await Promise.all([
          authStorage.setToken(response.accessToken),
          authRefreshToken.setToken(response.accessToken, "accessToken"),
          authRefreshToken.setToken(response.refreshToken, "refreshToken"),
        ]);
        setUser(response.user);

        // If the API returned user data use it, otherwise fetch profile
        if (response.user) {
          // const profile = Array.isArray(response.user)
          //   ? response.user.length
          //     ? response.user[0]
          //     : null
          //   : response.user;
          setUser(response.user);
        } else {
          await fetchAndSetUser(response.accessToken);
        }

        router.push("/");
      }
    } catch (error) {
      console.log(error);
      setError("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.signup(email, password, firstName, lastName);

      if (email !== response.user.email) {
        // Handle case where email doesn't match
        setError(`User already exists with this email ${email}`);
      }

      if (response) {
        await Promise.all([
          authStorage.setToken(response.accessToken),
          authRefreshToken.setToken(response.accessToken, "accessToken"),
          authRefreshToken.setToken(response.refreshToken, "refreshToken"),
        ]);

        // If the API returned user data use it, otherwise fetch profile
        if (response.user) {
          // const profile = Array.isArray(response.user)
          //   ? response.user.length
          //     ? response.user[0]
          //     : null
          //   : response.user;
          setUser(response.user);
        } else {
          await fetchAndSetUser(response.accessToken);
        }

        router.push("/auth/sign-in");
      }
    } catch (error) {
      console.log(error);
      setError("Signup failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    // remove all auth cookies so refresh flow cannot resurrect the session
    await Promise.all([
      authStorage.remove(),
      authRefreshToken.remove("accessToken"),
      authRefreshToken.remove("refreshToken"),
    ]);

    setUser(null);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        signup,
        logout,
        onClearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Make sure to wrap your root layout with <AuthProvider>."
    );
  }
  return context;
};
