"use client";

import { getToken, removeToken, setToken as setTokenAction } from "./auth-actions";

export const authStorage = {
  getToken: async (): Promise<string | null> => {
    return await getToken();
  },

  setToken: async (token: string): Promise<void> => {
    return await setTokenAction(token);
  },

  remove: async (): Promise<void> => {
    return await removeToken();
  },
};
