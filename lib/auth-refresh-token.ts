"use client";

import {
  getToken,
  removeToken,
  setToken as setTokenAction,
} from "./refresh-actions";

export const authRefreshToken = {
  getToken: async (tokenKey: string): Promise<string | null> => {
    return await getToken(tokenKey);
  },

  setToken: async (token: string, tokenKey: string): Promise<void> => {
    return await setTokenAction(token, tokenKey);
  },

  remove: async (tokenKey: string): Promise<void> => {
    return await removeToken(tokenKey);
  },
};
