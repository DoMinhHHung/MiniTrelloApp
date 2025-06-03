import api from "../services/api";
import type { AuthResponse } from "../types";

export const authService = {
  signin: async (
    email: string,
    verificationCode: string
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/signin", {
      email,
      verificationCode,
    });
    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
    }
    return response.data;
  },

  githubAuth: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  sendCode: async (email: string) => {
    const response = await api.post("/auth/send-code", { email });
    return response.data;
  },
};
